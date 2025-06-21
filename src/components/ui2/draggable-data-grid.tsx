import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DataGrid } from './data-grid';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableDataGridProps extends React.ComponentProps<typeof DataGrid> {
  onDragEnd?: (result: any) => void;
  draggableRows?: boolean;
  draggableColumns?: boolean;
}

export function DraggableDataGrid({
  onDragEnd,
  draggableRows = false,
  draggableColumns = false,
  ...props
}: DraggableDataGridProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  const renderDraggableRow = (row: any, provided: any) => (
    <tr
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn(
        'relative',
        row.className
      )}
    >
      <td className="w-4 px-2">
        <div {...provided.dragHandleProps} className="cursor-move">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </td>
      {row.cells.map((cell: any) => (
        <td key={cell.id} {...cell.getCellProps()}>
          {cell.render('Cell')}
        </td>
      ))}
    </tr>
  );

  const renderDraggableColumn = (column: any, provided: any) => (
    <th
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn(
        'relative',
        column.className
      )}
    >
      <div {...provided.dragHandleProps} className="cursor-move absolute left-0 top-1/2 -translate-y-1/2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="pl-6">
        {column.render('Header')}
      </div>
    </th>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <DataGrid
        {...props}
        renderRow={draggableRows ? renderDraggableRow : undefined}
        renderColumn={draggableColumns ? renderDraggableColumn : undefined}
      />
    </DragDropContext>
  );
}