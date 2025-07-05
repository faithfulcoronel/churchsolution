import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessageThreadRepository } from '../../hooks/useMessageThreadRepository';
import { useMessageRepository } from '../../hooks/useMessageRepository';
import type { Message } from '../../models/message.model';
import BackButton from '../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui2/card';
import { Textarea } from '../../components/ui2/textarea';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Separator } from '../../components/ui2/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui2/avatar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui2/tooltip';
import { useUserRepository } from '../../hooks/useUserRepository';
import { supabase } from '../../lib/supabase';
import type { User } from '../../models/user.model';
import { Loader2, Send, MessageCircle, AlertTriangle, User as UserIcon, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { useQuery, useUpdate } = useMessageThreadRepository();
  const { useQuery: useMessagesQuery, useCreate } = useMessageRepository();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const [body, setBody] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch thread data
  const { data: result, isLoading: threadLoading } = useQuery({ 
    filters: { id: { operator: 'eq', value: id } } 
  });
  const thread = result?.data?.[0];
  
  // Fetch messages separately to ensure we get the latest
  const { data: messagesResult, isLoading: messagesLoading } = useMessagesQuery({
    filters: { thread_id: { operator: 'eq', value: id } },
    order: { column: 'created_at', ascending: true }
  });
  const messages = messagesResult?.data as Message[] | undefined;

  // Fetch user details for message senders
  const { useQuery: useUsersQuery } = useUserRepository();
  const senderIds = Array.from(new Set(messages?.map(m => m.sender_id) || []));
  const { data: usersResult } = useUsersQuery({
    filters: { id: { operator: 'isAnyOf', value: senderIds } },
    enabled: senderIds.length > 0
  });
  const users = (usersResult?.data || []) as User[];
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim() || !id) return;

    try {
      // Create the message
      await createMutation.mutateAsync({ data: { thread_id: id, body } });
      
      // Update thread status to pending if it was resolved
      if (thread?.status === 'resolved') {
        await updateMutation.mutateAsync({
          id,
          data: { status: 'pending' }
        });
      }
      
      // Clear the input
      setBody('');

      // Schedule notification if no reply within 5 minutes
      if (user && thread) {
        const other = messages?.find(m => m.sender_id !== user.id)?.sender_id;
        const recipientId = thread.created_by === user.id ? other || thread.created_by : thread.created_by;
        if (recipientId) {
          setTimeout(async () => {
            const { data: latest } = await supabase
              .from('messages')
              .select('sender_id')
              .eq('thread_id', id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (latest && latest.sender_id === user.id) {
              await supabase.from('notifications').insert({
                user_id: recipientId,
                tenant_id: thread.tenant_id,
                title: 'New Support Message',
                message: `New message in thread "${thread.subject}"`,
                type: 'info',
                action_type: 'redirect',
                action_payload: `/support/${id}`,
                is_read: false
              });
            }
          }, 5 * 60 * 1000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleResolve = async () => {
    if (!id) return;
    
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: 'resolved' }
      });
    } catch (error) {
      console.error('Error resolving thread:', error);
    }
  };
  
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  
  const isCurrentUserMessage = (message: Message) => {
    return message.sender_id === user?.id;
  };
  
  const formatMessageDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return `Today at ${format(messageDate, 'h:mm a')}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(messageDate, 'h:mm a')}`;
    } else {
      return format(messageDate, 'MMM d, yyyy h:mm a');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (threadLoading || messagesLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
        <BackButton fallbackPath="/support" label="Back to Support" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-warning mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Thread Not Found</h3>
            <p className="text-muted-foreground mb-6">The message thread you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/support')}>
              Return to Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <BackButton fallbackPath="/support" label="Back" />
      
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                {thread.subject}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Created {format(new Date(thread.created_at!), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(thread.status)}
              {thread.status !== 'resolved' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleResolve}
                  className="flex items-center"
                >
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUserMessage(message)}
                  formatDate={formatMessageDate}
                  getInitials={getInitials}
                  sender={userMap.get(message.sender_id)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No messages in this thread yet.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <Separator />
          
          <div className="p-4 bg-muted/20">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  placeholder="Type your message here..." 
                  className="min-h-[100px] resize-none"
                  onKeyDown={handleKeyDown}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSend} 
                    disabled={!body.trim() || createMutation.isPending}
                    className="flex items-center"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  formatDate: (date: string) => string;
  getInitials: (email: string) => string;
  sender?: User;
}

function MessageBubble({ message, isCurrentUser, formatDate, getInitials, sender }: MessageBubbleProps) {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 mt-1">
                {sender?.raw_user_meta_data?.profile_picture_url && (
                  <AvatarImage
                    src={sender.raw_user_meta_data.profile_picture_url}
                    alt={sender.raw_user_meta_data?.first_name || sender.email}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <AvatarFallback className={isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                  {sender ? getInitials(sender.email) : <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            {sender && (
              <TooltipContent>{
                `${(sender.raw_user_meta_data as any)?.first_name || ''} ${(sender.raw_user_meta_data as any)?.last_name || ''}`.trim() || sender.email
              }</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg p-3 ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <p className="whitespace-pre-wrap text-sm">{message.body}</p>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {formatDate(message.created_at!)}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'resolved':
      return (
        <Badge variant="success" className="flex items-center">
          Resolved
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning" className="flex items-center">
          Pending
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="flex items-center">
          {status}
        </Badge>
      );
  }
}

export default ThreadDetail;
