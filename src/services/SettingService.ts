import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { ISettingRepository } from '../repositories/setting.repository';
import type { Setting } from '../models/setting.model';
import { tenantUtils } from '../utils/tenantUtils';
import { supabase } from '../lib/supabase';

export interface SettingService {
  getSetting(key: string): Promise<Setting | null>;
  setSetting(key: string, value: string, scope?: 'tenant' | 'user' | 'app'): Promise<Setting>;
  getTenantCurrency(): Promise<string | null>;
  setTenantCurrency(code: string): Promise<Setting>;
  getUserWelcomeFlag(): Promise<boolean>;
  setUserWelcomeFlag(value: boolean): Promise<Setting>;
}

@injectable()
export class SupabaseSettingService implements SettingService {
  constructor(
    @inject(TYPES.ISettingRepository)
    private repo: ISettingRepository,
  ) {}

  async getSetting(key: string): Promise<Setting | null> {
    return this.repo.getByKey(key);
  }

  private async upsertSetting(key: string, value: string, scope: 'tenant' | 'user' | 'app' = 'tenant'): Promise<Setting> {
    const existing = await this.repo.getByKey(key);
    const { data: { user } } = await supabase.auth.getUser();
    const tenantId = await tenantUtils.getTenantId();
    const payload: Partial<Setting> = { key, value };
    if (scope === 'tenant') {
      payload.tenant_id = tenantId || undefined;
    } else if (scope === 'user') {
      payload.user_id = user?.id;
      payload.tenant_id = tenantId || undefined;
    }
    if (existing) {
      return this.repo.update(existing.id, { value });
    }
    return this.repo.create(payload as Partial<Setting>);
  }

  async setSetting(key: string, value: string, scope: 'tenant' | 'user' | 'app' = 'tenant'): Promise<Setting> {
    return this.upsertSetting(key, value, scope);
  }

  async getTenantCurrency(): Promise<string | null> {
    const setting = await this.getSetting('tenant.currency');
    return setting?.value || null;
  }

  async setTenantCurrency(code: string): Promise<Setting> {
    return this.upsertSetting('tenant.currency', code, 'tenant');
  }

  async getUserWelcomeFlag(): Promise<boolean> {
    const setting = await this.getSetting('user.welcome_shown');
    return setting?.value === 'true';
  }

  async setUserWelcomeFlag(value: boolean): Promise<Setting> {
    return this.upsertSetting('user.welcome_shown', value.toString(), 'user');
  }
}
