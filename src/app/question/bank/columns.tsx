'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Worksheet } from '@/types/math';
import { KoreanWorksheet } from '@/types/korean';
import { EnglishWorksheet } from '@/types/english';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

type AnyWorksheet = Worksheet | KoreanWorksheet | EnglishWorksheet;

export const columns: ColumnDef<AnyWorksheet>[] = [
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
    header: () => <div className="text-center">학교</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      return (
        <div className="flex justify-center">
          <Badge
            className={`${
              worksheet.school_level === '고등학교'
                ? 'border-orange-300 text-orange-600 bg-orange-50'
                : 'border-blue-300 text-blue-600 bg-blue-50'
            }`}
          >
            {worksheet.school_level}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'grade',
    header: () => <div className="text-center">학년</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      return (
        <div className="flex justify-center">
          <Badge className="border-gray-300 text-gray-600 bg-gray-50">{worksheet.grade}학년</Badge>
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
    id: 'type_info',
    header: () => <div className="text-center">문제 유형</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      // 과목별로 다른 필드 사용
      const typeInfo =
        'unit_name' in worksheet ? worksheet.unit_name :
        'korean_type' in worksheet ? worksheet.korean_type :
        'english_type' in worksheet ? worksheet.english_type :
        '-';

      return (
        <div className="text-center">
          <span className="text-sm text-gray-500">{typeInfo}</span>
        </div>
      );
    },
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
