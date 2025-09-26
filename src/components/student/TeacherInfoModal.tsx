'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User } from 'lucide-react';
import { IoBookOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
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
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <DialogTitle className="flex items-center gap-2">
              과외 선생님 정보
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IoIosClose />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* 클래스 정보 */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <IoBookOutline className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{classroom.name}</span>
                  <Badge
                    className="rounded-[4px]"
                    style={{
                      backgroundColor: classroom.school_level === 'middle' ? '#E6F3FF' : '#FFF5E9',
                      color: classroom.school_level === 'middle' ? '#0085FF' : '#FF9F2D',
                      padding: '5px 10px',
                      fontSize: '14px',
                    }}
                  >
                    {classroom.school_level === 'middle' ? '중학교' : '고등학교'}
                  </Badge>
                  <Badge
                    className="rounded-[4px]"
                    style={{
                      backgroundColor: '#f5f5f5',
                      color: '#999999',
                      padding: '5px 10px',
                      fontSize: '14px',
                    }}
                  >
                    {classroom.grade}학년
                  </Badge>
                </div>
              </div>
            </div>

            {/* 선생님 정보 */}
            <div className="space-y-3">
              {/* 이름 */}
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{teacher.name}</div>
                </div>
              </div>

              {/* 이메일 */}
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{teacher.email}</div>
                </div>
              </div>

              {/* 전화번호 */}
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{formatPhoneNumber(teacher.phone)}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md"
            style={{ 
              flex: 1,
              backgroundColor: '#F5F5F5',
              color: '#666666'
            }}
          >
            닫기
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}