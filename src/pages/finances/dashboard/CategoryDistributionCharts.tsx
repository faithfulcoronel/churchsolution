import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { PieChart } from 'lucide-react';
import { Charts } from '../../../components/ui2/charts';

interface ChartData {
  series: any[];
  options: any;
}

interface Props {
  incomeData: ChartData;
  expenseData: ChartData;
}

export function CategoryDistributionCharts({ incomeData, expenseData }: Props) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="text-base font-medium text-foreground">Income Distribution</h3>
            </div>
          </div>
          <Charts type="donut" series={incomeData.series} options={incomeData.options} height={350} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 text-rose-500 mr-2" />
              <h3 className="text-base font-medium text-foreground">Expense Distribution</h3>
            </div>
          </div>
          <Charts type="donut" series={expenseData.series} options={expenseData.options} height={350} />
        </CardContent>
      </Card>
    </div>
  );
}
