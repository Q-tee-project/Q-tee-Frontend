'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/app/question/bank/data-table';
import { columns } from '@/app/question/bank/columns';
import { Worksheet, Subject } from '@/types/math';
import { KoreanWorksheet } from '@/types/korean';
import { EnglishWorksheetData } from '@/types/english';
import { BaseWorksheetDetail } from '@/types/common';
// 타입 별칭
type EnglishWorksheet = EnglishWorksheetData & BaseWorksheetDetail;
import { Trash2, RefreshCw } from 'lucide-react';

import { ColumnDef } from '@tanstack/react-table';

type AnyWorksheet = Worksheet | KoreanWorksheet | EnglishWorksheet;

interface WorksheetListProps {
  worksheets: AnyWorksheet[];
  selectedWorksheet: AnyWorksheet | null;
  selectedSubject: string;
  isLoading: boolean;
  error: string | null;
  onWorksheetSelect: (worksheet: AnyWorksheet) => void;
  onDeleteWorksheet: (worksheet: AnyWorksheet, event: React.MouseEvent) => void;
  onBatchDeleteWorksheets: (worksheets: AnyWorksheet[]) => void;
  onRefresh: () => void;
  onSubjectChange: (subject: string) => void;
}

export const WorksheetList: React.FC<WorksheetListProps> = ({
  worksheets,
  selectedWorksheet,
  selectedSubject,
  isLoading,
  error,
  onWorksheetSelect,
  onDeleteWorksheet,
  onBatchDeleteWorksheets,
  onRefresh,
  onSubjectChange,
}) => {
  const [selectedWorksheets, setSelectedWorksheets] = useState<AnyWorksheet[]>([]);
  const [clearSelection, setClearSelection] = useState(false);

  // 데이터가 없는 경우에만 카드 높이를 자동으로 조정
  const hasNoData = worksheets.length === 0;

  const handleRowSelectionChange = useCallback((selectedRows: AnyWorksheet[]) => {
    setSelectedWorksheets(selectedRows);
  }, []);

  // clearSelection이 true가 된 후 다시 false로 리셋
  React.useEffect(() => {
    if (clearSelection) {
      setClearSelection(false);
    }
  }, [clearSelection]);

  const handleBatchDelete = () => {
    if (selectedWorksheets.length === 0) {
      alert('삭제할 워크시트를 선택해주세요.');
      return;
    }

    const worksheetTitles = selectedWorksheets.map((w) => w.title).join(', ');
    if (
      confirm(
        `선택된 ${selectedWorksheets.length}개의 워크시트를 삭제하시겠습니까?\n\n${worksheetTitles}\n\n이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      onBatchDeleteWorksheets(selectedWorksheets);
      setSelectedWorksheets([]); // 선택 초기화
      setClearSelection(true); // 테이블 선택 상태 초기화 트리거
    }
  };

  return (
    <Card
      className={`w-1/3 flex flex-col shadow-sm ${hasNoData ? 'h-auto' : 'h-[calc(100vh-200px)]'}`}
      style={{ gap: '0', padding: '0' }}
    >
      <CardHeader
        className="flex flex-row items-center justify-between border-b border-gray-100"
        style={{ padding: '20px' }}
      >
        <CardTitle className="text-lg font-semibold text-gray-900">
          문제 목록
          {selectedWorksheets.length > 0 && (
            <span className="ml-2 text-sm text-[#0072CE]">
              ({selectedWorksheets.length}개 선택됨)
            </span>
          )}
        </CardTitle>
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
          {selectedWorksheets.length > 0 ? (
            <Button
              onClick={handleBatchDelete}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="선택된 워크시트들 일괄 삭제"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              일괄 삭제
            </Button>
          ) : (
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
          )}
        </div>
      </CardHeader>
      <CardContent
        className={`flex-1 min-h-0 ${hasNoData ? 'flex-none' : ''}`}
        style={{ padding: '20px' }}
      >
        {/* 과목 탭 */}
        <div className="mb-4">
          <div className="flex gap-2">
            {[Subject.KOREAN, Subject.ENGLISH, Subject.MATH].map((subject) => (
              <button
                key={subject}
                onClick={() => onSubjectChange(subject)}
                className={`py-2 px-4 text-sm font-medium rounded transition-colors duration-150 cursor-pointer ${
                  selectedSubject === subject
                    ? 'bg-[#E6F3FF] text-[#0085FF]'
                    : 'bg-[#f5f5f5] text-[#999999]'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {hasNoData ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">
              저장된 워크시트가 없습니다 (로딩 상태: {isLoading ? '로딩 중' : '로딩 완료'}, 과목:{' '}
              {selectedSubject}){error && <div className="text-red-500 mt-2">오류: {error}</div>}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2" style={{ height: 'calc(100vh - 400px)' }}>
            <DataTable
              columns={columns as ColumnDef<AnyWorksheet, unknown>[]}
              data={worksheets}
              onRowClick={onWorksheetSelect}
              selectedRowId={selectedWorksheet?.id}
              onRowSelectionChange={handleRowSelectionChange}
              clearSelection={clearSelection}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
