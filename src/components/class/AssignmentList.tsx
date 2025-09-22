'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar, Users } from 'lucide-react';
import { IoBookOutline } from "react-icons/io5";

interface AssignmentListProps {
  assignments: any[];
  onSelectAssignment: (assignment: any) => void;
  onDeployAssignment?: (assignment: any) => void;
}

export function AssignmentList({ assignments, onSelectAssignment, onDeployAssignment }: AssignmentListProps) {
  if (assignments.length === 0) {
    return null; // Let the parent component handle the empty state
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {assignments.map((assignment) => (
        <AccordionItem key={assignment.id} value={`assignment-${assignment.id}`} className="border-b-0">
          <div className="border rounded-lg mb-2">
            <div className="p-4 w-full text-left items-center">
              <div className="flex-1"
                   style={{display: 'flex',
                           flexDirection: 'column',
                           justifyContent: 'flex-start',
                           gap: '5px'}}
              >
                {/* First row: creation date, number of students, scope */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(assignment.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <IoBookOutline className="w-4 h-4" />
                    <div>{assignment.unit_name} &gt; {assignment.chapter_name}</div>
                  </div>
                </div>

                {/* Second row: assignment title, problem count */}
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                  <Badge variant="outline">{assignment.problem_count}문제</Badge>
                </div>
              </div>
              {/* Buttons moved outside AccordionTrigger */}
              <div className="flex gap-2 px-4 pb-3">
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => onSelectAssignment(assignment)}
                >
                  결과 보기
                </button>
                {onDeployAssignment && (
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => onDeployAssignment(assignment)}
                  >
                    학생에게 배포
                  </button>
                )}
              </div>
            </div>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
