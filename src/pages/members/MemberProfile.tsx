import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { format } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { Container } from '../../components/ui2/container';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { ImageInput } from '../../components/ui2/image-input';
import { Tabs } from '../../components/ui2/tabs';
import { ScrollArea } from '../../components/ui2/scroll-area';
import { Separator } from '../../components/ui2/separator';
import { DataGrid } from '../../components/ui2/mui-datagrid';
import { GridColDef, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
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
import {
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
  Edit2,
  ArrowLeft,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui2/dropdown-menu';

function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Use member repository
  const { useQuery, useDelete } = useMemberRepository();

  // Get member data
  const { data: result, isLoading: memberLoading } = useQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    }
  });

  // Get transactions for this member
  const { data: transactionData, isLoading: transactionsLoading } = useQuery({
    filters: {
      member_id: {
        operator: 'eq',
        value: id
      }
    },
    pagination: {
      page: page + 1,
      pageSize
    },
    order: sortModel[0] ? {
      column: sortModel[0].field,
      ascending: sortModel[0].sort === 'asc'
    } : {
      column: 'date',
      ascending: false
    }
  });

  // Delete member mutation
  const deleteMemberMutation = useDelete();

  const getStatusColor = (statusCode: string) => {
    const statusColors: Record<string, string> = {
      active: 'success',
      inactive: 'secondary',
      under_discipline: 'destructive',
      regular_attender: 'info',
      visitor: 'warning',
      withdrawn: 'warning',
      removed: 'destructive',
      donor: 'primary'
    };

    return statusColors[statusCode] || 'secondary';
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'ministry',
      label: 'Ministry',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  // Transaction grid columns
  const transactionColumns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      renderCell: (params) => (
        <Badge
          variant={params.value === 'income' ? 'success' : 'destructive'}
          className="flex items-center space-x-1"
        >
          {params.value === 'income' ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span>{params.value}</span>
        </Badge>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      valueGetter: (params) => params.row.category?.name,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div className={params.row.type === 'income' ? 'text-success' : 'text-destructive'}>
          {formatCurrency(params.value, currency)}
        </div>
      ),
    },
  ];

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const member = result?.data?.[0];
  if (!member) {
    return (
      <Card className="text-center py-8">
        <h3 className="text-lg font-medium text-foreground">Member not found</h3>
      </Card>
    );
  }

  const transactions = transactionData?.data || [];

  // Calculate financial summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const averageContribution = transactions
    .filter(t => t.type === 'income').length
    ? totalIncome / transactions.filter(t => t.type === 'income').length
    : 0;

  return (
    <Container>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/members/list')}
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Members
          </Button>

          {/* Action Buttons - Desktop */}
          <div className="hidden sm:flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/members/${id}/edit`)}
              className="flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Member
            </Button>
          </div>

          {/* Action Menu - Mobile */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/members/${id}/edit`)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Member Profile Card */}
        <Card>
          <CardHeader className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative">
                <ImageInput
                  value={member.profile_picture_url}
                  onChange={() => {}}
                  size="xl"
                  shape="circle"
                  className="ring-4 ring-background mx-auto sm:mx-0"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {member.preferred_name || `${member.first_name} ${member.middle_name ? `${member.middle_name} ` : ''}${member.last_name}`}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge variant={getStatusColor(member.status_categories?.code)}>
                    {member.status_categories?.name}
                  </Badge>
                  <Badge variant="primary">
                    {member.membership_categories?.name}
                  </Badge>
                  {member.leadership_position && (
                    <Badge variant="info">
                      {member.leadership_position}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="enclosed"
              size="sm"
            />

            <div className="mt-6">
              <ScrollArea className="h-[calc(100vh-24rem)]">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-4">Basic Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Full Name
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {member.first_name} {member.middle_name && `${member.middle_name} `}{member.last_name}
                            {member.preferred_name && (
                              <span className="ml-2 text-muted-foreground">
                                (Preferred: {member.preferred_name})
                              </span>
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Gender & Marital Status
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {member.gender?.charAt(0).toUpperCase() + member.gender?.slice(1) || 'Not specified'}, {' '}
                            {member.marital_status?.charAt(0).toUpperCase() + member.marital_status?.slice(1) || 'Not specified'}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <Cake className="h-5 w-5 mr-2" />
                            Birthday
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {member.birthday
                              ? format(new Date(member.birthday), 'MMMM d, yyyy')
                              : 'Not specified'}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Baptism Date
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {member.baptism_date
                              ? format(new Date(member.baptism_date), 'MMMM d, yyyy')
                              : 'Not specified'}
                          </dd>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-4">Contact Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <Phone className="h-5 w-5 mr-2" />
                            Contact Number
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">{member.contact_number}</dd>
                        </div>

                        {member.email && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                              <Mail className="h-5 w-5 mr-2" />
                              Email Address
                            </dt>
                            <dd className="mt-1 text-sm text-foreground">{member.email}</dd>
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            Address
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">{member.address}</dd>
                        </div>

                        {member.emergency_contact_name && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-muted-foreground">Emergency Contact</dt>
                            <dd className="mt-1 text-sm text-foreground">
                              {member.emergency_contact_name} - {member.emergency_contact_phone}
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Church Information */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-4">Church Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Membership Status
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {member.status_categories?.name}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-sm font-medium text-muted-foreground flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Membership Date
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {member.membership_date
                              ? format(new Date(member.membership_date), 'MMMM d, yyyy')
                              : 'Not specified'}
                          </dd>
                        </div>

                        {member.leadership_position && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                              <Briefcase className="h-5 w-5 mr-2" />
                              Leadership Position
                            </dt>
                            <dd className="mt-1 text-sm text-foreground">{member.leadership_position}</dd>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ministry' && (
                  <div className="space-y-8">
                    {/* Ministry Information */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-4">Ministry Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {member.spiritual_gifts && member.spiritual_gifts.length > 0 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                              <Gift className="h-5 w-5 mr-2" />
                              Spiritual Gifts
                            </dt>
                            <dd className="mt-1 text-sm text-foreground">
                              {member.spiritual_gifts.join(', ')}
                            </dd>
                          </div>
                        )}

                        {member.ministry_interests && member.ministry_interests.length > 0 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                              <Heart className="h-5 w-5 mr-2" />
                              Ministry Interests
                            </dt>
                            <dd className="mt-1 text-sm text-foreground">
                              {member.ministry_interests.join(', ')}
                            </dd>
                          </div>
                        )}

                        {member.volunteer_roles && member.volunteer_roles.length > 0 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                              <UserPlus className="h-5 w-5 mr-2" />
                              Volunteer Roles
                            </dt>
                            <dd className="mt-1 text-sm text-foreground">
                              {member.volunteer_roles.join(', ')}
                            </dd>
                          </div>
                        )}

                        {member.small_groups && member.small_groups.length > 0 && (
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground flex items-center">
                              <Users className="h-5 w-5 mr-2" />
                              Small Groups
                            </dt>
                            <dd className="mt-1 text-sm text-foreground">
                              {member.small_groups.join(', ')}
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Notes */}
                    {(member.pastoral_notes || (member.prayer_requests && member.prayer_requests.length > 0)) && (
                      <div>
                        <h4 className="text-lg font-medium text-foreground mb-4">Additional Notes</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {member.pastoral_notes && (
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground">Pastoral Notes</dt>
                              <dd className="mt-1 text-sm text-foreground whitespace-pre-line">
                                {member.pastoral_notes}
                              </dd>
                            </div>
                          )}

                          {member.prayer_requests && member.prayer_requests.length > 0 && (
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground">Prayer Requests</dt>
                              <dd className="mt-1 text-sm text-foreground">
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
                  </div>
                )}

                {activeTab === 'financial' && (
                  <div className="space-y-8">
                    {/* Financial Summary */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-4">Financial Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <TrendingUp className="h-5 w-5 text-success" />
                                <h3 className="ml-2 text-sm font-medium text-foreground">Total Contributions</h3>
                              </div>
                              <Badge variant="success">YTD</Badge>
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                              {formatCurrency(totalIncome, currency)}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <TrendingDown className="h-5 w-5 text-destructive" />
                                <h3 className="ml-2 text-sm font-medium text-foreground">Total Expenses</h3>
                              </div>
                              <Badge variant="destructive">YTD</Badge>
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                              {formatCurrency(totalExpenses, currency)}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <h3 className="ml-2 text-sm font-medium text-foreground">Average Contribution</h3>
                              </div>
                              <Badge variant="primary">Per Transaction</Badge>
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                              {formatCurrency(averageContribution, currency)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Transaction History */}
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-4">Transaction History</h4>
                      <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                          data={transactions}
                          columns={transactionColumns}
                          totalRows={transactionData?.count || 0}
                          loading={transactionsLoading}
                          onPageChange={setPage}
                          onPageSizeChange={setPageSize}
                          onSortChange={setSortModel}
                          onFilterChange={setFilterModel}
                          disableRowSelectionOnClick
                          pagination={{
                            pageSize: pageSize,
                            pageSizeOptions: [5, 10, 25, 50],
                          }}
                          exportOptions={{
                            enabled: true,
                            fileName: `${member.first_name}_${member.last_name}_transactions`,
                            pdf: true,
                            excel: true,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={showDeleteConfirm} 
          onOpenChange={(open) => {
            if (!open) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle variant="danger">Delete Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this member? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={async () => {
                  if (id) {
                    await deleteMemberMutation.mutateAsync(id);
                    navigate('/members');
                  }
                  setShowDeleteConfirm(false);
                }}
              >
                {deleteMemberMutation.isPending ? (
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

export default MemberProfile;