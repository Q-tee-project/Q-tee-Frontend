'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataTable } from '../data-table';
import { columns } from '../columns';
import { Worksheet, Subject } from '@/types/math';
import { Trash2, RefreshCw } from 'lucide-react';

interface WorksheetListProps {
  worksheets: Worksheet[];
  selectedWorksheet: Worksheet | null;
  selectedSubject: string;
  isLoading: boolean;
  error: string | null;
  onWorksheetSelect: (worksheet: Worksheet) => void;
  onDeleteWorksheet: (worksheet: Worksheet, event: React.MouseEvent) => void;
  onRefresh: () => void;
}

export const WorksheetList: React.FC<WorksheetListProps> = ({
  worksheets,
  selectedWorksheet,
  selectedSubject,
  isLoading,
  error,
  onWorksheetSelect,
  onDeleteWorksheet,
  onRefresh,
}) => {
  return (
    <Card className="w-1/3 flex flex-col shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between py-6 px-6 border-b border-gray-100">
        <CardTitle className="text-lg font-medium">문제 목록</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="icon"
            className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF]"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => selectedWorksheet && onDeleteWorksheet(selectedWorksheet, e)}
            disabled={!selectedWorksheet}
            variant="ghost"
            size="icon"
            className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF]"
            title="선택된 워크시트 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea style={{height: 'calc(100vh - 350px)'}} className="w-full">
          <div className="p-4">
            {selectedSubject !== Subject.MATH ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                {selectedSubject} 과목은 준비 중입니다
              </div>
            ) : worksheets.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                저장된 워크시트가 없습니다 (로딩 상태: {isLoading ? '로딩 중' : '로딩 완료'},
                과목: {selectedSubject})
                {error && <div className="text-red-500 mt-2">오류: {error}</div>}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={worksheets}
                onRowClick={onWorksheetSelect}
                selectedRowId={selectedWorksheet?.id}
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};