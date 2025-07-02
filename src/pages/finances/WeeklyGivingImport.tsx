import React from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import { DataGrid, GridColDef } from '../../components/ui2/mui-datagrid';
import { DatePickerInput } from '../../components/ui2/date-picker';
import { ProgressSteps } from '../../components/ui2/progress-steps';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { useCategoryRepository } from '../../hooks/useCategoryRepository';
import { useFundRepository } from '../../hooks/useFundRepository';
import { useFinancialSourceRepository } from '../../hooks/useFinancialSourceRepository';
import { useDonationImportService } from '../../hooks/useDonationImportService';
import { tenantUtils } from '../../utils/tenantUtils';

interface ParsedRow {
  id: number;
  memberName: string;
  memberId: string | null;
  categoryName: string;
  categoryId: string | null;
  fundName: string;
  fundId: string | null;
  sourceName: string;
  sourceId: string | null;
  amount: number;
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

  const { useQuery: useMembersQuery, useCreate } = useMemberRepository();
  const { useQuery: useCategoriesQuery } = useCategoryRepository();
  const { useQuery: useFundsQuery } = useFundRepository();
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();
  const { importDonations } = useDonationImportService();

  const membersRes = useMembersQuery();
  const categoriesRes = useCategoriesQuery({
    filters: { type: { operator: 'eq', value: 'income_transaction' } },
  });
  const fundsRes = useFundsQuery();
  const sourcesRes = useSourcesQuery();

  const createMemberMutation = useCreate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      setFileRows(json);
      setStep(1);
    };
    reader.readAsArrayBuffer(file);
  };

  React.useEffect(() => {
    if (!fileRows.length) return;

    const headers = Object.keys(fileRows[0]);
    const known = ['member', 'name', 'date', 'fund', 'source', 'description'];
    const categoryHeaders = headers.filter(
      (h) => !known.includes(h.toLowerCase()),
    );

    const members = membersRes.data?.data || [];
    const categories = categoriesRes.data?.data || [];
    const funds = fundsRes.data?.data || [];
    const sources = sourcesRes.data?.data || [];

    const parsed: ParsedRow[] = [];
    let idx = 0;
    for (const r of fileRows) {
      const memberName = r.member || r.name || '';
      const fundName = r.fund || '';
      const sourceName = r.source || '';

      for (const cat of categoryHeaders) {
        const amt = parseFloat(r[cat]) || 0;
        if (!amt) continue;

        const member = members.find(
          (m) => `${m.first_name} ${m.last_name}`.toLowerCase() === memberName.toLowerCase(),
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

        parsed.push({
          id: idx++,
          memberName,
          memberId: member ? member.id : null,
          categoryName: cat,
          categoryId: category ? category.id : null,
          fundName,
          fundId: fund ? fund.id : null,
          sourceName,
          sourceId: source ? source.id : null,
          amount: amt,
        });
      }
    }
    setGridRows(parsed);
  }, [fileRows, membersRes.data, categoriesRes.data, fundsRes.data, sourcesRes.data]);

  const columns: GridColDef[] = [
    { field: 'memberName', headerName: 'Member', flex: 1, editable: true },
    { field: 'categoryName', headerName: 'Category', flex: 1, editable: true },
    { field: 'fundName', headerName: 'Fund', flex: 1, editable: true },
    { field: 'sourceName', headerName: 'Source', flex: 1, editable: true },
    { field: 'amount', headerName: 'Amount', flex: 1, type: 'number', editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => {
        const row = params.row as ParsedRow;
        if (row.memberId) return null;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const [first, ...rest] = row.memberName.split(' ');
              const newMember = await createMemberMutation.mutateAsync({
                data: {
                  first_name: first || row.memberName,
                  last_name: rest.join(' ') || '.',
                  gender: 'other',
                  marital_status: 'single',
                  contact_number: 'N/A',
                  address: 'N/A',
                },
                fieldsToRemove: ['membership_type', 'membership_status'],
              });
              setGridRows((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, memberId: newMember.id } : r,
                ),
              );
            }}
          >
            Create Member
          </Button>
        );
      },
    },
  ];

  const handleCellEdit = React.useCallback((params: any) => {
    setGridRows((prev) =>
      prev.map((r) =>
        r.id === params.id ? { ...r, [params.field]: params.value } : r,
      ),
    );
  }, []);

  const finalizeImport = async () => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return;

    const categories = categoriesRes.data?.data || [];

    const grouped: Record<string, ParsedRow[]> = {};
    for (const r of gridRows) {
      const key = `${r.memberId || ''}-${headerData.transaction_date}`;
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
        member_id: rows[0].memberId,
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
          { title: 'Upload File', description: 'Select an XLSX file' },
          { title: 'Review', description: 'Verify and edit records' },
        ]}
        currentStep={step}
        orientation="horizontal"
      />

      {step === 0 && (
        <Input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
      )}

      {step === 1 && (
        <>
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
                columns={columns}
                data={gridRows}
                totalRows={gridRows.length}
                paginationMode="client"
                autoHeight
                processRowUpdate={(newRow) => newRow}
                onCellEditCommit={handleCellEdit}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={finalizeImport}>Finalize Import</Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default WeeklyGivingImport;
