'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const BLUE = 'text-blue-600';
const RED = 'text-red-500';

const SCHOOL_LIST = ['학교 선택', '중학교', '고등학교'];
const GRADE_LIST = ['학년 선택', '1학년', '2학년', '3학년'];

export default function JoinPage() {
  const router = useRouter();
  const [userType, setUserType] = useState('teacher'); // 기본값 '선생님'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '', // 선생님: 연락처, 학생: 학부모 연락처
    userId: '',
    password: '',
    confirmPassword: '',
    school: '', // 학생 전용
    grade: '', // 학생 전용
  });
  const [emailMsg, setEmailMsg] = useState('');
  const [emailMsgColor, setEmailMsgColor] = useState(RED);
  const [idMsg, setIdMsg] = useState('');
  const [idMsgColor, setIdMsgColor] = useState(RED);
  const [pwMsg, setPwMsg] = useState('');
  const [pwMsgColor, setPwMsgColor] = useState(RED);
  const [emptyFields, setEmptyFields] = useState<{[key:string]:boolean}>({});
  const [pwValid, setPwValid] = useState(true);

  // 임시: 이미 가입된 이메일/아이디 목록 (실제 구현시 API로 대체)
  const usedEmails = ['test@qtee.com'];
  const usedIds = ['teacher1', 'student1'];

  // 비밀번호 유효성 검사 (영어+숫자 혼합, 4자 이상)
  const isPasswordValid = (pw: string) => {
    const hasEng = /[a-zA-Z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    return pw.length >= 4 && hasEng && hasNum;
  };

  // 입력 시 해당 필드 에러 해제
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setEmptyFields((prev) => ({ ...prev, [name]: false }));
    // 실시간 알림 초기화
    if (name === 'email') setEmailMsg('');
    if (name === 'userId') setIdMsg('');
    if (name === 'confirmPassword') setPwMsg('');
    if (name === 'password') {
      setPwValid(isPasswordValid(value));
    }
  };

  // 이메일 중복 확인
  const handleEmailBlur = () => {
    if (!formData.email) return;
    if (usedEmails.includes(formData.email)) {
      setEmailMsg('이미 가입된 메일 입니다');
      setEmailMsgColor(RED);
    } else {
      setEmailMsg('');
    }
  };

  // 아이디 중복 확인
  const handleIdCheck = () => {
    if (!formData.userId) return;
    if (usedIds.includes(formData.userId)) {
      setIdMsg('이미 존재 하는 아이디 입니다');
      setIdMsgColor(RED);
    } else {
      setIdMsg('사용 가능한 아이디입니다.');
      setIdMsgColor(BLUE);
    }
  };

  // 비밀번호 확인
  const handlePwCheck = () => {
    if (!formData.confirmPassword) return;
    if (formData.password !== formData.confirmPassword) {
      setPwMsg('입력한 비밀번호와 일치하지 않습니다.');
      setPwMsgColor(RED);
    } else {
      setPwMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmptyFields: {[key:string]:boolean} = {};
    if (!formData.name) newEmptyFields.name = true;
    if (!formData.email) newEmptyFields.email = true;
    if (userType === 'teacher') {
      if (!formData.contact) newEmptyFields.contact = true;
    } else if (userType === 'student') {
      if (!formData.contact) newEmptyFields.contact = true;
      if (!formData.school || formData.school === '학교 선택') newEmptyFields.school = true;
      if (!formData.grade || formData.grade === '학년 선택') newEmptyFields.grade = true;
    }
    if (!formData.userId) newEmptyFields.userId = true;
    if (!formData.password) newEmptyFields.password = true;
    if (!formData.confirmPassword) newEmptyFields.confirmPassword = true;
    setEmptyFields(newEmptyFields);
    if (Object.keys(newEmptyFields).length > 0) return;
    // 비밀번호 유효성 체크
    if (!isPasswordValid(formData.password)) {
      setPwValid(false);
      return;
    }
    // TODO: 회원가입 처리
    alert('회원가입 완료!');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image src="/logo.svg" alt="Q-Tee Logo" width={32} height={32} className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Q-Tee</h1>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-center mb-6">회원가입</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 가입 유형 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">가입 유형</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${userType === 'teacher' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setUserType('teacher')}
                >
                  <div className="font-medium">선생님</div>
                </div>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${userType === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setUserType('student')}
                >
                  <div className="font-medium">학생</div>
                </div>
              </div>
            </div>
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">이름</label>
              {/* 자동완성/자동저장/자동수정 off */}
              <Input id="name" name="name" type="text" placeholder="이름" value={formData.name} onChange={handleInputChange} className={`w-full${emptyFields.name ? ' border-red-500' : ''}`} autoComplete="off" autoCorrect="off" spellCheck="false" />
              {emptyFields.name && <p className="text-xs mt-1 text-red-500">이름이 입력되지 않았습니다.</p>}
            </div>
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">이메일</label>
              {/* 자동완성/자동저장/자동수정 off */}
              <Input id="email" name="email" type="email" placeholder="이메일을 입력해 주세요" value={formData.email} onChange={handleInputChange} onBlur={handleEmailBlur} className={`w-full${emptyFields.email ? ' border-red-500' : ''}`} autoComplete="off" autoCorrect="off" spellCheck="false" />
              {emptyFields.email && <p className="text-xs mt-1 text-red-500">이메일이 입력되지 않았습니다.</p>}
              {emailMsg && <p className={`text-xs mt-1 ${emailMsgColor}`}>{emailMsg}</p>}
            </div>
            {/* 연락처(선생님) / 학부모 연락처(학생) */}
            {userType === 'teacher' && (
              <div>
                <label htmlFor="contact" className="text-sm font-medium text-gray-700 mb-2 block">연락처</label>
                {/* 자동완성/자동저장/자동수정 off */}
                <Input id="contact" name="contact" type="tel" placeholder="연락처를 입력해 주세요" value={formData.contact} onChange={handleInputChange} className={`w-full${emptyFields.contact ? ' border-red-500' : ''}`} autoComplete="off" autoCorrect="off" spellCheck="false" />
                {emptyFields.contact && <p className="text-xs mt-1 text-red-500">연락처가 입력되지 않았습니다.</p>}
              </div>
            )}
            {userType === 'student' && (
              <div>
                <label htmlFor="contact" className="text-sm font-medium text-gray-700 mb-2 block">학부모 연락처</label>
                {/* 자동완성/자동저장/자동수정 off */}
                <Input id="contact" name="contact" type="tel" placeholder="학부모 연락처를 입력해 주세요" value={formData.contact} onChange={handleInputChange} className={`w-full${emptyFields.contact ? ' border-red-500' : ''}`} autoComplete="off" autoCorrect="off" spellCheck="false" />
                {emptyFields.contact && <p className="text-xs mt-1 text-red-500">학부모 연락처가 입력되지 않았습니다.</p>}
              </div>
            )}
            {/* 학교/학년 (학생만) */}
            {userType === 'student' && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="school" className="text-sm font-medium text-gray-700 mb-2 block">학교</label>
                  <select id="school" name="school" value={formData.school} onChange={handleInputChange} className={`w-full h-9 rounded-md border px-3${emptyFields.school ? ' border-red-500' : ''}`}>
                    {SCHOOL_LIST.map((school) => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                  {emptyFields.school && <p className="text-xs mt-1 text-red-500">학교가 선택되지 않았습니다.</p>}
                </div>
                <div className="w-32">
                  <label htmlFor="grade" className="text-sm font-medium text-gray-700 mb-2 block">학년</label>
                  <select id="grade" name="grade" value={formData.grade} onChange={handleInputChange} className={`w-full h-9 rounded-md border px-3${emptyFields.grade ? ' border-red-500' : ''}`}>
                    {GRADE_LIST.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  {emptyFields.grade && <p className="text-xs mt-1 text-red-500">학년이 선택되지 않았습니다.</p>}
                </div>
              </div>
            )}
            {/* 아이디 */}
            <div>
              <label htmlFor="userId" className="text-sm font-medium text-gray-700 mb-2 block">아이디</label>
              <div className="flex gap-2">
                {/* 자동완성/자동저장/자동수정 off */}
                <Input id="userId" name="userId" type="text" placeholder="아이디를 입력해 주세요" value={formData.userId} onChange={handleInputChange} className={`flex-1${emptyFields.userId ? ' border-red-500' : ''}`} autoComplete="off" autoCorrect="off" spellCheck="false" />
                <Button type="button" variant="default" className="shrink-0" onClick={handleIdCheck}>중복 확인</Button>
              </div>
              {emptyFields.userId && <p className="text-xs mt-1 text-red-500">아이디가 입력되지 않았습니다.</p>}
              {idMsg && <p className={`text-xs mt-1 ${idMsgColor}`}>{idMsg}</p>}
            </div>
            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">비밀번호</label>
              {/* 자동완성/자동저장/자동수정 off */}
              <Input id="password" name="password" type="password" placeholder="비밀번호를 입력해 주세요" value={formData.password} onChange={handleInputChange} className={`w-full${emptyFields.password || !pwValid ? ' border-red-500' : ''}`} autoComplete="new-password" autoCorrect="off" spellCheck="false" />
              {emptyFields.password && <p className="text-xs mt-1 text-red-500">비밀번호가 입력되지 않았습니다.</p>}
              {!pwValid && <p className="text-xs mt-1 text-red-500">비밀번호는 영어와 숫자를 혼합하여 4자 이상 입력해야 합니다.</p>}
              {/* 안내문구 */}
              <p className="text-xs text-gray-500 mt-1">영어와 숫자를 혼합하여 4자 이상 입력하세요.</p>
            </div>
            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">비밀번호 확인</label>
              {/* 자동완성/자동저장/자동수정 off */}
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="비밀번호를 입력해 주세요" value={formData.confirmPassword} onChange={handleInputChange} onBlur={handlePwCheck} className={`w-full${emptyFields.confirmPassword ? ' border-red-500' : ''}`} autoComplete="new-password" autoCorrect="off" spellCheck="false" />
              {emptyFields.confirmPassword && <p className="text-xs mt-1 text-red-500">비밀번호 확인이 입력되지 않았습니다.</p>}
              {pwMsg && <p className={`text-xs mt-1 ${pwMsgColor}`}>{pwMsg}</p>}
            </div>
            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>이전</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">회원가입</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
