import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { format } from 'date-fns';

export interface FinancialSummaryRecord {
  opening_balance: number;
  total_income: number;
  total_expenses: number;
  net_result: number;
  ending_balance: number;
}

export interface FundBalanceRecord {
  fund_name: string;
  opening_balance: number;
  income: number;
  expenses: number;
  ending_balance: number;
}

export interface CategoryRecord {
  category_name: string;
  amount: number;
}

export interface AccountCategorySummary {
  account_name: string;
  categories: CategoryRecord[];
  subtotal: number;
}

export interface MemberGivingSummaryRecord {
  member_name: string;
  categories: CategoryRecord[];
  total: number;
}

export interface ChurchFinancialStatementData {
  summary: FinancialSummaryRecord;
  funds: FundBalanceRecord[];
  income: AccountCategorySummary[];
  expenses: AccountCategorySummary[];
  memberGiving: MemberGivingSummaryRecord[];
  remarks?: string;
}

const formatAmount = (amount: number) =>
  amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const drawHeader = (
  page: PDFPage,
  title: string,
  church: string,
  range: string,
  width: number,
  height: number,
  font: any,
  boldFont: any,
  margin: number,
  rowHeight: number,
) => {
  let y = height - margin;
  const tw = boldFont.widthOfTextAtSize(title, 16);
  page.drawText(title, { x: width / 2 - tw / 2, y, size: 16, font: boldFont });
  y -= rowHeight;
  const cw = font.widthOfTextAtSize(church, 12);
  page.drawText(church, { x: width / 2 - cw / 2, y, size: 12, font });
  y -= rowHeight;
  const rw = font.widthOfTextAtSize(range, 12);
  page.drawText(range, { x: width / 2 - rw / 2, y, size: 12, font });
  y -= rowHeight / 2;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1 });
  y -= rowHeight;
  return y;
};

const addFooters = (
  pages: PDFPage[],
  width: number,
  margin: number,
  font: any,
) => {
  pages.forEach((p, i) => {
    const text = `Page ${i + 1} of ${pages.length}`;
    const tw = font.widthOfTextAtSize(text, 10);
    p.drawText(text, { x: width - margin - tw, y: margin / 2, size: 10, font });
  });
};

export async function generateChurchFinancialStatementPdf(
  churchName: string,
  dateRange: { from: Date; to: Date },
  data: ChurchFinancialStatementData,
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const width = 841.89;
  const height = 595.28;
  const margin = 40;
  const rowHeight = 18;

  const pages: PDFPage[] = [];

  const rangeStr = `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(
    dateRange.to,
    'MMM dd, yyyy',
  )}`;

  // Summary Page
  let page = pdfDoc.addPage([width, height]);
  pages.push(page);
  let y = drawHeader(
    page,
    'Comprehensive Church Financial Statement',
    churchName,
    rangeStr,
    width,
    height,
    font,
    boldFont,
    margin,
    rowHeight,
  );

  const summaryLabels = [
    'Opening Balance',
    'Total Income',
    'Total Expenses',
    'Net Result',
    'Ending Balance',
  ];
  const summaryValues = [
    data.summary.opening_balance,
    data.summary.total_income,
    data.summary.total_expenses,
    data.summary.net_result,
    data.summary.ending_balance,
  ];
  summaryLabels.forEach((label, idx) => {
    page.drawText(label, { x: margin, y, size: 12, font });
    const val = formatAmount(summaryValues[idx]);
    const vw = font.widthOfTextAtSize(val, 12);
    page.drawText(val, { x: width - margin - vw, y, size: 12, font: boldFont });
    y -= rowHeight;
  });

  // Fund Balances Page
  page = pdfDoc.addPage([width, height]);
  pages.push(page);
  y = drawHeader(
    page,
    'Fund Balances',
    churchName,
    rangeStr,
    width,
    height,
    font,
    boldFont,
    margin,
    rowHeight,
  );
  const fundHeaders = ['Fund', 'Opening', 'Income', 'Expenses', 'Ending'];
  const colWidth = (width - margin * 2) / fundHeaders.length;
  fundHeaders.forEach((h, i) => {
    page.drawText(h, { x: margin + colWidth * i, y, size: 12, font: boldFont });
  });
  y -= rowHeight;
  data.funds.forEach(f => {
    const vals = [
      f.fund_name,
      formatAmount(f.opening_balance),
      formatAmount(f.income),
      formatAmount(f.expenses),
      formatAmount(f.ending_balance),
    ];
    vals.forEach((v, i) => {
      const fnt = i === 0 ? font : boldFont;
      const x = margin + colWidth * i;
      const val = typeof v === 'string' ? v : String(v);
      page.drawText(val, { x, y, size: 11, font: fnt });
    });
    y -= rowHeight;
  });

  // Income Summary Page
  page = pdfDoc.addPage([width, height]);
  pages.push(page);
  y = drawHeader(
    page,
    'Income Summary',
    churchName,
    rangeStr,
    width,
    height,
    font,
    boldFont,
    margin,
    rowHeight,
  );
  data.income.forEach(acc => {
    page.drawText(acc.account_name, { x: margin, y, size: 12, font: boldFont });
    y -= rowHeight;
    acc.categories.forEach(cat => {
      const label = `- ${cat.category_name}`;
      page.drawText(label, { x: margin + 20, y, size: 11, font });
      const amt = formatAmount(cat.amount);
      const aw = font.widthOfTextAtSize(amt, 11);
      page.drawText(amt, { x: width - margin - aw, y, size: 11, font });
      y -= rowHeight;
    });
    const sub = formatAmount(acc.subtotal);
    const sw = boldFont.widthOfTextAtSize(sub, 11);
    page.drawText('Subtotal', { x: margin + 20, y, size: 11, font: boldFont });
    page.drawText(sub, { x: width - margin - sw, y, size: 11, font: boldFont });
    y -= rowHeight * 1.5;
  });

  // Expense Summary Page
  page = pdfDoc.addPage([width, height]);
  pages.push(page);
  y = drawHeader(
    page,
    'Expense Summary',
    churchName,
    rangeStr,
    width,
    height,
    font,
    boldFont,
    margin,
    rowHeight,
  );
  data.expenses.forEach(acc => {
    page.drawText(acc.account_name, { x: margin, y, size: 12, font: boldFont });
    y -= rowHeight;
    acc.categories.forEach(cat => {
      const label = `- ${cat.category_name}`;
      page.drawText(label, { x: margin + 20, y, size: 11, font });
      const amt = formatAmount(cat.amount);
      const aw = font.widthOfTextAtSize(amt, 11);
      page.drawText(amt, { x: width - margin - aw, y, size: 11, font });
      y -= rowHeight;
    });
    const sub = formatAmount(acc.subtotal);
    const sw = boldFont.widthOfTextAtSize(sub, 11);
    page.drawText('Subtotal', { x: margin + 20, y, size: 11, font: boldFont });
    page.drawText(sub, { x: width - margin - sw, y, size: 11, font: boldFont });
    y -= rowHeight * 1.5;
  });

  // Member Giving Summary Page
  page = pdfDoc.addPage([width, height]);
  pages.push(page);
  y = drawHeader(
    page,
    'Member Giving Summary',
    churchName,
    rangeStr,
    width,
    height,
    font,
    boldFont,
    margin,
    rowHeight,
  );
  data.memberGiving.forEach(m => {
    page.drawText(m.member_name, { x: margin, y, size: 12, font: boldFont });
    y -= rowHeight;
    m.categories.forEach(cat => {
      const label = `- ${cat.category_name}`;
      page.drawText(label, { x: margin + 20, y, size: 11, font });
      const amt = formatAmount(cat.amount);
      const aw = font.widthOfTextAtSize(amt, 11);
      page.drawText(amt, { x: width - margin - aw, y, size: 11, font });
      y -= rowHeight;
    });
    const tot = formatAmount(m.total);
    const twidth = boldFont.widthOfTextAtSize(tot, 11);
    page.drawText('Total', { x: margin + 20, y, size: 11, font: boldFont });
    page.drawText(tot, { x: width - margin - twidth, y, size: 11, font: boldFont });
    y -= rowHeight * 1.5;
  });

  // Remarks Page
  if (data.remarks) {
    page = pdfDoc.addPage([width, height]);
    pages.push(page);
    y = drawHeader(
      page,
      'Treasurer / Pastoral Remarks',
      churchName,
      rangeStr,
      width,
      height,
      font,
      boldFont,
      margin,
      rowHeight,
    );
    const lines = data.remarks.split(/\n+/);
    lines.forEach(line => {
      const lineWidth = font.widthOfTextAtSize(line, 12);
      page.drawText(line, { x: margin, y, size: 12, font });
      y -= rowHeight;
    });
  }

  addFooters(pages, width, margin, font);
  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
