import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Member } from '../../../models/member.model';

interface ContactInfoTabProps {
  member: Partial<Member>;
  onChange: (field: string, value: any) => void;
  mode?: 'view' | 'edit' | 'add';
  errors?: Record<string, string[]>;
}

function ContactInfoTab({ member, onChange, mode = 'view', errors }: ContactInfoTabProps) {
  if (!member) return null;
  if (mode === 'view') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <dl className="space-y-4">
              {member.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="mt-1">
                      <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                        {member.email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              
              {member.contact_number && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="mt-1">
                      <a href={`tel:${member.contact_number}`} className="text-primary hover:underline">
                        {member.contact_number}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              
              {member.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                    <dd className="mt-1 whitespace-pre-line">{member.address}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
            {member.emergency_contact_name || member.emergency_contact_phone ? (
              <dl className="space-y-4">
                {member.emergency_contact_name && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="mt-1">{member.emergency_contact_name}</dd>
                    </div>
                  </div>
                )}
                
                {member.emergency_contact_phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                      <dd className="mt-1">
                        <a href={`tel:${member.emergency_contact_phone}`} className="text-primary hover:underline">
                          {member.emergency_contact_phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground">No emergency contact information provided.</p>
            )}
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
              label="Email"
              value={member.email || ''}
              onChange={e => onChange('email', e.target.value)}
            />
            <Input
              label="Phone"
              value={member.contact_number || ''}
              onChange={e => onChange('contact_number', e.target.value)}
              required
              error={errors?.contact_number?.[0]}
            />
            <Textarea
              value={member.address || ''}
              onChange={e => onChange('address', e.target.value)}
              placeholder="Address"
              className="min-h-[80px]"
              required
            />
            {errors?.address?.[0] && (
              <p className="text-sm text-destructive">{errors.address[0]}</p>
            )}
          </div>
          <div className="space-y-4">
            <Input
              label="Emergency Contact Name"
              value={member.emergency_contact_name || ''}
              onChange={e => onChange('emergency_contact_name', e.target.value)}
            />
            <Input
              label="Emergency Contact Phone"
              value={member.emergency_contact_phone || ''}
              onChange={e => onChange('emergency_contact_phone', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactInfoTab;

