import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));

handlebars.registerHelper('sum', (items) => {
  return items.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
});

async function main() {
  const [dataFile, outputFile] = process.argv.slice(2);
  if (!dataFile || !outputFile) {
    console.error('Usage: ts-node generate-report.ts <data.json> <output.pdf>');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  const templatePath = path.join(__dirname, '../templates/financial-report.hbs');
  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));
  const html = template(data);

  const browser = await puppeteer.launch({
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputFile, format: 'A4' });
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

