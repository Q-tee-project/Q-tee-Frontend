'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, BookOpen } from 'lucide-react';
import { TeacherInfoCard } from './TeacherInfoCard';
import { studentClassService, ClassroomWithTeacher } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

export function MyClassroomsWithTeachers() {
  const { userProfile } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClassrooms = async () => {
    if (!userProfile?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await studentClassService.getMyClassesWithTeachers(userProfile.id);
      setClassrooms(data);
    } catch (error: any) {
      console.error('클래스룸 정보 조회 실패:', error);
      setError(error.message || '클래스룸 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      loadClassrooms();
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">클래스 정보를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-sm text-red-600">{error}</div>
          <Button variant="outline" size="sm" onClick={loadClassrooms}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (classrooms.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <Users className="w-12 h-12 text-gray-400" />
          <div className="text-sm text-gray-600">가입된 클래스가 없습니다.</div>
          <div className="text-xs text-gray-500">
            선생님께서 제공한 클래스 코드로 클래스에 가입해보세요.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">내 클래스</h2>
          <span className="text-sm text-gray-500">({classrooms.length}개)</span>
        </div>
        <Button variant="outline" size="sm" onClick={loadClassrooms}>
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <TeacherInfoCard key={classroom.id} classroom={classroom} />
        ))}
      </div>
    </div>
  );
}