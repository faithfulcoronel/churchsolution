import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { container } from '@/lib/container';
import { TYPES } from '@/lib/types';
import type { AnnouncementService } from '@/services/AnnouncementService';
import type { Announcement } from '@/models/announcement.model';
import { Card, CardContent } from '../ui2/card';

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

  if (toRender.length === 0) return null;

  return (
    <Card className="max-w-md">
      <CardContent className="p-4 space-y-2">
        {toRender.map((a) => (
          <p key={a.id} className="text-sm text-muted-foreground">
            {a.message}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

export default Announcements;
