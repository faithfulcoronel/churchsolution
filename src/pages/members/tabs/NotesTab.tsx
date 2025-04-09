import React from 'react';
import { Textarea } from '../../../components/ui2/textarea';
import { Label } from '../../../components/ui2/label';

interface NotesTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function NotesTab({ formData, onChange }: NotesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="pastoral_notes">Pastoral Notes</Label>
        <Textarea
          id="pastoral_notes"
          value={formData.pastoral_notes || ''}
          onChange={(e) => onChange('pastoral_notes', e.target.value)}
          rows={3}
          placeholder="Enter pastoral notes..."
        />
      </div>

      <div>
        <Label htmlFor="prayer_requests">Prayer Requests</Label>
        <Textarea
          id="prayer_requests"
          value={formData.prayer_requests?.join('\n') || ''}
          onChange={(e) => onChange('prayer_requests', e.target.value.split('\n').map(s => s.trim()))}
          rows={3}
          placeholder="Enter each prayer request on a new line"
        />
      </div>
    </div>
  );
}