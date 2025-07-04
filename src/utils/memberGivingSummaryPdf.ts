import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { format } from 'date-fns';

export interface MemberGivingRecord {
  member_id: string;
  first_name: string;
  last_name: string;
  fund_name: string | null;
  amount: number;
}

export async function generateMemberGivingSummaryPdf(
  churchName: string,
  dateRange: { from: Date; to: Date },
  records: MemberGivingRecord[],
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const width = 595.28;
  const height = 841.89;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([width, height]);
  const pages = [page];
  const margin = 40;
  const rowHeight = 18;
  let y = height - margin;

  const drawHeader = () => {
    const title = 'Member Giving Summary Report';
    const titleWidth = boldFont.widthOfTextAtSize(title, 16);
    page.drawText(title, {
      x: width / 2 - titleWidth / 2,
      y,
      size: 16,
      font: boldFont,
    });
    y -= rowHeight;

    const rangeText = `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(
      dateRange.to,
      'MMM dd, yyyy',
    )}`;
    page.drawText(churchName, { x: margin, y, size: 12, font });
    const rangeWidth = font.widthOfTextAtSize(rangeText, 12);
    page.drawText(rangeText, { x: width - margin - rangeWidth, y, size: 12, font });
    y -= 6;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    y -= rowHeight;
  };

  const newPage = () => {
    page = pdfDoc.addPage([width, height]);
    pages.push(page);
    y = height - margin;
    drawHeader();
  };

  drawHeader();

  const groups = new Map<
    string,
    { name: string; funds: { fund: string; amount: number }[]; total: number }
  >();

  for (const rec of records) {
    const key = rec.member_id;
    const name = `${rec.first_name} ${rec.last_name}`;
    if (!groups.has(key)) {
      groups.set(key, { name, funds: [], total: 0 });
    }
    const g = groups.get(key)!;
    g.funds.push({ fund: rec.fund_name || '', amount: rec.amount });
    g.total += rec.amount;
  }

  const members = Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const member of members) {
    const neededSpace =
      rowHeight * (member.funds.length + 3) + rowHeight; // header + table + gap
    if (y - neededSpace < margin) newPage();

    page.drawText(member.name, { x: margin, y, size: 12, font: boldFont });
    y -= rowHeight;

    // table header
    page.drawText('Fund', { x: margin + 2, y, size: 11, font: boldFont });
    const amtHeader = 'Amount';
    const amtHeaderWidth = boldFont.widthOfTextAtSize(amtHeader, 11);
    page.drawText(amtHeader, {
      x: width - margin - amtHeaderWidth,
      y,
      size: 11,
      font: boldFont,
    });
    y -= rowHeight;

    member.funds.forEach((f, idx) => {
      if (y - rowHeight < margin) newPage();
      if (idx % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: y - 4,
          width: width - margin * 2,
          height: rowHeight,
          color: rgb(0.95, 0.95, 0.95),
        });
      }
      page.drawText(f.fund, { x: margin + 2, y, size: 11, font });
      const amount = f.amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const amtWidth = font.widthOfTextAtSize(amount, 11);
      page.drawText(amount, {
        x: width - margin - amtWidth,
        y,
        size: 11,
        font,
      });
      y -= rowHeight;
    });

    const totalLabel = 'Total';
    const totalStr = member.total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    page.drawText(totalLabel, { x: margin + 2, y, size: 11, font: boldFont });
    const totalWidth = boldFont.widthOfTextAtSize(totalStr, 11);
    page.drawText(totalStr, {
      x: width - margin - totalWidth,
      y,
      size: 11,
      font: boldFont,
    });
    y -= rowHeight * 1.5;
  }

  const generated = `Generated on: ${format(new Date(), 'MMM dd, yyyy')}`;
  const pageCount = pages.length;
  pages.forEach((p, idx) => {
    const footerY = margin / 2;
    p.drawText(generated, { x: margin, y: footerY, size: 10, font });
    const pageText = `Page ${idx + 1} of ${pageCount}`;
    const pageWidth = font.widthOfTextAtSize(pageText, 10);
    p.drawText(pageText, {
      x: width - margin - pageWidth,
      y: footerY,
      size: 10,
      font,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
