import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useMessageStore } from '../../components/MessageHandler';
import { useEnumValues } from '../../hooks/useEnumValues';
import { usePagination } from '../../hooks/usePagination';
import { useAuthStore } from '../../stores/authStore';
import { useAuditLogger } from '../../hooks/useAuditLogger';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import {Scrollable} from '../../components/ui/Scrollable';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import MemberProfile from './MemberProfile';
import MemberEdit from './MemberEdit';
import MemberAdd from './MemberAdd';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Filter,
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
  Calendar,
  ChevronRight,
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
  leadership_position?: string;
};

function MemberList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addMessage } = useMessageStore();
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const { memberStatuses, isLoading: enumsLoading } = useEnumValues();
  const { user } = useAuthStore();
  const { logMemberEvent } = useAuditLogger();

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .is('deleted_at', null)
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data as Member[];
    },
    enabled: !!currentTenant?.id,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Get member data before deletion for audit log
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      // Soft delete member
      const { error: updateError } = await supabase
        .rpc('soft_delete_member', { member_id: id });

      if (updateError) throw updateError;

      // Log audit event
      await logMemberEvent('delete', id, member || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      addMessage({
        type: 'success',
        text: 'Member deleted successfully',
        duration: 3000,
      });
      setMemberToDelete(null);
    },
    onError: (error: Error) => {
      addMessage({
        type: 'error',
        text: 'Failed to delete member',
        duration: 5000,
      });
      console.error('Error deleting member:', error);
      setMemberToDelete(null);
    },
  });

  const handleDelete = async (member: Member) => {
    setMemberToDelete(member);
    addMessage({
      type: 'warning',
      text: `Are you sure you want to delete ${member.first_name} ${member.last_name}?`,
      duration: 0,
    });
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteMemberMutation.mutateAsync(memberToDelete.id);
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const handleEdit = (member: Member) => {
    navigate(`/members/${member.id}/edit`);
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

  const tabs = [
    { 
      id: 'all', 
      label: 'All Members', 
      icon: <Users className="h-5 w-5" />, 
      filter: () => true 
    },
    { 
      id: 'active', 
      label: 'Active', 
      icon: <UserCheck className="h-5 w-5" />, 
      filter: (m: Member) => m.status === 'active' 
    },
    { 
      id: 'inactive', 
      label: 'Inactive', 
      icon: <UserMinus className="h-5 w-5" />, 
      filter: (m: Member) => m.status === 'inactive' 
    },
    { 
      id: 'new', 
      label: 'New Members', 
      icon: <UserPlus className="h-5 w-5" />, 
      filter: (m: Member) => {
        if (!m.membership_date) return false;
        const joinDate = new Date(m.membership_date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return joinDate >= threeMonthsAgo;
      }
    },
    { 
      id: 'birthdays', 
      label: 'Birthdays', 
      icon: <Calendar className="h-5 w-5" />, 
      filter: (m: Member) => {
        if (!m.birthday) return false;
        const birthday = new Date(m.birthday);
        const today = new Date();
        return birthday.getMonth() === today.getMonth();
      }
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Filter members based on search, status, and active tab
  const filteredMembers = members?.filter((member) => {
    if (!member) return false;

    // Apply tab filter
    const activeTabFilter = tabs.find(tab => tab.id === activeTab)?.filter;
    if (!activeTabFilter?.(member)) return false;

    // Apply search filter
    const matchesSearch = 
      (member.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.preferred_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.contact_number || '').includes(searchTerm);
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate counts for each tab
  const tabsWithCounts = tabs.map(tab => ({
    ...tab,
    badge: members?.filter(tab.filter).length || 0,
  }));

  const { 
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({
    totalItems: filteredMembers?.length || 0,
  });

  const paginatedMembers = filteredMembers?.slice(startIndex, endIndex);

  const isLoading = membersLoading || enumsLoading;

  return (
    <div>
      <div className="mb-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Members</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all church members including their name, contact information, and membership status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <SubscriptionGate type="member">
              <Button
                variant="primary"
                onClick={() => navigate('/members/add')}
                icon={<Plus />}
              >
                Add Member
              </Button>
            </SubscriptionGate>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <Tabs
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="enclosed"
            size="sm"
          />
        </div>

        {/* Filters */}
        <div className="mt-6 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search />}
            />
          </div>

          <div className="mt-4 sm:mt-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              icon={<Filter />}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...memberStatuses,
              ]}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-48" />
          ))}
        </div>
      ) : paginatedMembers && paginatedMembers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedMembers.map((member) => (
              <Card
                key={member.id}
                className="group relative overflow-visible"
                hoverable
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <div className="p-4">
                  {/* Member Photo and Basic Info */}
                  <div className="flex items-center space-x-4">
                    {member.profile_picture_url ? (
                      <img
                        src={member.profile_picture_url}
                        alt={`${member.first_name} ${member.last_name}`}
                        className="h-16 w-16 rounded-full object-cover bg-gray-100 dark:bg-gray-800 ring-4 ring-white dark:ring-gray-900 group-hover:ring-primary-50 dark:group-hover:ring-primary-900"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary-50 dark:bg-primary-900 flex items-center justify-center ring-4 ring-white dark:ring-gray-900 group-hover:ring-primary-50 dark:group-hover:ring-primary-900">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold text-xl">
                          {member.first_name[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {member.preferred_name || `${member.first_name} ${member.middle_name ? `${member.middle_name} ` : ''}${member.last_name}`}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {member.contact_number}
                      </p>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {member.address}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant={getStatusColor(member.status)}
                      className="transition-all duration-200 group-hover:scale-105"
                    >
                      {memberStatuses.find(s => s.value === member.status)?.label || member.status}
                    </Badge>
                    {member.leadership_position && (
                      <Badge 
                        variant="info"
                        className="transition-all duration-200 group-hover:scale-105"
                      >
                        {member.leadership_position}
                      </Badge>
                    )}
                  </div>

                  {/* Membership Date */}
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                    {member.membership_date 
                      ? `Member since ${new Date(member.membership_date).toLocaleDateString()}`
                      : 'No membership date'}
                  </div>

                  {/* Action Buttons - Fixed Position */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(member);
                      }}
                      icon={<Edit2 className="h-4 w-4" />}
                      className="!p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label="Edit member"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(member);
                      }}
                      loading={deleteMemberMutation.isPending}
                      icon={<Trash2 className="h-4 w-4" />}
                      className="!p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Delete member"
                    />
                  </div>

                  {/* Visual Indicator for Card Clickability */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="bg-primary-500 dark:bg-primary-400 text-white dark:text-gray-900 rounded-full p-1 shadow-lg">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredMembers?.length || 0}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      ) : (
        <Card className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'No members found matching your search criteria'
              : 'No members found. Add your first member by clicking the "Add Member" button above.'}
          </p>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Delete Member"
      >
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete {memberToDelete?.first_name} {memberToDelete?.last_name}? 
            This action cannot be undone and will also delete all associated records.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setMemberToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMemberMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Members() {
  return (
    <Routes>
      <Route index element={<MemberList />} />
      <Route path="add" element={<MemberAdd />} />
      <Route path=":id" element={<MemberProfile />} />
      <Route path=":id/edit" element={<MemberEdit />} />
    </Routes>
  );
}

export default Members;