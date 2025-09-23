'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { koreanService, Assignment, KoreanWorksheet, AssignmentDeployRequest } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishAssignmentDeployRequest, EnglishService } from '@/services/englishService';
import { classroomService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, BookOpen } from 'lucide-react';
import { IoSearch } from "react-icons/io5";
import { AssignmentList } from './AssignmentList';
import { AssignmentCreateModal } from './AssignmentCreateModal';
import { AssignmentResultView } from './AssignmentResultView';
import { StudentAssignmentModal } from './StudentAssignmentModal';
import { Worksheet } from '@/services/koreanService'; // Re-using Worksheet interface from koreanService
import { EnglishWorksheetData } from '@/types/english';

interface AssignmentTabProps {
  classId: number; // Changed to number
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

  // State for AssignmentCreateModal
  const [modalWorksheets, setModalWorksheets] = useState<Worksheet[] | EnglishWorksheetData[]>([]);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [selectedWorksheetIds, setSelectedWorksheetIds] = useState<(string | number)[]>([]);
  const [selectAllWorksheets, setSelectAllWorksheets] = useState(false);

  // Load assignments for the main list
  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: Assignment[] = [];
      if (activeSubject === 'korean') {
        data = await koreanService.getDeployedAssignments(classId.toString());
      } else if (activeSubject === 'math') {
        data = await mathService.getDeployedAssignments(classId.toString()); // Convert to string for API call if needed
        // Assuming mathService has a similar getDeployedAssignments method
        // data = await mathService.getDeployedAssignments(classId.toString());
        console.warn("MathService.getDeployedAssignments is not yet implemented.");
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

  // Load worksheets for the creation modal
  const loadWorksheetsForModal = useCallback(async () => {
    setModalIsLoading(true);
    try {
      let fetchedWorksheets: Worksheet[] = [];
      let fetchedEnglishWorksheets: EnglishWorksheetData[] = [];
      if (activeSubject === 'korean') {
        const response = await koreanService.getKoreanWorksheets();
        fetchedWorksheets = response.worksheets;
      } else if (activeSubject === 'math') {
        // Assuming mathService has a similar getMathWorksheets method
        const response = await mathService.getMathWorksheets();
        fetchedWorksheets = response.worksheets;
      } else if (activeSubject === 'english') {
        console.log('📚 영어 워크시트 목록 로딩 시작...');
        const response = await EnglishService.getEnglishWorksheets();
        console.log('📚 영어 워크시트 API 응답:', response);
        console.log('📚 영어 워크시트 개수:', response?.length);
        fetchedEnglishWorksheets = response as EnglishWorksheetData[];
      }
      setModalWorksheets(fetchedEnglishWorksheets);
      setSelectedWorksheetIds([]); // Reset selections when worksheets are reloaded
      setSelectAllWorksheets(false);
    } catch (error) {
      console.error('Failed to load worksheets for modal:', error);
      alert('워크시트 목록을 불러오는데 실패했습니다.');
    }
  }, [activeSubject]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    if (isCreateModalOpen) {
      loadWorksheetsForModal();
    }
  }, [isCreateModalOpen, loadWorksheetsForModal]);

  useEffect(() => {
    let filtered = assignments;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAssignments(filtered);
  }, [assignments, searchTerm]);

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleBackToAssignmentList = () => {
    setSelectedAssignment(null);
  };

  const handleDeployAssignment = (assignment: Assignment) => {
    setSelectedAssignmentForDeploy(assignment);
    setIsDeployModalOpen(true);
  };

  const handleAssignmentCreated = () => {
    setIsCreateModalOpen(false);
    loadAssignments(); // Refresh the list of assignments
  };

  const handleSelectAllWorksheets = (checked: boolean) => {
    setSelectAllWorksheets(checked);
    if (checked) {
      setSelectedWorksheetIds(modalWorksheets.map(ws => activeSubject === 'english' ? (ws as EnglishWorksheetData).worksheet_id : (ws as any).id));
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
      // 클래스의 학생 목록 조회
      const students = await classroomService.getClassroomStudents(classId);
      const studentIds = students.map(student => student.id);

      if (studentIds.length === 0) {
        alert('클래스에 등록된 학생이 없습니다. 먼저 학생을 등록해주세요.');
        return;
      } 

      for (const worksheetId of selectedWorksheetIds) {
        if (activeSubject === 'korean') {
          const deployRequest: AssignmentDeployRequest = {
            assignment_id: worksheetId as number,
            classroom_id: classId,
            student_ids: studentIds,
          };
          await koreanService.deployAssignment(deployRequest);
        } else if (activeSubject === 'math') {
          const deployRequest: AssignmentDeployRequest = {
            assignment_id: worksheetId as number,
            classroom_id: classId,
            student_ids: studentIds,
          };
          await mathService.deployAssignment(deployRequest);
          console.warn("MathService.deployAssignment is not yet implemented.");
        } else if (activeSubject === 'english') {
          const englishDeployRequest: EnglishAssignmentDeployRequest = {
            assignment_id: worksheetId as number,
            classroom_id: classId,
            student_ids: studentIds,
          };
          await EnglishService.deployAssignment(englishDeployRequest);
        }
      }
      alert(`${selectedWorksheetIds.length}개의 과제가 성공적으로 생성되었습니다.`);
      handleAssignmentCreated();
      handleAssignmentCreated();
    } catch (error) {
      console.error('Failed to create assignments:', error);
      alert(`과제 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const subjectTabs = [
    { id: 'korean' as const, label: '국어', count: activeSubject === 'korean' ? assignments.length : 0 },
    { id: 'english' as const, label: '영어', count: activeSubject === 'english' ? assignments.length : 0 },
    { id: 'math' as const, label: '수학', count: activeSubject === 'math' ? assignments.length : 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {selectedAssignment ? (
        <AssignmentResultView assignment={selectedAssignment} onBack={handleBackToAssignmentList} />
      ) : (
        <>
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
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 과제 목록 헤더 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {subjectTabs.find(tab => tab.id === activeSubject)?.label} 과제 목록 ({filteredAssignments.length})
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
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> 과제 생성
            </Button>
          </div>

          {/* 과제 목록 */}
          {isLoading ? (
            <p>Loading assignments...</p>
          ) : filteredAssignments.length === 0 ? (
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">배포된 과제가 없습니다</h3>
                      <p className="text-gray-500 mb-4">문제은행에서 과제를 생성하고 배포해보세요!</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <AssignmentList
              assignments={filteredAssignments}
              onSelectAssignment={handleSelectAssignment}
              onDeployAssignment={handleDeployAssignment}
              classId={classId.toString()}
              onRefresh={loadAssignments}
              subject={activeSubject}
            />
          )}
        </>
      )}
      <AssignmentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAssignmentCreated={handleAssignmentCreated}
        classId={classId.toString()}
      />

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
            loadAssignments(); // Refresh assignments list
          }}
        />
      )}
    </div>
  );
}
