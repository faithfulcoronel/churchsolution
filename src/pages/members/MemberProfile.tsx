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
  AlertTriangle,
  User
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
import FinancialTab from './tabs/FinancialTab';

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
        <div className="flex flex-col items-center text-center gap-4">
          {/* Profile picture and name */}
          <div className="flex flex-col items-center gap-2">
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
            <h1 className="text-2xl font-bold">
              {member.first_name} {member.middle_name ? `${member.middle_name} ` : ''}
              {member.last_name}
              {member.preferred_name && (
                <span className="text-muted-foreground ml-2 text-lg">({member.preferred_name})</span>
              )}
            </h1>
          </div>

          {/* Status and type */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {member.membership_status && (
              <Badge variant="outline">{member.membership_status.name}</Badge>
            )}
            {member.membership_type && (
              <Badge variant="secondary">{member.membership_type.name}</Badge>
            )}
          </div>

          {/* Address */}
          {member.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{member.address}</span>
            </div>
          )}

          {/* Contact information */}
          <div className="flex flex-wrap items-center justify-center gap-2">
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

          {/* Birthday and member since */}
          <div className="flex flex-col gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                          <dd className="mt-1">
                            {member.first_name} {member.middle_name ? `${member.middle_name} ` : ''}
                            {member.last_name}
                          </dd>
                        </div>
                        {member.preferred_name && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Preferred Name</dt>
                            <dd className="mt-1">{member.preferred_name}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                          <dd className="mt-1 capitalize">{member.gender || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Marital Status</dt>
                          <dd className="mt-1 capitalize">{member.marital_status || 'Not specified'}</dd>
                        </div>
                        {member.birthday && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Birthday</dt>
                            <dd className="mt-1">{new Date(member.birthday).toLocaleDateString()}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Membership Information</h3>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Membership Type</dt>
                          <dd className="mt-1">{member.membership_type?.name || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                          <dd className="mt-1">{member.membership_status?.name || 'Not specified'}</dd>
                        </div>
                        {member.membership_date && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Membership Date</dt>
                            <dd className="mt-1">{new Date(member.membership_date).toLocaleDateString()}</dd>
                          </div>
                        )}
                        {member.baptism_date && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Baptism Date</dt>
                            <dd className="mt-1">{new Date(member.baptism_date).toLocaleDateString()}</dd>
                          </div>
                        )}
                        {member.envelope_number && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Envelope Number</dt>
                            <dd className="mt-1">{member.envelope_number}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <dl className="space-y-4">
                        {member.email && (
                          <div className="flex items-start">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                              <dd className="mt-1">
                                <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                                  {member.email}
                                </a>
                              </dd>
                            </div>
                          </div>
                        )}
                        {member.contact_number && (
                          <div className="flex items-start">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                              <dd className="mt-1">
                                <a href={`tel:${member.contact_number}`} className="text-primary hover:underline">
                                  {member.contact_number}
                                </a>
                              </dd>
                            </div>
                          </div>
                        )}
                        {member.address && (
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                              <dd className="mt-1 whitespace-pre-line">{member.address}</dd>
                            </div>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                      {member.emergency_contact_name || member.emergency_contact_phone ? (
                        <dl className="space-y-4">
                          {member.emergency_contact_name && (
                            <div className="flex items-start">
                              <User className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                <dd className="mt-1">{member.emergency_contact_name}</dd>
                              </div>
                            </div>
                          )}
                          {member.emergency_contact_phone && (
                            <div className="flex items-start">
                              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                                <dd className="mt-1">
                                  <a href={`tel:${member.emergency_contact_phone}`} className="text-primary hover:underline">
                                    {member.emergency_contact_phone}
                                  </a>
                                </dd>
                              </div>
                            </div>
                          )}
                        </dl>
                      ) : (
                        <p className="text-muted-foreground">No emergency contact information provided.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ministry Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Ministry Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Ministry Involvement</h3>
                      <div className="space-y-4">
                        {member.leadership_position && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Leadership Position</h4>
                            <p className="mt-1">{member.leadership_position}</p>
                          </div>
                        )}
                        {member.ministries && member.ministries.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ministries</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {member.ministries.map((ministry: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {ministry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ministries</h4>
                            <p className="mt-1 text-muted-foreground">No ministries listed</p>
                          </div>
                        )}
                        {member.small_groups && member.small_groups.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Small Groups</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {member.small_groups.map((group: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Small Groups</h4>
                            <p className="mt-1 text-muted-foreground">No small groups listed</p>
                          </div>
                        )}
                        {member.volunteer_roles && member.volunteer_roles.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Volunteer Roles</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {member.volunteer_roles.map((role: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Volunteer Roles</h4>
                            <p className="mt-1 text-muted-foreground">No volunteer roles listed</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Spiritual Information</h3>
                      <div className="space-y-4">
                        {member.spiritual_gifts && member.spiritual_gifts.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Spiritual Gifts</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {member.spiritual_gifts.map((gift: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {gift}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Spiritual Gifts</h4>
                            <p className="mt-1 text-muted-foreground">No spiritual gifts listed</p>
                          </div>
                        )}
                        {member.ministry_interests && member.ministry_interests.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ministry Interests</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {member.ministry_interests.map((interest: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ministry Interests</h4>
                            <p className="mt-1 text-muted-foreground">No ministry interests listed</p>
                          </div>
                        )}
                        {member.attendance_rate !== null && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Attendance Rate</h4>
                            <p className="mt-1">{member.attendance_rate}%</p>
                          </div>
                        )}
                        {member.last_attendance_date && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Last Attendance</h4>
                            <p className="mt-1">{new Date(member.last_attendance_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pastoral Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Pastoral Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {member.pastoral_notes ? (
                    <p className="whitespace-pre-line">{member.pastoral_notes}</p>
                  ) : (
                    <p className="text-muted-foreground">No pastoral notes recorded.</p>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Prayer Requests</h4>
                    {member.prayer_requests && member.prayer_requests.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1">
                        {member.prayer_requests.map((request, index) => (
                          <li key={index}>{request}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No prayer requests recorded.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="financial" className="p-0">
            <FinancialTab memberId={member.id} />
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
