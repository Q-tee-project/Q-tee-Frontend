'use client';

import React, { useState, useEffect } from 'react';
import { MathService } from '@/services/mathService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen } from 'lucide-react';
import { IoSearch } from "react-icons/io5";
import { StudentAssignmentModal } from './StudentAssignmentModal';
import { AssignmentList } from './AssignmentList';
import { AssignmentCreateModal } from './AssignmentCreateModal';
import { StudentProfile } from '@/services/authService';

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

interface AssignmentStudent {
  id: number;
  name: string;
  school_level: 'middle' | 'high';
  grade: number;
  status: 'completed' | 'incomplete';
  score?: number;
  time_taken?: number;
  completed_at?: string;
}

export function AssignmentTab({ classId }: AssignmentTabProps) {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [assignments, setAssignments] = useState<Array<{
    id: number;
    worksheet_id: number;
    title: string;
    unit_name: string;
    chapter_name: string;
    problem_count: number;
    created_at: string;
    students: AssignmentStudent[];
  }>>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Array<{
    id: number;
    worksheet_id: number;
    title: string;
    unit_name: string;
    chapter_name: string;
    problem_count: number;
    created_at: string;
    students: AssignmentStudent[];
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // 검색어에 따른 과제 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssignments(filtered);
    }
  }, [assignments, searchTerm]);

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

  // 학생 배정 완료 후 콜백
  const handleStudentAssignmentComplete = (assignmentId: number, assignedStudents: StudentProfile[]) => {
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        // 기존 학생 목록에서 ID 추출
        const existingStudentIds = assignment.students.map(student => student.id);
        
        // 새로 배정된 학생들 중에서 기존에 없는 학생들만 필터링
        const newStudentsToAdd = assignedStudents.filter(student => 
          !existingStudentIds.includes(student.id)
        );
        
        // 새로운 학생들을 AssignmentStudent 형태로 변환
        const newStudents: AssignmentStudent[] = newStudentsToAdd.map(student => ({
          id: student.id,
          name: student.name,
          school_level: student.school_level,
          grade: student.grade,
          status: 'incomplete' as const, // 초기 상태는 미완료
        }));
        
        // 기존 학생들과 새로운 학생들을 합치기
        return {
          ...assignment,
          students: [...assignment.students, ...newStudents]
        };
      }
      return assignment;
    });
    setAssignments(updatedAssignments);
    saveAssignmentsToStorage(updatedAssignments);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* 과제 목록 헤더 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          과제 목록 ({filteredAssignments.length})
        </h3>
      </div>

      {/* 검색창과 과제 생성 버튼 */}
      <div className="flex justify-between items-center">
        <div className="max-w-sm relative">
          <Input
            placeholder="과제명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10"
          />
          <IoSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              검색 초기화
            </button>
          )}
          <Button
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: '#0072CE' }}
            className="hover:opacity-90 ml-4"
          >
            과제 생성
          </Button>
        </div>
      </div>

      {/* 과제 목록 */}
      {filteredAssignments.length === 0 ? (
        <div style={{ padding: '0 20px' }}>
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">'{searchTerm}'에 해당하는 과제를 찾을 수 없습니다</h3>
                  <p className="text-gray-500 mb-4">다른 검색어를 시도해보세요.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 과제가 없습니다</h3>
                  <p className="text-gray-500 mb-4">과제를 생성하여 학생들에게 배포해보세요!</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <AssignmentList
          assignments={filteredAssignments}
          onOpenStudentModal={handleOpenStudentModal}
          onDeleteAssignment={handleDeleteAssignment}
          onStudentAssignmentComplete={handleStudentAssignmentComplete}
        />
      )}

      {/* 과제 선택 모달 */}
      <AssignmentCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        worksheets={worksheets}
        isLoading={isLoading}
        selectedWorksheets={selectedWorksheets}
        selectAll={selectAll}
        onSelectAll={handleSelectAll}
        onSelectWorksheet={handleSelectWorksheet}
        onCreateAssignments={handleCreateAssignments}
      />

      {/* 학생 배정 모달 */}
      {selectedAssignment && (
        <StudentAssignmentModal
          isOpen={studentModalOpen}
          onClose={handleCloseStudentModal}
          assignmentId={selectedAssignment.id}
          worksheetId={selectedAssignment.worksheet_id}
          assignmentTitle={selectedAssignment.title}
          classId={classId}
          onAssignmentComplete={handleStudentAssignmentComplete}
        />
      )}
    </div>
  );
}
