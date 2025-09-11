'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/select';


export default function JoinPage() {
  const [userType, setUserType] = useState('');
  const initialFormData = {
    name: '',
    email: '',
    contact: '',
    parentContact: '',
    school: '',
    grade: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  };
  
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckId = () => {
    if (!formData.studentId.trim()) {
      setErrors((prev) => ({
        ...prev,
        studentId: '아이디를 입력해 주세요.',
      }));
      return;
    }
    alert(`"${formData.studentId}" 아이디 중복 확인`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!userType) newErrors.userType = '가입 유형을 선택해 주세요.';
    
    if (!formData.name.trim()) newErrors.name = '이름을 입력해 주세요.';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 형식이 아닙니다.';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = '연락처를 입력해 주세요.';
    } else if (!/^\d{10,15}$/.test(formData.contact)) {
      newErrors.contact = '숫자만 입력해 주세요 (10~15자리).';
    }

    if (!formData.studentId.trim()) newErrors.studentId = '아이디를 입력해 주세요.';
    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해 주세요.';
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,15}$/.test(
        formData.password
      )
    ) {
      newErrors.password = '문자, 숫자, 특수문자 포함 8~15자리 입력하세요.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (userType === 'student') {
      // if (!formData.parentContact.trim())
      //   newErrors.parentContact = '학부모 연락처를 입력해 주세요.';
      if (!formData.school.trim()) newErrors.school = '학교를 입력해 주세요.';
      if (!formData.grade.trim()) newErrors.grade = '학년을 선택해 주세요.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    console.log('회원가입 성공:', { userType, ...formData });
    
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-transparent shadow-none border-0">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image src="/logo.svg" alt="Q-Tee Logo" width={24} height={24} />
              <h1 className="text-xl font-semibold">Q-Tee</h1>
            </div>
            <h2 className="text-lg font-medium">회원가입</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 가입 유형 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">가입 유형</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: 'teacher',
                    label: '선생님',
                    description: '학생 맞춤형 문제를 생성하고 \n 학습을 관리하는 선생님',
                  },
                  {
                    key: 'student',
                    label: '학생',
                    description: '선생님이 만든 문제를 풀고 \n 성장을 기록하는 학생',
                  },
                ].map((type) => (
                <div
                  key={type.key}
                  className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${
                    userType === type.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setUserType(type.key);
                    setFormData(initialFormData);
                    setErrors({});
                  }}                  
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </div>
                ))}
              </div>
              {errors.userType && (
                <p className="text-red-500 text-sm mt-1">{errors.userType}</p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <p>이름</p>
              <Input
                name="name"
                placeholder="이름"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* 이메일 */}
            <div>
              <p>이메일</p>
              <Input
                name="email"
                type="email"
                placeholder="이메일을 입력해 주세요"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* 연락처 */}
            <div>
              <p>연락처</p>
              <Input
                name="contact"
                type="tel"
                placeholder="연락처를 입력해 주세요"
                value={formData.contact}
                onChange={handleInputChange}
                className={errors.contact ? 'border-red-500' : ''}
              />
              {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
            </div>

            {/* 학생 추가 입력란 */}
            {userType === 'student' && (
              <>
              
                {/* 학부모 연락처 */}
                {/* <div>
                  <p>학부모 연락처</p>
                  <Input
                    name="parentContact"
                    type="tel"
                    placeholder="학부모 연락처를 입력해 주세요"
                    value={formData.parentContact}
                    onChange={handleInputChange}
                    className={errors.parentContact ? 'border-red-500' : ''}
                  />
                  {errors.parentContact && (
                    <p className="text-red-500 text-sm mt-1">{errors.parentContact}</p>
                  )}
                </div> */}

                {/* 학교 / 학년 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>학교 선택</p>
                    <select
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${
                        errors.school ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">학교 선택</option>
                      <option value="middle">중학교</option>
                      <option value="high">고등학교</option>
                    </select>
                  </div>
                  <div>
                    <p>학년 선택</p>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${
                        errors.grade ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">학년 선택</option>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* 아이디 + 중복 확인 */}
            <div>
            <p>아이디</p>
              <div className="flex gap-2">
                <Input
                  name="studentId"
                  placeholder="아이디를 입력해 주세요"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className={`flex-1 ${errors.studentId ? 'border-red-500' : ''}`}
                />
                <Button type="button" onClick={handleCheckId}>
                  중복 확인
                </Button>
              </div>
              {errors.studentId && (
                <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <p>비밀번호</p>
              <Input
                name="password"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'border-red-500' : ''}
              />
                <p className="text-xs text-gray-400 mt-1">
                  숫자, 문자, 특수문자 포함 8-15 자리 입력하세요.
                </p>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <p>비밀번호 확인</p>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/login')}
            >
              이전
            </Button>

              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                회원가입
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
