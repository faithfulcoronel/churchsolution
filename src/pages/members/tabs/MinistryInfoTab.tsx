import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { Badge } from '../../../components/ui2/badge';

interface MinistryInfoTabProps {
  member: any;
}

function MinistryInfoTab({ member }: MinistryInfoTabProps) {
  if (!member) return null;
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

export default MinistryInfoTab;
