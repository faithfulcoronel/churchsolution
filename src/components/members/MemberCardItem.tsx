import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { Badge } from '../ui2/badge';
import { Mail, Phone, MapPin } from 'lucide-react';

export interface MemberCardItemData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  membership_date: string | null;
  membership_status: { name: string; code: string } | null;
  profile_picture_url: string | null;
  created_at: string | null;
  address?: string | null;
}

interface MemberCardItemProps {
  member: MemberCardItemData;
  showAddress?: boolean;
}

const statusVariantMap: Record<string, 'success' | 'info' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  visitor: 'info',
  inactive: 'secondary',
};

export function MemberCardItem({ member, showAddress = false }: MemberCardItemProps) {
  const variant = statusVariantMap[member.membership_status?.code || ''] || 'secondary';
  const joinedDate = member.membership_date || member.created_at;

  return (
    <Link to={`/members/${member.id}`} className="block">
      <Card size="sm" className="dark:bg-gray-600" hoverable>
        <CardContent className="flex justify-between gap-4 items-start py-3 px-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar size="xl">
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
            <div className="flex flex-col mt-1">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {member.first_name} {member.last_name}
              </span>
              {member.email && (
                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-1" />
                  {member.email}
                </span>
              )}
              {member.contact_number && (
                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  {member.contact_number}
                </span>
              )}
              {showAddress && member.address && (
                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {member.address}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            {member.membership_status?.name && (
              <Badge variant={variant} className="text-sm font-medium">
                {member.membership_status.name}
              </Badge>
            )}
            <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Member since{' '}
              {joinedDate
                ? new Date(joinedDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default MemberCardItem;
