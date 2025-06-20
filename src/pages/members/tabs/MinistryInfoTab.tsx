import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { Badge } from '../../../components/ui2/badge';
import { Input } from '../../../components/ui2/input';
import { Member } from '../../../models/member.model';

interface MinistryInfoTabProps {
  member: Partial<Member>;
  onChange: (field: string, value: any) => void;
  mode?: 'view' | 'edit' | 'add';
}

function MinistryInfoTab({ member, onChange, mode = 'view' }: MinistryInfoTabProps) {
  if (!member) return null;
  if (mode === 'view') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Ministry Involvement</h3>
            
            <div className="space-y-4">
              {member.leadership_position && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Leadership Position</h4>
                  <p className="mt-1">{member.leadership_position}</p>
                </div>
              )}
              
              {member.ministries && member.ministries.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Ministries</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.ministries.map((ministry: string, index: number) => (
                      <Badge key={index} variant="outline">{ministry}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Ministries</h4>
                  <p className="mt-1 text-muted-foreground">No ministries listed</p>
                </div>
              )}
              
              {member.small_groups && member.small_groups.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Small Groups</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.small_groups.map((group: string, index: number) => (
                      <Badge key={index} variant="outline">{group}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Small Groups</h4>
                  <p className="mt-1 text-muted-foreground">No small groups listed</p>
                </div>
              )}
              
              {member.volunteer_roles && member.volunteer_roles.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Volunteer Roles</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.volunteer_roles.map((role: string, index: number) => (
                      <Badge key={index} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Volunteer Roles</h4>
                  <p className="mt-1 text-muted-foreground">No volunteer roles listed</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Spiritual Information</h3>
            
            <div className="space-y-4">
              {member.spiritual_gifts && member.spiritual_gifts.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Spiritual Gifts</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.spiritual_gifts.map((gift: string, index: number) => (
                      <Badge key={index} variant="secondary">{gift}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Spiritual Gifts</h4>
                  <p className="mt-1 text-muted-foreground">No spiritual gifts listed</p>
                </div>
              )}
              
              {member.ministry_interests && member.ministry_interests.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Ministry Interests</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.ministry_interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Ministry Interests</h4>
                  <p className="mt-1 text-muted-foreground">No ministry interests listed</p>
                </div>
              )}
              
              {member.attendance_rate !== null && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Attendance Rate</h4>
                  <p className="mt-1">{member.attendance_rate}%</p>
                </div>
              )}
              
              {member.last_attendance_date && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Attendance</h4>
                  <p className="mt-1">{new Date(member.last_attendance_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  }

  const listToString = (arr?: string[]) => (arr ? arr.join(', ') : '');
  const handleListChange = (field: string, value: string) => {
    const parsed = value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    onChange(field, parsed);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label="Leadership Position"
              value={member.leadership_position || ''}
              onChange={e => onChange('leadership_position', e.target.value)}
            />
            <Input
              label="Ministries (comma separated)"
              value={listToString(member.ministries)}
              onChange={e => handleListChange('ministries', e.target.value)}
            />
            <Input
              label="Small Groups (comma separated)"
              value={listToString(member.small_groups)}
              onChange={e => handleListChange('small_groups', e.target.value)}
            />
            <Input
              label="Volunteer Roles (comma separated)"
              value={listToString(member.volunteer_roles)}
              onChange={e => handleListChange('volunteer_roles', e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <Input
              label="Spiritual Gifts (comma separated)"
              value={listToString(member.spiritual_gifts)}
              onChange={e => handleListChange('spiritual_gifts', e.target.value)}
            />
            <Input
              label="Ministry Interests (comma separated)"
              value={listToString(member.ministry_interests)}
              onChange={e => handleListChange('ministry_interests', e.target.value)}
            />
            <Input
              type="number"
              label="Attendance Rate"
              value={member.attendance_rate ?? ''}
              onChange={e => onChange('attendance_rate', Number(e.target.value))}
            />
            <Input
              type="date"
              label="Last Attendance"
              value={member.last_attendance_date || ''}
              onChange={e => onChange('last_attendance_date', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MinistryInfoTab;

