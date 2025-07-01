import * as React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const sourceIndex = active.data.current?.index;
    const destIndex = over.data.current?.index;
    const type = active.data.current?.type as 'row' | 'column';
    if (sourceIndex === undefined || destIndex === undefined || sourceIndex === destIndex) return;
    onDragEnd?.({
      source: { index: sourceIndex },
      destination: { index: destIndex },
      type,
    });
  };

  const DraggableRow = ({ row }: { row: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
    } = useSortable({ id: row.id, data: { index: row.index, type: 'row' } });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;

    return (
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn('relative', row.className)}
      >
        <td className="w-4 px-2">
          <div ref={setActivatorNodeRef} {...listeners} className="cursor-move">
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
  };

  const DraggableColumn = ({ column }: { column: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
    } = useSortable({ id: column.id, data: { index: column.index, type: 'column' } });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;

    return (
      <th
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn('relative', column.className)}
      >
        <div ref={setActivatorNodeRef} {...listeners} className="cursor-move absolute left-0 top-1/2 -translate-y-1/2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="pl-6">{column.render('Header')}</div>
      </th>
    );
  };

  const rowIds = (props as any).data?.map((_: any, idx: number) => idx.toString()) || [];
  const columnIds = (props as any).columns?.map((col: any, idx: number) => col.id ?? String(idx)) || [];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          <DataGrid
            {...props}
            renderRow={draggableRows ? ((row: any) => <DraggableRow row={row} />) : undefined}
            renderColumn={draggableColumns ? ((column: any) => <DraggableColumn column={column} />) : undefined}
          />
        </SortableContext>
      </SortableContext>
    </DndContext>
  );
}