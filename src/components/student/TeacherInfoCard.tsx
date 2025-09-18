'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Calendar, User } from 'lucide-react';
import { ClassroomWithTeacher } from '@/services/authService';

interface TeacherInfoCardProps {
  classroom: ClassroomWithTeacher;
}

export function TeacherInfoCard({ classroom }: TeacherInfoCardProps) {
  const { teacher } = classroom;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatPhoneNumber = (phone: string) => {
    // 전화번호 포맷팅 (010-1234-5678)
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">담당 선생님</CardTitle>
          <Badge variant="outline" className="text-xs">
            {classroom.school_level === 'middle' ? '중학교' : '고등학교'} {classroom.grade}학년
          </Badge>
        </div>
        <div className="text-sm text-gray-600">{classroom.name}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 선생님 이름 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{teacher.name}</div>
            <div className="text-sm text-gray-500">담당 교사</div>
          </div>
        </div>

        {/* 이메일 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-900">{teacher.email}</div>
            <div className="text-xs text-gray-500">이메일</div>
          </div>
        </div>

        {/* 전화번호 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-900">{formatPhoneNumber(teacher.phone)}</div>
            <div className="text-xs text-gray-500">연락처</div>
          </div>
        </div>

        {/* 클래스 생성일 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-sm text-gray-900">{formatDate(classroom.created_at)}</div>
            <div className="text-xs text-gray-500">클래스 생성일</div>
          </div>
        </div>

        {/* 클래스 코드 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">클래스 코드</div>
          <div className="font-mono text-sm font-medium text-gray-900">
            {classroom.class_code}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}