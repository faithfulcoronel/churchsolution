import React from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui2/table';

function WeeklyGivingImport() {
  const [rows, setRows] = React.useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      setRows(json);
      if (json.length > 0) {
        setHeaders(Object.keys(json[0]));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Import Weekly Giving</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload an Excel file to import weekly giving records.
          </p>
        </div>
      </div>

      <Input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />

      {rows.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {headers.map((h) => (
                      <TableCell key={h}>{row[h]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WeeklyGivingImport;
