import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useEnumValues } from '../../hooks/useEnumValues';
import { useMessageStore } from '../../components/MessageHandler';
import { useAuthStore } from '../../stores/authStore';
import { useAuditLogger } from '../../hooks/useAuditLogger';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { ImageInput } from '../../components/ui/ImageInput';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Heart,
  Gift,
  UserPlus,
  Home,
  Briefcase,
  Loader2,
} from 'lucide-react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  preferred_name?: string;
  contact_number: string;
  address: string;
  email?: string;
  envelope_number?: string;
  membership_type: string;
  status: string;
  membership_date: string | null;
  birthday: string | null;
  profile_picture_url: string | null;
  tenant_id: string;
  created_by: string;
  updated_by: string;
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
};

function MemberEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();
  const { user } = useAuthStore();
  const { logMemberEvent } = useAuditLogger();
  const [formData, setFormData] = useState<Partial<Member>>({});
  const { membershipTypes, memberStatuses, isLoading: enumsLoading } = useEnumValues();

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', currentTenant?.id)
        .single();

      if (error) throw error;
      return data as Member;
    },
    enabled: !!id && !!currentTenant?.id,
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  const updateMemberMutation = useMutation({
    mutationFn: async (data: Partial<Member>) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant found');
      }

      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Update member
      const { data: updatedMember, error } = await supabase
        .from('members')
        .update({
          ...data,
          updated_by: user.id,
        })
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await logMemberEvent('update', updatedMember.id, data);

      return updatedMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      addMessage({
        type: 'success',
        text: 'Member updated successfully',
        duration: 3000,
      });
      navigate(`/members/${id}`);
    },
    onError: (error: Error) => {
      addMessage({
        type: 'error',
        text: error.message,
        duration: 5000,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.contact_number || !formData.address) {
      addMessage({
        type: 'error',
        text: 'Please fill in all required fields',
        duration: 5000,
      });
      return;
    }

    try {
      await updateMemberMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (name: string, value: string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (memberLoading || enumsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center mt-8">
        <h3 className="text-sm font-medium text-gray-900">Member not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/members/${id}`)}
          icon={<ArrowLeft className="h-5 w-5" />}
        >
          Back to Profile
        </Button>
      </div>

      <Card>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Edit Member Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Update the member's personal information and membership details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6 space-y-8">
            {/* Profile Picture */}
            <div>
              <ImageInput
                label="Profile Picture"
                value={member.profile_picture_url}
                onChange={(file) => {
                  // Handle profile picture upload
                }}
                helperText="Upload a profile picture (optional)"
              />
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input
                  name="first_name"
                  label="First Name *"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  required
                  icon={<User />}
                />

                <Input
                  name="middle_name"
                  label="Middle Name"
                  value={formData.middle_name || ''}
                  onChange={handleInputChange}
                  icon={<User />}
                />

                <Input
                  name="last_name"
                  label="Last Name *"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  required
                  icon={<User />}
                />

                <Input
                  name="preferred_name"
                  label="Preferred Name"
                  value={formData.preferred_name || ''}
                  onChange={handleInputChange}
                  icon={<User />}
                />

                <Select
                  name="gender"
                  label="Gender *"
                  value={formData.gender || 'male'}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />

                <Select
                  name="marital_status"
                  label="Marital Status *"
                  value={formData.marital_status || 'single'}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'married', label: 'Married' },
                    { value: 'widowed', label: 'Widowed' },
                    { value: 'divorced', label: 'Divorced' },
                  ]}
                />

                <Input
                  type="date"
                  name="birthday"
                  label="Date of Birth"
                  value={formData.birthday || ''}
                  onChange={handleInputChange}
                  icon={<Calendar />}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  icon={<Mail />}
                />

                <Input
                  name="contact_number"
                  label="Contact Number *"
                  value={formData.contact_number || ''}
                  onChange={handleInputChange}
                  required
                  icon={<Phone />}
                />

                <div className="sm:col-span-2">
                  <Textarea
                    name="address"
                    label="Address *"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Church Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Church Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Select
                  name="membership_type"
                  label="Membership Type *"
                  value={formData.membership_type || ''}
                  onChange={handleInputChange}
                  required
                  options={membershipTypes}
                />

                <Select
                  name="status"
                  label="Status *"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  required
                  options={memberStatuses}
                />

                <Input
                  type="date"
                  name="membership_date"
                  label="Membership Date"
                  value={formData.membership_date || ''}
                  onChange={handleInputChange}
                  icon={<Calendar />}
                />

                <Input
                  type="date"
                  name="baptism_date"
                  label="Baptism Date"
                  value={formData.baptism_date || ''}
                  onChange={handleInputChange}
                  icon={<Calendar />}
                />

                <Input
                  name="envelope_number"
                  label="Envelope Number"
                  value={formData.envelope_number || ''}
                  onChange={handleInputChange}
                  pattern="[0-9]*"
                  helperText="Unique identifier for member contributions (numbers only)"
                />
              </div>
            </div>

            {/* Family Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Family Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input
                  name="emergency_contact_name"
                  label="Emergency Contact Name"
                  value={formData.emergency_contact_name || ''}
                  onChange={handleInputChange}
                  icon={<Users />}
                />

                <Input
                  name="emergency_contact_phone"
                  label="Emergency Contact Phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={handleInputChange}
                  icon={<Phone />}
                />
              </div>
            </div>

            {/* Ministry Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ministry Information</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input
                  name="leadership_position"
                  label="Leadership Position"
                  value={formData.leadership_position || ''}
                  onChange={handleInputChange}
                  icon={<Briefcase />}
                />

                <Input
                  name="spiritual_gifts"
                  label="Spiritual Gifts"
                  value={formData.spiritual_gifts?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('spiritual_gifts', e.target.value.split(',').map(s => s.trim()))}
                  icon={<Gift />}
                  placeholder="e.g., Teaching, Leadership, Service"
                />

                <Input
                  name="ministry_interests"
                  label="Ministry Interests"
                  value={formData.ministry_interests?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('ministry_interests', e.target.value.split(',').map(s => s.trim()))}
                  icon={<Heart />}
                  placeholder="e.g., Youth, Worship, Outreach"
                />

                <Input
                  name="volunteer_roles"
                  label="Volunteer Roles"
                  value={formData.volunteer_roles?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('volunteer_roles', e.target.value.split(',').map(s => s.trim()))}
                  icon={<UserPlus />}
                  placeholder="e.g., Usher, Sunday School Teacher"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h4>
              <div className="grid grid-cols-1 gap-y-6">
                <Textarea
                  name="pastoral_notes"
                  label="Pastoral Notes"
                  value={formData.pastoral_notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                />

                <Textarea
                  name="prayer_requests"
                  label="Prayer Requests"
                  value={formData.prayer_requests?.join('\n') || ''}
                  onChange={(e) => handleArrayInputChange('prayer_requests', e.target.value.split('\n').map(s => s.trim()))}
                  rows={3}
                  placeholder="Enter each prayer request on a new line"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/members/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateMemberMutation.isPending}
                icon={<Save />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default MemberEdit;