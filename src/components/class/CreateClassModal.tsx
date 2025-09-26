'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IoIosClose } from "react-icons/io";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    school_level: 'middle' | 'high';
    grade: number;
  }) => Promise<void>;
  error?: string;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onSubmit,
  error
}: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    school_level: 'middle' as 'middle' | 'high',
    grade: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 수업 생성
  const handleCreateClass = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        school_level: 'middle',
        grade: 1,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              수업 생성
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-0 w-6 h-6 flex items-center justify-center"
            >
              <IoIosClose />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
              수업명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="className"
              placeholder="예: 중1-1반, 수학심화반 등"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="flex gap-4 pb-4 border-b border-[#D1D1D1]">
            <div className="flex-1">
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                학교 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.school_level}
                onValueChange={(value: 'middle' | 'high') =>
                  handleInputChange('school_level', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle">중학교</SelectItem>
                  <SelectItem value="high">고등학교</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                학년 <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.grade.toString()}
                onValueChange={(value) => handleInputChange('grade', parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1학년</SelectItem>
                  <SelectItem value="2">2학년</SelectItem>
                  <SelectItem value="3">3학년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex-1"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            onClick={handleCreateClass}
            className="px-4 py-2 rounded-md transition-colors flex-1 bg-[#0072CE] text-white"
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? '생성 중...' : '생성하기'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}