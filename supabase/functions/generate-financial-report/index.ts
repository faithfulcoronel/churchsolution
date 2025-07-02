import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import PDFDocument from 'https://esm.sh/pdfkit@0.15.1';
import { Buffer } from 'node:buffer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-application-name',
};

interface Transaction {
  date: string;
  description: string;
  amount: number;
}

interface ReportData {
  title?: string;
  transactions?: Transaction[];
}

function sum(transactions: Transaction[] = []): number {
  return transactions.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
}

function createPdf(data: ReportData): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Uint8Array[] = [];
    doc.on('data', (c: Uint8Array) => chunks.push(c));
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    doc.fontSize(18).text(data.title || 'Financial Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text('Date', 50, doc.y, { continued: true });
    doc.text('Description', 150, doc.y, { continued: true });
    doc.text('Amount', 400, doc.y);
    doc.moveDown();

    (data.transactions || []).forEach((txn) => {
      doc.text(txn.date, 50, doc.y, { continued: true });
      doc.text(txn.description, 150, doc.y, { continued: true });
      doc.text(String(txn.amount), 400, doc.y);
      doc.moveDown();
    });

    doc.moveDown();
    doc.text(`Total: ${sum(data.transactions)}`, 400);

    doc.end();
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: ReportData = await req.json();
    const pdfBytes = await createPdf(data);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
      },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
