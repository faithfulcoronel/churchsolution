import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { Container } from '../../../components/ui2/container';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Badge } from '../../../components/ui2/badge';
import { Separator } from '../../../components/ui2/separator';
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
  Edit2,
  Trash2,
  Users,
  Heart,
  Calendar,
  User,
  FileText,
  Loader2,
} from 'lucide-react';

type FamilyRelationship = {
  id: string;
  member_id: string;
  related_member_id: string;
  relationship_category_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
  member: {
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
  };
  related_member: {
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
  };
  category: {
    name: string;
    code: string;
  };
};

function FamilyRelationshipProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  // Get relationship data
  const { data: relationship, isLoading } = useQuery({
    queryKey: ['family-relationship', id, currentTenant?.id],
    queryFn: async () => {
      if (!id || !currentTenant?.id) return null;

      const { data, error } = await supabase
        .from('family_relationships')
        .select(`
          *,
          member:member_id (
            first_name,
            last_name,
            email,
            contact_number
          ),
          related_member:related_member_id (
            first_name,
            last_name,
            email,
            contact_number
          ),
          category:relationship_category_id (
            name,
            code
          )
        `)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) throw error;
      return data as FamilyRelationship;
    },
    enabled: !!id && !!currentTenant?.id,
  });

  // Delete relationship mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('family_relationships')
        .delete()
        .eq('id', id)
        .eq('tenant_id', currentTenant?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-relationships'] });
      navigate('/members/family');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!relationship) {
    return (
      <Card className="text-center py-8">
        <h3 className="text-lg font-medium text-foreground">Relationship not found</h3>
      </Card>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/members/family')}
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Family Relationships
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/members/family/${id}/edit`)}
              className="flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Family Relationship</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  View family relationship details
                </p>
              </div>
              <Badge variant="secondary" className="self-start sm:self-center">
                {relationship.category.name}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-8">
              {/* Members Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Primary Member */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Primary Member
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Name:</span>{' '}
                      {relationship.member.first_name} {relationship.member.last_name}
                    </p>
                    {relationship.member.email && (
                      <p className="text-sm">
                        <span className="font-medium text-muted-foreground">Email:</span>{' '}
                        {relationship.member.email}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Contact:</span>{' '}
                      {relationship.member.contact_number}
                    </p>
                  </div>
                </div>

                {/* Related Member */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Related Member
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Name:</span>{' '}
                      {relationship.related_member.first_name} {relationship.related_member.last_name}
                    </p>
                    {relationship.related_member.email && (
                      <p className="text-sm">
                        <span className="font-medium text-muted-foreground">Email:</span>{' '}
                        {relationship.related_member.email}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Contact:</span>{' '}
                      {relationship.related_member.contact_number}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Relationship Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-primary" />
                  Relationship Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Type:</span>{' '}
                      {relationship.category.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">Created:</span>{' '}
                      {format(new Date(relationship.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {relationship.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2" />
                      Notes
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {relationship.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this family relationship? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteMutation.mutate();
                  setShowDeleteConfirm(false);
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Container>
  );
}

export default FamilyRelationshipProfile;