import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui2/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui2/select';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import { Combobox } from '../../components/ui2/combobox';
import { MultiSelect } from '../../components/ui2/multi-select';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { useFundRepository } from '../../hooks/useFundRepository';
import { useCategoryRepository } from '../../hooks/useCategoryRepository';
import { tenantUtils } from '../../utils/tenantUtils';

import TrialBalanceReport from './financialReports/TrialBalanceReport';
import GeneralLedgerReport from './financialReports/GeneralLedgerReport';
import JournalReport from './financialReports/JournalReport';
import IncomeStatementReport from './financialReports/IncomeStatementReport';
import BudgetVsActualReport from './financialReports/BudgetVsActualReport';
import FundSummaryReport from './financialReports/FundSummaryReport';
import MemberGivingSummaryReport from './financialReports/MemberGivingSummaryReport';
import GivingStatementReport from './financialReports/GivingStatementReport';
import OfferingSummaryReport from './financialReports/OfferingSummaryReport';
import CategoryFinancialReport from './financialReports/CategoryFinancialReport';
import CashFlowSummaryReport from './financialReports/CashFlowSummaryReport';

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
  { id: 'cash-flow', label: 'Cash Flow Summary' },
];

function FinancialReportsPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [reportType, setReportType] = useState(reportOptions[0].id);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [memberId, setMemberId] = useState<string | null>(null);
  const [fundId, setFundId] = useState<string | null>(null);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { useQuery: useAccountsQuery } = useAccountRepository();
  const { useQuery: useMembersQuery } = useMemberRepository();
  const { useQuery: useFundsQuery } = useFundRepository();
  const { useQuery: useCategoriesQuery } = useCategoryRepository();

  const accountsRes = useAccountsQuery();
  const membersRes = useMembersQuery();
  const fundsRes = useFundsQuery();
  const categoriesRes = useCategoriesQuery();

  const accountOptions = React.useMemo(
    () =>
      (accountsRes.data?.data || []).map(a => ({ value: a.id, label: a.name })),
    [accountsRes.data],
  );
  const memberOptions = React.useMemo(
    () =>
      (membersRes.data?.data || []).map(m => ({
        value: m.id,
        label: `${m.first_name} ${m.last_name}`,
      })),
    [membersRes.data],
  );
  const fundOptions = React.useMemo(
    () => (fundsRes.data?.data || []).map(f => ({ value: f.id, label: f.name })),
    [fundsRes.data],
  );
  const categoryOptions = React.useMemo(
    () =>
      (categoriesRes.data?.data || []).map(c => ({ value: c.id, label: c.name })),
    [categoriesRes.data],
  );


  useEffect(() => {
    tenantUtils.getTenantId().then(id => setTenantId(id));
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Financial Reports</h1>
        <p className="text-muted-foreground">Generate and export financial reports.</p>
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
            <MultiSelect
              label="Account"
              options={accountOptions}
              value={accountIds}
              onChange={setAccountIds}
              placeholder="Select account"
              className="max-w-xs"
            />
          )}
          {['member-giving', 'giving-statement'].includes(reportType) && (
            <Combobox
              options={memberOptions}
              value={memberId || ''}
              onChange={v => setMemberId(v || null)}
              placeholder="Select member"
              className="max-w-xs"
            />
          )}
          {['fund-summary'].includes(reportType) && (
            <Combobox
              options={fundOptions}
              value={fundId || ''}
              onChange={v => setFundId(v || null)}
              placeholder="Select fund"
              className="max-w-xs"
            />
          )}
          {['category-financial'].includes(reportType) && (
            <Combobox
              options={categoryOptions}
              value={categoryId || ''}
              onChange={v => setCategoryId(v || null)}
              placeholder="Select category"
              className="max-w-xs"
            />
          )}
        </CardHeader>
        <CardContent>
          {reportType === 'trial-balance' && (
            <TrialBalanceReport tenantId={tenantId} dateRange={dateRange} />
          )}
          {reportType === 'general-ledger' && (
            <GeneralLedgerReport tenantId={tenantId} dateRange={dateRange} accountId={accountIds} />
          )}
          {reportType === 'journal' && (
            <JournalReport tenantId={tenantId} dateRange={dateRange} />
          )}
          {reportType === 'income-statement' && (
            <IncomeStatementReport tenantId={tenantId} dateRange={dateRange} />
          )}
          {reportType === 'budget-vs-actual' && (
            <BudgetVsActualReport tenantId={tenantId} dateRange={dateRange} />
          )}
          {reportType === 'fund-summary' && (
            <FundSummaryReport tenantId={tenantId} dateRange={dateRange} />
          )}
          {reportType === 'member-giving' && (
            <MemberGivingSummaryReport tenantId={tenantId} dateRange={dateRange} memberId={memberId || undefined} />
          )}
          {reportType === 'giving-statement' && (
            <GivingStatementReport tenantId={tenantId} dateRange={dateRange} memberId={memberId || undefined} />
          )}
          {reportType === 'offering-summary' && (
            <OfferingSummaryReport tenantId={tenantId} dateRange={dateRange} />
          )}
          {reportType === 'category-financial' && (
            <CategoryFinancialReport tenantId={tenantId} dateRange={dateRange} categoryId={categoryId || undefined} />
          )}
          {reportType === 'cash-flow' && (
            <CashFlowSummaryReport tenantId={tenantId} dateRange={dateRange} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialReportsPage;
