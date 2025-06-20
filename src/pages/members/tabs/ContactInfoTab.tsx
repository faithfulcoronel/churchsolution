import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { Mail, Phone, MapPin, User } from 'lucide-react';

interface ContactInfoTabProps {
  member: any;
}

function ContactInfoTab({ member }: ContactInfoTabProps) {
  if (!member) return null;
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

export default ContactInfoTab;

export { ContactInfoTab }