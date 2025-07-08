-- Add Legacy license for all tenants and populate license_features

-- Insert Legacy license per tenant if it doesn't already exist
INSERT INTO licenses (tenant_id, code, tier, status, created_by, updated_by)
SELECT
  t.id,
  'legacy',
  'Legacy',
  'active',
  t.created_by,
  t.created_by
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1
  FROM licenses l
  WHERE l.tenant_id = t.id
    AND l.code = 'legacy'
);

-- Insert feature mappings for the Legacy license
WITH legacy AS (
  SELECT id AS license_id, tenant_id, created_by
  FROM licenses
  WHERE code = 'legacy'
)
INSERT INTO license_features (tenant_id, license_id, feature, created_by, updated_by)
SELECT
  mi.tenant_id,
  l.license_id,
  mi.code,
  l.created_by,
  l.created_by
FROM menu_items mi
JOIN legacy l ON l.tenant_id = mi.tenant_id
ON CONFLICT (tenant_id, license_id, feature) DO NOTHING;
