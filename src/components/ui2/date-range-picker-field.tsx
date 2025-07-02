import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange, DateRangePicker, DateRangePreset } from './date-range-picker';
import { FormFieldProps } from './types';

export interface DateRangePickerFieldProps extends FormFieldProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  showCompactInput?: boolean;
  presets?: DateRangePreset[];
}

export function DateRangePickerField({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  clearable = true,
  showCompactInput = false,
  presets,
  label,
  required,
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
      presets={presets}
      icon={<CalendarIcon className="h-4 w-4" />}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    />
  );
}