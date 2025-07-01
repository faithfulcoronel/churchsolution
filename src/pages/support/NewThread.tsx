import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessageThreadRepository } from '../../hooks/useMessageThreadRepository';
import { useMessageRepository } from '../../hooks/useMessageRepository';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Textarea } from '../../components/ui2/textarea';
import { Button } from '../../components/ui2/button';
import { Avatar, AvatarFallback } from '../../components/ui2/avatar';
import BackButton from '../../components/BackButton';
import { Save, Loader2, MessageCircle, AlertCircle, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

function NewThread() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { useCreate: useCreateThread } = useMessageThreadRepository();
  const { useCreate: useCreateMessage } = useMessageRepository();
  const createThread = useCreateThread();
  const createMessage = useCreateMessage();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    
    if (!body.trim()) {
      setError('Message is required');
      return;
    }
    
    try {
      const thread = await createThread.mutateAsync({ data: { subject, status: 'pending' } });
      await createMessage.mutateAsync({ data: { thread_id: thread.id, body } });
      navigate(`/support/${thread.id}`);
    } catch (err) {
      console.error('Error creating support thread:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating your message');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/support" label="Back to Support" />
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-primary" />
              New Support Message
            </CardTitle>
            <CardDescription>
              Create a new support thread to get help from our team
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            <Input 
              label="Subject" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
              placeholder="Brief description of your issue or question"
              error={error && !subject.trim() ? 'Subject is required' : undefined}
            />
            
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email ? getInitials(user.email) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  label="Message" 
                  rows={8} 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  required 
                  placeholder="Describe your issue in detail..."
                  error={error && !body.trim() ? 'Message is required' : undefined}
                />
              </div>
            </div>
            
            {error && !error.includes('required') && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t bg-muted/20 flex justify-end space-x-3 p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/support')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createThread.isPending || createMessage.isPending}
            >
              {createThread.isPending || createMessage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" /> Send Message
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default NewThread;
