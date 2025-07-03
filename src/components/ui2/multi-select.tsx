import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { FormFieldProps } from './types';

export type MultiSelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export interface MultiSelectProps extends FormFieldProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
  clearable?: boolean;
  searchable?: boolean;
  icon?: React.ReactNode;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select options...",
  emptyMessage = "No options found.",
  className,
  disabled = false,
  maxDisplay = 3,
  clearable = true,
  searchable = true,
  icon,
  label,
  required,
  error,
  helperText,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSelect = React.useCallback((optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
    );
  }, [value, onChange]);

  const handleClear = () => {
    onChange([]);
    setOpen(false);
  };

  const selectedLabels = React.useMemo(() => {
    return value.map(v => {
      const option = options.find(opt => opt.value === v);
      return option?.label || v;
    });
  }, [value, options]);

  const displayValue = React.useMemo(() => {
    if (value.length === 0) return placeholder;
    
    if (value.length <= maxDisplay) {
      return selectedLabels.join(', ');
    }
    
    return `${selectedLabels.slice(0, maxDisplay).join(', ')} +${value.length - maxDisplay} more`;
  }, [value, selectedLabels, maxDisplay, placeholder]);

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
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required ? true : undefined}
            className={cn(
              "w-full justify-between",
              value.length === 0 && "text-muted-foreground",
              error && "border-destructive",
              "h-10 px-3 py-2 dark:border-border dark:bg-muted"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {icon && <span className="shrink-0">{icon}</span>}
              <span className="truncate">{displayValue}</span>
            </div>
            <div className="flex shrink-0">
              {value.length > 0 && clearable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 opacity-70 hover:opacity-100 mr-1 dark:text-muted-foreground dark:hover:text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50 dark:text-muted-foreground" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 dark:border-border" align="start">
          <Command>
            {searchable && (
              <CommandInput 
                placeholder="Search options..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-9"
              />
            )}
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "flex items-center gap-2",
                        option.disabled && "opacity-50 cursor-not-allowed",
                        "dark:aria-selected:bg-muted"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:border-border"
                        onCheckedChange={() => handleSelect(option.value)}
                      />
                      {option.icon && <span className="mr-1">{option.icon}</span>}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {value.length > 0 && (
              <div className="border-t p-2 dark:border-border">
                <div className="flex flex-wrap gap-1 mb-2">
                  {value.map((selectedValue) => {
                    const option = options.find(opt => opt.value === selectedValue);
                    return (
                      <Badge 
                        key={selectedValue} 
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 dark:bg-muted dark:text-muted-foreground"
                      >
                        {option?.icon && <span className="mr-0.5">{option.icon}</span>}
                        <span>{option?.label || selectedValue}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 p-0 ml-1 hover:bg-transparent dark:text-muted-foreground dark:hover:text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(selectedValue);
                          }}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {value.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs dark:text-muted-foreground dark:hover:bg-muted"
                    onClick={handleClear}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </Command>
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