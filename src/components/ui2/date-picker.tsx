import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Calendar } from './calendar';
import { FormFieldProps } from './types';

export interface DatePickerProps extends FormFieldProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  clearable = true,
  label,
  error,
  helperText,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    if (!isNaN(inputDate.getTime())) {
      handleSelect(inputDate);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label 
          className={cn(
            "block text-sm font-medium mb-1.5 dark:text-gray-300",
            error ? 'text-destructive' : 'text-foreground',
            disabled && 'opacity-50'
          )}
        >
          {label}
          {error && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={cn(error && "border-destructive", "dark:bg-gray-800 dark:border-gray-700")}
              disabled={disabled}
              icon={<CalendarIcon className="h-4 w-4" />}
              clearable={clearable && !!date}
              onClear={() => handleSelect(undefined)}
              onClick={() => setIsOpen(true)}
              error={error}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 dark:border-gray-700" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {(helperText || error) && (
        <p
          className={cn(
            "mt-1.5 text-sm",
            error ? "text-destructive" : "text-muted-foreground dark:text-gray-400"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}