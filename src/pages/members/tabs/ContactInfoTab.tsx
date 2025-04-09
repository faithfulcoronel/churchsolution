import React from 'react';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Label } from '../../../components/ui2/label';
import { Mail, Phone, MapPin, Users } from 'lucide-react';

interface ContactInfoTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ContactInfoTab({ formData, onChange }: ContactInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            icon={<Mail className="h-4 w-4" />}
          />
        </div>

        <div>
          <Label htmlFor="contact_number">Contact Number *</Label>
          <Input
            id="contact_number"
            value={formData.contact_number || ''}
            onChange={(e) => onChange('contact_number', e.target.value)}
            required
            icon={<Phone className="h-4 w-4" />}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            value={formData.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name || ''}
            onChange={(e) => onChange('emergency_contact_name', e.target.value)}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone || ''}
            onChange={(e) => onChange('emergency_contact_phone', e.target.value)}
            icon={<Phone className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}