import { supabase } from '../lib/supabase';
import { tenantUtils } from './tenantUtils';
import type { Member } from '../models/member.model';

export async function getCurrentUserMember(): Promise<Member | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenantId = await tenantUtils.getTenantId();
  if (!tenantId) return null;

  const { data: tenantUser, error: tuError } = await supabase
    .from('tenant_users')
    .select('member_id')
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .single();

  if (tuError || !tenantUser?.member_id) {
    if (tuError) console.error('Error fetching tenant user:', tuError);
    return null;
  }

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', tenantUser.member_id)
    .is('deleted_at', null)
    .single();

  if (memberError) {
    console.error('Error fetching member:', memberError);
    return null;
  }

  return member as Member;
}
