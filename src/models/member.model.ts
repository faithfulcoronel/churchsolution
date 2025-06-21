import { BaseModel } from './base.model';

export interface Member extends BaseModel {
  first_name: string;
  last_name: string;
  middle_name?: string;
  preferred_name?: string;
  contact_number: string;
  address: string;
  email?: string;
  membership_category_id: string;
  status_category_id: string;
  membership_date: string | null;
  birthday: string | null;
  profile_picture_url: string | null;
  gender: 'male' | 'female' | 'other';
  marital_status: 'single' | 'married' | 'widowed' | 'divorced';
  baptism_date?: string;
  spiritual_gifts?: string[];
  ministry_interests?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  leadership_position?: string;
  small_groups?: string[];
  ministries?: string[];
  volunteer_roles?: string[];
  attendance_rate?: number;
  last_attendance_date?: string;
  pastoral_notes?: string;
  prayer_requests?: string[];
  membership_categories?: {
    id: string;
    name: string;
    code: string;
  };
  status_categories?: {
    id: string;
    name: string;
    code: string;
  };
}