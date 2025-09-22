'use client';

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { Users } from 'lucide-react';
import { AssignmentTab } from '@/components/class/AssignmentTab';
import { StudentManagementTab } from '@/components/class/StudentManagementTab';
import { ApprovalTab as StudentApprovalTab } from '@/components/class/StudentApprovalTab';
import { GradingApprovalTab } from '@/components/class/GradingApprovalTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { classroomService, Classroom } from '@/services/authService';
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
import { IoIosClose } from 'react-icons/io';

interface ClassDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const [activeTab, setActiveTab] = useState('assignment');
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [studentRefreshTrigger, setStudentRefreshTrigger] = useState(0);
  const router = useRouter();

  const resolvedParams = use(params);
  const classId = resolvedParams.id;

  // URL 파라미터에서 탭 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    if (tabParam && ['assignment', 'student', 'approval', 'grading_approval'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // 수정 폼 데이터
  const [editFormData, setEditFormData] = useState({
    name: '',
    school_level: 'middle' as 'middle' | 'high',
    grade: 1,
  });

  // 클래스 정보 로드
  useEffect(() => {
    const loadClassroom = async () => {
      try {
        setIsLoading(true);
        const classroomData = await classroomService.getClassroom(parseInt(classId));
        setClassroom(classroomData);
        // 수정 폼 데이터 초기화
        setEditFormData({
          name: classroomData.name,
          school_level: classroomData.school_level,
          grade: classroomData.grade,
        });
      } catch (error) {
        console.error('클래스 정보 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassroom();
  }, [classId]);

  // 수정 모달 열기
  const handleEditModalOpen = () => {
    if (classroom) {
      setEditFormData({
        name: classroom.name,
        school_level: classroom.school_level,
        grade: classroom.grade,
      });
      setError('');
      setIsEditModalOpen(true);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  // 클래스 정보 수정
  const handleUpdateClass = async () => {
    if (!editFormData.name.trim()) {
      setError('수업명을 입력해주세요.');
      return;
    }

    try {
      // 실제 API 호출로 클래스룸 정보 업데이트
      const updatedClassroom = await classroomService.updateClassroom(classroom!.id, {
        name: editFormData.name,
        school_level: editFormData.school_level,
        grade: editFormData.grade,
      });

      setClassroom(updatedClassroom);
      setIsEditModalOpen(false);
      setError('');

      // 성공 메시지 표시
      alert('클래스 정보가 성공적으로 수정되었습니다!');
    } catch (error: any) {
      console.error('클래스 수정 실패:', error);
      setError(error?.message || '클래스 수정에 실패했습니다.');
    }
  };

  // 클래스 삭제
  const handleDeleteClass = async () => {
    if (!confirm('정말로 이 클래스를 삭제하시겠습니까? 삭제된 클래스는 복구할 수 없습니다.')) {
      return;
    }

    try {
      // 실제 API 호출로 클래스룸 삭제
      await classroomService.deleteClassroom(classroom!.id);

      setIsDeleteModalOpen(false);
      alert('클래스가 성공적으로 삭제되었습니다.');
      router.push('/class/create');
    } catch (error: any) {
      console.error('클래스 삭제 실패:', error);
      setError(error?.message || '클래스 삭제에 실패했습니다.');
    }
  };

  // 학생 승인 후 콜백
  const handleStudentApproved = () => {
    setStudentRefreshTrigger((prev) => prev + 1);
  };

  const tabs = [
    { id: 'assignment', label: '과제 목록', count: 0 },
    { id: 'student', label: '학생 관리', count: 0 },
    { id: 'approval', label: '승인 대기', count: 0 },
    { id: 'grading_approval', label: '채점 승인', count: 0 },
  ];

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 */}
      <PageHeader
        icon={<Users />}
        title="수업 관리"
        variant="class"
        description="수업을 생성하고 관리하세요"
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1">
        <div className="mx-auto">
          {/* 전체 콘텐츠 컨테이너 */}
          <div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6"
            style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}
          >
            {/* 이전으로 돌아가기 및 클래스명 */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/class/create')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
                style={{ backgroundColor: '#f5f5f5', borderRadius: '50%', cursor: 'pointer' }}
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900">
                {isLoading
                  ? '로딩 중...'
                  : classroom
                  ? `${classroom.name} (${
                      classroom.school_level === 'middle' ? '중학교' : '고등학교'
                    } ${classroom.grade}학년)`
                  : `클래스 상세 정보 (ID: ${classId})`}
              </h1>

              {/* 클래스 정보 수정 버튼 */}
              <button
                onClick={handleEditModalOpen}
                className="ml-3 p-2 rounded-md hover:text-gray-600 transition-colors duration-200"
                style={{ color: '#666666', cursor: 'pointer' }}
              >
                <HiOutlinePencilSquare className="h-5 w-5" />
              </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={{ padding: '10px 20px' }}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 탭 내용 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeTab === 'assignment' && <AssignmentTab classId={parseInt(classId)} />}
              {activeTab === 'student' && (
                <StudentManagementTab classId={classId.toString()} refreshTrigger={studentRefreshTrigger} />
              )}
              {activeTab === 'approval' && (
                <StudentApprovalTab classId={classId.toString()} onStudentApproved={handleStudentApproved} />
              )}
              {activeTab === 'grading_approval' && <GradingApprovalTab classId={classId.toString()} />}
            </div>
          </div>
        </div>
      </div>

      {/* 클래스 정보 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DialogTitle>클래스 정보 수정</DialogTitle>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                  수업명 <span style={{ color: '#FF0000' }}>*</span>
                </label>
                <Input
                  id="className"
                  placeholder="예: 중1-1반, 수학심화반 등"
                  value={editFormData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="flex gap-[15px]">
                <div className="flex-1">
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                    학교 <span style={{ color: '#FF0000' }}>*</span>
                  </label>
                  <Select
                    value={editFormData.school_level}
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
                    학년 <span style={{ color: '#FF0000' }}>*</span>
                  </label>
                  <Select
                    value={editFormData.grade.toString()}
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

              {/* 삭제하기 버튼 */}
              <div style={{ borderBottom: '1px solid #D1D1D1', paddingBottom: '15px' }}>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#EAEAEA',
                    color: '#0072CE',
                    borderRadius: '5px',
                    padding: '7px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>

          <DialogFooter style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              style={{ flex: 1 }}
            >
              취소
            </button>
            <button
              onClick={handleUpdateClass}
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                flex: 1,
                backgroundColor: '#0072CE',
                color: '#ffffff',
              }}
            >
              수정하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 클래스 삭제 확인 모달 */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DialogTitle>클래스 삭제</DialogTitle>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600">정말로 이 클래스를 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500">
              • 삭제된 클래스는 복구할 수 없습니다.
              <br />
              • 클래스에 속한 모든 학생들이 자동으로 제거됩니다.
              <br />• 클래스와 관련된 모든 데이터가 삭제됩니다.
            </p>
          </div>

          <DialogFooter style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              style={{ flex: 1 }}
            >
              취소
            </button>
            <button
              onClick={handleDeleteClass}
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                flex: 1,
                backgroundColor: '#dc2626',
                color: '#ffffff',
              }}
            >
              삭제하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
