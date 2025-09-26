'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Users, Plus, Calendar, User } from 'lucide-react';
import { IoSearch } from "react-icons/io5";

export default function StudentClassPage() {
  const router = useRouter();
  const { isAuthenticated, userType, userProfile } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [classesWithTeachers, setClassesWithTeachers] = useState<ClassroomWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomWithTeacher | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  
  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/');
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
      
      // 선생님 정보를 포함한 클래스 데이터 로드
      if (userProfile?.id) {
        const classesWithTeachersData = await studentClassService.getMyClassesWithTeachers(userProfile.id);
        setClassesWithTeachers(classesWithTeachersData);
      }
    } catch (error: any) {
      console.error('클래스 로드 실패:', error);
      setError('클래스 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 클래스 클릭 시 교사 정보 모달 열기
  const handleClassClick = async (classroom: Classroom) => {
    try {
      // 이미 로드된 선생님 정보에서 찾기
      const classroomWithTeacher = classesWithTeachers.find(c => c.id === classroom.id);

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

  // 검색 필터링된 클래스 목록 (클래스명과 선생님명으로 검색)
  const filteredClasses = classes.filter(classroom => {
    const classMatch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase());
    // 선생님명 검색은 실제 데이터 구조에 따라 조정 필요
    return classMatch;
  });

  return (
    <div className="flex flex-col p-5 gap-5">
      {/* 헤더 */}
      <PageHeader
        icon={<Users />}
        title="내 클래스"
        variant="class"
        description="가입한 클래스를 확인하고 관리하세요"
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1">
        <div className="mx-auto">
          {/* 전체 콘텐츠 컨테이너 */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            {/* 검색 및 액션 버튼 */}
            <div className="flex justify-between items-center mb-6">
              <div className="max-w-sm relative">
                <Input
                  placeholder="클래스명, 선생님명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10"
                />
                <IoSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <Button
                onClick={handleJoinClass}
                className="bg-[#0072CE] hover:opacity-90 ml-4"
              >
                클래스 가입하기
              </Button>
            </div>

            {/* 클래스 목록 섹션 */}
            <div className="rounded-[10px] border p-6 shadow-sm">
              {/* 클래스 목록 제목 */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">가입한 클래스 목록</h2>

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
              ) : filteredClasses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    {searchTerm ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-gray-500 mb-4">다른 검색어로 검색해보세요.</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">가입한 클래스가 없습니다</h3>
                        <p className="text-gray-500 mb-4">클래스 코드를 입력하여 클래스에 가입해보세요!</p>
                        <Button
                          onClick={handleJoinClass}
                          className="bg-[#0072CE] hover:opacity-90"
                        >
                          클래스 가입하기
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* 클래스 테이블 */
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-1/5">
                        클래스명
                      </TableHead>
                      <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[15%]">
                        학교
                      </TableHead>
                      <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[10%]">
                        학년
                      </TableHead>
                      <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-1/5">
                        가입일
                      </TableHead>
                      <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-1/5">
                        담당선생님
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((classroom) => (
                      <TableRow
                        key={classroom.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-[#e1e1e1]"
                        onClick={() => handleClassClick(classroom)}
                      >
                        <TableCell className="font-medium text-center text-sm text-[#666666] p-3">
                          {classroom.name}
                        </TableCell>
                        <TableCell className="text-center p-3">
                          <Badge
                            className={`rounded px-2.5 py-1.5 text-sm ${
                              classroom.school_level === 'middle' 
                                ? 'bg-[#E6F3FF] text-[#0085FF]' 
                                : 'bg-[#FFF5E9] text-[#FF9F2D]'
                            }`}
                          >
                            {classroom.school_level === 'middle' ? '중학교' : '고등학교'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center p-3">
                          <Badge className="rounded px-2.5 py-1.5 text-sm bg-[#f5f5f5] text-[#999999]">
                            {classroom.grade}학년
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-[#666666] p-3">
                          {new Date(classroom.created_at).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-center text-sm text-[#666666] p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClassClick(classroom);
                            }}
                            className="hover:bg-blue-50 hover:border-blue-200 p-2.5"
                          >
                            {(() => {
                              const classroomWithTeacher = classesWithTeachers.find(c => c.id === classroom.id);
                              return classroomWithTeacher?.teacher?.name || '선생님 정보';
                            })()}
                            <span>선생님</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* 클래스 활용 팁 */}
              {filteredClasses.length > 0 && (
                <div className="mt-6 pt-6">
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
                </div>
              )}
            </div>
          </div>
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
