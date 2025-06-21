import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedValues = Array.from(values);
    const [removed] = reorderedValues.splice(result.source.index, 1);
    reorderedValues.splice(result.destination.index, 0, removed);

    onChange(reorderedValues);
  };

  const renderFilterInput = (filter: FilterValue, field: FilterField, index: number) => {
    const operators = field.operators || getDefaultOperators(field.type);

    return (
      <div key={index} className="flex flex-wrap items-end gap-2">
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
                value={filter.value ? new Date(filter.value) : undefined}
                onChange={(date) => updateFilter(index, {
                  value: date?.toISOString().split('T')[0]
                })}
              />
              {filter.operator === 'between' && (
                <>
                  <span className="text-muted-foreground">to</span>
                  <DatePickerInput
                    value={filter.valueTo ? new Date(filter.valueTo) : undefined}
                    onChange={(date) => updateFilter(index, {
                      valueTo: date?.toISOString().split('T')[0]
                    })}
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="filters">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  {values.map((filter, index) => {
                    const field = fields.find(f => f.id === filter.field);
                    if (!field) return null;

                    return (
                      <Draggable
                        key={`${filter.field}-${index}`}
                        draggableId={`${filter.field}-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-muted/5 rounded-lg p-4 border border-border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                </div>
                                <span className="font-medium text-sm">
                                  {field.label}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFilter(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {renderFilterInput(filter, field, index)}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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