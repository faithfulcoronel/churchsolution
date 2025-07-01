import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessageThreadRepository } from '../../hooks/useMessageThreadRepository';
import { useMessageRepository } from '../../hooks/useMessageRepository';
import BackButton from '../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Textarea } from '../../components/ui2/textarea';
import { Button } from '../../components/ui2/button';
import { Save, Loader2 } from 'lucide-react';

function NewThread() {
  const navigate = useNavigate();
  const { useCreate: useCreateThread } = useMessageThreadRepository();
  const { useCreate: useCreateMessage } = useMessageRepository();
  const createThread = useCreateThread();
  const createMessage = useCreateMessage();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    const thread = await createThread.mutateAsync({ data: { subject } });
    await createMessage.mutateAsync({ data: { thread_id: thread.id, body } });
    navigate(`/support/${thread.id}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/support" label="Back" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">New Support Message</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
            <Textarea label="Message" rows={5} value={body} onChange={e => setBody(e.target.value)} required />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="submit" disabled={createThread.isPending || createMessage.isPending}>
              {createThread.isPending || createMessage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Send
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
