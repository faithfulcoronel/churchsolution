import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onSearchChange?: (value: string) => void;
  onOpen?: () => void;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  onKeyDown,
  onSearchChange,
  onOpen,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSelect = React.useCallback((selectedValue: string) => {
    onChange?.(selectedValue);
    setSearchQuery('');
    setOpen(false);
  }, [onChange]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      setOpen(false);
      onKeyDown?.(e);
    } else if (e.key === 'Enter' && open && filteredOptions.length === 1) {
      e.preventDefault();
      handleSelect(filteredOptions[0].value);
    }
  }, [open, filteredOptions, handleSelect, onKeyDown]);

  const handleOpenChange = React.useCallback((o: boolean) => {
    setOpen(o);
    if (o) {
      onOpen?.();
    }
  }, [onOpen]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className,
            'dark:border-border dark:bg-muted'
          )}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 dark:text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 dark:border-border" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onValueChange={(v) => {
              setSearchQuery(v);
              onSearchChange?.(v);
            }}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto dark:border-border">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
                className="cursor-pointer dark:aria-selected:bg-muted"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4 shrink-0',
                    value === option.value ? 'opacity-100' : 'opacity-0',
                    'dark:text-muted-foreground'
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
