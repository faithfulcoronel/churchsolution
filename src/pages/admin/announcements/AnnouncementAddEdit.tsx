import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnnouncementRepository } from '../../../hooks/useAnnouncementRepository';
import type { Announcement } from '../../../models/announcement.model';
import BackButton from '../../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Switch } from '../../../components/ui2/switch';
import { DatePickerInput } from '../../../components/ui2/date-picker';
import { Textarea } from '../../../components/ui2/textarea';
import { Button } from '../../../components/ui2/button';
import { Save, Loader2, Bell } from 'lucide-react';

function AnnouncementAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { useQuery, useCreate, useUpdate } = useAnnouncementRepository();

  const [formData, setFormData] = useState<Partial<Announcement>>({
    message: '',
    active: true,
    starts_at: undefined,
    ends_at: undefined,
  });

  const { data: announcementData, isLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && announcementData?.data?.[0]) {
      setFormData(announcementData.data[0]);
    }
  }, [isEdit, announcementData]);

  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message?.trim()) return;

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync({ data: formData });
      }
      navigate('/administration/announcements');
    } catch (err) {
      console.error('Error saving announcement', err);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/administration/announcements" label="Back to Announcements" />
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Bell className="h-6 w-6 mr-2 text-primary" />
              <h3 className="text-lg font-medium">
                {isEdit ? 'Edit Announcement' : 'New Announcement'}
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              label="Message"
              value={formData.message || ''}
              onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DatePickerInput
                label="Start Date"
                value={formData.starts_at ? new Date(formData.starts_at) : undefined}
                onChange={d => setFormData(prev => ({ ...prev, starts_at: d ? d.toISOString() : undefined }))}
              />
              <DatePickerInput
                label="End Date"
                value={formData.ends_at ? new Date(formData.ends_at) : undefined}
                onChange={d => setFormData(prev => ({ ...prev, ends_at: d ? d.toISOString() : undefined }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.active ?? true}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate('/administration/announcements')}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> {isEdit ? 'Save Changes' : 'Create Announcement'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default AnnouncementAddEdit;
