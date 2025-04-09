import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationRepository } from '../../hooks/useNotificationRepository';
import { Button } from '../ui2/button';
import { ScrollArea } from '../ui2/scroll-area';
import { Badge } from '../ui2/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui2/dropdown-menu';
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Check,
  Loader2,
} from 'lucide-react';

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { useQuery, useUpdate } = useNotificationRepository();

  // Get notifications
  const { data: result, isLoading } = useQuery({
    filters: {
      user_id: {
        operator: 'eq',
        value: user?.id
      },
      read: {
        operator: 'eq',
        value: false
      }
    },
    order: {
      column: 'created_at',
      ascending: false
    }
  });

  const notifications = result?.data || [];
  const unreadCount = notifications.length;

  // Mark notification as read mutation
  const markAsReadMutation = useUpdate();

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read
      await markAsReadMutation.mutateAsync({
        id: notification.id,
        data: { read: true }
      });

      // Navigate if action URL provided
      if (notification.action_url) {
        navigate(notification.action_url);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-4 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.action_text && (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        {notification.action_text}
                      </Button>
                    )}
                  </div>
                  {markAsReadMutation.isPending && markAsReadMutation.variables?.id === notification.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Check className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No new notifications
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}