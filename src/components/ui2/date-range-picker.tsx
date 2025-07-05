import * as React from 'react';
import {
  format,
  isValid,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  addDays,
  parse,
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { Badge } from './badge';
import { Separator } from './separator';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type DateRangePreset = {
  name: string;
  label: string;
  range: () => DateRange;
};

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  presets?: DateRangePreset[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCompactInput?: boolean;
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  clearable = true,
  presets,
  align = 'start',
  side = 'bottom',
  showCompactInput = false,
  icon,
  label,
  required,
  error,
  helperText,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange>(value);
  const [fromInput, setFromInput] = React.useState(
    value.from ? format(value.from, 'yyyy-MM-dd') : ''
  );
  const [toInput, setToInput] = React.useState(
    value.to ? format(value.to, 'yyyy-MM-dd') : ''
  );

  React.useEffect(() => {
    if (open) {
      setRange(value);
      setFromInput(value.from ? format(value.from, 'yyyy-MM-dd') : '');
      setToInput(value.to ? format(value.to, 'yyyy-MM-dd') : '');
    }
  }, [open, value]);
  
  // Default presets if none provided
  const defaultPresets: DateRangePreset[] = [
    {
      name: 'today',
      label: 'Today',
      range: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      name: 'yesterday',
      label: 'Yesterday',
      range: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          from: yesterday,
          to: yesterday,
        };
      },
    },
    {
      name: 'last7Days',
      label: 'Last 7 Days',
      range: () => ({
        from: addDays(new Date(), -6),
        to: new Date(),
      }),
    },
    {
      name: 'last30Days',
      label: 'Last 30 Days',
      range: () => ({
        from: addDays(new Date(), -29),
        to: new Date(),
      }),
    },
    {
      name: 'thisMonth',
      label: 'This Month',
      range: () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: firstDayOfMonth,
          to: today,
        };
      },
    },
    {
      name: 'lastMonth',
      label: 'Last Month',
      range: () => {
        const today = new Date();
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          from: firstDayOfLastMonth,
          to: lastDayOfLastMonth,
        };
      },
    },
    {
      name: 'thisYear',
      label: 'This Year',
      range: () => {
        const year = new Date().getFullYear();
        return {
          from: new Date(year, 0, 1),
          to: new Date(year, 11, 31),
        };
      },
    },
    {
      name: 'lastYear',
      label: 'Last Year',
      range: () => {
        const year = new Date().getFullYear() - 1;
        return {
          from: new Date(year, 0, 1),
          to: new Date(year, 11, 31),
        };
      },
    },
  ];

  const finalPresets = presets || defaultPresets;

  const handleClear = () => {
    setRange({ from: undefined, to: undefined });
    setFromInput('');
    setToInput('');
    onChange({ from: undefined, to: undefined });
    setOpen(false);
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    const r = preset.range();
    setRange(r);
    setFromInput(r.from ? format(r.from, 'yyyy-MM-dd') : '');
    setToInput(r.to ? format(r.to, 'yyyy-MM-dd') : '');
  };

  const handleCalendarSelect = (r: { from?: Date; to?: Date } | undefined) => {
    if (r?.from) {
      const from = startOfDay(r.from);
      const to = r.to ? endOfDay(r.to) : undefined;
      setRange({ from, to });
      setFromInput(format(from, 'yyyy-MM-dd'));
      setToInput(to ? format(to, 'yyyy-MM-dd') : '');
    } else {
      setRange({ from: undefined, to: undefined });
      setFromInput('');
      setToInput('');
    }
  };

  const handleFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromInput(val);
    const parsed = parse(val, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) {
      const from = startOfDay(parsed);
      let to = range.to;
      if (to && isAfter(from, to)) {
        to = undefined;
        setToInput('');
      }
      setRange({ from, to });
    }
  };

  const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setToInput(val);
    const parsed = parse(val, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) {
      const to = endOfDay(parsed);
      let from = range.from;
      if (from && isAfter(from, to)) {
        from = undefined;
        setFromInput('');
      }
      setRange({ from, to });
    }
  };

  const formattedDateRange = React.useMemo(() => {
    if (!value.from) return placeholder;
    
    if (!value.to) {
      return format(value.from, 'MMM d, yyyy');
    }
    
    return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
  }, [value, placeholder]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label 
          className={cn(
            "block text-sm font-medium mb-1.5 dark:text-muted-foreground",
            error ? 'text-destructive' : 'text-foreground',
            disabled && 'opacity-50'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {showCompactInput ? (
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal",
                !value.from && "text-muted-foreground",
                error && "border-destructive",
                "dark:border-border dark:bg-muted"
              )}
              aria-required={required ? true : undefined}
            >
              {icon || <CalendarIcon className="h-4 w-4 mr-2" />}
              <span className="flex-1 truncate">{formattedDateRange}</span>
              <ChevronDown className="h-4 w-4 opacity-50 dark:text-muted-foreground" />
            </Button>
          ) : (
            <div className="relative">
              <Input
                value={formattedDateRange}
                readOnly
                disabled={disabled}
                className={cn(
                  "cursor-pointer",
                  error && "border-destructive",
                  "dark:bg-muted dark:border-border"
                )}
                icon={icon || <CalendarIcon className="h-4 w-4" />}
                clearable={clearable && !!value.from}
                onClear={handleClear}
                onClick={() => setOpen(true)}
                required={required}
                error={error}
              />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 dark:border-border" 
          align={align}
          side={side}
        >
          <div className="flex flex-col sm:flex-row">
            {finalPresets.length > 0 && (
              <div className="p-2 sm:p-3 sm:border-r dark:border-border">
                <div className="space-y-1.5">
                  {finalPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="ghost"
                      size="sm"
                      className="justify-start font-normal w-full dark:text-muted-foreground dark:hover:bg-muted"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="text"
                  value={fromInput}
                  placeholder="From"
                  onChange={handleFromInputChange}
                  className="w-[150px] dark:bg-muted dark:border-border"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="text"
                  value={toInput}
                  placeholder="To"
                  onChange={handleToInputChange}
                  className="w-[150px] dark:bg-muted dark:border-border"
                />
              </div>
              <Calendar
                mode="range"
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear() + 10}
                selected={{
                  from: range.from,
                  to: range.to,
                }}
                onSelect={handleCalendarSelect}
                initialFocus
                numberOfMonths={2}
                className="flex flex-col sm:flex-row gap-2"
              />
              <div className="flex items-center justify-between pt-4 border-t mt-4 dark:border-border">
                <div className="text-sm text-muted-foreground">
                  {range.from && range.to && (
                    <Badge variant="secondary" className="font-normal dark:bg-muted dark:text-muted-foreground">
                      {`${format(range.from, 'MMM d, yyyy')} - ${format(range.to, 'MMM d, yyyy')}`}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!range.from}
                    className="dark:border-border dark:bg-muted"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onChange(range);
                      setOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
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