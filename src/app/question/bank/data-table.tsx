'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  selectedRowId?: number | string;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  clearSelection?: boolean; // 선택 상태 초기화 트리거
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  selectedRowId,
  onRowSelectionChange,
  clearSelection,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (originalRow) => {
      const row = originalRow as any;
      return row.id ?? row.worksheet_id;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // 페이지네이션 비활성화 - 모든 데이터 표시
    manualPagination: true,
    // 컬럼 크기 조정 활성화
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  // 선택 상태 초기화
  React.useEffect(() => {
    if (clearSelection) {
      setRowSelection({});
    }
  }, [clearSelection]);

  // 선택된 행들이 변경될 때마다 부모 컴포넌트에 알림
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection]); // rowSelection만 의존성으로 설정

  return (
    <div className="overflow-x-auto pb-2">
      <Table style={{ minWidth: '720px' }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const rowData = row.original as any;
              const rowId = rowData.id ?? rowData.worksheet_id;
              const isSelected = selectedRowId !== undefined && rowId === selectedRowId;

              return (
                <TableRow
                  key={rowId}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`cursor-pointer hover:bg-[#F8FAFF] transition-colors ${
                    isSelected ? 'bg-[#F0F7FF]' : ''
                  }`}
                  style={{ minHeight: '60px' }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
