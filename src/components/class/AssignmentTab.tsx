'use client';

import React, { useState, useEffect } from 'react';
import { MathService } from '@/services/mathService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Calendar, Users, BookOpen, Trash2 } from 'lucide-react';
import { StudentAssignmentModal } from './StudentAssignmentModal';

interface AssignmentTabProps {
  classId: string;
}

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

export function AssignmentTab({ classId }: AssignmentTabProps) {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorksheets, setSelectedWorksheets] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // 로컬 스토리지에서 과제 데이터 로드
  useEffect(() => {
    loadAssignmentsFromStorage();
    loadWorksheets();
  }, [classId]);

  // 로컬 스토리지에서 과제 데이터 로드
  const loadAssignmentsFromStorage = () => {
    try {
      const storedAssignments = localStorage.getItem(`assignments_${classId}`);
      if (storedAssignments) {
        setAssignments(JSON.parse(storedAssignments));
      }
    } catch (error) {
      console.error('과제 데이터 로드 실패:', error);
    }
  };

  // 과제 데이터를 로컬 스토리지에 저장
  const saveAssignmentsToStorage = (newAssignments: any[]) => {
    try {
      localStorage.setItem(`assignments_${classId}`, JSON.stringify(newAssignments));
    } catch (error) {
      console.error('과제 데이터 저장 실패:', error);
    }
  };

  const loadWorksheets = async () => {
    try {
      setIsLoading(true);
      const data = await MathService.getMathWorksheets();
      setWorksheets(data);
    } catch (error) {
      console.error('워크시트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedWorksheets(worksheets.map((w) => w.id));
    } else {
      setSelectedWorksheets([]);
    }
  };

  // 개별 선택/해제
  const handleSelectWorksheet = (worksheetId: number, checked: boolean) => {
    if (checked) {
      setSelectedWorksheets((prev) => [...prev, worksheetId]);
    } else {
      setSelectedWorksheets((prev) => prev.filter((id) => id !== worksheetId));
    }
  };

  // 과제 생성
  const handleCreateAssignments = () => {
    if (selectedWorksheets.length === 0) {
      alert('과제를 선택해주세요.');
      return;
    }

    const newAssignments = selectedWorksheets.map((worksheetId) => {
      const worksheet = worksheets.find((w) => w.id === worksheetId);
      return {
        id: Date.now() + Math.random(),
        worksheet_id: worksheetId,
        title: worksheet?.title || '',
        unit_name: worksheet?.unit_name || '',
        chapter_name: worksheet?.chapter_name || '',
        problem_count: worksheet?.problem_count || 0,
        created_at: new Date().toISOString(),
        students: [], // 학생 목록은 나중에 추가
      };
    });

    const updatedAssignments = [...assignments, ...newAssignments];
    setAssignments(updatedAssignments);
    saveAssignmentsToStorage(updatedAssignments);

    setIsModalOpen(false);
    setSelectedWorksheets([]);
    setSelectAll(false);
  };

  // 과제 삭제
  const handleDeleteAssignment = (assignmentId: number) => {
    if (confirm('정말로 이 과제를 삭제하시겠습니까?')) {
      const updatedAssignments = assignments.filter((a) => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      saveAssignmentsToStorage(updatedAssignments);
    }
  };

  // 학생 배정 모달 열기
  const handleOpenStudentModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setStudentModalOpen(true);
  };

  // 학생 배정 모달 닫기
  const handleCloseStudentModal = () => {
    setStudentModalOpen(false);
    setSelectedAssignment(null);
  };

  return (
    <div className="space-y-6" style={{ padding: '10px' }}>
      {/* 과제 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>
          과제 목록
        </h3>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          과제 생성
        </Button>
      </div>

      {/* 과제 목록 */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 과제가 없습니다</h3>
            <p className="text-gray-500 mb-4">과제를 생성하여 학생들에게 배포해보세요!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(assignment.created_at).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {assignment.students.length}명 배정
                      </div>
                      <Badge variant="outline">{assignment.problem_count}문제</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {assignment.unit_name} &gt; {assignment.chapter_name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStudentModal(assignment)}
                    >
                      학생 배정
                    </Button>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 과제 선택 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              과제 생성
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                        </TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>학교급/학년</TableHead>
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
                                handleSelectWorksheet(worksheet.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{worksheet.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {worksheet.school_level === 'middle' ? '중등' : '고등'}{' '}
                              {worksheet.grade}학년
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{worksheet.unit_name}</div>
                              <div className="text-gray-500">{worksheet.chapter_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{worksheet.problem_count}문제</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(worksheet.created_at).toLocaleDateString('ko-KR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateAssignments}
              disabled={selectedWorksheets.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              과제 생성 ({selectedWorksheets.length}개 선택됨)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 배정 모달 */}
      {selectedAssignment && (
        <StudentAssignmentModal
          isOpen={studentModalOpen}
          onClose={handleCloseStudentModal}
          assignmentId={selectedAssignment.id}
          worksheetId={selectedAssignment.worksheet_id}
          assignmentTitle={selectedAssignment.title}
          classId={classId}
        />
      )}
    </div>
  );
}
