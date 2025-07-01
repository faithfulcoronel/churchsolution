import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '../ui2/card';

interface AnnouncementsProps {
  messages?: string[];
}

interface Announcement {
  id: number;
  message: string;
}

export function Announcements({ messages }: AnnouncementsProps) {
  const { data } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, message')
        .eq('active', true);
      if (error) {
        console.error('Error fetching announcements:', error);
        return [];
      }
      return data as Announcement[];
    },
    enabled: !messages,
  });

  const toRender = messages
    ? messages.map((m, i) => ({ id: i, message: m }))
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
