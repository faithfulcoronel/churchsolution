import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { format } from 'date-fns';

export interface MemberOfferingRecord {
  member_name: string;
  offerings: Record<string, number>;
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function splitTextIntoLines(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
      while (font.widthOfTextAtSize(current, size) > maxWidth) {
        let i = 1;
        while (
          i <= current.length &&
          font.widthOfTextAtSize(current.substring(0, i), size) <= maxWidth
        ) {
          i++;
        }
        const part = current.substring(0, i - 1);
        lines.push(part);
        current = current.substring(i - 1);
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}


export async function generateMemberOfferingSummaryPdf(
  tenantName: string,
  sundayDate: Date,
  records: MemberOfferingRecord[],
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const width = 841.89;
  const height = 595.28;

  const margin = 60;
  const rowHeight = 18;
  const tableYOffset = 51;
  const textShift = 0;
  const spacing = 1;
  const tableWidth = width - margin * 2 - spacing * (records.length + 1);

  const categories = Array.from(new Set(records.flatMap(r => Object.keys(r.offerings)))).sort();
  const memberColWidth = tableWidth * 0.10;
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
    y = ty - tableYOffset;
  };

  const drawTableHeader = () => {
    let x = margin;
    const headerBg = rgb(0.9, 0.9, 0.9);
    const border = rgb(0, 0, 0);
    const cells = [
      { text: 'Member Name', width: memberColWidth, alignRight: false },
      ...categories.map(cat => ({ text: cat, width: colWidth, alignRight: true })),
      { text: 'Total', width: colWidth, alignRight: true },
    ];

    const lineArrays = cells.map(c => splitTextIntoLines(c.text, boldFont, 10, c.width - 4));
    const headerLines = Math.max(...lineArrays.map(l => l.length));
    const headerHeight = rowHeight * headerLines;

    cells.forEach((cell, idx) => {
      const lines = lineArrays[idx];
      page.drawRectangle({
        x,
        y: y - headerHeight + 4,
        width: cell.width,
        height: headerHeight,
        color: headerBg,
        borderColor: border,
        borderWidth: 0.5,
      });
      lines.forEach((line, lineIdx) => {
        const w = boldFont.widthOfTextAtSize(line, 10);
        const ty = y - lineIdx * rowHeight;
        const tx = (cell.alignRight ? x + cell.width - w - 4 : x + 4) + textShift;
        page.drawText(line, { x: tx, y: ty - 8, font: boldFont, size: 10 });
      });
      x += cell.width + spacing;
    });
    y -= headerHeight;
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
      const w = font.widthOfTextAtSize(text, 10);
      const tx = (alignRight ? x + width - w - 4 : x + 4) + textShift;
      page.drawText(text, { x: tx, y: y - 8, size: 10, font });
      x += width + spacing;
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
    const w = boldFont.widthOfTextAtSize(text, 10);
    const tx = (alignRight ? x + width - w - 4 : x + 4) + textShift;
    page.drawText(text, { x: tx, y: y - 8, size: 10, font: boldFont });
    x += width + spacing;
  };

  drawSumCell('Summary Total', memberColWidth);
  [...categories, '__TOTAL__'].forEach(cat => {
    const value = cat === '__TOTAL__' ? formatAmount(summaryTotal) : formatAmount(summary[cat]);
    drawSumCell(value, colWidth, true);
  });
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
