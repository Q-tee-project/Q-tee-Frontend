'use client';

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { RxExternalLink } from "react-icons/rx";
import { FaCircleCheck } from "react-icons/fa6";

// 채점 완료된 과제 목록 컴포넌트
interface Assignment {
  id: string;
  title: string;
  subject: '국어' | '영어' | '수학';
  problem_count?: number;
  status: 'completed' | 'pending';
  score?: number;
  deployed_at?: string;
  raw_id: number;
  raw_subject: 'korean' | 'english' | 'math';
  dueDate: string;
  myScore?: number;
  averageScore?: number;
}

interface GradedAssignmentsListProps {
  gradedAssignments: Assignment[];
  isLoadingAssignments: boolean;
  onAssignmentClick: (assignment: Assignment) => void;
}


const GradedAssignmentItem = React.memo(function GradedAssignmentItem({
  assignment,
  onAssignmentClick,
}: {
  assignment: Assignment;
  onAssignmentClick: (assignment: Assignment) => void;
}) {
  const handleClick = useCallback(() => {
    onAssignmentClick(assignment);
  }, [assignment, onAssignmentClick]);

  return (
    <div
      onClick={handleClick}
      className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 cursor-pointer transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FaCircleCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {assignment.title}
          </h4>
        </div>
        <RxExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
});

const GradedAssignmentsList: React.FC<GradedAssignmentsListProps> = React.memo(function GradedAssignmentsList({
  gradedAssignments,
  isLoadingAssignments,
  onAssignmentClick,
}) {
  return (
    <Card className="shadow-sm h-full flex flex-col px-6 py-5 gap-0">
      <CardHeader className="px-0 py-3">
        <h3 className="text-xl font-bold text-gray-900">과제 채점 완료</h3>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        <div className="h-full bg-white overflow-y-auto">
          {isLoadingAssignments ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs">로딩 중...</p>
              </div>
            </div>
          ) : gradedAssignments.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">채점 완료된 과제가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {gradedAssignments.map((assignment) => (
                <GradedAssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onAssignmentClick={onAssignmentClick}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default GradedAssignmentsList;