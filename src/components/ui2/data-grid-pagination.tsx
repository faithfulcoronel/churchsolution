import * as React from 'react';
import { Pagination } from './pagination';
import { useDataGrid } from './data-grid/context';

export function DataGridPagination() {
  const { pageIndex, pageSize, data, handlePageChange, handlePageSizeChange } = useDataGrid<any, any>();

  return (
    <Pagination
      currentPage={pageIndex + 1}
      totalPages={Math.max(1, Math.ceil(data.length / pageSize))}
      onPageChange={(p) => handlePageChange(p - 1)}
      itemsPerPage={pageSize}
      totalItems={data.length}
      onItemsPerPageChange={handlePageSizeChange}
      showItemsPerPage
      className="border-t"
      size="sm"
    />
  );
}



