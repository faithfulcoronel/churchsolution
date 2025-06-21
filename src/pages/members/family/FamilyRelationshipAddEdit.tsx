import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useMessageStore } from '../../../components/MessageHandler';
import { Container } from '../../../components/ui2/container';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { Label } from '../../../components/ui2/label';
import { Textarea } from '../../../components/ui2/textarea';
import { Combobox } from '../../../components/ui2/combobox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../../components/ui2/alert-dialog';
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  Heart,
  AlertCircle,
} from 'lucide-react';

type FamilyRelationship = {
  id: string;
  member_id: string;
  related_member_id: string;
  relationship_category_id: string;
  notes: string;
};

function FamilyRelationshipAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<Partial<FamilyRelationship>>({
    notes: '',
  });

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  // Get relationship data if editing
  const { data: relationship, isLoading: relationshipLoading } = useQuery({
    queryKey: ['family-relationship', id, currentTenant?.id],
    queryFn: async () => {
      if (!id || !currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('family_relationships')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as FamilyRelationship;
    },
    enabled: !!id && !!currentTenant?.id,
  });

  // Get members
  const { data: members } = useQuery({
    queryKey: ['members', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .eq('tenant_id', currentTenant?.id)
        .is('deleted_at', null)
        .order('last_name');

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  // Get relationship categories
  const { data: categories } = useQuery({
    queryKey: ['categories', 'relationship_type', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .eq('type', 'relationship_type')
        .is('deleted_at', null)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  // Initialize form data when relationship data is loaded
  useEffect(() => {
    if (relationship) {
      setFormData(relationship);
    }
  }, [relationship]);

  // Track form changes
  useEffect(() => {
    if (!relationship) {
      setHasUnsavedChanges(Object.keys(formData).length > 0);
      return;
    }

    const hasChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof FamilyRelationship];
      const relationshipValue = relationship[key as keyof FamilyRelationship];
      return formValue !== relationshipValue;
    });

    setHasUnsavedChanges(hasChanges);
  }, [formData, relationship]);

  const checkForDuplicates = async () => {
    if (!currentTenant?.id || !formData.member_id || !formData.related_member_id || !formData.relationship_category_id) {
      return false;
    }

    const { data: existingRelationships } = await supabase
      .from('family_relationships')
      .select('id')
      .eq('tenant_id', currentTenant.id)
      .eq('member_id', formData.member_id)
      .eq('related_member_id', formData.related_member_id)
      .eq('relationship_category_id', formData.relationship_category_id);

    if (!existingRelationships?.length) return false;

    // For updates, exclude the current relationship
    if (id) {
      const duplicates = existingRelationships.filter(r => r.id !== id);
      return duplicates.length > 0;
    }

    return true;
  };

  const addRelationshipMutation = useMutation({
    mutationFn: async (data: Partial<FamilyRelationship>) => {
      const { data: newRelationship, error } = await supabase
        .from('family_relationships')
        .insert([{
          ...data,
          tenant_id: currentTenant?.id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return newRelationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-relationships'] });
      addMessage({
        type: 'success',
        text: 'Family relationship added successfully',
        duration: 3000,
      });
      navigate('/members/family');
    },
    onError: (error: Error) => {
      addMessage({
        type: 'error',
        text: error.message,
        duration: 5000,
      });
    },
  });

  const updateRelationshipMutation = useMutation({
    mutationFn: async (data: Partial<FamilyRelationship>) => {
      const { error } = await supabase
        .from('family_relationships')
        .update({
          ...data,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id)
        .eq('tenant_id', currentTenant?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['family-relationship', id] });
      addMessage({
        type: 'success',
        text: 'Family relationship updated successfully',
        duration: 3000,
      });
      navigate(`/members/family/${id}`);
    },
    onError: (error: Error) => {
      addMessage({
        type: 'error',
        text: error.message,
        duration: 5000,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.member_id || !formData.related_member_id || !formData.relationship_category_id) {
      addMessage({
        type: 'error',
        text: 'Please fill in all required fields',
        duration: 5000,
      });
      return;
    }

    if (formData.member_id === formData.related_member_id) {
      addMessage({
        type: 'error',
        text: 'A member cannot have a relationship with themselves',
        duration: 5000,
      });
      return;
    }

    const hasDuplicates = await checkForDuplicates();
    if (hasDuplicates) {
      setShowDuplicateConfirm(true);
      return;
    }

    try {
      if (id) {
        await updateRelationshipMutation.mutateAsync(formData);
      } else {
        await addRelationshipMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error saving relationship:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      navigate(id ? `/members/family/${id}` : '/members/family');
    }
  };

  const memberOptions = React.useMemo(() => 
    members?.map(m => ({
      value: m.id,
      label: `${m.first_name} ${m.last_name}`
    })) || [], 
    [members]
  );

  const categoryOptions = React.useMemo(() => 
    categories?.map(c => ({
      value: c.id,
      label: c.name
    })) || [],
    [categories]
  );

  if (relationshipLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Family Relationships
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-foreground">
              {id ? 'Edit Family Relationship' : 'Add Family Relationship'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {id ? 'Update family relationship details' : 'Create a new family relationship'}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Members Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="member_id">Primary Member *</Label>
                  <Combobox
                    options={memberOptions}
                    value={formData.member_id}
                    onChange={(value) => setFormData(prev => ({ ...prev, member_id: value }))}
                    placeholder="Select Primary Member"
                  />
                </div>

                <div>
                  <Label htmlFor="related_member_id">Related Member *</Label>
                  <Combobox
                    options={memberOptions.filter(m => m.value !== formData.member_id)}
                    value={formData.related_member_id}
                    onChange={(value) => setFormData(prev => ({ ...prev, related_member_id: value }))}
                    placeholder="Select Related Member"
                  />
                </div>
              </div>

              {/* Relationship Type */}
              <div>
                <Label htmlFor="relationship_category_id">Relationship Type *</Label>
                <Combobox
                  options={categoryOptions}
                  value={formData.relationship_category_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, relationship_category_id: value }))}
                  placeholder="Select Relationship Type"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Add any additional notes about this relationship..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addRelationshipMutation.isPending || updateRelationshipMutation.isPending}
                >
                  {addRelationshipMutation.isPending || updateRelationshipMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {id ? 'Update Relationship' : 'Add Relationship'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
                Continue Editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowCancelConfirm(false);
                  navigate(id ? `/members/family/${id}` : '/members/family');
                }}
              >
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Duplicate Confirmation Dialog */}
        <AlertDialog open={showDuplicateConfirm} onOpenChange={setShowDuplicateConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Duplicate Relationship</AlertDialogTitle>
              <AlertDialogDescription>
                This relationship already exists between these members. Do you want to proceed anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDuplicateConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>
                Proceed Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Container>
  );
}

export default FamilyRelationshipAddEdit;