'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import CreateClassModal from '@/components/class/CreateClassModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { classroomService } from '@/services/authService';
import type { Classroom } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Users, CheckCircle } from 'lucide-react';
import { IoCopyOutline, IoSearch } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";

export default function ClassCreatePage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [studentCounts, setStudentCounts] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);

  // 코드 복사 상태
  const [copied, setCopied] = useState(false);


  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated || userType !== 'teacher') {
      router.push('/login');
      return;
    }

    loadClasses();
  }, [isAuthenticated, userType, router]);

  // 클래스 목록 로드
  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const classData = await classroomService.getMyClassrooms();
      setClasses(classData);
      
      // 각 클래스의 학생 수 로드
      const counts: {[key: number]: number} = {};
      for (const classroom of classData) {
        try {
          const students = await classroomService.getClassroomStudents(classroom.id);
          counts[classroom.id] = students.length;
        } catch (error) {
          console.error(`클래스 ${classroom.id} 학생 수 로드 실패:`, error);
          counts[classroom.id] = 0;
        }
      }
      setStudentCounts(counts);
    } catch (error: any) {
      console.error('클래스 로드 실패:', error);
      setError('클래스 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 클래스 생성
  const handleCreateClass = async (formData: {
    name: string;
    school_level: 'middle' | 'high';
    grade: number;
  }) => {
    try {
      await classroomService.createClassroom({
        name: formData.name,
        school_level: formData.school_level,
        grade: formData.grade,
      });

      // 성공 후 목록 새로고침
      await loadClasses();
      setIsCreateModalOpen(false);
      setError('');
    } catch (error: any) {
      console.error('클래스 생성 실패:', error);
      setError(error?.message || '클래스 생성에 실패했습니다.');
      throw error; // 모달에서 에러를 처리할 수 있도록 에러를 다시 던짐
    }
  };

  // 코드 모달 열기
  const handleShowCode = (classroom: Classroom) => {
    setSelectedClass(classroom);
    setIsCodeModalOpen(true);
    setCopied(false);
  };

  // 코드 복사
  const handleCopyCode = async () => {
    if (!selectedClass) return;

    try {
      await navigator.clipboard.writeText(selectedClass.class_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('코드 복사에 실패했습니다.');
    }
  };

  // 클래스 상세보기
  const handleClassClick = (classroom: Classroom) => {
    router.push(`/class/${classroom.id}`);
  };

  // 검색 필터링된 클래스 목록 (클래스명으로만 검색)
  const filteredClasses = classes.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 */}
      <PageHeader
        icon={<Users />}
        title="클래스 관리"
        variant="class"
        description="클래스를 생성하고 관리하세요"
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
                placeholder="클래스명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10"
              />
              <IoSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              style={{ backgroundColor: '#0072CE' }}
              className="hover:opacity-90 ml-4"
            >
              클래스 생성
            </Button>
          </div>

          {/* 클래스 목록 섹션 */}
          <div className="rounded-[10px] border p-6 shadow-sm">
            {/* 클래스 목록 제목 */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">내 클래스 목록</h2>


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
                    <p className="text-gray-500 mb-4">다른 클래스명으로 검색해보세요.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 클래스가 없습니다</h3>
                    <p className="text-gray-500 mb-4">첫 번째 클래스를 생성해보세요!</p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      style={{ backgroundColor: '#0072CE' }}
                      className="hover:opacity-90"
                    >
                      클래스 생성
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
                    <TableHead 
                      className="font-semibold text-center border-b"
                      style={{ 
                        fontSize: '16px', 
                        color: '#666666',
                        borderBottomColor: '#666666',
                        padding: '10px 12px',
                        width: '15%'
                      }}
                    >
                      클래스명
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-center border-b"
                      style={{ 
                        fontSize: '16px', 
                        color: '#666666',
                        borderBottomColor: '#666666',
                        padding: '10px 12px',
                        width: '15%'
                      }}
                    >
                      학교
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-center border-b"
                      style={{ 
                        fontSize: '16px', 
                        color: '#666666',
                        borderBottomColor: '#666666',
                        padding: '10px 12px',
                        width: '10%'
                      }}
                    >
                      학년
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-center border-b"
                      style={{ 
                        fontSize: '16px',
                        color: '#666666',
                        borderBottomColor: '#666666',
                        padding: '10px 12px',
                        width: '20%'
                      }}
                    >
                      생성일
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-center border-b"
                      style={{ 
                        fontSize: '16px',
                        color: '#666666',
                        borderBottomColor: '#666666',
                        padding: '10px 12px',
                        width: '15%'
                      }}
                    >
                      학생 수
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-center border-b"
                      style={{ 
                        fontSize: '16px',
                        color: '#666666',
                        borderBottomColor: '#666666',
                        padding: '10px 12px',
                        width: '15%'
                      }}
                    >
                      코드
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classroom) => (
                    <TableRow
                      key={classroom.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: '1px solid #e1e1e1' }}
                      onClick={() => handleClassClick(classroom)}
                    >
                      <TableCell 
                        className="font-medium text-center"
                        style={{ 
                          fontSize: '14px', 
                          color: '#666666',
                          padding: '10px 12px'
                        }}
                      >
                        {classroom.name}
                      </TableCell>
                      <TableCell 
                        className="text-center"
                        style={{ padding: '10px 12px' }}
                      >
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
                      </TableCell>
                      <TableCell 
                        className="text-center"
                        style={{ padding: '10px 12px' }}
                      >
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
                      </TableCell>
                      <TableCell 
                        className="text-center"
                        style={{ 
                          fontSize: '14px', 
                          color: '#666666',
                          padding: '10px 12px'
                        }}
                      >
                        {new Date(classroom.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell 
                        className="text-center"
                        style={{ 
                          fontSize: '14px', 
                          color: '#666666',
                          padding: '10px 12px'
                        }}
                      >
                        {studentCounts[classroom.id] || 0}명
                      </TableCell>
                      <TableCell 
                        className="text-center"
                        style={{ padding: '10px 12px' }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowCode(classroom);
                          }}
                          className="hover:bg-blue-50 hover:border-blue-200"
                          style={{ padding: '10px' }}
                        >
                          <IoCopyOutline className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* 클래스 생성 모달 */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        error={error}
      />

      {/* 클래스 코드 모달 */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DialogTitle className="flex items-center gap-2">
                클래스 코드
              </DialogTitle>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p className="text-sm text-gray-600">클래스명: {selectedClass.name}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 이 코드를 학생들에게 공유하세요</p>
                  <p>• 학생은 클래스 가입 페이지에서 이 코드를 입력할 수 있습니다</p>
                  <p>• 가입 요청 후 선생님의 승인이 필요합니다</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {selectedClass.class_code}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              style={{ flex: 1 }}
            >
              닫기
            </button>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-md transition-colors"
              style={{ 
                flex: 1,
                backgroundColor: '#0072CE',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  복사됨!
                </>
              ) : (
                <>
                  <IoCopyOutline className="w-4 h-4 mr-2" />
                  코드 복사
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
