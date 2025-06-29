ALTER TABLE public.accounts RENAME TO financial_entities;

ALTER INDEX accounts_tenant_id_idx RENAME TO financial_entities_tenant_id_idx;
ALTER INDEX accounts_account_type_idx RENAME TO financial_entities_account_type_idx;
ALTER INDEX accounts_member_id_idx RENAME TO financial_entities_member_id_idx;
ALTER INDEX accounts_deleted_at_idx RENAME TO financial_entities_deleted_at_idx;

ALTER TRIGGER update_accounts_updated_at ON financial_entities RENAME TO update_financial_entities_updated_at;

ALTER POLICY "Accounts are viewable by tenant users"
  ON financial_entities
  RENAME TO "Financial entities are viewable by tenant users";
ALTER POLICY "Accounts can be inserted by authenticated users"
  ON financial_entities
  RENAME TO "Financial entities can be inserted by authenticated users";
ALTER POLICY "Accounts can be updated by authenticated users"
  ON financial_entities
  RENAME TO "Financial entities can be updated by authenticated users";
ALTER POLICY "Accounts can be deleted by authenticated users"
  ON financial_entities
  RENAME TO "Financial entities can be deleted by authenticated users";

ALTER TABLE financial_entities RENAME CONSTRAINT accounts_member_id_fkey TO financial_entities_member_id_fkey;
ALTER TABLE financial_entities RENAME CONSTRAINT accounts_tenant_id_fkey TO financial_entities_tenant_id_fkey;
ALTER TABLE financial_entities RENAME CONSTRAINT accounts_created_by_fkey TO financial_entities_created_by_fkey;
ALTER TABLE financial_entities RENAME CONSTRAINT accounts_updated_by_fkey TO financial_entities_updated_by_fkey;
ALTER TABLE financial_entities RENAME CONSTRAINT accounts_account_type_check TO financial_entities_account_type_check;

-- Recreate create_accounts_for_members function using new table name
CREATE OR REPLACE FUNCTION create_financial_entities_for_members()
RETURNS void AS $$
DECLARE
    member_record RECORD;
    entity_id UUID;
    current_user_id UUID;
BEGIN
    -- Loop through all active members without a financial entity
    FOR member_record IN
        SELECT m.*
        FROM members m
        LEFT JOIN financial_entities fe ON fe.member_id = m.id
        WHERE fe.id IS NULL
          AND m.deleted_at IS NULL
    LOOP
        -- Create a new financial entity for this member
        INSERT INTO financial_entities (
            name,
            account_type,
            account_number,
            description,
            email,
            phone,
            address,
            is_active,
            member_id,
            tenant_id,
            created_by,
            updated_by,
            created_at,
            updated_at
        ) VALUES (
            CONCAT(member_record.first_name, ' ', member_record.last_name),
            'person',
            CONCAT('MEM-', SUBSTRING(member_record.id::text, 1, 8)),
            CONCAT('Personal account for ', member_record.first_name, ' ', member_record.last_name),
            member_record.email,
            member_record.contact_number,
            member_record.address,
            TRUE,
            member_record.id,
            member_record.tenant_id,
            member_record.created_by,
            member_record.created_by,
            NOW(),
            NOW()
        )
        RETURNING id INTO entity_id;

        RAISE NOTICE 'Created financial entity % for member % %',
            entity_id,
            member_record.first_name,
            member_record.last_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update link_member_transactions function to use financial_entities table
CREATE OR REPLACE FUNCTION link_member_transactions() RETURNS VOID AS $$
DECLARE
    v_transaction RECORD;
    v_entity_id UUID;
    v_tenant_id UUID;
    v_tenant RECORD;
    v_tenant_count INT := 0;
    v_total_tenants INT;
    v_transaction_count INT := 0;
    v_linked_count INT := 0;
BEGIN
    SELECT COUNT(*) INTO v_total_tenants FROM tenants;
    FOR v_tenant IN SELECT id FROM tenants LOOP
        v_tenant_id := v_tenant.id;
        v_tenant_count := v_tenant_count + 1;
        RAISE NOTICE 'Processing tenant % (% of %): Linking member transactions', v_tenant_id, v_tenant_count, v_total_tenants;
        FOR v_transaction IN
            SELECT ft.id, ft.member_id
            FROM financial_transactions ft
            WHERE ft.tenant_id = v_tenant_id
              AND ft.member_id IS NOT NULL
              AND ft.accounts_account_id IS NULL
        LOOP
            v_transaction_count := v_transaction_count + 1;
            SELECT id INTO v_entity_id
            FROM financial_entities
            WHERE member_id = v_transaction.member_id
              AND tenant_id = v_tenant_id
              AND deleted_at IS NULL
            LIMIT 1;
            IF v_entity_id IS NOT NULL THEN
                UPDATE financial_transactions
                SET accounts_account_id = v_entity_id,
                    updated_at = NOW()
                WHERE id = v_transaction.id;
                v_linked_count := v_linked_count + 1;
            END IF;
            IF v_transaction_count % 100 = 0 THEN
                RAISE NOTICE 'Processed % transactions, linked %', v_transaction_count, v_linked_count;
            END IF;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Member transaction linking complete. Processed % transactions, linked %', v_transaction_count, v_linked_count;
END;
$$ LANGUAGE plpgsql;

-- Optional audit log
SELECT record_audit_log('update', 'table', 'accounts', jsonb_build_object('new_table', 'financial_entities'));

