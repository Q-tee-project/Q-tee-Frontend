'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User } from 'lucide-react';
import { ClassroomWithTeacher } from '@/services/authService';

interface TeacherInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: ClassroomWithTeacher | null;
}

export function TeacherInfoModal({ isOpen, onClose, classroom }: TeacherInfoModalProps) {
  if (!classroom) return null;

  const { teacher } = classroom;

  const formatPhoneNumber = (phone: string) => {
    // 전화번호 포맷팅 (010-1234-5678)
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            담당 선생님 정보
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 클래스 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{classroom.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {classroom.school_level === 'middle' ? '중학교' : '고등학교'} {classroom.grade}학년
              </Badge>
            </div>
          </div>

          {/* 선생님 정보 */}
          <div className="space-y-4">
            {/* 이름 */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{teacher.name}</div>
                <div className="text-sm text-gray-600">담당 교사</div>
              </div>
            </div>

            {/* 이메일 */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{teacher.email}</div>
                <div className="text-sm text-gray-600">이메일</div>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{formatPhoneNumber(teacher.phone)}</div>
                <div className="text-sm text-gray-600">연락처</div>
              </div>
            </div>

          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              확인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}