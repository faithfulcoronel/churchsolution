import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { useEnumValues } from '../../hooks/useEnumValues';
import { useMessageStore } from '../../components/MessageHandler';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ImageInput } from '../../components/ui/ImageInput';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { uploadProfilePicture } from '../../utils/storage';
import {
  ArrowLeft,
  Edit2,
  User,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Heart,
  Gift,
  UserPlus,
  Home,
  Briefcase,
  Users,
  Cake,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  preferred_name?: string;
  contact_number: string;
  address: string;
  email?: string;
  envelope_number?: string;
  membership_type: string;
  status: string;
  membership_date: string | null;
  birthday: string | null;
  profile_picture_url: string | null;
  tenant_id: string;
  created_by: string;
  updated_by: string;
  deleted_at: string | null;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'widowed' | 'divorced';
  baptism_date?: string;
  spiritual_gifts?: string[];
  ministry_interests?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  leadership_position?: string;
  small_groups?: string[];
  ministries?: string[];
  volunteer_roles?: string[];
  attendance_rate?: number;
  last_attendance_date?: string;
  pastoral_notes?: string;
  prayer_requests?: string[];
};

type Transaction = {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  member_id: string;
  tenant_id: string;
};

function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { membershipTypes, memberStatuses } = useEnumValues();
  const { currency } = useCurrencyStore();

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', currentTenant?.id)
        .single();

      if (error) throw error;
      return data as Member;
    },
    enabled: !!id && !!currentTenant?.id,
  });

  // Get transactions for this member
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['member-transactions', id, currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('member_id', id)
        .eq('tenant_id', currentTenant?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!id && !!currentTenant?.id,
  });

  const filteredTransactions = transactions?.filter((transaction) => {
    // Add any additional transaction filtering logic here
    return true;
  });

  const { 
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({
    totalItems: filteredTransactions?.length || 0,
  });

  const paginatedTransactions = filteredTransactions?.slice(startIndex, endIndex);

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant found');
      }

      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Upload the file and get the URL
      const url = await uploadProfilePicture(file, currentTenant.id, user.id);

      // Update member profile with new URL
      const { error: updateError } = await supabase
        .from('members')
        .update({ profile_picture_url: url })
        .eq('id', id)
        .eq('tenant_id', currentTenant.id);

      if (updateError) throw updateError;

      // Log audit event
      //await logMemberEvent('update', id!, {
      //  profile_picture_url: url
      //});

      return url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', id] });
      setUploadSuccess(true);
      addMessage({
        type: 'success',
        text: 'Profile picture updated successfully',
        duration: 3000,
      });
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    onError: (error: Error) => {
      setUploadError(error.message);
      addMessage({
        type: 'error',
        text: `Failed to upload profile picture: ${error.message}`,
        duration: 5000,
      });
      setTimeout(() => setUploadError(null), 3000);
    },
  });

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    uploadProfilePictureMutation.mutate(file);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'success',
      inactive: 'secondary',
      under_discipline: 'danger',
      regular_attender: 'info',
      visitor: 'warning',
      withdrawn: 'warning',
      removed: 'danger',
      donor: 'primary'
    };

    return statusColors[status] || 'secondary';
  };

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center mt-8">
        <h3 className="text-sm font-medium text-gray-900">Member not found</h3>
      </div>
    );
  }

  const membershipType = membershipTypes.find(t => t.value === member.membership_type)?.label || member.membership_type;
  const memberStatus = memberStatuses.find(s => s.value === member.status)?.label || member.status;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/members')}
          icon={<ArrowLeft />}
        >
          Back to Members
        </Button>
      </div>

      {/* Member Profile Card */}
      <Card>
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="relative">
              <ImageInput
                value={member.profile_picture_url}
                onChange={handleFileUpload}
                error={uploadError}
                success={uploadSuccess}
                size="lg"
                shape="circle"
                className="ring-4 ring-white"
              />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {member.preferred_name || `${member.first_name} ${member.middle_name ? `${member.middle_name} ` : ''}${member.last_name}`}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={getStatusColor(member.status)}>
                  {memberStatus}
                </Badge>
                <Badge variant="primary">
                  {membershipType}
                </Badge>
                {member.leadership_position && (
                  <Badge variant="info">
                    {member.leadership_position}
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/members/${id}/edit`)}
                  icon={<Edit2 />}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Member Details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {/* Basic Information */}
            <div className="sm:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.first_name} {member.middle_name && `${member.middle_name} `}{member.last_name}
                    {member.preferred_name && (
                      <span className="ml-2 text-gray-500">
                        (Preferred: {member.preferred_name})
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Gender & Marital Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.gender?.charAt(0).toUpperCase() + member.gender?.slice(1) || 'Not specified'}, {' '}
                    {member.marital_status?.charAt(0).toUpperCase() + member.marital_status?.slice(1) || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Cake className="h-5 w-5 mr-2" />
                    Birthday
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.birthday
                      ? format(new Date(member.birthday), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Baptism Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.baptism_date
                      ? format(new Date(member.baptism_date), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="sm:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.contact_number}</dd>
                </div>

                {member.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.email}</dd>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.address}</dd>
                </div>

                {member.emergency_contact_name && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.emergency_contact_name} - {member.emergency_contact_phone}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Church Information */}
            <div className="sm:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Church Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Membership Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {memberStatus}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Membership Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.membership_date
                      ? format(new Date(member.membership_date), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </dd>
                </div>

                {member.envelope_number && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Envelope Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.envelope_number}</dd>
                  </div>
                )}

                {member.leadership_position && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Leadership Position
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{member.leadership_position}</dd>
                  </div>
                )}
              </div>
            </div>

            {/* Ministry Information */}
            <div className="sm:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ministry Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {member.spiritual_gifts && member.spiritual_gifts.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Gift className="h-5 w-5 mr-2" />
                      Spiritual Gifts
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.spiritual_gifts.join(', ')}
                    </dd>
                  </div>
                )}

                {member.ministry_interests && member.ministry_interests.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Ministry Interests
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.ministry_interests.join(', ')}
                    </dd>
                  </div>
                )}

                {member.volunteer_roles && member.volunteer_roles.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Volunteer Roles
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.volunteer_roles.join(', ')}
                    </dd>
                  </div>
                )}

                {member.small_groups && member.small_groups.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Small Groups
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.small_groups.join(', ')}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            {(member.pastoral_notes || (member.prayer_requests && member.prayer_requests.length > 0)) && (
              <div className="sm:col-span-2">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h4>
                <div className="grid grid-cols-1 gap-4">
                  {member.pastoral_notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pastoral Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {member.pastoral_notes}
                      </dd>
                    </div>
                  )}

                  {member.prayer_requests && member.prayer_requests.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Prayer Requests</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul className="list-disc pl-5 space-y-1">
                          {member.prayer_requests.map((request, index) => (
                            <li key={index}>{request}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </dl>
        </div>
      </Card>

      {/* Financial History Section */}
      <div className="mt-8">
        <Card>
          <div className="px-4 py-5 sm:px-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial History
                </h3>
              </div>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? 'success' : 'danger'}
                          icon={transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.category.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell align="right">
                        <span
                          className={
                            transaction.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {formatCurrency(transaction.amount, currency)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredTransactions?.length || 0}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No financial records found
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default MemberProfile;