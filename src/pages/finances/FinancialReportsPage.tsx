import React, { useEffect, useMemo, useState } from 'react';
import { startCase } from 'lodash-es';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '../../components/ui2/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui2/select';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import { Input } from '../../components/ui2/input';
import { DataGrid } from '../../components/ui2/data-grid';
import { Button } from '../../components/ui2/button';
import { Loader2, Printer, Download } from 'lucide-react';
import { useFinancialReports } from '../../hooks/useFinancialReports';
import { tenantUtils } from '../../utils/tenantUtils';
import { usePermissions } from '../../hooks/usePermissions';
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import blobStream from 'blob-stream';

interface RecordData {
  [key: string]: any;
}

const reportOptions = [
  { id: 'trial-balance', label: 'Trial Balance' },
  { id: 'general-ledger', label: 'General Ledger' },
  { id: 'journal', label: 'Journal Report' },
  { id: 'income-statement', label: 'Income Statement' },
  { id: 'budget-vs-actual', label: 'Budget vs Actual' },
  { id: 'fund-summary', label: 'Fund Summary' },
  { id: 'member-giving', label: 'Member Giving Summary' },
  { id: 'giving-statement', label: 'Giving Statement' },
  { id: 'offering-summary', label: 'Offering Summary' },
  { id: 'category-financial', label: 'Category Based Report' },
  { id: 'cash-flow', label: 'Cash Flow Summary' }
];

function FinancialReportsPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [reportType, setReportType] = useState('trial-balance');
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [memberId, setMemberId] = useState('');
  const [fundId, setFundId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const { isAdmin } = usePermissions();

  useEffect(() => {
    tenantUtils.getTenantId().then(id => setTenantId(id));
  }, []);

  const {
    useTrialBalance,
    useGeneralLedger,
    useJournalReport,
    useIncomeStatement,
    useBudgetVsActual,
    useFundSummary,
    useMemberGivingSummary,
    useGivingStatement,
    useOfferingSummary,
    useCategoryFinancialReport,
    useCashFlowSummary,
  } = useFinancialReports(tenantId);

  const trialBalanceQuery = useTrialBalance(format(dateRange.to, 'yyyy-MM-dd'), { enabled: reportType === 'trial-balance' });
  const generalLedgerQuery = useGeneralLedger(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    accountId || undefined,
    { enabled: reportType === 'general-ledger' }
  );
  const journalQuery = useJournalReport(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    { enabled: reportType === 'journal' }
  );
  const incomeStatementQuery = useIncomeStatement(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    { enabled: reportType === 'income-statement' }
  );
  const budgetQuery = useBudgetVsActual(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    { enabled: reportType === 'budget-vs-actual' }
  );
  const fundSummaryQuery = useFundSummary(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    { enabled: reportType === 'fund-summary' }
  );
  const memberGivingQuery = useMemberGivingSummary(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    memberId || undefined,
    { enabled: reportType === 'member-giving' }
  );
  const givingStatementQuery = useGivingStatement(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    memberId,
    { enabled: reportType === 'giving-statement' }
  );
  const offeringSummaryQuery = useOfferingSummary(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    { enabled: reportType === 'offering-summary' }
  );
  const categoryReportQuery = useCategoryFinancialReport(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    categoryId || undefined,
    { enabled: reportType === 'category-financial' }
  );
  const cashFlowQuery = useCashFlowSummary(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
    { enabled: reportType === 'cash-flow' }
  );

  const activeQuery =
    trialBalanceQuery ?? generalLedgerQuery ?? journalQuery ?? incomeStatementQuery ?? budgetQuery ?? fundSummaryQuery ?? memberGivingQuery ?? givingStatementQuery ?? offeringSummaryQuery ?? categoryReportQuery ?? cashFlowQuery;

  const { data, isLoading } = activeQuery;

  const columns = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    const keys = Object.keys(data[0] as RecordData);
    return keys.map(key => ({ accessorKey: key, header: startCase(key) }));
  }, [data]);

  const handlePrint = () => window.print();

  const exportPdfWithPdfKit = () => {
    if (!data || !Array.isArray(data)) return;

    const doc = new PDFDocument({ margin: 40 });
    const stream = doc.pipe(blobStream());

    const title = reportOptions.find(r => r.id === reportType)?.label || 'Financial Report';

    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text('Date', 50, doc.y, { continued: true });
    doc.text('Description', 150, doc.y, { continued: true });
    doc.text('Amount', 400, doc.y);
    doc.moveDown();

    (data as RecordData[]).forEach(rec => {
      doc.text(String(rec.date), 50, doc.y, { continued: true });
      doc.text(String(rec.description), 150, doc.y, { continued: true });
      doc.text(String(rec.amount), 400, doc.y);
      doc.moveDown();
    });

    const total = (data as RecordData[]).reduce(
      (acc, cur) => acc + (Number(cur.amount) || 0),
      0,
    );
    doc.moveDown();
    doc.text(`Total: ${total}`, 400);

    doc.end();

    stream.on('finish', () => {
      const url = stream.toBlobURL('application/pdf');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}.pdf`;
      link.click();
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and export financial reports.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={exportPdfWithPdfKit} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-end gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger label="Report Type" className="max-w-xs">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              {reportOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePickerField
            value={dateRange}
            onChange={setDateRange}
            label="Date Range"
            showCompactInput
          />
          {['general-ledger'].includes(reportType) && (
            <Input value={accountId} onChange={e => setAccountId(e.target.value)} label="Account ID" className="max-w-xs" />
          )}
          {['member-giving', 'giving-statement'].includes(reportType) && (
            <Input value={memberId} onChange={e => setMemberId(e.target.value)} label="Member ID" className="max-w-xs" />
          )}
          {['fund-summary'].includes(reportType) && (
            <Input value={fundId} onChange={e => setFundId(e.target.value)} label="Fund ID" className="max-w-xs" />
          )}
          {['category-financial'].includes(reportType) && (
            <Input value={categoryId} onChange={e => setCategoryId(e.target.value)} label="Category" className="max-w-xs" />
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data && Array.isArray(data) && data.length > 0 ? (
            <DataGrid
              data={data}
              columns={columns}
              title={reportOptions.find(r => r.id === reportType)?.label}
              exportOptions={{ enabled: true, excel: true, pdf: false, fileName: reportType }}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">No data available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialReportsPage;
