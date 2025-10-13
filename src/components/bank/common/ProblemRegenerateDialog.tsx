'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw } from 'lucide-react';

interface ProblemRegenerateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (feedback: string) => void;
  subject: '수학' | '국어';
}

export const ProblemRegenerateDialog: React.FC<ProblemRegenerateDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  subject,
}) => {
  const [feedback, setFeedback] = useState('');

  const handleConfirm = () => {
    if (!feedback.trim()) {
      alert('수정 요청 사항을 입력해주세요.');
      return;
    }
    onConfirm(feedback);
    setFeedback('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFeedback('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-green-600" />
            문제 재생성
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              어떻게 수정하고 싶으신가요? (필수)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="예: 문제를 더 쉽게 만들어주세요"
              rows={4}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-500 bg-slate-50 p-3 rounded-md border">
            💡 재생성 시 새로운 문제가 생성되며, 기존 문제는 대체됩니다.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            재생성 실행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
