'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { koreanService, Assignment } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, BookOpen } from 'lucide-react';
import { IoSearch } from "react-icons/io5";
import { AssignmentList } from './AssignmentList';
import { AssignmentCreateModal } from './AssignmentCreateModal';
import { AssignmentResultView } from './AssignmentResultView';
import { StudentAssignmentModal } from './StudentAssignmentModal';

interface AssignmentTabProps {
  classId: number;
}

export function AssignmentTab({ classId }: AssignmentTabProps) {
  const [activeSubject, setActiveSubject] = useState<'korean' | 'english' | 'math'>('korean');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignmentForDeploy, setSelectedAssignmentForDeploy] = useState<Assignment | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: Assignment[] = [];

      if (activeSubject === 'korean') {
        data = await koreanService.getDeployedAssignments(classId.toString());
      } else if (activeSubject === 'math') {
        data = await mathService.getDeployedAssignments(classId.toString());
      } else if (activeSubject === 'english') {
        data = await EnglishService.getDeployedAssignments(classId.toString());
      }

      setAssignments(data);
    } catch (error) {
      console.error('Assignments load failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [classId, activeSubject]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    const filtered = searchTerm.trim()
      ? assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : assignments;
    setFilteredAssignments(filtered);
  }, [assignments, searchTerm]);

  const handleDeployAssignment = (assignment: Assignment) => {
    setSelectedAssignmentForDeploy(assignment);
    setIsDeployModalOpen(true);
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    if (!confirm(`"${assignment.title}" 과제를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      if (activeSubject === 'korean') {
        await koreanService.deleteAssignment(assignment.id);
      } else if (activeSubject === 'math') {
        await mathService.deleteAssignment(assignment.id);
      } else if (activeSubject === 'english') {
        await EnglishService.deleteAssignment(assignment.id);
      }

      alert('과제가 삭제되었습니다.');
      loadAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('과제 삭제에 실패했습니다.');
    }
  };

  const subjectTabs = [
    { id: 'korean' as const, label: '국어' },
    { id: 'english' as const, label: '영어' },
    { id: 'math' as const, label: '수학' },
  ];

  if (selectedAssignment) {
    return (
      <AssignmentResultView
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 과목별 탭 */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {subjectTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubject(tab.id)}
              className={`px-5 py-2.5 border-b-2 font-medium text-sm ${
                activeSubject === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {activeSubject === tab.id && assignments.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {assignments.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {subjectTabs.find(tab => tab.id === activeSubject)?.label} 과제 목록 ({filteredAssignments.length})
        </h3>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
          <Plus className="w-4 h-4 mr-2" /> 과제 생성
        </Button>
      </div>

      {/* 검색창 */}
      <div className="max-w-sm relative">
        <Input
          placeholder="과제명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        <IoSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {/* 과제 목록 */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">과제를 불러오는 중...</div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  '{searchTerm}'에 해당하는 과제를 찾을 수 없습니다
                </h3>
                <p className="text-gray-500">다른 검색어를 시도해보세요.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">배포된 과제가 없습니다</h3>
                <p className="text-gray-500">문제은행에서 과제를 생성하고 배포해보세요!</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <AssignmentList
          assignments={filteredAssignments}
          onSelectAssignment={setSelectedAssignment}
          onDeployAssignment={handleDeployAssignment}
          onDeleteAssignment={handleDeleteAssignment}
          classId={classId.toString()}
          onRefresh={loadAssignments}
          subject={activeSubject}
        />
      )}

      {/* 과제 생성 모달 */}
      <AssignmentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAssignmentCreated={() => {
          setIsCreateModalOpen(false);
          loadAssignments();
        }}
        classId={classId.toString()}
      />

      {/* 학생 배정 모달 */}
      {selectedAssignmentForDeploy && (
        <StudentAssignmentModal
          isOpen={isDeployModalOpen}
          onClose={() => {
            setIsDeployModalOpen(false);
            setSelectedAssignmentForDeploy(null);
          }}
          assignmentId={selectedAssignmentForDeploy.id}
          worksheetId={selectedAssignmentForDeploy.worksheet_id}
          assignmentTitle={selectedAssignmentForDeploy.title}
          classId={classId.toString()}
          subject={activeSubject}
          onAssignmentComplete={() => {
            setIsDeployModalOpen(false);
            setSelectedAssignmentForDeploy(null);
            loadAssignments();
          }}
        />
      )}
    </div>
  );
}
