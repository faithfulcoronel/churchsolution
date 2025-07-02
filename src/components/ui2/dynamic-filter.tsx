import * as React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { format, parse } from 'date-fns';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Select } from './select';
import { Button } from './button';
import { Badge } from './badge';
import { DatePickerInput } from './date-picker';
import { X, Filter, GripVertical } from 'lucide-react';

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'between' | 'greaterThan' | 'lessThan';

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface FilterField {
  id: string;
  label: string;
  type: FilterType;
  operators?: FilterOperator[];
  options?: { value: string; label: string }[];
}

export interface FilterValue {
  field: string;
  operator: FilterOperator;
  value: any;
  valueTo?: any; // For 'between' operator
}

interface DynamicFilterProps {
  fields: FilterField[];
  values: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  onReset?: () => void;
  className?: string;
}

export function DynamicFilter({
  fields,
  values = [],
  onChange,
  onReset,
  className,
}: DynamicFilterProps) {
  const [showFilters, setShowFilters] = React.useState(values.length > 0);

  const getOperatorLabel = (operator: FilterOperator): string => {
    const labels: Record<FilterOperator, string> = {
      equals: 'Equals',
      contains: 'Contains',
      startsWith: 'Starts with',
      endsWith: 'Ends with',
      between: 'Between',
      greaterThan: 'Greater than',
      lessThan: 'Less than'
    };
    return labels[operator];
  };

  const getDefaultOperators = (type: FilterType): FilterOperator[] => {
    switch (type) {
      case 'text':
        return ['equals', 'contains', 'startsWith', 'endsWith'];
      case 'number':
        return ['equals', 'between', 'greaterThan', 'lessThan'];
      case 'date':
        return ['equals', 'between', 'greaterThan', 'lessThan'];
      case 'select':
        return ['equals'];
      case 'boolean':
        return ['equals'];
      default:
        return ['equals'];
    }
  };

  const addFilter = (field: FilterField) => {
    const operators = field.operators || getDefaultOperators(field.type);
    onChange([
      ...values,
      {
        field: field.id,
        operator: operators[0],
        value: field.type === 'number' ? 0 : field.type === 'boolean' ? false : '',
        valueTo: field.type === 'date' ? '' : undefined
      }
    ]);
  };

  const removeFilter = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterValue>) => {
    const newFilters = [...values];
    newFilters[index] = { ...newFilters[index], ...updates };
    onChange(newFilters);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const oldIndex = parseInt(active.id.toString(), 10);
    const newIndex = parseInt(over.id.toString(), 10);
    if (oldIndex !== newIndex) {
      onChange(arrayMove(values, oldIndex, newIndex));
    }
  };

  const FilterItem = ({ filter, index, field }: { filter: FilterValue; index: number; field: FilterField }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
    } = useSortable({ id: index.toString() });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="bg-muted/5 rounded-lg p-4 border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div ref={setActivatorNodeRef} {...listeners} className="cursor-move">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="font-medium text-sm">{field.label}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => removeFilter(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {renderFilterInput(filter, field, index)}
      </div>
    );
  };

  const renderFilterInput = (filter: FilterValue, field: FilterField, index: number) => {
    const operators = field.operators || getDefaultOperators(field.type);

    return (
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={filter.operator}
            onChange={(e) => updateFilter(index, { operator: e.target.value as FilterOperator })}
            options={operators.map(op => ({
              value: op,
              label: getOperatorLabel(op)
            }))}
          />
        </div>

        <div className="flex-[2] min-w-[200px]">
          {field.type === 'select' ? (
            <Select
              value={filter.value}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
              options={field.options || []}
            />
          ) : field.type === 'date' ? (
            <div className="flex gap-2 items-center">
              <DatePickerInput
                value={filter.value ? parse(filter.value, 'yyyy-MM-dd', new Date()) : undefined}
                onChange={(date) =>
                  updateFilter(index, {
                    value: date ? format(date, 'yyyy-MM-dd') : ''
                  })
                }
              />
              {filter.operator === 'between' && (
                <>
                  <span className="text-muted-foreground">to</span>
                  <DatePickerInput
                    value={filter.valueTo ? parse(filter.valueTo, 'yyyy-MM-dd', new Date()) : undefined}
                    onChange={(date) =>
                      updateFilter(index, {
                        valueTo: date ? format(date, 'yyyy-MM-dd') : ''
                      })
                    }
                  />
                </>
              )}
            </div>
          ) : (
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              value={filter.value}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("mt-6", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {values.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {values.length}
                </Badge>
              )}
            </Button>
          </div>

          {onReset && values.length > 0 && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        {showFilters && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={values.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {values.map((filter, index) => {
                  const field = fields.find((f) => f.id === filter.field);
                  if (!field) return null;
                  return <FilterItem key={`${filter.field}-${index}`} filter={filter} index={index} field={field} />;
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {showFilters && (
          <div className="pt-2">
            <Select
              value=""
              onChange={(e) => {
                const field = fields.find(f => f.id === e.target.value);
                if (field) addFilter(field);
              }}
              options={[
                { value: '', label: 'Add filter...' },
                ...fields
                  .filter(field => !values.some(v => v.field === field.id))
                  .map(field => ({
                    value: field.id,
                    label: field.label
                  }))
              ]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}