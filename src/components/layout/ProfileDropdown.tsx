import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../ui2/avatar';
import { Button } from '../ui2/button';
import { Badge } from '../ui2/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui2/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
} from 'lucide-react';

export function ProfileDropdown() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Get associated member data
  const { data: memberData } = useQuery({
    queryKey: ['current-user-member', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;

      // Then get the member details
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, first_name, last_name, profile_picture_url, leadership_position')
        .eq('email', user.email)
        .is('deleted_at', null)
        .single();

      if (memberError) {
        console.error('Error fetching member data:', memberError);
        return null;
      }

      return member;
    },
    enabled: !!user?.email,
  });

  const handleLogout = async () => {
    await useAuthStore.getState().signOut();
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full"
        >
          {memberData?.profile_picture_url ? (
            <Avatar
              src={memberData.profile_picture_url}
              alt={`${memberData.first_name} ${memberData.last_name}`}
              className="h-10 w-10"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {memberData ? memberData.first_name[0] : user.email[0].toUpperCase()}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* Profile Info */}
        <div className="flex items-center gap-4 p-4">
          {memberData?.profile_picture_url ? (
            <Avatar
              src={memberData.profile_picture_url}
              alt={`${memberData.first_name} ${memberData.last_name}`}
              className="h-16 w-16"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xl font-medium">
                {memberData ? memberData.first_name[0] : user.email[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">
              {memberData ? `${memberData.first_name} ${memberData.last_name}` : 'Guest User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {memberData?.leadership_position && (
              <Badge variant="secondary" className="mt-1 w-fit">
                {memberData.leadership_position}
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Menu Items */}
        {memberData && (
          <DropdownMenuItem onClick={() => navigate(`/members/${memberData.id}`)}>
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}