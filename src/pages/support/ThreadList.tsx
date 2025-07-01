import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMessageThreadRepository } from '../../hooks/useMessageThreadRepository';
import type { MessageThread } from '../../models/messageThread.model';
import { Card, CardContent, CardHeader } from '../../components/ui2/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui2/table';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Badge } from '../../components/ui2/badge';
import { Plus, Loader2, Search, MessageCircle, Calendar, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

function ThreadList() {
  const { useQuery } = useMessageThreadRepository();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: result, isLoading } = useQuery({ order: { column: 'created_at', ascending: false } });
  const threads = (result?.data as MessageThread[]) || [];

  const filtered = threads.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.messages && t.messages.some(m => m.body.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleThreadClick = (id: string) => {
    navigate(`/support/${id}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
            <MessageCircle className="h-6 w-6 mr-2 text-primary" />
            Support Messages
          </h1>
          <p className="text-muted-foreground">Contact the administrators about issues or questions</p>
        </div>
        <Link to="add">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" /> New Message
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:max-w-xs">
          <Input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search messages..." 
            icon={<Search className="h-4 w-4" />}
            clearable
            onClear={() => setSearchTerm('')}
          />
        </div>
        <div className="flex-1 text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'thread' : 'threads'} found
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <h3 className="text-lg font-medium flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            Message Threads
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Subject</TableHead>
                  <TableHead className="w-1/6">Status</TableHead>
                  <TableHead className="w-1/6">Created</TableHead>
                  <TableHead className="w-1/6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((thread) => (
                  <TableRow 
                    key={thread.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleThreadClick(thread.id)}
                  >
                    <TableCell>
                      <div className="font-medium">{thread.subject}</div>
                      {thread.messages && thread.messages.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {thread.messages[thread.messages.length - 1].body}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(thread.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {format(new Date(thread.created_at!), 'MMM d, yyyy')}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1.5" />
                          {format(new Date(thread.created_at!), 'h:mm a')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThreadClick(thread.id);
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No message threads found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search term' : 'Start a new conversation with the support team'}
              </p>
              <Link to="add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> New Message
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ThreadList;