import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { container } from '@/lib/container';
import { TYPES } from '@/lib/types';
import type { AnnouncementService } from '@/services/AnnouncementService';
import type { Announcement } from '@/models/announcement.model';
import { Card, CardContent, CardHeader } from '../ui2/card';
import { Badge } from '../ui2/badge';
import { Megaphone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AnnouncementsProps {
  messages?: string[];
}

export function Announcements({ messages }: AnnouncementsProps) {
  const service = container.get<AnnouncementService>(TYPES.AnnouncementService);

  const { data } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: () => service.getActiveAnnouncements(),
    enabled: !messages,
  });

  const toRender = messages
    ? messages.map((m, i) => ({ id: String(i), message: m }))
    : data || [];

  if (!toRender || toRender.length === 0) return null;

  return (
    <div className="space-y-4">
      {toRender.map((announcement) => (
        <Card 
          key={announcement.id} 
          className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Megaphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground whitespace-pre-line">
                  {announcement.message}
                </p>
                
                {announcement.starts_at && (
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {format(new Date(announcement.starts_at), 'MMM d, yyyy')}
                      {announcement.ends_at && ` - ${format(new Date(announcement.ends_at), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Announcements;
