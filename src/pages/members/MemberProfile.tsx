import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberService } from '../../hooks/useMemberService';
import {
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Cake,
  Heart,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import BackButton from '../../components/BackButton';

// UI Components
import { Button } from '../../components/ui2/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui2/avatar';
import { Badge } from '../../components/ui2/badge';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui2/card';
import { Tabs, TabsContent } from '../../components/ui2/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui2/alert-dialog';

// Tabs
import BasicInfoTab from './tabs/BasicInfoTab';
import MinistryInfoTab from './tabs/MinistryInfoTab';
import NotesTab from './tabs/NotesTab';

function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById, useDelete } = useMemberService();
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch member data using repository
  const { data: member, isLoading, error } = useFindById(id || '');

  // Delete mutation
  const deleteMemberMutation = useDelete();

  // Get member initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-warning mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Member Not Found</h3>
        <p className="text-muted-foreground mb-6">The member you're looking for doesn't exist or has been removed.</p>
        <BackButton fallbackPath="/members/list" label="Go Back to Members" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton fallbackPath="/members/list" label="Back to Members" />
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/members/${id}/edit`)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Member Header */}
      <div
        className="p-6"
        style={{
          backgroundImage: "url('/profile_header_pattern.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto', // Keeps actual size of the image
          backgroundPosition: 'center',
          overflow: 'visible', // Allow background overflow
        }}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <Avatar className="h-24 w-24 border-2 border-primary">
            {member.profile_picture_url && (
              <AvatarImage
                src={member.profile_picture_url}
                alt={`${member.first_name} ${member.last_name}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <AvatarFallback className="text-xl">
              {getInitials(member.first_name, member.last_name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold">
              {member.first_name} {member.middle_name ? `${member.middle_name} ` : ''}
              {member.last_name}
              {member.preferred_name && (
                <span className="text-muted-foreground ml-2 text-lg">({member.preferred_name})</span>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {member.membership_type && (
              <Badge variant="secondary">{member.membership_type.name}</Badge>
            )}
            {member.membership_status && (
              <Badge variant="outline">{member.membership_status.name}</Badge>
            )}
            {member.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{member.address}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                  {member.email}
                </a>
              </div>
            )}
            {member.contact_number && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${member.contact_number}`} className="text-primary hover:underline">
                  {member.contact_number}
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {member.birthday && (
              <div className="flex items-center text-sm justify-center">
                <Cake className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Birthday: {formatDate(member.birthday)}</span>
              </div>
            )}
            {member.membership_date && (
              <div className="flex items-center text-sm justify-center">
                <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Member since: {formatDate(member.membership_date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Details Tabs */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Member Details</h3>
          <p className="text-sm text-muted-foreground">
            View and manage member information
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="profile" className="p-0">
            <div className="space-y-6">
              <Card className="w-fit">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <BasicInfoTab mode="view" member={member} onChange={() => {}} />
                </CardContent>
              </Card>

              <Card className="w-fit">
                <CardHeader>
                  <CardTitle>Ministry Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <MinistryInfoTab mode="view" member={member} onChange={() => {}} />
                </CardContent>
              </Card>

              <Card className="w-fit">
                <CardHeader>
                  <CardTitle>Pastoral Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <NotesTab mode="view" member={member} onChange={() => {}} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMemberMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async (e) => {
                e.preventDefault();
                if (id) {
                  await deleteMemberMutation.mutateAsync(id);
                  setDeleteDialogOpen(false);
                  navigate('/members');
                }
              }}
              disabled={deleteMemberMutation.isPending}
            >
              {deleteMemberMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MemberProfile;
