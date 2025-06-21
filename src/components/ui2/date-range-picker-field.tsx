import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange, DateRangePicker } from './date-range-picker';
import { FormFieldProps } from './types';

export interface DateRangePickerFieldProps extends FormFieldProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  showCompactInput?: boolean;
}

export function DateRangePickerField({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  clearable = true,
  showCompactInput = false,
  label,
  error,
  helperText,
}: DateRangePickerFieldProps) {
  return (
    <DateRangePicker
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      clearable={clearable}
      showCompactInput={showCompactInput}
      icon={<CalendarIcon className="h-4 w-4" />}
      label={label}
      error={error}
      helperText={helperText}
    />
  );
}