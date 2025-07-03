import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { Badge } from '../ui2/badge';
import { Mail, Phone } from 'lucide-react';

export interface RecentMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  membership_date: string | null;
  membership_status: { name: string; code: string } | null;
  profile_picture_url: string | null;
  created_at: string | null;
}

interface RecentMemberItemProps {
  member: RecentMember;
}

const statusVariantMap: Record<string, 'success' | 'info' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  visitor: 'info',
  inactive: 'secondary',
};

export function RecentMemberItem({ member }: RecentMemberItemProps) {
  const variant = statusVariantMap[member.membership_status?.code || ''] || 'secondary';
  const joinedDate = member.membership_date || member.created_at;
  return (
    <Card size="sm" hoverable>
      <CardContent className="flex justify-between gap-4 items-start py-3 px-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar size="md">
            {member.profile_picture_url && (
              <AvatarImage
                src={member.profile_picture_url}
                alt={`${member.first_name} ${member.last_name}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 font-semibold">
              {member.first_name.charAt(0)}{member.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {member.first_name} {member.last_name}
            </span>
            {member.email && (
              <span className="flex items-center text-md text-gray-500 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-1" />
                {member.email}
              </span>
            )}
            {member.contact_number && (
              <span className="flex items-center text-md text-gray-500 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-1" />
                {member.contact_number}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {member.membership_status?.name && (
            <Badge variant={variant} className="text-md font-medium">
              {member.membership_status.name}
            </Badge>
          )}
          <span className="text-md text-gray-400 dark:text-gray-500 mt-1">
            Joined{' '}
            {joinedDate
            ? new Date(joinedDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
            : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentMemberItem;
