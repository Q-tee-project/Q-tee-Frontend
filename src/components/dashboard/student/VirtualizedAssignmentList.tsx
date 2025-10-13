'use client';

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClipboardList, FileText } from 'lucide-react';
import { RxExternalLink } from "react-icons/rx";
import { FaCircleExclamation, FaCircleCheck } from "react-icons/fa6";

// 과제 타입 정의
interface Assignment {
  id: string;
  title: string;
  subject: '국어' | '영어' | '수학';
  problem_count?: number;
  status: 'completed' | 'pending';
  deployed_at?: string;
  raw_id: number;
  raw_subject: 'korean' | 'english' | 'math';
  dueDate: string;
  myScore?: number;
  averageScore?: number;
}

interface VirtualizedAssignmentListProps {
  assignments: Assignment[];
  isLoadingAssignments: boolean;
  onAssignmentClick: (assignment: Assignment) => void;
  type: 'pending' | 'graded';
  emptyMessage: string;
  emptyIcon: React.ComponentType<{ className?: string }>;
}

// 개별 과제 아이템 컴포넌트 (메모이제이션)
const AssignmentItem = React.memo(function AssignmentItem({
  assignment,
  onAssignmentClick,
  type,
}: {
  assignment: Assignment;
  onAssignmentClick: (assignment: Assignment) => void;
  type: 'pending' | 'graded';
}) {
  const handleClick = useCallback(() => {
    onAssignmentClick(assignment);
  }, [assignment, onAssignmentClick]);

  const IconComponent = type === 'pending' ? FaCircleExclamation : FaCircleCheck;
  const iconColor = type === 'pending' ? 'text-red-500' : 'text-green-500';
  const hoverClass = type === 'pending' 
    ? 'hover:bg-red-50 hover:border-red-200' 
    : 'hover:bg-green-50 hover:border-green-200';

  return (
    <div
      onClick={handleClick}
      className={`p-3 bg-white rounded-lg border border-gray-200 ${hoverClass} cursor-pointer transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <IconComponent className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {assignment.title}
          </h4>
        </div>
        <RxExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
});

const VirtualizedAssignmentList: React.FC<VirtualizedAssignmentListProps> = React.memo(function VirtualizedAssignmentList({
  assignments,
  isLoadingAssignments,
  onAssignmentClick,
  type,
  emptyMessage,
  emptyIcon: EmptyIcon,
}) {
  return (
    <Card className="shadow-sm h-full flex flex-col px-6 py-5 gap-0">
      <CardHeader className="px-0 py-3">
        <h3 className="text-xl font-bold text-gray-900">
          {type === 'pending' ? '과제 미제출' : '과제 채점 완료'}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        <div className="h-full bg-white overflow-y-auto max-h-80">
          {isLoadingAssignments ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs">로딩 중...</p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <EmptyIcon className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">{emptyMessage}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <AssignmentItem
                  key={assignment.id}
                  assignment={assignment}
                  onAssignmentClick={onAssignmentClick}
                  type={type}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default VirtualizedAssignmentList;
