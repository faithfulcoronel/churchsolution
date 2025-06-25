import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFinancialTransactionHeaderRepository } from "../../../hooks/useFinancialTransactionHeaderRepository";
import { useChartOfAccounts } from "../../../hooks/useChartOfAccounts";
import { useFinancialSourceRepository } from "../../../hooks/useFinancialSourceRepository";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../../components/ui2/card";
import { Input } from "../../../components/ui2/input";
import { Button } from "../../../components/ui2/button";
import BackButton from "../../../components/BackButton";
import { Textarea } from "../../../components/ui2/textarea";
import { DatePickerInput } from "../../../components/ui2/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui2/select";
import { Combobox } from "../../../components/ui2/combobox";
import { Switch } from "../../../components/ui2/switch";
import { useAccountRepository } from "../../../hooks/useAccountRepository";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Building2,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useCurrencyStore } from "../../../stores/currencyStore";
import { formatCurrency } from "../../../utils/currency";
import { FormDialog } from "../../../components/ui2/form-dialog";
import AccountCreateForm from "../../../components/forms/AccountCreateForm";
import ChartOfAccountCreateForm from "../../../components/forms/ChartOfAccountCreateForm";

interface TransactionEntry {
  accounts_account_id: string;
  account_id: string;
  description: string;
  debit: number | null;
  credit: number | null;
}

function BulkTransactionEntry() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { currency } = useCurrencyStore();

  // Repositories
  const {
    useCreateWithTransactions,
    useUpdateWithTransactions,
    useQuery,
    getTransactionEntries,
  } = useFinancialTransactionHeaderRepository();
  const { useAccountOptions } = useChartOfAccounts();
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();
  const { useQuery: useAccountsQuery } = useAccountRepository();

  // Get transaction data if editing
  const { data: transactionData } = useQuery({
    filters: {
      id: {
        operator: "eq",
        value: id,
      },
    },
    relationships: [
      {
        table: "financial_sources",
        foreignKey: "source_id",
        select: ["id", "name", "source_type"],
      },
    ],
    enabled: isEditMode,
  });

  // Create/update mutations
  const createMutation = useCreateWithTransactions();
  const updateMutation = useUpdateWithTransactions();

  // Get account options
  const { data: accountOptions, isLoading: isAccountsLoading } =
    useAccountOptions();

  // Get financial sources
  const { data: sourcesData, isLoading: isSourcesLoading } = useSourcesQuery({
    filters: {
      is_active: {
        operator: "eq",
        value: true,
      },
    },
  });
  const sources = sourcesData?.data || [];

  // Get accounts for People/Org column
  const { data: accountRecordsData, isLoading: isAccountRecordsLoading } =
    useAccountsQuery();
  const accountRecords = accountRecordsData?.data || [];

  const accountRecordOptions = React.useMemo(
    () => accountRecords.map((a) => ({ value: a.id, label: a.name })),
    [accountRecords],
  );

  // Form state
  const [headerData, setHeaderData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    source_id: "none",
  });

  const [isLoading, setIsLoading] = useState(isEditMode);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showChartAccountModal, setShowChartAccountModal] = useState(false);

  const [autoBalance, setAutoBalance] = useState(false);
  const [offsetAccountId, setOffsetAccountId] = useState("");

  // Default offset account when auto balance is enabled
  React.useEffect(() => {
    if (!autoBalance || offsetAccountId) return;

    const defaultAccount = accountOptions?.find(
      (opt) => opt.type === "asset",
    );
    if (defaultAccount) {
      setOffsetAccountId(defaultAccount.value);
    }
  }, [autoBalance, offsetAccountId, accountOptions]);

  // Load transaction data when editing
  React.useEffect(() => {
    const loadTransactionData = async () => {
      if (isEditMode && id && transactionData?.data?.[0]) {
        const header = transactionData.data[0];

        setHeaderData({
          transaction_date: header.transaction_date,
          description: header.description,
          reference: header.reference || "",
          source_id: header.source_id || "none",
        });

        try {
          const entriesData = await getTransactionEntries(id);
          if (entriesData && entriesData.length > 0) {
            setEntries(
              entriesData.map((entry: any) => ({
                accounts_account_id: entry.accounts_account_id || "",
                account_id: entry.account_id,
                description: entry.description,
                debit: entry.debit || null,
                credit: entry.credit || null,
              }))
            );
          }
        } catch (error) {
          console.error("Error loading transaction entries:", error);
          setError("Failed to load transaction entries");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadTransactionData();
  }, [isEditMode, id, transactionData, getTransactionEntries]);

  const [entries, setEntries] = useState<TransactionEntry[]>([
    {
      accounts_account_id: "",
      account_id: "",
      description: "",
      debit: null,
      credit: null,
    },
    {
      accounts_account_id: "",
      account_id: "",
      description: "",
      debit: null,
      credit: null,
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  // Build displayed entries including offset when auto balancing
  const displayedEntries = React.useMemo(() => {
    if (!autoBalance) return entries;

    const accountId =
      offsetAccountId || accountOptions?.find((opt) => opt.type === "asset")?.value;
    if (!accountId) return entries;

    const totalDebits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredits = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const diff = totalDebits - totalCredits;

    const offset: TransactionEntry = {
      accounts_account_id: "",
      account_id: accountId,
      description: "",
      debit: null,
      credit: null,
    };

    if (diff > 0) {
      offset.credit = diff;
    } else if (diff < 0) {
      offset.debit = -diff;
    }

    return [...entries, offset];
  }, [entries, autoBalance, offsetAccountId, accountOptions]);

  // Calculate totals
  const totalDebits = displayedEntries.reduce(
    (sum, entry) => sum + (entry.debit || 0),
    0,
  );
  const totalCredits = displayedEntries.reduce(
    (sum, entry) => sum + (entry.credit || 0),
    0,
  );
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Handle header field changes
  const handleHeaderChange = (field: string, value: string) => {
    setHeaderData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle entry field changes
  const handleEntryChange = (index: number, field: string, value: any) => {
    // Prevent edits to the auto-balance row
    if (autoBalance && index === entries.length) {
      return;
    }

    const newEntries = [...entries];

    if (field === "debit" && value !== null && value !== "") {
      // If debit is set, clear credit
      newEntries[index] = {
        ...newEntries[index],
        [field]: parseFloat(value) || 0,
        credit: null,
      };
    } else if (field === "credit" && value !== null && value !== "") {
      // If credit is set, clear debit
      newEntries[index] = {
        ...newEntries[index],
        [field]: parseFloat(value) || 0,
        debit: null,
      };
    } else {
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
      };
    }

    setEntries(newEntries);
  };

  // Add new entry row
  const addEntry = () => {
    setEntries([
      ...entries,
      {
        accounts_account_id: "",
        account_id: "",
        description: "",
        debit: null,
        credit: null,
      },
    ]);
  };

  // Remove entry row
  const removeEntry = (index: number) => {
    // Prevent removing the auto-balance row
    if (autoBalance && index === entries.length) {
      return;
    }

    if (entries.length <= 2) {
      setError("A transaction must have at least two entries");
      return;
    }

    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  // Validate form
  const validateForm = () => {
    // Reset error
    setError(null);

    // Check header fields
    if (!headerData.transaction_date) {
      setError("Transaction date is required");
      return false;
    }

    if (!headerData.description.trim()) {
      setError("Transaction description is required");
      return false;
    }

    // Check entries
    if (entries.length < 2) {
      setError("A transaction must have at least two entries");
      return false;
    }

    // Check if all entries have an account
    const missingAccount = entries.some((entry) => !entry.account_id);
    if (missingAccount) {
      setError("All entries must have an account selected");
      return false;
    }

    // Check if all entries have either debit or credit
    const invalidAmount = entries.some(
      (entry) =>
        (entry.debit === null ||
          entry.debit === undefined ||
          entry.debit === 0) &&
        (entry.credit === null ||
          entry.credit === undefined ||
          entry.credit === 0),
    );
    if (invalidAmount) {
      setError("All entries must have either a debit or credit amount");
      return false;
    }

    // Require offset account when auto balancing
    if (autoBalance && !offsetAccountId) {
      setError("Select an offset account for automatic balancing");
      return false;
    }

    // Check if transaction is balanced when auto balance is off
    if (!autoBalance && !isBalanced) {
      setError(
        "Transaction must be balanced (total debits must equal total credits)",
      );
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Format entries for submission
      const formattedEntries = displayedEntries.map((entry) => ({
        account_id: entry.account_id,
        accounts_account_id: entry.accounts_account_id || null,
        description: entry.description || headerData.description,
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        date: headerData.transaction_date,
      }));

      if (isEditMode && id) {
        // Update transaction
        await updateMutation.mutateAsync({
          id,
          data: {
            transaction_date: headerData.transaction_date,
            description: headerData.description,
            reference: headerData.reference || null,
            source_id:
              headerData.source_id === "none" ? null : headerData.source_id,
          },
          transactions: formattedEntries,
        });
      } else {
        // Create transaction header and entries
        await createMutation.mutateAsync({
          data: {
            transaction_date: headerData.transaction_date,
            description: headerData.description,
            reference: headerData.reference || null,
            source_id:
              headerData.source_id === "none" ? null : headerData.source_id,
            status: "draft",
          },
          transactions: formattedEntries,
        });
      }

      // Navigate to transaction list
      navigate("/finances/transactions");
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the transaction",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/transactions" label="Back to Transactions" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">
                {isEditMode ? "Edit Transaction" : "New Transaction"}
              </h3>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <DatePickerInput
                  label="Transaction Date"
                  value={
                    headerData.transaction_date
                      ? new Date(headerData.transaction_date)
                      : undefined
                  }
                  onChange={(date) =>
                    handleHeaderChange(
                      "transaction_date",
                      date ? date.toISOString().split("T")[0] : "",
                    )
                  }
                  placeholder="Select date"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Financial Source
                </label>
                <Select
                  value={headerData.source_id}
                  onValueChange={(value) =>
                    handleHeaderChange("source_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select financial source (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {isSourcesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading sources...
                      </SelectItem>
                    ) : (
                      sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name} ({source.source_type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Description"
                  value={headerData.description}
                  onChange={(e) =>
                    handleHeaderChange("description", e.target.value)
                  }
                  placeholder="Enter transaction description"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Reference (Optional)"
                  value={headerData.reference}
                  onChange={(e) =>
                    handleHeaderChange("reference", e.target.value)
                  }
                  placeholder="Enter reference number or document"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-lg font-medium">Transaction Entries</h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAccountModal(true)}
                  className="flex items-center"
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  New Account
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChartAccountModal(true)}
                  className="flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  New Chart
                </Button>
                <Button
                  type="button"
                  onClick={addEntry}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Switch
                id="auto-balance"
                checked={autoBalance}
                onCheckedChange={setAutoBalance}
              />
              <label htmlFor="auto-balance" className="text-sm font-medium">
                Auto Balance
              </label>
              <Combobox
                options={accountOptions || []}
                value={offsetAccountId}
                onChange={setOffsetAccountId}
                placeholder="Select offset account"
                disabled={!autoBalance || isAccountsLoading}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                      People/Org
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                      Account
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">
                      Debit
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">
                      Credit
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEntries.map((entry, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="px-4 py-2">
                        <Combobox
                          options={accountRecordOptions}
                          value={entry.accounts_account_id}
                          onChange={(value) =>
                            handleEntryChange(index, "accounts_account_id", value)
                          }
                          placeholder={
                            isAccountRecordsLoading
                              ? "Loading accounts..."
                              : "Select account"
                          }
                          disabled={
                            isAccountRecordsLoading ||
                            (autoBalance && index === entries.length)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Combobox
                          options={accountOptions || []}
                          value={entry.account_id}
                          onChange={(value) =>
                            handleEntryChange(index, "account_id", value)
                          }
                          placeholder={
                            isAccountsLoading
                              ? "Loading accounts..."
                              : "Select account"
                          }
                          disabled={
                            isAccountsLoading ||
                            (autoBalance && index === entries.length)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={entry.description}
                          onChange={(e) =>
                            handleEntryChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Entry description (optional)"
                          disabled={
                            autoBalance && index === entries.length
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          value={entry.debit !== null ? entry.debit : ""}
                          onChange={(e) =>
                            handleEntryChange(index, "debit", e.target.value)
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="text-right"
                          disabled={
                            autoBalance && index === entries.length
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          value={entry.credit !== null ? entry.credit : ""}
                          onChange={(e) =>
                            handleEntryChange(index, "credit", e.target.value)
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="text-right"
                          disabled={
                            autoBalance && index === entries.length
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          disabled={
                            entries.length <= 2 ||
                            (autoBalance && index === entries.length)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-medium">
                    <td className="px-4 py-2" colSpan={3}>
                      Totals
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(totalDebits, currency)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(totalCredits, currency)}
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2" colSpan={3}>
                      Difference
                    </td>
                    <td className="px-4 py-2 text-right" colSpan={2}>
                      <span
                        className={
                          isBalanced ? "text-success" : "text-destructive"
                        }
                      >
                        {isBalanced
                          ? "Balanced"
                          : formatCurrency(
                              Math.abs(totalDebits - totalCredits),
                              currency,
                            )}
                      </span>
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {error && (
              <div className="mt-4 bg-destructive/10 border border-destructive/30 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/finances/transactions")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending || updateMutation.isPending || !isBalanced
              }
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Transaction" : "Create Transaction"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      <FormDialog
        open={showAccountModal}
        onOpenChange={setShowAccountModal}
        title="Add Account"
      >
        <AccountCreateForm
          onCancel={() => setShowAccountModal(false)}
          onSuccess={() => setShowAccountModal(false)}
        />
      </FormDialog>
      <FormDialog
        open={showChartAccountModal}
        onOpenChange={setShowChartAccountModal}
        title="Add Chart of Account"
      >
        <ChartOfAccountCreateForm
          onCancel={() => setShowChartAccountModal(false)}
          onSuccess={() => setShowChartAccountModal(false)}
        />
      </FormDialog>
    </div>
  );
}

export default BulkTransactionEntry;
