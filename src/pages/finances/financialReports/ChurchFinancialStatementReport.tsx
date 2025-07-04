import React from 'react';
import { format } from 'date-fns';
import { Button } from '../../../components/ui2/button';
import { Printer, Download } from 'lucide-react';
import { useFinancialReports } from '../../../hooks/useFinancialReports';
import { generateChurchFinancialStatementPdf } from '../../../utils';
import { tenantUtils } from '../../../utils/tenantUtils';

interface Props {
  tenantId: string | null;
  dateRange: { from: Date; to: Date };
}

export default function ChurchFinancialStatementReport({ tenantId, dateRange }: Props) {
  const { useChurchFinancialStatement } = useFinancialReports(tenantId);
  const { data } = useChurchFinancialStatement(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd'),
  );

  const handlePrint = () => window.print();
  const handlePdf = async () => {
    if (!data) return;
    const tenant = await tenantUtils.getCurrentTenant();
    const blob = await generateChurchFinancialStatementPdf(
      tenant?.name || '',
      dateRange,
      data,
    );
    const url = URL.createObjectURL(blob);
    const fileName = `church-financial-statement-${format(dateRange.from, 'yyyyMMdd')}-${format(dateRange.to, 'yyyyMMdd')}.pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>Print</Button>
        <Button variant="outline" onClick={handlePdf} icon={<Download className="h-4 w-4" />}>PDF</Button>
      </div>
    </div>
  );
}
