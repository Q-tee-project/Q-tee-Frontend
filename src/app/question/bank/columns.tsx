"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Worksheet } from "@/types/math"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<Worksheet>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
    accessorKey: "school_level",
    header: "학생 유형",
    cell: ({ row }) => {
      const worksheet = row.original
      return (
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
      )
    },
  },
  {
    accessorKey: "title",
    header: "제목",
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "unit_name",
    header: "문제 유형",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {row.getValue("unit_name")}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "생성일",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <span className="text-sm text-gray-500">
          {date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).replace(/\./g, '.').replace(/\.$/, '')}
        </span>
      )
    },
  },
]