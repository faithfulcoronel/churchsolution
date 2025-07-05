import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  required,
  error,
  helperText,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, 'yyyy-MM-dd') : ''
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const id = React.useId();

  React.useEffect(() => {
    setDate(value);
    setInputValue(value ? format(value, 'yyyy-MM-dd') : '');
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setInputValue(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
    onChange?.(selectedDate);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const parsed = parse(newValue, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) {
      handleSelect(parsed);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium mb-1.5 dark:text-muted-foreground',
            error ? 'text-destructive' : 'text-foreground',
            disabled && 'opacity-50'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={cn(error && 'border-destructive', 'dark:bg-muted dark:border-border')}
              disabled={disabled}
              icon={<CalendarIcon className="h-4 w-4" />}
              clearable={clearable && !!date}
              onClear={() => handleSelect(undefined)}
              onClick={() => setIsOpen(true)}
              required={required}
              error={error}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 dark:border-border" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            captionLayout="dropdown-buttons"
            fromYear={1900}
            toYear={new Date().getFullYear() + 10}
          />
        </PopoverContent>
      </Popover>
      
      {(helperText || error) && (
        <p
          className={cn(
            "mt-1.5 text-sm",
            error ? "text-destructive" : "text-muted-foreground dark:text-muted-foreground"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}