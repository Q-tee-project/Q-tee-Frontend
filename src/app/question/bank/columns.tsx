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

export const columns: ColumnDef<AnyWorksheet, unknown>[] = [
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
    id: 'school_level',
    accessorFn: (worksheet) => ('school_level' in worksheet ? worksheet.school_level : '-'),
    header: () => <div className="text-center">학교</div>,
    cell: ({ row }) => {
      const schoolLevel = row.getValue('school_level') as string;
      return (
        <div className="flex justify-center">
          <Badge
            className="rounded-[4px]"
            style={{
              backgroundColor: schoolLevel === '고등학교' ? '#FFF5E9' : '#E6F3FF',
              color: schoolLevel === '고등학교' ? '#FF9F2D' : '#0085FF',
              padding: '5px 10px',
              fontSize: '14px',
            }}
          >
            {schoolLevel}
          </Badge>
        </div>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    id: 'grade',
    accessorFn: (worksheet) => ('grade' in worksheet ? `${worksheet.grade}학년` : '-'),
    header: () => <div className="text-center">학년</div>,
    cell: ({ row }) => {
      const grade = row.getValue('grade') as string;
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
            {grade}
          </Badge>
        </div>
      );
    },
    size: 100,
    minSize: 100,
  },
  {
    id: 'title',
    accessorFn: (worksheet) =>
      'title' in worksheet
        ? worksheet.title
        : 'worksheet_name' in worksheet
        ? worksheet.worksheet_name
        : '제목 없음',
    header: () => <div className="text-center">제목</div>,
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
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
    accessorFn: (worksheet) =>
      'unit_name' in worksheet
        ? worksheet.unit_name
        : 'korean_type' in worksheet
        ? worksheet.korean_type
        : 'problem_type' in worksheet
        ? worksheet.problem_type
        : '-',
    header: () => <div className="text-center">문제 유형</div>,
    cell: ({ row }) => {
      const typeInfo = row.getValue('type_info') as string;
      return (
        <div className="text-center">
          <span className="text-sm text-gray-500">{typeInfo}</span>
        </div>
      );
    },
    size: 150,
    minSize: 150,
  },
  {
    id: 'created_at',
    accessorFn: (worksheet) => ('created_at' in worksheet ? worksheet.created_at : new Date()),
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
