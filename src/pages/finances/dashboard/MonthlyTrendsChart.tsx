import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { Badge } from '../../../components/ui2/badge';
import { LineChart } from 'lucide-react';
import { Charts } from '../../../components/ui2/charts';

interface ChartData {
  series: any[];
  options: any;
}

interface Props {
  data: ChartData;
}

export function MonthlyTrendsChart({ data }: Props) {
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <LineChart className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-base font-medium text-foreground">Monthly Income vs Expenses</h3>
          </div>
          <Badge variant="secondary">Last 12 Months</Badge>
        </div>
        <Charts type="area" series={data.series} options={data.options} height={350} />
      </CardContent>
    </Card>
  );
}
