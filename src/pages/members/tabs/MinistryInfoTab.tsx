import React from 'react';
import { Input } from '../../../components/ui2/input';
import { Label } from '../../../components/ui2/label';
import { Briefcase, Heart, Gift, UserPlus, Users } from 'lucide-react';

interface MinistryInfoTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function MinistryInfoTab({ formData, onChange }: MinistryInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="leadership_position">Leadership Position</Label>
          <Input
            id="leadership_position"
            value={formData.leadership_position || ''}
            onChange={(e) => onChange('leadership_position', e.target.value)}
            icon={<Briefcase className="h-4 w-4" />}
          />
        </div>

        <div>
          <Label htmlFor="spiritual_gifts">Spiritual Gifts</Label>
          <Input
            id="spiritual_gifts"
            value={formData.spiritual_gifts?.join(', ') || ''}
            onChange={(e) => onChange('spiritual_gifts', e.target.value.split(',').map(s => s.trim()))}
            icon={<Gift className="h-4 w-4" />}
            placeholder="e.g., Teaching, Leadership, Service"
          />
        </div>

        <div>
          <Label htmlFor="ministry_interests">Ministry Interests</Label>
          <Input
            id="ministry_interests"
            value={formData.ministry_interests?.join(', ') || ''}
            onChange={(e) => onChange('ministry_interests', e.target.value.split(',').map(s => s.trim()))}
            icon={<Heart className="h-4 w-4" />}
            placeholder="e.g., Youth, Worship, Outreach"
          />
        </div>

        <div>
          <Label htmlFor="volunteer_roles">Volunteer Roles</Label>
          <Input
            id="volunteer_roles"
            value={formData.volunteer_roles?.join(', ') || ''}
            onChange={(e) => onChange('volunteer_roles', e.target.value.split(',').map(s => s.trim()))}
            icon={<UserPlus className="h-4 w-4" />}
            placeholder="e.g., Usher, Sunday School Teacher"
          />
        </div>

        <div>
          <Label htmlFor="small_groups">Small Groups</Label>
          <Input
            id="small_groups"
            value={formData.small_groups?.join(', ') || ''}
            onChange={(e) => onChange('small_groups', e.target.value.split(',').map(s => s.trim()))}
            icon={<Users className="h-4 w-4" />}
            placeholder="e.g., Young Adults, Bible Study"
          />
        </div>

        <div>
          <Label htmlFor="ministries">Ministries</Label>
          <Input
            id="ministries"
            value={formData.ministries?.join(', ') || ''}
            onChange={(e) => onChange('ministries', e.target.value.split(',').map(s => s.trim()))}
            icon={<Heart className="h-4 w-4" />}
            placeholder="e.g., Children's Ministry, Music Ministry"
          />
        </div>
      </div>
    </div>
  );
}