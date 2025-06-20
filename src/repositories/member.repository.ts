import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Member } from '../models/member.model';
import { MemberAdapter } from '../adapters/member.adapter';
import { NotificationService } from '../services/NotificationService';
import { MemberValidator } from '../validators/member.validator';

@injectable()
export class MemberRepository extends BaseRepository<Member> {
  constructor(@inject(MemberAdapter) adapter: MemberAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<Member>): Promise<Partial<Member>> {
    // Validate member data
    MemberValidator.validate(data);
    
    // Format data before creation
    return this.formatMemberData(data);
  }

  protected override async afterCreate(data: Member): Promise<void> {
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
    console.log(`Welcome notification sent to ${member.first_name} ${member.last_name}`);
  }

  private async updateRelatedRecords(member: Member): Promise<void> {
    // Implement related records update logic
    console.log(`Updated related records for member ${member.id}`);
  }

  private async validateDeletion(id: string): Promise<void> {
    // Additional deletion validation if needed
    console.log(`Validated deletion for member ${id}`);
  }

  private async cleanupRelatedRecords(id: string): Promise<void> {
    // Implement cleanup logic for related records
    console.log(`Cleaned up related records for member ${id}`);
  }
}