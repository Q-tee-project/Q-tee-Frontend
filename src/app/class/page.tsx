'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { studentClassService } from '@/services/authService';
import type { Classroom, ClassroomWithTeacher } from '@/services/authService';
import { TeacherInfoModal } from '@/components/student/TeacherInfoModal';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, BookOpen, Calendar } from 'lucide-react';

export default function StudentClassPage() {
  const router = useRouter();
  const { isAuthenticated, userType, userProfile } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomWithTeacher | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/login');
      return;
    }

    loadClasses();
  }, [isAuthenticated, userType, router]);

  // 클래스 목록 로드
  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const classData = await studentClassService.getMyClasses();
      setClasses(classData);
    } catch (error: any) {
      console.error('클래스 로드 실패:', error);
      setError('클래스 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 클래스 클릭 시 교사 정보 모달 열기
  const handleClassClick = async (classroom: Classroom) => {
    if (!userProfile?.id) {
      setError('사용자 정보가 없습니다.');
      return;
    }

    try {
      // 교사 정보를 포함한 클래스룸 정보 가져오기
      const classroomsWithTeachers = await studentClassService.getMyClassesWithTeachers(userProfile.id);
      const classroomWithTeacher = classroomsWithTeachers.find(c => c.id === classroom.id);

      if (classroomWithTeacher) {
        setSelectedClassroom(classroomWithTeacher);
        setIsTeacherModalOpen(true);
      } else {
        setError('교사 정보를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('교사 정보 조회 실패:', error);
      setError('교사 정보를 불러오는데 실패했습니다.');
    }
  };

  // 클래스 가입 페이지로 이동
  const handleJoinClass = () => {
    router.push('/class/join');
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <PageHeader
        icon={<Users />}
        title="내 클래스"
        variant="class"
        description="가입한 클래스를 확인하고 관리하세요"
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* 상단 액션 버튼 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">가입한 클래스 목록</h2>
            <Button onClick={handleJoinClass} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              클래스 가입하기
            </Button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded mb-4 border border-red-200">
              {error}
            </div>
          )}

          {/* 로딩 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">클래스 목록을 불러오는 중...</div>
            </div>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">가입한 클래스가 없습니다</h3>
                <p className="text-gray-500 mb-4">클래스 코드를 입력하여 클래스에 가입해보세요!</p>
                <Button onClick={handleJoinClass} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  클래스 가입하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* 클래스 테이블 */
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>클래스명</TableHead>
                      <TableHead>학교급</TableHead>
                      <TableHead>학년</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-center">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classroom) => (
                      <TableRow
                        key={classroom.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleClassClick(classroom)}
                      >
                        <TableCell className="font-medium">{classroom.name}</TableCell>
                        <TableCell>
                          {classroom.school_level === 'middle' ? '중학교' : '고등학교'}
                        </TableCell>
                        <TableCell>{classroom.grade}학년</TableCell>
                        <TableCell>
                          {new Date(classroom.created_at).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            활성
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClassClick(classroom);
                            }}
                          >
                            <BookOpen className="w-4 h-4 mr-1" />
                            입장
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* 추가 안내 카드 */}
          {classes.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">클래스 활용 팁</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 클래스를 클릭하면 담당 선생님의 연락처를 확인할 수 있습니다</p>
                      <p>• 과제 풀이 메뉴에서 선생님이 출제한 과제를 확인할 수 있습니다</p>
                      <p>• 새로운 클래스에 가입하려면 "클래스 가입하기" 버튼을 클릭하세요</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 교사 정보 모달 */}
      <TeacherInfoModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        classroom={selectedClassroom}
      />
    </div>
  );
}
