import { PDFDocument, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';
import { useCurrencyStore } from '../stores/currencyStore';

export interface ExpenseSummaryRecord {
  description: string;
  category_name: string | null;
  fund_name: string | null;
  fund_balance: number;
  amount: number;
}

const formatAmount = (amount: number) =>
  amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export async function generateExpenseSummaryPdf(
  tenantName: string,
  dateRange: { from: Date; to: Date },
  records: ExpenseSummaryRecord[],
  fundBalances: { id: string; name: string; balance: number }[],
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const width = 595.28;
  const height = 841.89;

  const margin = 40;
  const rowHeight = 18;
  const columnWidth = (width - margin * 2) / 4;

  const pages: any[] = [];
  let page = pdfDoc.addPage([width, height]);
  pages.push(page);
  let y = height - margin;

  const { currency } = useCurrencyStore.getState();

  const headerText = 'Expense Summary Report';

  const drawHeader = () => {
    y = height - margin;
    const titleWidth = boldFont.widthOfTextAtSize(headerText, 16);
    page.drawText(headerText, {
      x: width / 2 - titleWidth / 2,
      y,
      size: 16,
      font: boldFont,
    });
    y -= rowHeight;

    const tenantWidth = font.widthOfTextAtSize(tenantName, 12);
    page.drawText(tenantName, { x: width / 2 - tenantWidth / 2, y, size: 12, font });
    y -= rowHeight;

    const rangeStr = `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    const rangeWidth = font.widthOfTextAtSize(rangeStr, 12);
    page.drawText(rangeStr, { x: width / 2 - rangeWidth / 2, y, size: 12, font });
    y -= rowHeight / 2;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
    });
    y -= rowHeight;
  };

  const drawTableHeader = () => {
    const headers = ['Expense Description', 'Expense Category', 'Fund', 'Amount'];
    headers.forEach((h, idx) => {
      page.drawText(h, { x: margin + idx * columnWidth, y, size: 10, font: boldFont });
    });
    y -= rowHeight;
  };

  const addPage = () => {
    page = pdfDoc.addPage([width, height]);
    pages.push(page);
    drawHeader();
    drawTableHeader();
  };

  drawHeader();
  drawTableHeader();

  const drawRow = (r: ExpenseSummaryRecord) => {
    if (y - rowHeight < margin) addPage();
    const cells = [
      r.description || '',
      r.category_name || '',
      r.fund_name || '',
      formatAmount(r.amount),
    ];
    cells.forEach((c, idx) => {
      page.drawText(String(c), { x: margin + idx * columnWidth, y, size: 8, font });
    });
    y -= rowHeight;
  };

  records.forEach(rec => drawRow(rec));

  const total = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  if (y - rowHeight < margin) addPage();
  page.drawText('Expense Grand Total', {
    x: margin + 2 * columnWidth,
    y,
    size: 10,
    font: boldFont,
  });
  page.drawText(formatAmount(total), {
    x: margin + 3 * columnWidth,
    y,
    size: 10,
    font: boldFont,
  });

  y -= rowHeight * 2;
  if (y - rowHeight < margin) addPage();
  page.drawText('Fund Balances Summary', { x: margin, y, size: 12, font: boldFont });
  y -= rowHeight;
  fundBalances.forEach(f => {
    if (y - rowHeight < margin) addPage();
    page.drawText(f.name, { x: margin, y, size: 10, font });
    const bal = formatAmount(f.balance);
    const tw = font.widthOfTextAtSize(bal, 10);
    page.drawText(bal, { x: width - margin - tw, y, size: 10, font });
    y -= rowHeight;
  });

  pages.forEach((p, idx) => {
    const text = `Page ${idx + 1} of ${pages.length}`;
    const tw = font.widthOfTextAtSize(text, 10);
    p.drawText(text, { x: width / 2 - tw / 2, y: margin / 2, size: 10, font });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
