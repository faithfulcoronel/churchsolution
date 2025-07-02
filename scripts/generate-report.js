import fs from 'fs';
import PDFDocument from 'pdfkit';

function sum(transactions) {
  return transactions.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
}

function main() {
  const [dataFile, outputFile] = process.argv.slice(2);
  if (!dataFile || !outputFile) {
    console.error('Usage: node generate-report.js <data.json> <output.pdf>');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(outputFile));

  doc.fontSize(18).text(data.title || 'Financial Report', { align: 'center' });
  doc.moveDown();

  // table header
  doc.fontSize(12);
  doc.text('Date', 50, doc.y, { continued: true });
  doc.text('Description', 150, doc.y, { continued: true });
  doc.text('Amount', 400, doc.y);
  doc.moveDown();

  (data.transactions || []).forEach(txn => {
    doc.text(txn.date, 50, doc.y, { continued: true });
    doc.text(txn.description, 150, doc.y, { continued: true });
    doc.text(String(txn.amount), 400, doc.y);
    doc.moveDown();
  });

  doc.moveDown();
  doc.text(`Total: ${sum(data.transactions || [])}`, 400);

  doc.end();
}

main();

