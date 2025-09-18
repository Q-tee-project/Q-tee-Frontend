'use client';

import React from 'react';
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

interface Worksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  semester: number;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  created_at: string;
}

interface AssignmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheets: Worksheet[];
  isLoading: boolean;
  selectedWorksheets: number[];
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectWorksheet: (worksheetId: number, checked: boolean) => void;
  onCreateAssignments: () => void;
}

export function AssignmentCreateModal({
  isOpen,
  onClose,
  worksheets,
  isLoading,
  selectedWorksheets,
  selectAll,
  onSelectAll,
  onSelectWorksheet,
  onCreateAssignments,
}: AssignmentCreateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[60%] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            과제 생성
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <p className="text-sm text-gray-600">
            생성된 워크시트 중에서 과제로 사용할 항목을 선택하세요.
          </p>

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
                        <Checkbox checked={selectAll} onCheckedChange={onSelectAll} />
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
                            checked={selectedWorksheets.includes(worksheet.id)}
                            onCheckedChange={(checked) =>
                              onSelectWorksheet(worksheet.id, checked as boolean)
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
                            <div className="font-medium">{worksheet.unit_name}</div>
                            <div className="text-gray-500">{worksheet.chapter_name}</div>
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
            onClick={onCreateAssignments}
            disabled={selectedWorksheets.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            과제 생성 ({selectedWorksheets.length}개 선택됨)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
