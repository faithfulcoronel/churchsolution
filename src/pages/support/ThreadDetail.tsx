import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessageThreadRepository } from '../../hooks/useMessageThreadRepository';
import { useMessageRepository } from '../../hooks/useMessageRepository';
import type { Message } from '../../models/message.model';
import BackButton from '../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Textarea } from '../../components/ui2/textarea';
import { Button } from '../../components/ui2/button';
import { Loader2, Send } from 'lucide-react';

function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const { useQuery } = useMessageThreadRepository();
  const { useCreate } = useMessageRepository();
  const createMutation = useCreate();
  const [body, setBody] = useState('');

  const { data: result, isLoading } = useQuery({ filters: { id: { operator: 'eq', value: id } } });
  const thread = result?.data?.[0];
  const messages = thread?.messages as Message[] | undefined;

  const handleSend = async () => {
    if (!body.trim() || !id) return;
    await createMutation.mutateAsync({ data: { thread_id: id, body } });
    setBody('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <BackButton fallbackPath="/support" label="Back" />
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">{thread.subject}</h3>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[50vh] overflow-y-auto">
          {messages?.map(m => (
            <div key={m.id} className="border rounded p-2">
              <p className="text-sm whitespace-pre-wrap">{m.body}</p>
              <p className="text-xs text-muted-foreground text-right mt-1">{new Date(m.created_at!).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="space-x-2">
          <Textarea value={body} onChange={e => setBody(e.target.value)} className="flex-1" rows={3} />
          <Button onClick={handleSend} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ThreadDetail;
