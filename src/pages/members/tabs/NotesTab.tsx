import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Textarea } from '../../../components/ui2/textarea';
import { Loader2, Save } from 'lucide-react';

interface NotesTabProps {
  member: any;
}

function NotesTab({ member }: NotesTabProps) {
  const [notes, setNotes] = useState(member?.pastoral_notes || '');
  const [prayerRequests, setPrayerRequests] = useState<string[]>(member?.prayer_requests || []);
  const [newPrayerRequest, setNewPrayerRequest] = useState('');
  const queryClient = useQueryClient();

  if (!member) return null;

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('members')
        .update({ 
          pastoral_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', member.id] });
    }
  });

  // Update prayer requests mutation
  const updatePrayerRequestsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('members')
        .update({ 
          prayer_requests: prayerRequests,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', member.id] });
      setNewPrayerRequest('');
    }
  });

  const handleAddPrayerRequest = () => {
    if (newPrayerRequest.trim()) {
      const updatedRequests = [...prayerRequests, newPrayerRequest.trim()];
      setPrayerRequests(updatedRequests);
      updatePrayerRequestsMutation.mutate();
    }
  };

  const handleRemovePrayerRequest = (index: number) => {
    const updatedRequests = [...prayerRequests];
    updatedRequests.splice(index, 1);
    setPrayerRequests(updatedRequests);
    updatePrayerRequestsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Pastoral Notes</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter pastoral notes here..."
            className="min-h-[150px] mb-4"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => updateNotesMutation.mutate()}
              disabled={updateNotesMutation.isPending}
            >
              {updateNotesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Prayer Requests</h3>
          
          <div className="space-y-4 mb-6">
            {prayerRequests && prayerRequests.length > 0 ? (
              <ul className="space-y-2">
                {prayerRequests.map((request, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span>{request}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemovePrayerRequest(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No prayer requests recorded.</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={newPrayerRequest}
              onChange={(e) => setNewPrayerRequest(e.target.value)}
              placeholder="Add a new prayer request..."
              className="flex-1"
            />
            <Button 
              onClick={handleAddPrayerRequest}
              disabled={!newPrayerRequest.trim() || updatePrayerRequestsMutation.isPending}
            >
              {updatePrayerRequestsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotesTab;

export { NotesTab }