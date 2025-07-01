import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnnouncementRepository } from '../../../hooks/useAnnouncementRepository';
import { Announcement } from '../../../models/announcement.model';
import BackButton from '../../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Switch } from '../../../components/ui2/switch';
import { DatePickerInput } from '../../../components/ui2/date-picker';
import { Textarea } from '../../../components/ui2/textarea';
import { Button } from '../../../components/ui2/button';
import { Save, Loader2, Megaphone, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

function AnnouncementAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { useQuery, useCreate, useUpdate } = useAnnouncementRepository();
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    
    if (!formData.message?.trim()) {
      setError('Message is required');
      return;
    }
    
    // Validate date range
    if (formData.starts_at && formData.ends_at) {
      const startDate = new Date(formData.starts_at);
      const endDate = new Date(formData.ends_at);
      
      if (endDate < startDate) {
        setError('End date must be after start date');
        return;
      }
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync({ data: formData });
      }
      navigate('/administration/announcements', { replace: true });
    } catch (err) {
      console.error('Error saving announcement', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
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
      
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Megaphone className="h-6 w-6 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">
                    {isEdit ? 'Edit Announcement' : 'New Announcement'}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  label="Announcement Message"
                  value={formData.message || ''}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  required
                  placeholder="Enter your announcement message here..."
                  error={error && !formData.message?.trim() ? 'Message is required' : undefined}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DatePickerInput
                    label="Start Date"
                    value={formData.starts_at ? new Date(formData.starts_at) : undefined}
                    onChange={d => setFormData(prev => ({ ...prev, starts_at: d ? d.toISOString() : undefined }))}
                    icon={<Calendar className="h-4 w-4" />}
                    placeholder="Optional start date"
                  />
                  <DatePickerInput
                    label="End Date"
                    value={formData.ends_at ? new Date(formData.ends_at) : undefined}
                    onChange={d => setFormData(prev => ({ ...prev, ends_at: d ? d.toISOString() : undefined }))}
                    icon={<Calendar className="h-4 w-4" />}
                    placeholder="Optional end date"
                    error={error && error.includes('End date') ? error : undefined}
                  />
                </div>
                
                {error && !error.includes('End date') && !error.includes('required') && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 flex items-start">
                    <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}
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
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <h3 className="text-base font-medium">Announcement Settings</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Status</label>
                    <Switch
                      checked={formData.active ?? true}
                      onCheckedChange={checked => setFormData(prev => ({ ...prev, active: checked }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.active ? 
                      'This announcement is active and will be displayed to users.' : 
                      'This announcement is inactive and will not be displayed.'}
                  </p>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                    Preview
                  </h4>
                  <div className="rounded-md bg-card border p-3 mt-2">
                    <div className="flex justify-between items-start mb-2">
                      <Megaphone className="h-4 w-4 text-primary mt-1" />
                      <Badge 
                        variant={formData.active ? 'success' : 'secondary'} 
                        className="flex items-center"
                      >
                        {formData.active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm whitespace-pre-line">
                      {formData.message || 'Your announcement will appear here'}
                    </p>
                    {(formData.starts_at || formData.ends_at) && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formData.starts_at ? format(new Date(formData.starts_at), 'MMM d, yyyy') : 'Any time'} 
                        {formData.ends_at ? ` - ${format(new Date(formData.ends_at), 'MMM d, yyyy')}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AnnouncementAddEdit;
