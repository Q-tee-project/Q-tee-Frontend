'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
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
import { Users, Plus, Code, Copy, CheckCircle } from 'lucide-react';

export default function ClassCreatePage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    school_level: 'middle' as 'middle' | 'high',
    grade: 1,
  });

  // 코드 복사 상태
  const [copied, setCopied] = useState(false);

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
    } catch (error: any) {
      console.error('클래스 로드 실패:', error);
      setError('클래스 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // 클래스 생성
  const handleCreateClass = async () => {
    if (!formData.name.trim()) {
      setError('클래스명을 입력해주세요.');
      return;
    }

    try {
      await classroomService.createClassroom({
        name: formData.name,
        school_level: formData.school_level,
        grade: formData.grade
      });

      // 성공 후 목록 새로고침
      await loadClasses();
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        school_level: 'middle',
        grade: 1,
      });
      setError('');
    } catch (error: any) {
      console.error('클래스 생성 실패:', error);
      setError(error?.message || '클래스 생성에 실패했습니다.');
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <PageHeader
        icon={<Users />}
        title="수업 관리"
        variant="class"
        description="클래스를 생성하고 관리하세요"
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* 상단 액션 버튼 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">내 클래스 목록</h2>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              신규 수업 생성하기
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 클래스가 없습니다</h3>
                <p className="text-gray-500 mb-4">첫 번째 클래스를 생성해보세요!</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  신규 수업 생성하기
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
                      <TableHead>생성일</TableHead>
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
                              handleShowCode(classroom);
                            }}

                          >
                            <Code className="w-4 h-4 mr-1" />
                            코드
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 클래스 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              신규 클래스 생성
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                클래스명 *
              </label>
              <Input
                id="className"
                placeholder="예: 중1-1반, 수학심화반 등"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                학교급 *
              </label>
              <Select 
                value={formData.school_level} 
                onValueChange={(value: 'middle' | 'high') => handleInputChange('school_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle">중학교</SelectItem>
                  <SelectItem value="high">고등학교</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                학년 *
              </label>
              <Select 
                value={formData.grade.toString()} 
                onValueChange={(value) => handleInputChange('grade', parseInt(value))}
              >
                <SelectTrigger>
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

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              취소
            </Button>
            <Button 
              onClick={handleCreateClass}
              className="bg-green-600 hover:bg-green-700"
            >
              생성하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 클래스 코드 모달 */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              클래스 코드
            </DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">클래스: {selectedClass.name}</p>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">학생들이 입력할 코드</p>
                  <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                    {selectedClass.class_code}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• 이 코드를 학생들에게 공유하세요</p>
                <p>• 학생은 클래스 가입 페이지에서 이 코드를 입력할 수 있습니다</p>
                <p>• 가입 요청 후 선생님의 승인이 필요합니다</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCodeModalOpen(false)}
            >
              닫기
            </Button>
            <Button 
              onClick={handleCopyCode}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  코드 복사
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}