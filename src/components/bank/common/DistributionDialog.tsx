'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ClassData {
  id: string;
  name: string;
  studentCount: number;
}

interface Recipient {
  id: string;
  name: string;
  school: string;
  level: string;
  grade: string;
  classId: string;
}

interface DistributionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classes?: ClassData[];
  selectedClasses: string[];
  selectedRecipients: string[];
  filteredRecipients: Recipient[];
  onClassSelect: (classId: string) => void;
  onRecipientSelect: (recipientId: string) => void;
  onDistribute: () => void;
}

export const DistributionDialog: React.FC<DistributionDialogProps> = ({
  isOpen,
  onOpenChange,
  classes = [],
  selectedClasses,
  selectedRecipients,
  filteredRecipients,
  onClassSelect,
  onRecipientSelect,
  onDistribute,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>문제 배포</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-96">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-3">클래스 목록</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {classes.map((cls) => {
                  const isSelected = selectedClasses.includes(cls.id);
                  const hasStudents = cls.studentCount > 0;

                  return (
                    <div
                      key={cls.id}
                      className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-l-[#0072CE]'
                          : hasStudents
                          ? 'hover:bg-gray-50'
                          : 'hover:bg-red-50'
                      } ${!hasStudents ? 'opacity-60' : ''}`}
                      onClick={() => onClassSelect(cls.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#0072CE] border-gray-300 rounded focus:ring-[#0072CE]"
                      />
                      <Image src="/logo.svg" alt="클래스 아이콘" width={16} height={16} />
                      <div className="flex-1 flex justify-between items-center">
                        <span
                          className={`text-sm ${
                            isSelected ? 'text-[#0072CE] font-medium' : 'text-gray-900'
                          }`}
                        >
                          {cls.name}
                        </span>
                        <span
                          className={`text-xs ${hasStudents ? 'text-gray-500' : 'text-red-400'}`}
                        >
                          ({cls.studentCount}명)
                          {!hasStudents && <span className="ml-1">비어있음</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-3">수신자 목록</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {filteredRecipients.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">선택된 클래스에 학생이 없습니다.</p>
                    <p className="text-xs mt-1">클래스를 선택해주세요.</p>
                  </div>
                ) : (
                  filteredRecipients.map((recipient) => {
                    const isSelected = selectedRecipients.includes(recipient.id);

                    return (
                      <div
                        key={recipient.id}
                        className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-green-50 border-l-4 border-l-green-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => onRecipientSelect(recipient.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-[#0072CE] border-gray-300 rounded focus:ring-[#0072CE]"
                        />
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#0072CE] text-white text-xs rounded">
                            {recipient.level}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {recipient.grade}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{recipient.name}</div>
                          <div className="text-xs text-gray-500">{recipient.school}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onDistribute} className="bg-[#0072CE] hover:bg-[#0056A3]">
            배포
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
