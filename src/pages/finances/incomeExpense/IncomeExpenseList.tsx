import React, { useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useFinancialTransactionHeaderRepository } from "../../../hooks/useFinancialTransactionHeaderRepository";
import { useIncomeExpenseTransactionRepository } from "../../../hooks/useIncomeExpenseTransactionRepository";
import { useIncomeExpenseService } from "../../../hooks/useIncomeExpenseService";
import { useAccess } from "../../../utils/access";
import { Card, CardContent } from "../../../components/ui2/card";
import { Button } from "../../../components/ui2/button";
import { Textarea } from "../../../components/ui2/textarea";
import { Input } from "../../../components/ui2/input";
import { DateRangePickerField } from "../../../components/ui2/date-range-picker-field";
import { DataGrid } from "../../../components/ui2/mui-datagrid";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui2/select";
import { Badge } from "../../../components/ui2/badge";
import MetricCard from "../../../components/dashboard/MetricCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui2/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui2/alert-dialog";
import { FinancialTransactionHeader } from "../../../models/financialTransactionHeader.model";
import { GridColDef } from "@mui/x-data-grid";
import {
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal,
  FileText,
  Check,
  X,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useCurrencyStore } from "../../../stores/currencyStore";
import { formatCurrency } from "../../../utils/currency";
import { usePathname } from "../../../providers";
import { useIncomeExpenseFilterStore } from "../../../stores/incomeExpenseFilterStore";

interface IncomeExpenseListProps {
  transactionType: "income" | "expense";
}

function IncomeExpenseList({ transactionType }: IncomeExpenseListProps) {
  const navigate = useNavigate();
  const { hasAccess } = useAccess();
  const { prevPathname } = usePathname();
  const filters = useIncomeExpenseFilterStore((state) => state[transactionType]);
  const setFilter = useIncomeExpenseFilterStore((state) => state.setFilter);
  const resetFilter = useIncomeExpenseFilterStore((state) => state.resetFilter);
  const basePath = transactionType === "income" ? "giving" : "expenses";
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { searchTerm, statusFilter, dateRange } = filters;

  useEffect(() => {
    if (!prevPathname || !prevPathname.startsWith(`/finances/${basePath}`)) {
      resetFilter(transactionType);
    }
  }, []);
  const { useQueryAll: useEntryQuery } = useIncomeExpenseTransactionRepository();
  const {
    useQueryAll: useHeaderQuery,
    submitTransaction,
    approveTransaction,
    postTransaction,
    useUpdate,
  } = useFinancialTransactionHeaderRepository();
  const updateMutation = useUpdate();
  const { deleteBatch } = useIncomeExpenseService(transactionType);
  const { currency } = useCurrencyStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showDeleteReasonDialog, setShowDeleteReasonDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<FinancialTransactionHeader | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: entryResult,
    isLoading: entriesLoading,
    error: entriesError,
  } = useEntryQuery({
    filters: {
      transaction_type: { operator: "eq", value: transactionType },
      transaction_date: {
        operator: "between",
        value: format(dateRange.from, "yyyy-MM-dd"),
        valueTo: format(dateRange.to, "yyyy-MM-dd"),
      },
    },
    order: { column: "transaction_date", ascending: false },
  });

  const headerIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          (entryResult?.data || [])
            .map((e: any) => e.header_id)
            .filter((id: string | null) => !!id),
        ),
      ),
    [entryResult],
  );

  const {
    data: headerResult,
    isLoading: headerLoading,
    error: headerError,
  } = useHeaderQuery({
    filters: {
      id: { operator: "isAnyOf", value: headerIds },
      transaction_date: {
        operator: "between",
        value: format(dateRange.from, "yyyy-MM-dd"),
        valueTo: format(dateRange.to, "yyyy-MM-dd"),
      },
    },
    order: { column: "transaction_date", ascending: false },
    enabled: headerIds.length > 0,
  });
  const headers = headerResult?.data || [];
  const isLoading = entriesLoading || headerLoading;

  const filteredHeaders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return headers.filter((h) => {
      const matchesSearch =
        h.transaction_number.toLowerCase().includes(term) ||
        (h.description || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || h.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [headers, searchTerm, statusFilter]);

  const totalsByHeader = useMemo(() => {
    const totals: Record<string, number> = {};
    (entryResult?.data || []).forEach((e: any) => {
      if (e.header_id) {
        totals[e.header_id] = (totals[e.header_id] || 0) + Number(e.amount || 0);
      }
    });
    return totals;
  }, [entryResult]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      draft: 0,
      submitted: 0,
      approved: 0,
      posted: 0,
      voided: 0,
    };
    headers.forEach((h) => {
      counts[h.status] = (counts[h.status] || 0) + 1;
    });
    return counts;
  }, [headers]);

  const statusMetrics = useMemo(
    () => [
      {
        name: "Draft",
        value: statusCounts.draft,
        icon: FileText,
        iconClassName: "text-secondary",
        barClassName: "bg-secondary",
      },
      {
        name: "Submitted",
        value: statusCounts.submitted,
        icon: FileText,
        iconClassName: "text-info",
        barClassName: "bg-info",
      },
      {
        name: "Approved",
        value: statusCounts.approved,
        icon: Check,
        iconClassName: "text-warning",
        barClassName: "bg-warning",
      },
      {
        name: "Posted",
        value: statusCounts.posted,
        icon: Check,
        iconClassName: "text-success",
        barClassName: "bg-success",
      },
      {
        name: "Voided",
        value: statusCounts.voided,
        icon: X,
        iconClassName: "text-destructive",
        barClassName: "bg-destructive",
      },
    ],
    [statusCounts],
  );

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      setDeleteInProgress(true);
      setDeleteError(null);
      await deleteBatch(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the transaction",
      );
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!selectedTransaction) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await submitTransaction(selectedTransaction.id);
      setShowSubmitDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting transaction:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting the transaction",
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await approveTransaction(selectedTransaction.id);
      setShowApproveDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error approving transaction:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "An error occurred while approving the transaction",
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePostTransaction = async () => {
    if (!selectedTransaction) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await postTransaction(selectedTransaction.id);
      setShowPostDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error posting transaction:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "An error occurred while posting the transaction",
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEditTransaction = () => {
    if (!selectedTransaction) return;
    navigate(`/finances/${basePath}/${selectedTransaction.id}/edit`);
  };

  const columns: GridColDef[] = [
    { field: "transaction_date", headerName: "Date", flex: 1, minWidth: 120 },
    {
      field: "transaction_number",
      headerName: "Number",
      flex: 1,
      minWidth: 150,
    },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => totalsByHeader[params.row.id] || 0,
      renderCell: (params) =>
        formatCurrency(totalsByHeader[params.row.id] || 0, currency),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const status = params.value;
        return (
          <Badge
            variant={
              status === "posted"
                ? "success"
                : status === "voided"
                  ? "destructive"
                  : status === "approved"
                    ? "warning"
                    : status === "submitted"
                      ? "info"
                      : "secondary"
            }
            className="flex items-center"
          >
            {status === "posted" ? (
              <>
                <Check className="h-3 w-3 mr-1" /> Posted
              </>
            ) : status === "voided" ? (
              <>
                <X className="h-3 w-3 mr-1" /> Voided
              </>
            ) : status === "approved" ? (
              <>
                <Check className="h-3 w-3 mr-1" /> Approved
              </>
            ) : status === "submitted" ? (
              <>
                <FileText className="h-3 w-3 mr-1" /> Submitted
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 mr-1" /> Draft
              </>
            )}
          </Badge>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const status = params.row.status;
        const canEdit = status === "draft";

        return (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate(`/finances/${basePath}/${params.row.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedTransaction(params.row);
                  setShowEditDialog(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/finances/${basePath}/${params.row.id}`)
                  }
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </DropdownMenuItem>

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setShowEditDialog(true);
                    }}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Transaction
                  </DropdownMenuItem>
                )}

                {status === "draft" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setShowSubmitDialog(true);
                    }}
                    className="flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Submit Transaction
                  </DropdownMenuItem>
                )}

                {status === "submitted" &&
                  hasAccess("finance.approve", "finance.approve") && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedTransaction(params.row);
                        setShowApproveDialog(true);
                      }}
                      className="flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve Transaction
                    </DropdownMenuItem>
                  )}

                {status === "submitted" &&
                  hasAccess("finance.approve", "finance.approve") && (
                    <DropdownMenuItem
                      onClick={async () => {
                        await updateMutation.mutateAsync({
                          id: params.row.id,
                          data: { status: "draft" },
                        });
                        window.location.reload();
                      }}
                      className="flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject to Draft
                    </DropdownMenuItem>
                  )}

                {status === "approved" &&
                  hasAccess("finance.approve", "finance.approve") && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedTransaction(params.row);
                        setShowPostDialog(true);
                      }}
                      className="flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" /> Post Transaction
                    </DropdownMenuItem>
                  )}

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setTransactionToDelete(params.row.id);
                      setDeleteReason("");
                      setShowDeleteReasonDialog(true);
                    }}
                    className="flex items-center text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Transaction
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const title = transactionType === "income" ? "Donations" : "Expenses";
  const description =
    transactionType === "income"
      ? "Manage contribution batches."
      : "Manage expense entries.";
  const addLabel = transactionType === "income" ? "Add Batch" : "Add Expense";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to={`/finances/${basePath}/add`}>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" /> {addLabel}
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) =>
              setFilter(transactionType, { searchTerm: e.target.value })
            }
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePickerField
            value={{ from: dateRange.from, to: dateRange.to }}
            onChange={(range) => {
              if (range.from && range.to) {
                setFilter(transactionType, {
                  dateRange: { from: range.from, to: range.to },
                });
              }
            }}
            placeholder="Select date range"
            icon={<Calendar className="h-4 w-4" />}
            showCompactInput
          />

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setFilter(transactionType, { statusFilter: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusMetrics.map((m) => (
          <MetricCard
            key={m.name}
            label={m.name}
            value={m.value}
            icon={m.icon}
            iconClassName={m.iconClassName}
            barClassName={m.barClassName}
          />
        ))}
      </div>

      <div className="mt-6">
        <Card className="dark:bg-slate-800">
          <CardContent className="p-0">
            <DataGrid<FinancialTransactionHeader>
              columns={columns}
              data={filteredHeaders}
              totalRows={filteredHeaders.length}
              loading={isLoading}
              error={
                entriesError instanceof Error
                  ? entriesError.message
                  : headerError instanceof Error
                    ? headerError.message
                    : undefined
              }
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              getRowId={(row) => row.id}
              onRowClick={(params) =>
                navigate(
                  params.row.status === "draft"
                    ? `/finances/${basePath}/${params.id}/edit`
                    : `/finances/${basePath}/${params.id}`,
                )
              }
              autoHeight
              paginationMode="client"
              showQuickFilter={false}
              page={page}
              pageSize={pageSize}
              storageKey="income-expense-list-grid"
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Reason Dialog */}
      <AlertDialog open={showDeleteReasonDialog} onOpenChange={setShowDeleteReasonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for deleting this transaction.
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">
                    {selectedTransaction.transaction_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      parse(
                        selectedTransaction.transaction_date,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      totalsByHeader[selectedTransaction.id] || 0,
                      currency,
                    )}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-2">
            <Textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter reason for deleting"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteReasonDialog(false);
                setDeleteReason("");
                setTransactionToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteReason.trim()) return;
                setShowDeleteReasonDialog(false);
                setDeleteDialogOpen(true);
              }}
              disabled={!deleteReason.trim()}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">
                    {selectedTransaction.transaction_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      parse(
                        selectedTransaction.transaction_date,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      totalsByHeader[selectedTransaction.id] || 0,
                      currency,
                    )}
                  </p>
                  {deleteReason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {deleteReason}
                    </p>
                  )}
                </div>
              )}
              {deleteError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setTransactionToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={deleteInProgress}
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Transaction"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">
              Submit Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this transaction for approval?
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">
                    {selectedTransaction.transaction_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      parse(
                        selectedTransaction.transaction_date,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      totalsByHeader[selectedTransaction.id] || 0,
                      currency,
                    )}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowSubmitDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handleSubmitTransaction}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Transaction"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">
              Approve Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this transaction?
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">
                    {selectedTransaction.transaction_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      parse(
                        selectedTransaction.transaction_date,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      totalsByHeader[selectedTransaction.id] || 0,
                      currency,
                    )}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowApproveDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handleApproveTransaction}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Transaction"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post Confirmation Dialog */}
      <AlertDialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">
              Post Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post this transaction? Once posted, it
              cannot be edited or deleted.
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">
                    {selectedTransaction.transaction_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      parse(
                        selectedTransaction.transaction_date,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      totalsByHeader[selectedTransaction.id] || 0,
                      currency,
                    )}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowPostDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handlePostTransaction}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Transaction"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">
              Edit Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit this transaction?
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">
                    {selectedTransaction.transaction_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      parse(
                        selectedTransaction.transaction_date,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      totalsByHeader[selectedTransaction.id] || 0,
                      currency,
                    )}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleEditTransaction}>
              Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default IncomeExpenseList;
