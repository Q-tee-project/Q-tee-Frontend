'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Worksheet } from '@/types/math';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Worksheet>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'school_level',
    header: () => <div className="text-center">학생 유형</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      return (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              worksheet.school_level === '고등학교'
                ? 'bg-blue-100 text-blue-800'
                : worksheet.school_level === '중학교'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {worksheet.school_level} {worksheet.grade}학년
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: () => <div className="text-center">제목</div>,
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-900 truncate max-w-xs text-center">
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'unit_name',
    header: () => <div className="text-center">문제 유형</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-sm text-gray-500">{row.getValue('unit_name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: () => <div className="text-center">생성일</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return (
        <div className="text-center">
          <span className="text-sm text-gray-500">
            {date
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\./g, '.')
              .replace(/\.$/, '')}
          </span>
        </div>
      );
    },
  },
];
