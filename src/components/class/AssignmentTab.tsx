'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { koreanService, Assignment, KoreanWorksheet, AssignmentDeployRequest } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
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
  const [modalWorksheets, setModalWorksheets] = useState<Worksheet[]>([]);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [selectedWorksheetIds, setSelectedWorksheetIds] = useState<number[]>([]);
  const [selectAllWorksheets, setSelectAllWorksheets] = useState(false);

  // Load assignments for the main list
  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      let data: Assignment[] = [];
      if (activeSubject === 'korean') {
        data = await koreanService.getDeployedAssignments(classId.toString()); // Convert to string for API call if needed
      } else if (activeSubject === 'math') {
        data = await mathService.getDeployedAssignments(classId.toString()); // Convert to string for API call if needed
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
      if (activeSubject === 'korean') {
        const response = await koreanService.getKoreanWorksheets();
        fetchedWorksheets = response.worksheets;
      } else if (activeSubject === 'math') {
        // Assuming mathService has a similar getMathWorksheets method
        const response = await mathService.getMathWorksheets();
        fetchedWorksheets = response.worksheets;
      }
      setModalWorksheets(fetchedWorksheets);
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
      setSelectedWorksheetIds(modalWorksheets.map(ws => ws.id));
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
      // For simplicity, assuming all students in the class will get the assignment
      // In a real app, you might fetch student IDs from the classroom service
      const studentIds: number[] = []; // TODO: Replace with actual student IDs from the class

      for (const worksheetId of selectedWorksheetIds) {
        const deployRequest: AssignmentDeployRequest = {
          assignment_id: worksheetId, // This is actually worksheet_id in the backend deploy endpoint
          classroom_id: classId, // classId is already a number
          student_ids: studentIds, // Pass actual student IDs here
        };

        if (activeSubject === 'korean') {
          await koreanService.deployAssignment(deployRequest);
        } else if (activeSubject === 'math') {
          await mathService.deployAssignment(deployRequest);
        }
      }
      alert(`${selectedWorksheetIds.length}개의 과제가 성공적으로 생성되었습니다.`);
      handleAssignmentCreated();
    } catch (error) {
      console.error('Failed to create assignments:', error);
      alert('과제 생성에 실패했습니다.');
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
