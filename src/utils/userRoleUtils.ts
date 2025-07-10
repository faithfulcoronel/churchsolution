import { supabase } from '../lib/supabase';

export interface UserRoleDataProvider {
  fetchIsSuperAdmin(): Promise<boolean>;
}

class SupabaseUserRoleDataProvider implements UserRoleDataProvider {
  async fetchIsSuperAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_super_admin');
    if (error) throw error;
    return data === true;
  }
}

export class UserRoleUtils {
  private static instance: UserRoleUtils;
  private isSuperAdminCache: boolean | null = null;
  private lastFetch = 0;
  private readonly CACHE_DURATION =
    parseInt(import.meta.env.VITE_ROLE_CACHE_DURATION_MS) || 5 * 60 * 1000;
  private fetchPromise: Promise<boolean> | null = null;

  private constructor(private provider: UserRoleDataProvider = new SupabaseUserRoleDataProvider()) {}

  public static getInstance(provider: UserRoleDataProvider = new SupabaseUserRoleDataProvider()): UserRoleUtils {
    if (!UserRoleUtils.instance) {
      UserRoleUtils.instance = new UserRoleUtils(provider);
    }
    return UserRoleUtils.instance;
  }

  public async isSuperAdmin(forceRefresh = false): Promise<boolean> {
    const now = Date.now();

    if (
      !forceRefresh &&
      this.isSuperAdminCache !== null &&
      now - this.lastFetch < this.CACHE_DURATION
    ) {
      return this.isSuperAdminCache;
    }

    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.provider
      .fetchIsSuperAdmin()
      .then(result => {
        this.isSuperAdminCache = result;
        this.lastFetch = now;
        return result;
      })
      .catch(error => {
        console.error('Error checking super admin:', error);
        return false;
      })
      .finally(() => {
        this.fetchPromise = null;
      });

    return this.fetchPromise;
  }

  public clearCache(): void {
    this.isSuperAdminCache = null;
    this.lastFetch = 0;
    this.fetchPromise = null;
  }
}

export const userRoleUtils = UserRoleUtils.getInstance();
