'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/services/authService';

export default function JoinPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'teacher' | 'student'>('teacher');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    parent_phone: '',
    school_level: 'middle' as 'middle' | 'high',
    grade: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'grade' ? Number(value) : value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!userType) {
      setError('가입 유형을 선택해주세요.');
      return false;
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.username || !formData.password) {
      setError('모든 필수 항목을 입력해주세요.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (userType === 'student' && !formData.parent_phone) {
      setError('학부모 연락처를 입력해주세요.');
      return false;
    }
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (userType === 'teacher') {
        await authService.teacherSignup({
          username: formData.username,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        });
      } else {
        await authService.studentSignup({
          username: formData.username,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          parent_phone: formData.parent_phone,
          school_level: formData.school_level,
          grade: formData.grade,
          password: formData.password,
        });
      }
      
      // 회원가입 성공 후 로그인 페이지로 이동
      router.push('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error?.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image src="/logo.svg" alt="Q-Tee Logo" width={24} height={24} className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Q-Tee</h1>
            </div>
          </div>

          <h2 className="text-lg font-medium text-center mb-6">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 가입 유형 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">가입 유형</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${
                    userType === 'teacher'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUserType('teacher')}
                >
                  <div className="font-medium">선생님</div>
                </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${
                    userType === 'student'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUserType('student')}
                >
                  <div className="font-medium">학생</div>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                이름
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력해 주세요"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 연락처 */}
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                연락처
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="연락처를 입력해 주세요"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 아이디 */}
            <div>
              <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2 block">
                아이디
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="아이디를 입력해 주세요"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                숫자, 문자, 특수문자 혼합으로 8-15 자리 입력하세요. (20자 제한)
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                비밀번호 확인
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 학생 전용 필드들 */}
            {userType === 'student' && (
              <>
                {/* 학부모 연락처 */}
                <div>
                  <label htmlFor="parent_phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    학부모 연락처 *
                  </label>
                  <Input
                    id="parent_phone"
                    name="parent_phone"
                    type="tel"
                    placeholder="학부모 연락처를 입력해 주세요"
                    value={formData.parent_phone}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                {/* 학교급 선택 */}
                <div>
                  <label htmlFor="school_level" className="text-sm font-medium text-gray-700 mb-2 block">
                    학교급 *
                  </label>
                  <select
                    id="school_level"
                    name="school_level"
                    value={formData.school_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value="middle">중등학교</option>
                    <option value="high">고등학교</option>
                  </select>
                </div>

                {/* 학년 선택 */}
                <div>
                  <label htmlFor="grade" className="text-sm font-medium text-gray-700 mb-2 block">
                    학년 *
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                  </select>
                </div>
              </>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleBackClick}
                disabled={isLoading}
              >
                이전
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
