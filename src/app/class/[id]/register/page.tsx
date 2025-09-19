'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from "react-icons/fa6";
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { classroomService, StudentJoinRequest } from '@/services/authService';

interface RegisterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resolvedParams = use(params);
  const classId = resolvedParams.id;

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    parent_phone: '',
    school_level: 'middle' as 'middle' | 'high',
    grade: 1,
  });

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.parent_phone.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 백엔드 API 호출하지 않고 로컬 상태만 관리
      // (실제로는 학생이 코드를 입력할 때까지 대기)
      
      // 로컬 상태에 "초대 완료" 상태로 추가
      const invitedRequest: StudentJoinRequest = {
        id: Date.now(), // 임시 ID
        student_id: Date.now(), // 임시 학생 ID
        classroom_id: parseInt(classId),
        status: 'invited',
        requested_at: new Date().toISOString(),
        student: {
          id: Date.now(),
          username: formData.email.split('@')[0],
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          parent_phone: formData.parent_phone,
          school_level: formData.school_level,
          grade: formData.grade,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        classroom: {
          id: parseInt(classId),
          name: '',
          school_level: formData.school_level,
          grade: formData.grade,
          class_code: '',
          teacher_id: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        }
      };

      // localStorage에 초대 완료 상태 저장
      const existingInvites = JSON.parse(localStorage.getItem(`invited_students_${classId}`) || '[]');
      existingInvites.push(invitedRequest);
      localStorage.setItem(`invited_students_${classId}`, JSON.stringify(existingInvites));
      
      // 등록 성공 후 승인 대기 탭으로 이동
      router.push(`/class/${classId}?tab=approval`);
      
      // TODO: 나중에 학생이 코드를 입력하면 실제 백엔드 API 호출
      console.log('학생이 초대 완료 상태로 등록되었습니다. 학생이 코드를 입력할 때까지 대기합니다.');
    } catch (error: any) {
      console.error('학생 등록 실패:', error);
      setError(error?.message || '학생 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.push(`/class/${classId}`);
  };

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 */}
      <PageHeader
        icon={<UserPlus />}
        title="학생 등록"
        variant="class"
        description="새로운 학생을 등록하세요"
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1">
        <div className="mx-auto">
          {/* 전체 콘텐츠 컨테이너 */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            {/* 이전으로 돌아가기 및 제목 */}
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push(`/class/${classId}`)}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900">
                학생 등록하기
              </h1>
            </div>

            {/* 본문 영역 - 등록 폼 */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* 에러 메시지 */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}

              {/* 학생 이름 */}
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  학생 이름 <span style={{ color: '#FF0000' }}>*</span>
                </label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="학생 이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span style={{ color: '#FF0000' }}>*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              {/* 학생 연락처 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  학생 연락처 <span style={{ color: '#FF0000' }}>*</span>
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="학생 연락처를 입력하세요"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              {/* 학부모 연락처 */}
              <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  학부모 연락처 <span style={{ color: '#FF0000' }}>*</span>
                </label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="학부모 연락처를 입력하세요"
                  value={formData.parent_phone}
                  onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                />
              </div>

              {/* 학교/학년 */}
              <div className="flex gap-[15px] pb-4" style={{ borderBottom: '1px solid #D1D1D1' }}>
                <div className="flex-1">
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                    학교 <span style={{ color: '#FF0000' }}>*</span>
                  </label>
                  <Select
                    value={formData.school_level}
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
                    value={formData.grade.toString()}
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

              {/* 버튼 영역 */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  style={{ flex: 1 }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md transition-colors"
                  style={{ 
                    flex: 1,
                    backgroundColor: '#0072CE',
                    color: '#ffffff',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
