import * as React from 'react';
import { Pagination } from './pagination';
import { useDataGrid } from './data-grid/context';

export function DataGridPagination() {
  const { pageIndex, pageSize, recordCount, handlePageChange, handlePageSizeChange } = useDataGrid<any, any>();

  return (
    <Pagination
      currentPage={pageIndex + 1}
      totalPages={Math.max(1, Math.ceil(recordCount / pageSize))}
      onPageChange={(p) => handlePageChange(p - 1)}
      itemsPerPage={pageSize}
      totalItems={recordCount}
      onItemsPerPageChange={handlePageSizeChange}
      showItemsPerPage
      className="border-t"
      size="sm"
    />
  );
}



