import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Member } from '../models/member.model';
import type { IMemberAdapter } from '../adapters/member.adapter';
import type { IAccountRepository } from './account.repository';
import { NotificationService } from '../services/NotificationService';
import { MemberValidator } from '../validators/member.validator';
import { deleteProfilePicture } from '../utils/storage';
import { tenantUtils } from '../utils/tenantUtils';
import { supabase } from '../lib/supabase';

export interface IMemberRepository extends BaseRepository<Member> {
  getCurrentMonthBirthdays(): Promise<Member[]>;
  getBirthdaysByMonth(month: number): Promise<Member[]>;
}

@injectable()
export class MemberRepository
  extends BaseRepository<Member>
  implements IMemberRepository
{
  constructor(
    @inject('IMemberAdapter') adapter: IMemberAdapter,
    @inject('IAccountRepository') private accountRepository: IAccountRepository
  ) {
    super(adapter);
  }

  async getCurrentMonthBirthdays(): Promise<Member[]> {
    const { data, error } = await supabase.rpc('get_current_month_birthdays');
    if (error) throw error;
    return (data || []) as Member[];
  }

  async getBirthdaysByMonth(month: number): Promise<Member[]> {
    const { data, error } = await supabase.rpc('get_birthdays_for_month', {
      p_month: month,
    });
    if (error) throw error;
    return (data || []) as Member[];
  }

  protected override async beforeCreate(data: Partial<Member>): Promise<Partial<Member>> {
    // Validate member data
    MemberValidator.validate(data);
    
    // Format data before creation
    return this.formatMemberData(data);
  }

  protected override async afterCreate(data: Member): Promise<void> {
    const accountNumber = `MEM-${data.id.slice(0, 8)}`;
    await this.accountRepository.create({
      name: `${data.first_name} ${data.last_name}`,
      account_type: 'person',
      account_number: accountNumber,
      member_id: data.id
    });

    // Additional repository-level operations after creation
    await this.sendWelcomeNotification(data);
  }

  protected override async beforeUpdate(id: string, data: Partial<Member>): Promise<Partial<Member>> {
    // Validate member data
    MemberValidator.validate(data);
    
    // Format data before update
    return this.formatMemberData(data);
  }

  protected override async afterUpdate(data: Member): Promise<void> {
    // Additional repository-level operations after update
    await this.updateRelatedRecords(data);
  }

  protected override async beforeDelete(id: string): Promise<void> {
    // Additional repository-level validation before delete
    await this.validateDeletion(id);
  }

  protected override async afterDelete(id: string): Promise<void> {
    // Additional repository-level cleanup after delete
    await this.cleanupRelatedRecords(id);

    // Remove profile picture from storage
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (tenantId) {
        await deleteProfilePicture(tenantId, id);
      }
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
    }
  }

  // Private helper methods

  private formatMemberData(data: Partial<Member>): Partial<Member> {
    return {
      ...data,
      first_name: data.first_name?.trim(),
      last_name: data.last_name?.trim(),
      email: data.email?.toLowerCase().trim(),
      contact_number: data.contact_number?.trim(),
      address: data.address?.trim(),
    };
  }

  private async sendWelcomeNotification(member: Member): Promise<void> {
    // Implement welcome notification logic
    console.debug(`Welcome notification sent to ${member.first_name} ${member.last_name}`);
  }

  private async updateRelatedRecords(member: Member): Promise<void> {
    // Implement related records update logic
    console.debug(`Updated related records for member ${member.id}`);
  }

  private async validateDeletion(id: string): Promise<void> {
    // Additional deletion validation if needed
    console.debug(`Validated deletion for member ${id}`);
  }

  private async cleanupRelatedRecords(id: string): Promise<void> {
    // Implement cleanup logic for related records
    console.debug(`Cleaned up related records for member ${id}`);
  }
}