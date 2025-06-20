import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui2/select';
import { Calendar, User, Users } from 'lucide-react';
import { categoryUtils } from '../../../utils/categoryUtils';
import { Member } from '../../../models/member.model';

interface BasicInfoTabProps {
  member: Partial<Member>;
  onChange: (field: string, value: any) => void;
  mode?: 'view' | 'edit' | 'add';
}

function BasicInfoTab({ member, onChange, mode = 'view' }: BasicInfoTabProps) {
  // Fetch category options
  const { data: membershipCategories } = useQuery({
    queryKey: ['categories', 'membership'],
    queryFn: () => categoryUtils.getCategories('membership')
  });

  const { data: statusCategories } = useQuery({
    queryKey: ['categories', 'member_status'],
    queryFn: () => categoryUtils.getCategories('member_status')
  });

  if (!member) return null;
  if (mode === 'view') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                <dd className="mt-1">
                  {member.first_name} {member.middle_name ? `${member.middle_name} ` : ''}{member.last_name}
                </dd>
              </div>
              
              {member.preferred_name && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Preferred Name</dt>
                  <dd className="mt-1">{member.preferred_name}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                <dd className="mt-1 capitalize">{member.gender || 'Not specified'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Marital Status</dt>
                <dd className="mt-1 capitalize">{member.marital_status || 'Not specified'}</dd>
              </div>
              
              {member.birthday && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Birthday</dt>
                  <dd className="mt-1">{new Date(member.birthday).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Membership Information</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Membership Type</dt>
                <dd className="mt-1">{member.membership_categories?.name || 'Not specified'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">{member.status_categories?.name || 'Not specified'}</dd>
              </div>
              
              {member.membership_date && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Membership Date</dt>
                  <dd className="mt-1">{new Date(member.membership_date).toLocaleDateString()}</dd>
                </div>
              )}
              
              {member.baptism_date && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Baptism Date</dt>
                  <dd className="mt-1">{new Date(member.baptism_date).toLocaleDateString()}</dd>
                </div>
              )}
              
              {member.envelope_number && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Envelope Number</dt>
                  <dd className="mt-1">{member.envelope_number}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label="First Name"
              value={member.first_name || ''}
              onChange={e => onChange('first_name', e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Middle Name"
              value={member.middle_name || ''}
              onChange={e => onChange('middle_name', e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Last Name"
              value={member.last_name || ''}
              onChange={e => onChange('last_name', e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Preferred Name"
              value={member.preferred_name || ''}
              onChange={e => onChange('preferred_name', e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Select
              value={member.gender || ''}
              onValueChange={value => onChange('gender', value)}
            >
              <SelectTrigger label="Gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={member.marital_status || ''}
              onValueChange={value => onChange('marital_status', value)}
            >
              <SelectTrigger label="Marital Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              label="Birthday"
              value={member.birthday || ''}
              onChange={e => onChange('birthday', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-4">
            <Select
              value={member.membership_category_id || ''}
              onValueChange={value => onChange('membership_category_id', value)}
            >
              <SelectTrigger label="Membership Type">
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
            <Select
              value={member.status_category_id || ''}
              onValueChange={value => onChange('status_category_id', value)}
            >
              <SelectTrigger label="Status">
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
            <Input
              type="date"
              label="Membership Date"
              value={member.membership_date || ''}
              onChange={e => onChange('membership_date', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
            <Input
              type="date"
              label="Baptism Date"
              value={member.baptism_date || ''}
              onChange={e => onChange('baptism_date', e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
            <Input
              label="Envelope Number"
              value={member.envelope_number || ''}
              onChange={e => onChange('envelope_number', e.target.value)}
              icon={<Users className="h-4 w-4" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BasicInfoTab;

