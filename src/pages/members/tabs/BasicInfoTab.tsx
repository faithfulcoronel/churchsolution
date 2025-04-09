import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';
import { Label } from '../../../components/ui2/label';
import { Separator } from '../../../components/ui2/separator';
import { User, Calendar, Users } from 'lucide-react';
import { categoryUtils } from '../../../utils/categoryUtils';

interface BasicInfoTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function BasicInfoTab({ formData, onChange }: BasicInfoTabProps) {
  // Get membership categories
  const { data: membershipCategories } = useQuery({
    queryKey: ['categories', 'membership'],
    queryFn: () => categoryUtils.getCategories('membership'),
  });

  // Get status categories
  const { data: statusCategories } = useQuery({
    queryKey: ['categories', 'member_status'],
    queryFn: () => categoryUtils.getCategories('member_status'),
  });

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h4 className="text-lg font-medium mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name || ''}
              onChange={(e) => onChange('first_name', e.target.value)}
              required
              icon={<User className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              value={formData.middle_name || ''}
              onChange={(e) => onChange('middle_name', e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name || ''}
              onChange={(e) => onChange('last_name', e.target.value)}
              required
              icon={<User className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="preferred_name">Preferred Name</Label>
            <Input
              id="preferred_name"
              value={formData.preferred_name || ''}
              onChange={(e) => onChange('preferred_name', e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => onChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marital_status">Marital Status *</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) => onChange('marital_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="birthday">Date of Birth</Label>
            <Input
              type="date"
              id="birthday"
              value={formData.birthday || ''}
              onChange={(e) => onChange('birthday', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="baptism_date">Baptism Date</Label>
            <Input
              type="date"
              id="baptism_date"
              value={formData.baptism_date || ''}
              onChange={(e) => onChange('baptism_date', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Church Information */}
      <div>
        <h4 className="text-lg font-medium mb-4">Church Information</h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="membership_category_id">Membership Type *</Label>
            <Select
              value={formData.membership_category_id}
              onValueChange={(value) => onChange('membership_category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                {membershipCategories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status_category_id">Status *</Label>
            <Select
              value={formData.status_category_id}
              onValueChange={(value) => onChange('status_category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusCategories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="membership_date">Membership Date</Label>
            <Input
              type="date"
              id="membership_date"
              value={formData.membership_date || ''}
              onChange={(e) => onChange('membership_date', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>

          <div>
            <Label htmlFor="envelope_number">Envelope Number</Label>
            <Input
              id="envelope_number"
              value={formData.envelope_number || ''}
              onChange={(e) => onChange('envelope_number', e.target.value)}
              pattern="[0-9]*"
              helperText="Unique identifier for member contributions (numbers only)"
              icon={<Users className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}