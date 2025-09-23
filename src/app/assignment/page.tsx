'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mathService } from '@/services/mathService';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Calendar, Users, Clock } from 'lucide-react';

interface StudentAssignment {
  id: number;
  title: string;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  status: string;
  deployed_at: string;
  assignment_id: number;
}

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { userType, userProfile } = useAuth();

  // 학생만 접근 가능
  useEffect(() => {
    if (userType !== 'student') {
      router.push('/login');
      return;
    }
  }, [userType, router]);

  // 과제 목록 로드
  // useEffect(() => {
  //   if (userProfile?.id) {
  //     loadAssignments();
  //   }
  // }, [userProfile]);

  // const loadAssignments = async () => {
  //   try {
  //     setIsLoading(true);
  //     if (!userProfile?.id) {
  //       console.error('사용자 정보가 없습니다');
  //       return;
  //     }
  //     const assignmentList = await mathService.getStudentAssignments(userProfile.id);
  //     setAssignments(assignmentList);
  //   } catch (error) {
  //     console.error('과제 목록 로드 실패:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <Badge variant="outline" className="text-blue-600">
            배정됨
          </Badge>
        );
      case 'started':
        return (
          <Badge variant="default" className="bg-yellow-500">
            진행중
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            완료
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStartAssignment = (assignment: StudentAssignment) => {
    router.push(`/assignment/${assignment.assignment_id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">과제 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">과제 목록</h1>
          <p className="text-gray-600">배정받은 과제를 확인하고 풀이하세요.</p>
        </div>

        {/* 과제 목록 */}
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">배정된 과제가 없습니다</h3>
              <p className="text-gray-500">교사가 과제를 배정하면 여기에 표시됩니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </CardTitle>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* 단원 정보 */}
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>
                        {assignment.unit_name} &gt; {assignment.chapter_name}
                      </span>
                    </div>

                    {/* 문제 수 */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{assignment.problem_count}문제</span>
                    </div>

                    {/* 배포일 */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(assignment.deployed_at).toLocaleDateString('ko-KR')}</span>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="pt-4">
                      {assignment.status === 'assigned' ? (
                        <Button
                          onClick={() => handleStartAssignment(assignment)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          과제 시작
                        </Button>
                      ) : assignment.status === 'started' ? (
                        <Button
                          onClick={() => handleStartAssignment(assignment)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          계속하기
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleStartAssignment(assignment)}
                          variant="outline"
                          className="w-full"
                        >
                          결과 보기
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
