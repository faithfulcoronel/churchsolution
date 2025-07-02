import React from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import { DataGrid, GridColDef } from '../../components/ui2/mui-datagrid';
import { Combobox } from '../../components/ui2/combobox';
import { DatePickerInput } from '../../components/ui2/date-picker';
import { ProgressSteps } from '../../components/ui2/progress-steps';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { useCategoryRepository } from '../../hooks/useCategoryRepository';
import { useFundRepository } from '../../hooks/useFundRepository';
import { useFinancialSourceRepository } from '../../hooks/useFinancialSourceRepository';
import { useDonationImportService } from '../../hooks/useDonationImportService';
import { tenantUtils } from '../../utils/tenantUtils';

const computeStatus = (row: Omit<ParsedRow, 'status'> & { status?: ParsedRow['status'] }): ParsedRow['status'] =>
  row.accountId && row.categoryId && row.fundId && row.sourceId
    ? 'matched'
    : 'unmatched';

interface ParsedRow {
  id: number;
  accountName: string;
  accountId: string | null;
  memberId: string | null;
  categoryName: string;
  categoryId: string | null;
  fundName: string;
  fundId: string | null;
  sourceName: string;
  sourceId: string | null;
  amount: number;
  status: 'matched' | 'unmatched';
}

function toSnake(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function WeeklyGivingImport() {
  const [step, setStep] = React.useState(0);
  const [fileRows, setFileRows] = React.useState<Record<string, any>[]>([]);
  const [gridRows, setGridRows] = React.useState<ParsedRow[]>([]);
  const [headerData, setHeaderData] = React.useState({
    transaction_date: '',
    description: '',
  });

  const { useQuery: useAccountsQuery, useCreate } = useAccountRepository();
  const { useQuery: useCategoriesQuery } = useCategoryRepository();
  const { useQuery: useFundsQuery } = useFundRepository();
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();
  const { importDonations } = useDonationImportService();

  const accountsRes = useAccountsQuery();
  const categoriesRes = useCategoriesQuery({
    filters: { type: { operator: 'eq', value: 'income_transaction' } },
  });
  const fundsRes = useFundsQuery();
  const sourcesRes = useSourcesQuery();

  const accountOptions = React.useMemo(
    () =>
      (accountsRes.data?.data || []).map((a) => ({
        value: a.id,
        label: a.name,
      })),
    [accountsRes.data],
  );
  const categoryOptions = React.useMemo(
    () =>
      (categoriesRes.data?.data || []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categoriesRes.data],
  );
  const fundOptions = React.useMemo(
    () =>
      (fundsRes.data?.data || []).map((f) => ({
        value: f.id,
        label: f.name,
      })),
    [fundsRes.data],
  );
  const sourceOptions = React.useMemo(
    () =>
      (sourcesRes.data?.data || []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [sourcesRes.data],
  );

  const [defaultSourceId, setDefaultSourceId] = React.useState('');

  React.useEffect(() => {
    if (!defaultSourceId && sourceOptions.length) {
      setDefaultSourceId(sourceOptions[0].value);
    }
  }, [sourceOptions, defaultSourceId]);

  const uploadColumns = React.useMemo<GridColDef[]>(
    () =>
      fileRows.length
        ? Object.keys(fileRows[0])
            .filter((h) => h !== 'id')
            .map((h) => ({
              field: h,
              headerName: h,
              flex: 1,
            }))
        : [],
    [fileRows],
  );

  const createAccountMutation = useCreate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const withIds = json.map((row, index) => ({ id: index, ...row }));
      setFileRows(withIds);
      setStep(0);
    };
    reader.readAsArrayBuffer(file);
  };

  React.useEffect(() => {
    if (!fileRows.length) return;

    const headers = Object.keys(fileRows[0]);
    const known = ['id','member', 'name', 'date', 'fund', 'source', 'description'];
    const categoryHeaders = headers.filter(
      (h) => !known.includes(h.toLowerCase()),
    );

    const accounts = accountsRes.data?.data || [];
    const categories = categoriesRes.data?.data || [];
    const funds = fundsRes.data?.data || [];
    const sources = sourcesRes.data?.data || [];

    const parsed: ParsedRow[] = [];
    let idx = 0;
    for (const r of fileRows) {
      const accountName = r['MEMBERS LIST'] || r.member || r.name || '';
      const fundName = r.fund || 'Default Fund';
      const sourceName = r.source || 'Offering Box';

      for (const cat of categoryHeaders) {
        const amt = parseFloat(r[cat]) || 0;
        if (!amt) continue;

        const account = accounts.find(
          (a) => a.name.toLowerCase() === accountName.toLowerCase(),
        );
        const category = categories.find(
          (c) =>
            c.name.toLowerCase() === cat.toLowerCase() ||
            c.code.toLowerCase() === toSnake(cat),
        );
        const fund = funds.find(
          (f) =>
            f.code.toLowerCase() === fundName.toLowerCase() ||
            f.name.toLowerCase() === fundName.toLowerCase(),
        );
        const source = sources.find(
          (s) => s.name.toLowerCase() === sourceName.toLowerCase(),
        );

        let resolvedSourceId = source ? source.id : null;
        let resolvedSourceName = source ? source.name : sourceName;

        if (!source && defaultSourceId) {
          const def = sources.find((s) => s.id === defaultSourceId);
          resolvedSourceId = def ? def.id : null;
          resolvedSourceName = def ? def.name : resolvedSourceName;
        }

        const row = {
          id: idx++,
          accountName,
          accountId: account ? account.id : null,
          memberId: account?.member_id ?? null,
          categoryName: cat,
          categoryId: category ? category.id : null,
          fundName,
          fundId: fund ? fund.id : null,
          sourceName: resolvedSourceName,
          sourceId: resolvedSourceId,
          amount: amt,
          status: 'unmatched' as const,
        };
        row.status = computeStatus(row);
        parsed.push(row);
      }
    }
    setGridRows(parsed);
  }, [fileRows, accountsRes.data, categoriesRes.data, fundsRes.data, sourcesRes.data]);

  const editColumns: GridColDef[] = [
    {
      field: 'accountName',
      headerName: 'Account',
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <Combobox
          options={accountOptions}
          value={params.row.accountId || ''}
          onChange={(v) => {
            const label =
              accountOptions.find((o) => o.value === v)?.label || params.row.accountName;
            const memberId = accountsRes.data?.data?.find((a) => a.id === v)?.member_id ?? null;
            setGridRows((prev) =>
              prev.map((r) =>
                r.id === params.row.id
                  ? (() => {
                      const updated = { ...r, accountId: v || null, accountName: label, memberId };
                      return { ...updated, status: computeStatus(updated) };
                    })()
                  : r,
              ),
            );
          }}
        />
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <Combobox
          options={categoryOptions}
          value={params.row.categoryId || ''}
          onChange={(v) => {
            const label =
              categoryOptions.find((o) => o.value === v)?.label || params.row.categoryName;
            setGridRows((prev) =>
              prev.map((r) =>
                r.id === params.row.id
                  ? (() => {
                      const updated = { ...r, categoryId: v || null, categoryName: label };
                      return { ...updated, status: computeStatus(updated) };
                    })()
                  : r,
              ),
            );
          }}
        />
      ),
    },
    {
      field: 'fundName',
      headerName: 'Fund',
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <Combobox
          options={fundOptions}
          value={params.row.fundId || ''}
          onChange={(v) => {
            const label =
              fundOptions.find((o) => o.value === v)?.label || params.row.fundName;
            setGridRows((prev) =>
              prev.map((r) =>
                r.id === params.row.id
                  ? (() => {
                      const updated = { ...r, fundId: v || null, fundName: label };
                      return { ...updated, status: computeStatus(updated) };
                    })()
                  : r,
              ),
            );
          }}
        />
      ),
    },
    {
      field: 'sourceName',
      headerName: 'Source',
      flex: 1,
      editable: true,
      renderEditCell: (params) => (
        <Combobox
          options={sourceOptions}
          value={params.row.sourceId || ''}
          onChange={(v) => {
            const label =
              sourceOptions.find((o) => o.value === v)?.label || params.row.sourceName;
            setGridRows((prev) =>
              prev.map((r) =>
                r.id === params.row.id
                  ? (() => {
                      const updated = { ...r, sourceId: v || null, sourceName: label };
                      return { ...updated, status: computeStatus(updated) };
                    })()
                  : r,
              ),
            );
          }}
        />
      ),
    },
    { field: 'amount', headerName: 'Amount', flex: 1, type: 'number', editable: true },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const row = params.row as ParsedRow;
        if (row.accountId) return null;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const newAccount = await createAccountMutation.mutateAsync({
                data: { name: row.accountName, account_type: 'person' },
              });
              setGridRows((prev) =>
                prev.map((r) =>
                  r.id === row.id
                    ? (() => {
                        const updated = {
                          ...r,
                          accountId: newAccount.id,
                          memberId: newAccount.member_id ?? null,
                        };
                        return { ...updated, status: computeStatus(updated) };
                      })()
                    : r,
                ),
              );
            }}
          >
            Create Account
          </Button>
        );
      },
    },
  ];

  const matchColumns: GridColDef[] = [
    { field: 'accountName', headerName: 'Account', flex: 1 },
    { field: 'categoryName', headerName: 'Category', flex: 1 },
    { field: 'fundName', headerName: 'Fund', flex: 1 },
    { field: 'sourceName', headerName: 'Source', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 1 },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const row = params.row as ParsedRow;
        if (row.accountId) return null;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const newAccount = await createAccountMutation.mutateAsync({
                data: { name: row.accountName, account_type: 'person' },
              });
              setGridRows((prev) =>
                prev.map((r) =>
                  r.id === row.id
                    ? (() => {
                        const updated = {
                          ...r,
                          accountId: newAccount.id,
                          memberId: newAccount.member_id ?? null,
                        };
                        return { ...updated, status: computeStatus(updated) };
                      })()
                    : r,
                ),
              );
            }}
          >
            Create Account
          </Button>
        );
      },
    },
  ];

  const handleCellEdit = React.useCallback((params: any) => {
    if (
      ['accountName', 'categoryName', 'fundName', 'sourceName'].includes(
        params.field,
      )
    ) {
      return;
    }
    setGridRows((prev) =>
      prev.map((r) =>
        r.id === params.id
          ? (() => {
              const updated = { ...r, [params.field]: params.value };
              return { ...updated, status: computeStatus(updated) };
            })()
          : r,
      ),
    );
  }, []);

  const finalizeImport = async () => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return;

    const categories = categoriesRes.data?.data || [];

    const accounts = accountsRes.data?.data || [];

    const grouped: Record<string, ParsedRow[]> = {};
    for (const r of gridRows) {
      const key = `${r.accountId || ''}-${headerData.transaction_date}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    const payload = Object.values(grouped).map((rows) => {
      const categoriesMap: Record<string, number> = {};
      rows.forEach((r) => {
        const code =
          categories.find((c) => c.id === r.categoryId)?.code ||
          toSnake(r.categoryName);
        categoriesMap[code] = (categoriesMap[code] || 0) + Number(r.amount || 0);
      });
      return {
        tenant_id: tenantId,
        member_id: accounts.find((a) => a.id === rows[0].accountId)?.member_id ?? null,
        giving_date: headerData.transaction_date,
        categories: categoriesMap,
      };
    });

    await importDonations(payload);
    setStep(0);
    setFileRows([]);
    setGridRows([]);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Import Weekly Giving</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload an Excel file to import weekly giving records.
          </p>
        </div>
      </div>

      <ProgressSteps
        steps={[
          { title: 'Upload', description: 'Select file & preview' },
          { title: 'Match Accounts', description: 'Resolve unmatched accounts' },
          { title: 'Finalize', description: 'Edit details and submit' },
        ]}
        currentStep={step}
        orientation="horizontal"
      />

      {step === 0 && (
        <>
          <div className="space-y-4">
            <Input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Default Source
              </label>
              <Combobox
                options={sourceOptions}
                value={defaultSourceId}
                onChange={(v) => setDefaultSourceId(v)}
                placeholder="Select source"
              />
            </div>
          </div>
          {fileRows.length > 0 && (
            <Card className="mt-4">
              <CardContent>
                <DataGrid
                  columns={uploadColumns}
                  data={fileRows}
                  totalRows={fileRows.length}
                  paginationMode="client"
                  autoHeight
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep(1)} disabled={!fileRows.length}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {step === 1 && (
        <Card>
          <CardContent>
            <DataGrid
              columns={matchColumns}
              data={gridRows}
              totalRows={gridRows.length}
              paginationMode="client"
              autoHeight
            />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!gridRows.every((r) => r.accountId)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerInput
                label="Date"
                value={headerData.transaction_date ? new Date(headerData.transaction_date) : undefined}
                onChange={(d) =>
                  setHeaderData({ ...headerData, transaction_date: d ? d.toISOString().split('T')[0] : '' })
                }
                required
              />
              <Input
                label="Description"
                value={headerData.description}
                onChange={(e) =>
                  setHeaderData({ ...headerData, description: e.target.value })
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <DataGrid
              columns={editColumns}
              data={gridRows}
              totalRows={gridRows.length}
              paginationMode="client"
              autoHeight
              processRowUpdate={(newRow) => newRow}
              onCellEditCommit={handleCellEdit}
            />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={finalizeImport}>Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WeeklyGivingImport;
