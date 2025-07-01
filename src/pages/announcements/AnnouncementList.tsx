import React, { useState } from 'react';
import { useAnnouncementRepository } from '../../hooks/useAnnouncementRepository';
import type { Announcement } from '../../models/announcement.model';
import { Card, CardContent } from '../../components/ui2/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui2/table';
import { Input } from '../../components/ui2/input';
import { Loader2 } from 'lucide-react';

function AnnouncementList() {
  const { useQuery } = useAnnouncementRepository();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: result, isLoading } = useQuery({
    order: { column: 'starts_at', ascending: false }
  });

  const announcements = (result?.data as Announcement[]) || [];
  const filtered = announcements.filter(a =>
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Latest announcements for your account.</p>
      </div>
      <div className="max-w-sm">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search announcements..."
        />
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-32">Start</TableHead>
                  <TableHead className="w-32">End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.message}</TableCell>
                    <TableCell>{a.starts_at ? new Date(a.starts_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{a.ends_at ? new Date(a.ends_at).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No announcements found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AnnouncementList;
