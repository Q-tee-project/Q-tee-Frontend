'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Worksheet } from '@/types/math';
import { KoreanWorksheet } from '@/types/korean';
import { EnglishWorksheetData } from '@/types/english';

// 타입 별칭
type EnglishWorksheet = EnglishWorksheetData;
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
    size: 50,
    minSize: 50,
  },
  {
    accessorKey: 'school_level',
    header: () => <div className="text-center">학교</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      return (
        <div className="flex justify-center">
          <Badge
            className="rounded-[4px]"
            style={{
              backgroundColor: worksheet.school_level === '고등학교' ? '#FFF5E9' : '#E6F3FF',
              color: worksheet.school_level === '고등학교' ? '#FF9F2D' : '#0085FF',
              padding: '5px 10px',
              fontSize: '14px',
            }}
          >
            {worksheet.school_level}
          </Badge>
        </div>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: 'grade',
    header: () => <div className="text-center">학년</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      return (
        <div className="flex justify-center">
          <Badge
            className="rounded-[4px]"
            style={{
              backgroundColor: '#f5f5f5',
              color: '#999999',
              padding: '5px 10px',
              fontSize: '14px',
            }}
          >
            {worksheet.grade}학년
          </Badge>
        </div>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    accessorKey: 'title',
    header: () => <div className="text-center">제목</div>,
    cell: ({ row }) => {
      const worksheet = row.original;
      // 영어 워크시트는 worksheet_name을 사용할 수 있음
      const title = worksheet.title ||
                   ('worksheet_name' in worksheet ? worksheet.worksheet_name : null) ||
                   '제목 없음';

      return (
        <div className="text-sm font-medium text-gray-900 truncate max-w-xs text-center">
          {title}
        </div>
      );
    },
    size: 200,
    minSize: 200,
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
        'problem_type' in worksheet ? worksheet.problem_type :
        '-';

      return (
        <div className="text-center">
          <span className="text-sm text-gray-500">{typeInfo as string}</span>
        </div>
      );
    },
    size: 150,
    minSize: 150,
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
    size: 120,
    minSize: 120,
  },
];
