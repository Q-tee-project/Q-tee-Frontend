'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { classroomService, StudentProfile } from '@/services/authService';

interface StudentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  worksheetId: number;
  assignmentTitle: string;
  classId: string;
  subject: 'korean' | 'english' | 'math';
  onAssignmentComplete?: (assignmentId: number, assignedStudents: StudentProfile[]) => void;
}

export function StudentAssignmentModal({
  isOpen,
  onClose,
  assignmentId,
  worksheetId,
  assignmentTitle,
  classId,
  subject,
  onAssignmentComplete,
}: StudentAssignmentModalProps) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // 학생 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen, classId]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const studentList = await classroomService.getClassroomStudents(parseInt(classId));
      setStudents(studentList);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student.id));
    }
  };

  // 개별 학생 선택/해제
  const handleSelectStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    } else {
      setSelectedStudents((prev) => [...prev, studentId]);
    }
  };

  // 과제 배포
  const handleDeployAssignment = async () => {
    if (selectedStudents.length === 0) {
      alert('배포할 학생을 선택해주세요.');
      return;
    }

    try {
      setIsDeploying(true);

      // Authorization 헤더 추가
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      // 요청 데이터 준비 (subject 포함)
      const requestData = {
        subject: subject,
        assignment_id: worksheetId, // worksheet_id를 assignment_id로 사용
        student_ids: selectedStudents,
        classroom_id: parseInt(classId),
      };

      console.log('🚀 Assignment Deploy Request:', {
        subject,
        data: requestData
      });

      // Next.js API Route 프록시를 통해 과제 배포 (상대 경로 사용)
      const response = await fetch('/api/assignments/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API 요청 실패: ${response.status}`;

        // 워크시트 관련 에러 처리
        if (errorText.includes('Worksheet not found')) {
          errorMessage = '선택한 워크시트를 찾을 수 없습니다. 먼저 해당 과목의 워크시트를 생성해주세요.';
        } else {
          errorMessage += ` - ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      // 배포된 학생 정보 가져오기
      const assignedStudents = students.filter(student => 
        selectedStudents.includes(student.id)
      );
      
      // 콜백 함수 호출
      if (onAssignmentComplete) {
        onAssignmentComplete(assignmentId, assignedStudents);
      }
      
      alert(`${selectedStudents.length}명의 학생에게 과제가 배포되었습니다.`);
      onClose();
      setSelectedStudents([]);
    } catch (error) {
      console.error('과제 배포 실패:', error);
      alert('과제 배포에 실패했습니다.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>학생 배정 - {assignmentTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 전체 선택 */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="select-all"
              checked={selectedStudents.length === students.length && students.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              전체 선택 ({selectedStudents.length}/{students.length})
            </label>
          </div>

          {/* 학생 목록 */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">학생 목록을 불러오는 중...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">등록된 학생이 없습니다.</div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => handleSelectStudent(student.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {student.school_level === 'middle' ? '중학교' : '고등학교'} {student.grade}
                        학년
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.email} • {student.phone}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleDeployAssignment}
            disabled={selectedStudents.length === 0 || isDeploying}
          >
            {isDeploying ? '배포 중...' : `${selectedStudents.length}명에게 배포`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
