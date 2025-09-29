'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ClipboardList, Clock } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  problem_count: number;
  status: string;
  deployed_at?: string;
}

interface PendingAssignmentsListProps {
  unsubmittedAssignments: Assignment[];
  isLoadingAssignments: boolean;
  onAssignmentClick: (assignment: Assignment) => void;
}

const PendingAssignmentsList: React.FC<PendingAssignmentsListProps> = ({
  unsubmittedAssignments,
  isLoadingAssignments,
  onAssignmentClick,
}) => {
  return (
    <Card className="shadow-sm h-full flex flex-col px-6 py-5">
      <CardHeader className="px-0 py-3">
        <h3 className="text-xl font-bold text-gray-900">과제 미제출</h3>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-y-auto">
          {isLoadingAssignments ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs">로딩 중...</p>
              </div>
            </div>
          ) : unsubmittedAssignments.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <ClipboardList className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">미제출 과제가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-5">
              {unsubmittedAssignments.map((assignment, index) => (
                <div
                  key={index}
                  onClick={() => onAssignmentClick(assignment)}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {assignment.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {assignment.subject || '과목 미지정'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {assignment.problem_count || 0}문제
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-orange-500 font-medium">미응시</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingAssignmentsList;
