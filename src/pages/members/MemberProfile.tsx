import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMemberService } from '../../hooks/useMemberService';
import {
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Cake,
  Heart,
  Loader2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import BackButton from '../../components/BackButton';

// UI Components
import { Button } from '../../components/ui2/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui2/avatar';
import { Badge } from '../../components/ui2/badge';
import { Tabs, TabsList, Tab, TabPanel } from '../../components/ui2/tabs';
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
import ContactInfoTab from './tabs/ContactInfoTab';
import MinistryInfoTab from './tabs/MinistryInfoTab';
import NotesTab from './tabs/NotesTab';

function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById, useDelete } = useMemberService();
  const [activeTab, setActiveTab] = useState('basic');
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
        className="rounded-2xl p-6 shadow-sm relative"
        style={{
          backgroundImage: "url('/profile_header_pattern.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto", // Keeps actual size of the image
          backgroundPosition: "center", // Adjust position if needed
          overflow: "visible", // Allow background overflow
        }}
      >
        <div className="flex flex-col items-center text-center gap-4">
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

          <div className="flex flex-wrap justify-center gap-2">
            {member.membership_type && (
              <Badge variant="secondary">{member.membership_type.name}</Badge>
            )}
            {member.membership_status && (
              <Badge variant="outline">{member.membership_status.name}</Badge>
            )}
            {member.envelope_number && (
              <Badge variant="outline" className="bg-primary-50 text-primary border-primary-200">
                Envelope #{member.envelope_number}
              </Badge>
            )}
          </div>

          {member.address && (
            <div className="flex items-center justify-center mt-2">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{member.address}</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 mt-2">
            {member.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                  {member.email}
                </a>
              </div>
            )}
            {member.contact_number && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
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
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} className="w-full">
          <TabsList className="mb-6">
            <Tab value="basic">
              <User className="h-4 w-4 mr-2" />
              Basic Info
            </Tab>
            <Tab value="contact">
              <Phone className="h-4 w-4 mr-2" />
              Contact Info
            </Tab>
            <Tab value="ministry">
              <Users className="h-4 w-4 mr-2" />
              Ministry Info
            </Tab>
            <Tab value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </Tab>
          </TabsList>

          <TabPanel value="basic">
            <BasicInfoTab mode="view" member={member} onChange={() => {}} />
          </TabPanel>

          <TabPanel value="contact">
            <ContactInfoTab mode="view" member={member} onChange={() => {}} />
          </TabPanel>

          <TabPanel value="ministry">
            <MinistryInfoTab mode="view" member={member} onChange={() => {}} />
          </TabPanel>

          <TabPanel value="notes">
            <NotesTab mode="view" member={member} onChange={() => {}} />
          </TabPanel>
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
