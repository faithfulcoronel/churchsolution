import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMessageThreadRepository } from '../../hooks/useMessageThreadRepository';
import type { MessageThread } from '../../models/messageThread.model';
import { Card, CardContent } from '../../components/ui2/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui2/table';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Plus, Loader2 } from 'lucide-react';

function ThreadList() {
  const { useQuery } = useMessageThreadRepository();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: result, isLoading } = useQuery({ order: { column: 'created_at', ascending: false } });
  const threads = (result?.data as MessageThread[]) || [];

  const filtered = threads.filter(t => t.subject.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Messages</h1>
          <p className="text-muted-foreground">Contact the admins about issues.</p>
        </div>
        <Link to="add">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Message
          </Button>
        </Link>
      </div>
      <div className="max-w-sm">
        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." />
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id} asChild>
                    <Link to={t.id} className="cursor-pointer hover:bg-accent">
                      <TableCell>{t.subject}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>{new Date(t.created_at!).toLocaleDateString()}</TableCell>
                    </Link>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No messages found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ThreadList;
