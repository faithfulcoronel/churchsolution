import React from 'react';
import { DateRangePickerField } from '../ui2/date-range-picker-field';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  value: {
    start: string;
    end: string;
  };
  onChange: (value: { start: string; end: string }) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  // Convert string dates to Date objects for the DateRangePicker
  const dateRange = {
    from: value.start ? new Date(value.start) : undefined,
    to: value.end ? new Date(value.end) : undefined
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onChange({
      start: range.from ? range.from.toISOString().split('T')[0] : '',
      end: range.to ? range.to.toISOString().split('T')[0] : ''
    });
  };

  return (
    <div className="flex-1 min-w-[200px]">
      <DateRangePickerField
        value={dateRange}
        onChange={handleDateRangeChange}
        placeholder="Select date range"
        label="Date Range"
      />
    </div>
  );
}