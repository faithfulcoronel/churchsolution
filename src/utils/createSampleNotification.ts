import { supabase } from '../lib/supabase';

/**
 * Creates a sample notification for the current user
 * @param type The notification type: 'success', 'info', 'warning', or 'error'
 * @param title The notification title
 * @param message The notification message
 * @param actionType The action type: 'redirect', 'modal', or 'none'
 * @param actionPayload Optional payload for the action (e.g., URL for redirect)
 */
export async function createSampleNotification({
  type = 'info',
  title = 'Sample Notification',
  message = 'This is a sample notification message.',
  actionType = 'none',
  actionPayload = '',
}: {
  type?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message?: string;
  actionType?: 'redirect' | 'modal' | 'none';
  actionPayload?: string;
}) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }

    // Get current tenant
    const { data: tenantData, error: tenantError } = await supabase.rpc('get_current_tenant');
    if (tenantError) throw tenantError;
    if (!tenantData || tenantData.length === 0) throw new Error('No tenant found');
    
    const tenantId = tenantData[0].id;

    // Create notification
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: user.id,
          tenant_id: tenantId,
          title,
          message,
          type,
          action_type: actionType,
          action_payload: actionPayload,
          is_read: false
        }
      ]);

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating sample notification:', error);
    throw error;
  }
}