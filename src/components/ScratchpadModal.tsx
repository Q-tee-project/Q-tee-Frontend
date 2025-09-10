'use client';

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HandwritingCanvas } from './HandwritingCanvas';
import { BookOpen, X } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemNumber: number;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({
  isOpen,
  onClose,
  problemNumber
}) => {
  const [hasContent, setHasContent] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0072CE]" />
              연습장 - 문제 {problemNumber}번
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 py-4">
          <div className="text-sm text-gray-600 mb-4">
            아래 공간에서 자유롭게 계산하고 풀이해보세요. 연습장 내용은 답안에 포함되지 않습니다.
          </div>
          
          <HandwritingCanvas
            width={700}
            height={400}
            onStrokeChange={setHasContent}
            className="w-full"
          />
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              {hasContent ? '연습장에 내용이 있습니다' : '연습장이 비어있습니다'}
            </div>
            <Button onClick={onClose} className="bg-[#0072CE] hover:bg-[#0056A3]">
              닫기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};