import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

interface FundBalance {
  id: string;
  name: string;
  balance: number;
}

interface Props {
  funds?: FundBalance[];
  currency: string;
  title?: string;
}

export function FundBalances({ funds, currency, title = 'Fund Balances' }: Props) {
  if (!funds || funds.length === 0) return null;
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
          <h3 className="text-base font-medium text-foreground">{title}</h3>
        </div>
        <ul className="space-y-2">
          {funds.map(f => (
            <li key={f.id} className="flex justify-between text-sm">
              <span>{f.name}</span>
              <span>{formatCurrency(f.balance, currency)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
