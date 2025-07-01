import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { Member } from '../../models/member.model';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import BackButton, { performGoBack } from '../../components/BackButton';
import { ImageInput } from '../../components/ui2/image-input';
import { uploadProfilePicture } from '../../utils/storage';
import { tenantUtils } from '../../utils/tenantUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui2/tabs';
import { Separator } from '../../components/ui2/separator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../components/ui2/alert-dialog';
import { Save, Loader2 } from 'lucide-react';

// Import tabs
import BasicInfoTab from './tabs/BasicInfoTab';
import ContactInfoTab from './tabs/ContactInfoTab';
import MinistryInfoTab from './tabs/MinistryInfoTab';
import NotesTab from './tabs/NotesTab';

function MemberAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<Partial<Member>>({
    gender: 'male',
    marital_status: 'single',
    spiritual_gifts: [],
    ministry_interests: [],
    small_groups: [],
    ministries: [],
    volunteer_roles: [],
    prayer_requests: [],
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  // Use member repository
  const { useQuery, useCreate, useUpdate } = useMemberRepository();

  // Get member data if editing
  const { data: result, isLoading: memberLoading } = useQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    enabled: !!id
  });

  // Initialize form data when member data is loaded
  useEffect(() => {
    if (result?.data?.[0]) {
      setFormData(result.data[0]);
    }
  }, [result]);

  // Track form changes
  useEffect(() => {
    if (!result?.data?.[0]) {
      setHasUnsavedChanges(Object.keys(formData).length > 0);
      return;
    }

    const hasChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof Member];
      const memberValue = result.data[0][key as keyof Member];

      // Handle array comparisons
      if (Array.isArray(formValue) && Array.isArray(memberValue)) {
        return JSON.stringify(formValue) !== JSON.stringify(memberValue);
      }

      return formValue !== memberValue;
    });

    setHasUnsavedChanges(hasChanges);
  }, [formData, result]);

  // Create member mutation
  const createMemberMutation = useCreate();

  // Update member mutation
  const updateMemberMutation = useUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let memberId = id;
      let savedMember: Member | null = null;

      if (id) {
        savedMember = await updateMemberMutation.mutateAsync({
          id,
          data: formData,
          fieldsToRemove: ['membership_type', 'membership_status']
        });
      } else {
        savedMember = await createMemberMutation.mutateAsync({
          data: formData,
          fieldsToRemove: ['membership_type', 'membership_status']
        });
        memberId = savedMember.id;
      }

      if (profilePictureFile && memberId) {
        const tenantId = await tenantUtils.getTenantId();
        if (tenantId) {
          const url = await uploadProfilePicture(profilePictureFile, tenantId, memberId);
          await updateMemberMutation.mutateAsync({ id: memberId, data: { profile_picture_url: url } });
          setFormData(prev => ({ ...prev, profile_picture_url: url }));
        }
      }

      navigate('/members/list');
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      performGoBack(navigate, id ? `/members/${id}` : '/members/list');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = (file: File | null) => {
    setProfilePictureFile(file);
    if (!file) {
      setFormData(prev => ({ ...prev, profile_picture_url: null }));
    }
  };

  const mode = id ? 'edit' : 'add';

  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      badge: formErrors.basic?.length,
      content: (
        <BasicInfoTab
          mode={mode}
          member={formData}
          onChange={handleInputChange}
        />
      ),
    },
    {
      id: 'contact',
      label: 'Contact Info',
      badge: formErrors.contact?.length,
      content: (
        <ContactInfoTab
          mode={mode}
          member={formData}
          onChange={handleInputChange}
        />
      ),
    },
    {
      id: 'ministry',
      label: 'Ministry Info',
      badge: formErrors.ministry?.length,
      content: (
        <MinistryInfoTab
          mode={mode}
          member={formData}
          onChange={handleInputChange}
        />
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      badge: formErrors.notes?.length,
      content: (
        <NotesTab
          mode={mode}
          member={formData}
          onChange={handleInputChange}
        />
      ),
    },
  ];

  if (memberLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Back Button */}
        <BackButton fallbackPath="/members/list" label="Back to Members" />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">
                    {id ? 'Edit Member' : 'Add New Member'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {id ? 'Update member information' : 'Enter member details'}
                  </p>
                </div>

                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <ImageInput
                    value={formData.profile_picture_url || undefined}
                    onChange={handleProfilePictureChange}
                    onRemove={() => handleProfilePictureChange(null)}
                    size="xl"
                    shape="circle"
                    className="ring-4 ring-background mx-auto sm:mx-0"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList size="sm">
                  {tabs.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map(tab => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {tab.content}
                  </TabsContent>
                ))}
              </Tabs>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMemberMutation.isPending || updateMemberMutation.isPending}
                >
                  {createMemberMutation.isPending || updateMemberMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Save Confirmation Dialog */}
        <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Changes</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to save these changes?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowSaveConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle variant="danger">Discard Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
                Continue Editing
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setShowCancelConfirm(false);
                  performGoBack(navigate, id ? `/members/${id}` : '/members/list');
                }}
              >
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Duplicate Member Dialog */}
        <AlertDialog open={showDuplicateConfirm} onOpenChange={setShowDuplicateConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle variant="warning">Duplicate Member Found</AlertDialogTitle>
              <AlertDialogDescription>
                A member with the same name already exists. Do you want to proceed anyway?
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
  );
}

export default MemberAddEdit;

