'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { IoIosClose } from "react-icons/io";
import { koreanService, KoreanWorksheet } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { Worksheet as MathWorksheet } from '@/services/marketApi'; // Re-using Worksheet interface from marketApi for math
import { useAuth } from '@/contexts/AuthContext';
import { EnglishService } from '@/services/englishService';
import { EnglishWorksheetData } from '@/types/english';

// 타입 별칭
type EnglishWorksheet = EnglishWorksheetData;
interface AssignmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
  classId: string;
}

export function AssignmentCreateModal({
  isOpen,
  onClose,
  onAssignmentCreated,
  classId,
}: AssignmentCreateModalProps) {
  const { userProfile } = useAuth();
  const [activeSubject, setActiveSubject] = useState<'korean' | 'math' | 'english'>('korean');
  const [worksheets, setWorksheets] = useState<(KoreanWorksheet | MathWorksheet | EnglishWorksheet)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorksheetIds, setSelectedWorksheetIds] = useState<(string | number)[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const loadWorksheets = useCallback(async () => {
    if (!userProfile?.id) return;

    setIsLoading(true);
    try {
      let fetchedWorksheets: (KoreanWorksheet | MathWorksheet | EnglishWorksheet)[] = [];
      if (activeSubject === 'korean') {
        const response = await koreanService.getKoreanWorksheets();
        fetchedWorksheets = response.worksheets;
      } else if (activeSubject === 'math') {
        const response = await mathService.getMathWorksheets();
        fetchedWorksheets = response.worksheets;
      } else if (activeSubject === 'english') {
        const response = await EnglishService.getEnglishWorksheets();
        fetchedWorksheets = response as EnglishWorksheet[];
      }
      setWorksheets(fetchedWorksheets);
      setSelectedWorksheetIds([]); // Reset selections when worksheets are reloaded
      setSelectAll(false);
    } catch (error) {
      console.error('Failed to load worksheets for modal:', error);
      alert('워크시트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.id, activeSubject]);

  useEffect(() => {
    if (isOpen) {
      loadWorksheets();
    }
  }, [isOpen, loadWorksheets]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedWorksheetIds(worksheets.map(ws => activeSubject === 'english' ? (ws as EnglishWorksheet).worksheet_id : (ws as any).id));
    } else {
      setSelectedWorksheetIds([]);
    }
  };

  const handleSelectWorksheet = (worksheetId: string | number, checked: boolean) => {
    setSelectedWorksheetIds(prev =>
      checked ? [...prev, worksheetId] : prev.filter(id => id !== worksheetId)
    );
  };

  const handleCreateAssignments = async () => {
    if (selectedWorksheetIds.length === 0) {
      alert('과제로 생성할 워크시트를 선택해주세요.');
      return;
    }

    try {
      if (activeSubject === 'english') {
        // 영어의 경우 국어/수학과 동일하게 draft 상태로 생성만 함
        for (const worksheetId of selectedWorksheetIds) {
          await EnglishService.createAssignment(worksheetId as number, parseInt(classId));
        }
        alert(`${selectedWorksheetIds.length}개의 영어 과제가 성공적으로 생성되었습니다.`);
      } else {
        // 국어, 수학의 경우 직접 서비스 호출
        for (const worksheetId of selectedWorksheetIds) {
          if (activeSubject === 'korean') {
            await koreanService.createAssignment(worksheetId as number, parseInt(classId));
          } else if (activeSubject === 'math') {
            await mathService.createAssignment(worksheetId as number, parseInt(classId));
          }
        }
        alert(`${selectedWorksheetIds.length}개의 과제가 성공적으로 생성되었습니다.`);
      }
      onAssignmentCreated();
    } catch (error: any) {
      console.error('Failed to create assignments:', error);
      alert(`과제 생성에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
    }
  };

  const subjectTabs = [
    { id: 'korean' as const, label: '국어' },
    { id: 'math' as const, label: '수학' },
    { id: 'english' as const, label: '영어' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[60%] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              과제 생성
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-0 w-6 h-6 flex items-center justify-center"
            >
              <IoIosClose />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <p className="text-sm text-gray-600">
            생성된 워크시트 중에서 과제로 사용할 항목을 선택하세요.
          </p>

          {/* 과목별 탭 */}
          <div className="mb-4">
            <div className="flex gap-2">
              {subjectTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubject(tab.id)}
                  className={`py-2 px-4 text-sm font-medium rounded transition-colors duration-150 cursor-pointer ${
                    activeSubject === tab.id
                      ? 'bg-[#E6F3FF] text-[#0085FF]'
                      : 'bg-[#f5f5f5] text-[#999999]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">워크시트 목록을 불러오는 중...</div>
            </div>
          ) : worksheets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">생성된 워크시트가 없습니다.</div>
              <div className="text-sm text-gray-400">
                문제 생성 페이지에서 먼저 워크시트를 생성해주세요.
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 border rounded-lg">
              <div className="h-96 overflow-auto p-2.5">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>학교/학년</TableHead>
                      {activeSubject !== 'english' && (
                        <TableHead>단원</TableHead>
                      )}
                      {
                        activeSubject === 'english' && (
                          <TableHead>문제유형</TableHead>
                        )
                      }
                      <TableHead>문제수</TableHead>
                      <TableHead>생성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worksheets.map((worksheet, index) => {
                      const worksheetId = activeSubject === 'english' ? (worksheet as EnglishWorksheet).worksheet_id : (worksheet as any).id;
                      return (
                      <TableRow key={`${activeSubject}-${worksheetId}-${index}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedWorksheetIds.includes(worksheetId)}
                            onCheckedChange={(checked) =>
                              handleSelectWorksheet(worksheetId, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {activeSubject === 'english' ? (worksheet as EnglishWorksheet).worksheet_name || 'N/A' : (worksheet as any).title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-sm border-none px-3 py-1.5 min-w-[60px] text-center ${
                                (worksheet as any).school_level === '중학교' 
                                  ? 'bg-[#E6F3FF] text-[#0085FF]' 
                                  : 'bg-[#FFF5E9] text-[#FF9F2D]'
                              }`}
                            >
                              {(worksheet as any).school_level || '중학교'}
                            </Badge>
                            <Badge className="text-sm border-none px-3 py-1.5 min-w-[60px] text-center bg-[#f5f5f5] text-[#999999]">
                              {(worksheet as any).grade || 1}학년
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {activeSubject === 'english' ? (worksheet as EnglishWorksheet).problem_type || 'N/A' : (worksheet as any).unit_name || 'N/A'}
                            </div>
                            {
                              activeSubject !== 'english' && (
                                <div className="text-gray-500">{(worksheet as any).chapter_name || 'N/A'}</div>
                              )
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="text-sm border-none px-3 py-1.5 min-w-[60px] text-center bg-[#f5f5f5] text-[#999999]">
                            {activeSubject === 'english' ? (worksheet as EnglishWorksheet).total_questions : (worksheet as any).problem_count}문제
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date((worksheet as any).created_at).toLocaleDateString('ko-KR')}
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={handleCreateAssignments}
            disabled={selectedWorksheetIds.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            과제 생성 ({selectedWorksheetIds.length}개 선택됨)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}