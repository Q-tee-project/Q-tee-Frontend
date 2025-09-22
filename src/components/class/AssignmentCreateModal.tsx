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
import { koreanService, KoreanWorksheet, AssignmentDeployRequest } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { Worksheet as MathWorksheet } from '@/services/marketApi'; // Re-using Worksheet interface from marketApi for math
import { useAuth } from '@/contexts/AuthContext';
import { classroomService } from '@/services/authService'; // Import classroomService

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
  const [activeSubject, setActiveSubject] = useState<'korean' | 'math'>('korean');
  const [worksheets, setWorksheets] = useState<(KoreanWorksheet | MathWorksheet)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorksheetIds, setSelectedWorksheetIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const loadWorksheets = useCallback(async () => {
    if (!userProfile?.id) return;

    setIsLoading(true);
    try {
      let fetchedWorksheets: (KoreanWorksheet | MathWorksheet)[] = [];
      if (activeSubject === 'korean') {
        const response = await koreanService.getKoreanWorksheets();
        fetchedWorksheets = response.worksheets;
      } else if (activeSubject === 'math') {
        const response = await mathService.getMathWorksheets();
        fetchedWorksheets = response.worksheets;
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
      setSelectedWorksheetIds(worksheets.map(ws => ws.id));
    } else {
      setSelectedWorksheetIds([]);
    }
  };

  const handleSelectWorksheet = (worksheetId: number, checked: boolean) => {
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
      // Fetch student IDs for the class
      const students = await classroomService.getClassroomStudents(parseInt(classId));
      const studentIds = students.map(student => student.id);

      if (studentIds.length === 0) {
        alert('클래스에 등록된 학생이 없습니다. 먼저 학생을 등록해주세요.');
        return;
      }

      for (const worksheetId of selectedWorksheetIds) {
        const deployRequest: AssignmentDeployRequest = {
          assignment_id: worksheetId, // This is actually worksheet_id in the backend deploy endpoint
          classroom_id: parseInt(classId),
          student_ids: studentIds, // Pass actual student IDs here
        };

        if (activeSubject === 'korean') {
          await koreanService.deployAssignment(deployRequest);
        } else if (activeSubject === 'math') {
          await mathService.deployAssignment(deployRequest);
        }
      }
      alert(`${selectedWorksheetIds.length}개의 과제가 성공적으로 생성되었습니다.`);
      onAssignmentCreated();
    } catch (error) {
      console.error('Failed to create assignments:', error);
      alert(`과제 생성에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
    }
  };

  const subjectTabs = [
    { id: 'korean' as const, label: '국어' },
    { id: 'math' as const, label: '수학' },
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
              className="text-gray-400 hover:text-gray-600"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          <div className="border-b border-gray-200">
            <div className="flex">
              {subjectTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubject(tab.id)}
                  className={`border-b-2 font-medium text-sm ${
                    activeSubject === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ padding: '10px 20px' }}
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
                      <TableHead>단원</TableHead>
                      <TableHead>문제수</TableHead>
                      <TableHead>생성일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worksheets.map((worksheet) => (
                      <TableRow key={worksheet.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedWorksheetIds.includes(worksheet.id)}
                            onCheckedChange={(checked) =>
                              handleSelectWorksheet(worksheet.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{worksheet.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className="text-sm"
                              style={{
                                backgroundColor: worksheet.school_level === '중학교' ? '#E6F3FF' : '#FFF5E9',
                                border: 'none',
                                color: worksheet.school_level === '중학교' ? '#0085FF' : '#FF9F2D',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                              }}
                            >
                              {worksheet.school_level}
                            </Badge>
                            <Badge
                              className="text-sm"
                              style={{
                                backgroundColor: '#f5f5f5',
                                border: 'none',
                                color: '#999999',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                              }}
                            >
                              {worksheet.grade}학년
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{worksheet.unit_name || 'N/A'}</div>
                            <div className="text-gray-500">{worksheet.chapter_name || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-sm"
                            style={{
                              backgroundColor: '#f5f5f5',
                              border: 'none',
                              color: '#999999',
                              padding: '6px 12px',
                              minWidth: '60px',
                              textAlign: 'center',
                            }}
                          >
                            {worksheet.problem_count}문제
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(worksheet.created_at).toLocaleDateString('ko-KR')}
                        </TableCell>
                      </TableRow>
                    ))}
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
