import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';

interface BasicInfoTabProps {
  member: any;
}

function BasicInfoTab({ member }: BasicInfoTabProps) {
  if (!member) return null;
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

export default BasicInfoTab;

export { BasicInfoTab }