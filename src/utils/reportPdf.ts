import { PDFDocument, StandardFonts } from 'pdf-lib';
import { startCase } from 'lodash-es';

export interface PdfOptions {
  title: string;
  fileName: string;
}

export async function exportReportPdf(
  data: Record<string, any>[] | undefined,
  { title, fileName }: PdfOptions,
) {
  if (!data || data.length === 0) return;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 40;
  page.drawText(title, { x: 40, y, size: 18, font });
  y -= 24;

  const keys = Object.keys(data[0]);
  const columnWidth = (width - 80) / keys.length;

  keys.forEach((key, index) => {
    page.drawText(startCase(key), { x: 40 + index * columnWidth, y, size: 12, font });
  });
  y -= 16;

  data.forEach(rec => {
    keys.forEach((key, index) => {
      page.drawText(String(rec[key] ?? ''), {
        x: 40 + index * columnWidth,
        y,
        font,
        size: 12,
      });
    });
    y -= 16;
  });

  if (keys.includes('amount')) {
    const total = data.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    y -= 8;
    const amountIndex = keys.indexOf('amount');
    page.drawText(`Total: ${total}`, {
      x: 40 + amountIndex * columnWidth,
      y,
      size: 12,
      font,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
