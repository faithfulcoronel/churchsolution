import * as React from 'react';
import { format, isValid, startOfDay, endOfDay, isBefore, isAfter, addDays } from 'date-fns';
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
  error,
  helperText,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  
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
  ];

  const finalPresets = presets || defaultPresets;

  const handleClear = () => {
    onChange({ from: undefined, to: undefined });
    setOpen(false);
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    onChange(preset.range());
  };

  const handleSelect = (day: Date) => {
    const date = startOfDay(day);

    if (!value.from) {
      onChange({ from: date, to: undefined });
    } else if (value.from && !value.to) {
      if (isBefore(date, value.from)) {
        onChange({ from: date, to: value.from });
      } else {
        onChange({ from: value.from, to: date });
      }
    } else {
      onChange({ from: date, to: undefined });
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
            "block text-sm font-medium mb-1.5 dark:text-gray-300",
            error ? 'text-destructive' : 'text-foreground',
            disabled && 'opacity-50'
          )}
        >
          {label}
          {error && <span className="text-destructive ml-1">*</span>}
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
                "dark:border-gray-700 dark:bg-gray-800"
              )}
            >
              {icon || <CalendarIcon className="h-4 w-4 mr-2" />}
              <span className="flex-1 truncate">{formattedDateRange}</span>
              <ChevronDown className="h-4 w-4 opacity-50 dark:text-gray-400" />
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
                  "dark:bg-gray-800 dark:border-gray-700"
                )}
                icon={icon || <CalendarIcon className="h-4 w-4" />}
                clearable={clearable && !!value.from}
                onClear={handleClear}
                onClick={() => setOpen(true)}
                error={error}
              />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 dark:border-gray-700" 
          align={align}
          side={side}
        >
          <div className="flex flex-col sm:flex-row">
            {finalPresets.length > 0 && (
              <div className="p-2 sm:p-3 sm:border-r dark:border-gray-700">
                <div className="space-y-1.5">
                  {finalPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="ghost"
                      size="sm"
                      className="justify-start font-normal w-full dark:text-gray-300 dark:hover:bg-gray-800"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-2 sm:p-3">
              <Calendar
                mode="range"
                selected={{
                  from: value.from,
                  to: value.to,
                }}
                onSelect={(range) => {
                  if (range?.from) {
                    if (range.to) {
                      onChange({ 
                        from: startOfDay(range.from), 
                        to: endOfDay(range.to) 
                      });
                      setOpen(false);
                    } else {
                      onChange({ from: startOfDay(range.from), to: undefined });
                    }
                  } else {
                    onChange({ from: undefined, to: undefined });
                  }
                }}
                initialFocus
                numberOfMonths={2}
                className="flex flex-col sm:flex-row gap-2"
              />
              <div className="flex items-center justify-between pt-4 border-t mt-4 dark:border-gray-700">
                <div className="text-sm text-muted-foreground">
                  {value.from && value.to && (
                    <Badge variant="secondary" className="font-normal dark:bg-gray-700 dark:text-gray-300">
                      {`${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!value.from}
                    className="dark:border-gray-700 dark:bg-gray-800"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setOpen(false)}
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
            error ? "text-destructive" : "text-muted-foreground dark:text-gray-400"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}