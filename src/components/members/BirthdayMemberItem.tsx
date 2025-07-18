import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { Cake } from 'lucide-react';

interface BirthdayMember {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  profile_picture_url: string | null;
}

function calculateAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function BirthdayMemberItem({ member }: { member: BirthdayMember }) {
  const age = calculateAge(member.birthday);
  const dateLabel = new Date(member.birthday).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/members/${member.id}`} className="block">
      <Card size="sm" hoverable className="dark:bg-gray-600">
        <CardContent className="flex justify-between gap-4 items-center py-3 px-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
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
                {member.first_name.charAt(0)}
                {member.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {member.first_name} {member.last_name}
              </span>
              <span className="text-sm text-muted-foreground">
                {dateLabel} • {age}
              </span>
            </div>
          </div>
          <Cake className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default BirthdayMemberItem;
