import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { format } from 'date-fns';

export interface MemberOfferingRecord {
  member_name: string;
  offerings: Record<string, number>;
}

function formatAmount(amount: number) {
  return `\u20B1${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function generateMemberOfferingSummaryPdf(
  tenantName: string,
  sundayDate: Date,
  records: MemberOfferingRecord[],
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  // Landscape A4 dimensions
  const width = 841.89;
  const height = 595.28;

  const margin = 72; // 1 inch
  const rowHeight = 18;
  // Additional offset to align text within table cells (1.8 cm in points)
  const textShift = 51;
  const tableWidth = width - margin * 2;

  const categories = Array.from(
    new Set(records.flatMap(r => Object.keys(r.offerings)))
  ).sort();

  const memberColWidth = tableWidth * 0.3;
  const colWidth = (tableWidth - memberColWidth) / (categories.length + 1);

  const pages: PDFPage[] = [];
  let page: PDFPage;
  let y: number;

  const drawHeader = () => {
    let ty = height - margin;
    const title = 'Offering Summary by Member';
    const tw = boldFont.widthOfTextAtSize(title, 16);
    page.drawText(title, { x: width / 2 - tw / 2, y: ty, size: 16, font: boldFont });
    ty -= rowHeight;

    const churchW = font.widthOfTextAtSize(tenantName, 12);
    page.drawText(tenantName, { x: width / 2 - churchW / 2, y: ty, size: 12, font });
    ty -= rowHeight;

    const dateStr = format(sundayDate, 'MMMM d, yyyy');
    const dateW = font.widthOfTextAtSize(dateStr, 12);
    page.drawText(dateStr, { x: width / 2 - dateW / 2, y: ty, size: 12, font });
    ty -= rowHeight;

    const genText = `Generated via StewardTrack on: ${format(new Date(), 'MMMM d, yyyy')}`;
    const genW = font.widthOfTextAtSize(genText, 10);
    page.drawText(genText, { x: width - margin - genW, y: ty, size: 10, font });
    ty -= 6;
    page.drawLine({
      start: { x: margin, y: ty },
      end: { x: width - margin, y: ty },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    ty -= rowHeight;
    y = ty;
  };

  const drawTableHeader = () => {
    let x = margin;
    const headerBg = rgb(0.9, 0.9, 0.9);
    const border = rgb(0, 0, 0);
    const drawCell = (text: string, width: number, alignRight = false) => {
      page.drawRectangle({
        x,
        y: y - rowHeight + 4,
        width,
        height: rowHeight,
        color: headerBg,
        borderColor: border,
        borderWidth: 0.5,
      });
      const w = boldFont.widthOfTextAtSize(text, 11);
      const tx = (alignRight ? x + width - w - 2 : x + 2) + textShift;
      page.drawText(text, { x: tx, y, font: boldFont, size: 11 });
      x += width;
    };
    drawCell('Member Name', memberColWidth);
    categories.forEach(cat => drawCell(cat, colWidth, true));
    drawCell('Total', colWidth, true);
    y -= rowHeight;
  };

  const addPage = () => {
    page = pdfDoc.addPage([width, height]);
    pages.push(page);
    drawHeader();
    drawTableHeader();
  };

  const drawRow = (rec: MemberOfferingRecord, rowIdx: number) => {
    if (y - rowHeight < margin) addPage();
    let x = margin;
    const fillColor = rowIdx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.98, 0.98, 0.98);
    const border = rgb(0, 0, 0);
    const drawCell = (text: string, width: number, alignRight = false) => {
      page.drawRectangle({
        x,
        y: y - rowHeight + 4,
        width,
        height: rowHeight,
        color: fillColor,
        borderColor: border,
        borderWidth: 0.5,
      });
      const fontUsed = alignRight ? font : font;
      const w = fontUsed.widthOfTextAtSize(text, 11);
      const tx = (alignRight ? x + width - w - 2 : x + 2) + textShift;
      page.drawText(text, { x: tx, y, size: 11, font: fontUsed });
      x += width;
    };
    drawCell(rec.member_name, memberColWidth);
    let total = 0;
    categories.forEach(cat => {
      const amt = rec.offerings[cat] || 0;
      total += amt;
      drawCell(formatAmount(amt), colWidth, true);
    });
    drawCell(formatAmount(total), colWidth, true);
    y -= rowHeight;
  };

  addPage();
  const sorted = [...records].sort((a, b) => a.member_name.localeCompare(b.member_name));
  sorted.forEach((rec, idx) => drawRow(rec, idx));

  const summary: Record<string, number> = {};
  categories.forEach(cat => {
    summary[cat] = records.reduce((sum, r) => sum + (r.offerings[cat] || 0), 0);
  });
  const summaryTotal = Object.values(summary).reduce((a, b) => a + b, 0);

  if (y - rowHeight < margin) addPage();
  let x = margin;
  const fill = rgb(0.9, 0.9, 0.9);
  const border = rgb(0, 0, 0);
  const drawSumCell = (text: string, width: number, alignRight = false) => {
    page.drawRectangle({
      x,
      y: y - rowHeight + 4,
      width,
      height: rowHeight,
      color: fill,
      borderColor: border,
      borderWidth: 0.5,
    });
    const w = boldFont.widthOfTextAtSize(text, 11);
    const tx = (alignRight ? x + width - w - 2 : x + 2) + textShift;
    page.drawText(text, { x: tx, y, size: 11, font: boldFont });
    x += width;
  };
  drawSumCell('Summary Total', memberColWidth);
  categories.forEach(cat => drawSumCell(formatAmount(summary[cat]), colWidth, true));
  drawSumCell(formatAmount(summaryTotal), colWidth, true);
  y -= rowHeight;

  const pageCount = pages.length;
  pages.forEach((p, idx) => {
    const text = `Page ${idx + 1} of ${pageCount}`;
    const tw = font.widthOfTextAtSize(text, 10);
    p.drawText(text, { x: width / 2 - tw / 2, y: margin / 2, size: 10, font });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

