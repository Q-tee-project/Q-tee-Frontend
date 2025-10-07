'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ClipboardList } from 'lucide-react';

interface AssignmentData {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submitted: number;
  total: number;
}

interface AssignmentSelectionModalProps {
  assignments: AssignmentData[];
  selectedAssignments: string[];
  handleAssignmentSelect: (assignmentId: string) => void;
  isAssignmentModalOpen: boolean;
  setIsAssignmentModalOpen: (isOpen: boolean) => void;
}

const AssignmentSelectionModal = ({
  assignments,
  selectedAssignments,
  handleAssignmentSelect,
  isAssignmentModalOpen,
  setIsAssignmentModalOpen,
}: AssignmentSelectionModalProps) => {
  return (
    <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-medium border-[#0072CE]/30 hover:border-[#0072CE]/50 hover:bg-[#0072CE]/5 transition-all duration-200"
        >
          <ClipboardList className="h-3 w-3 mr-1" />
          {selectedAssignments.length > 0
            ? `${selectedAssignments.length}개 과제 선택됨`
            : '과제 선택'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#0072CE]" />
            과제 선택 (최대 5개)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            차트에 표시할 과제를 선택하세요. 최대 5개까지 선택 가능합니다.
          </div>

          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleAssignmentSelect(assignment.id);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedAssignments.includes(assignment.id)
                    ? 'bg-[#0072CE]/10 border-[#0072CE]/50'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } ${
                  !selectedAssignments.includes(assignment.id) &&
                  selectedAssignments.length >= 5
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 break-words overflow-hidden">
                      {assignment.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {assignment.subject} • 마감: {assignment.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {assignment.submitted}/{assignment.total}명 제출
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedAssignments.length > 0 && (
            <div className="p-3 bg-[#0072CE]/5 rounded-lg border border-[#0072CE]/20">
              <div className="text-xs text-[#0072CE] font-medium">
                선택된 과제: {selectedAssignments.length}개
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="h-9 px-4 text-xs"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="h-9 px-4 text-xs bg-[#0072CE] hover:bg-[#0072CE]/90"
            >
              적용
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentSelectionModal;
