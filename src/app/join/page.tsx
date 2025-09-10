'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function JoinPage() {
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { userType, ...formData });
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
              />
            </div>

            {/* 연락처 */}
            <div>
              <label htmlFor="contact" className="text-sm font-medium text-gray-700 mb-2 block">
                연락처
              </label>
              <Input
                id="contact"
                name="contact"
                type="tel"
                placeholder="연락처를 입력해 주세요"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* 아이디 */}
            <div>
              <label htmlFor="studentId" className="text-sm font-medium text-gray-700 mb-2 block">
                아이디
              </label>
              <div className="flex gap-2">
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="아이디를 입력해 주세요"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button type="button" variant="default" className="shrink-0">
                  중복 확인
                </Button>
              </div>
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
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1">
                이전
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                회원가입
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
