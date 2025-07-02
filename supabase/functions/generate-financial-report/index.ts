import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1?target=deno';

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

async function createPdf(data: ReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 40;
  page.drawText(data.title || 'Financial Report', {
    x: 40,
    y,
    size: 18,
    font,
  });
  y -= 24;

  page.drawText('Date', { x: 40, y, size: 12, font });
  page.drawText('Description', { x: 150, y, size: 12, font });
  page.drawText('Amount', { x: 400, y, size: 12, font });
  y -= 16;

  for (const txn of data.transactions || []) {
    page.drawText(txn.date, { x: 40, y, size: 12, font });
    page.drawText(txn.description, { x: 150, y, size: 12, font });
    page.drawText(String(txn.amount), { x: 400, y, size: 12, font });
    y -= 16;
  }

  y -= 8;
  page.drawText(`Total: ${sum(data.transactions)}`, { x: 400, y, size: 12, font });

  return pdfDoc.save();
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
