import { supabase } from '../lib/supabase';

export type Tenant = {
  id: string;
  name: string;
  subdomain: string;
  address: string | null;
  contact_number: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  status: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_end_date: string | null;
  profile_picture_url: string | null;
  billing_cycle: string;
};

export class TenantUtils {
  private static instance: TenantUtils;
  private currentTenant: Tenant | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private fetchPromise: Promise<Tenant | null> | null = null;

  private constructor() {}

  public static getInstance(): TenantUtils {
    if (!TenantUtils.instance) {
      TenantUtils.instance = new TenantUtils();
    }
    return TenantUtils.instance;
  }

  public async getCurrentTenant(forceRefresh = false): Promise<Tenant | null> {
    const now = Date.now();
    
    // Return cached tenant if valid
    if (
      !forceRefresh &&
      this.currentTenant &&
      now - this.lastFetch < this.CACHE_DURATION
    ) {
      return this.currentTenant;
    }

    // If there's already a fetch in progress, wait for it
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    try {
      // Start new fetch
      this.fetchPromise = this.fetchTenant();
      const tenant = await this.fetchPromise;
      
      // Update cache
      this.currentTenant = tenant;
      this.lastFetch = now;
      
      return tenant;
    } catch (error) {
      console.error('Error fetching current tenant:', error);
      return null;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchTenant(): Promise<Tenant | null> {
    const { data, error } = await supabase.rpc('get_current_tenant');
    if (error) throw error;
    return data?.[0] || null;
  }

  public async getTenantId(): Promise<string | null> {
    const tenant = await this.getCurrentTenant();
    return tenant?.id || null;
  }

  public async isSubscriptionActive(): Promise<boolean> {
    const tenant = await this.getCurrentTenant();
    if (!tenant) return false;
    return tenant.subscription_status === 'active';
  }

  public async getSubscriptionTier(): Promise<string | null> {
    const tenant = await this.getCurrentTenant();
    return tenant?.subscription_tier || null;
  }

  public async clearCache(): Promise<void> {
    this.currentTenant = null;
    this.lastFetch = 0;
    this.fetchPromise = null;
  }
}

// Export a singleton instance
export const tenantUtils = TenantUtils.getInstance();