'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  problem_count: number;
  status: string;
  score?: number;
  deployed_at?: string;
}

interface GradedAssignmentsListProps {
  gradedAssignments: Assignment[];
  isLoadingAssignments: boolean;
  onAssignmentClick: (assignment: Assignment) => void;
}

const GradedAssignmentsList: React.FC<GradedAssignmentsListProps> = ({
  gradedAssignments,
  isLoadingAssignments,
  onAssignmentClick,
}) => {
  return (
    <Card className="shadow-sm h-full flex flex-col px-6 py-5">
      <CardHeader className="px-0 py-3">
        <h3 className="text-xl font-bold text-gray-900">과제 채점 완료</h3>
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
          ) : gradedAssignments.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">채점 완료된 과제가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {gradedAssignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onAssignmentClick(assignment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {assignment.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                          {assignment.subject}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {assignment.problem_count}문제
                        </span>
                        {assignment.score && (
                          <span className="text-xs font-medium text-green-600">
                            {assignment.score}점
                          </span>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
              {gradedAssignments.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{gradedAssignments.length - 3}개 더
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradedAssignmentsList;
