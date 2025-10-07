'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { UserType } from '@/types/join';

interface JoinUserTypeSelectionProps {
  userType: UserType | null;
  onUserTypeSelect: (type: UserType) => void;
}

export const JoinUserTypeSelection: React.FC<JoinUserTypeSelectionProps> = React.memo(({ 
  userType, 
  onUserTypeSelect 
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = useCallback((type: UserType) => {
    onUserTypeSelect(type);
  }, [onUserTypeSelect]);

  const handleMouseEnter = useCallback((cardType: string) => {
    setHoveredCard(cardType);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image
            src="/logo.svg"
            alt="Q-Tee Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <h1 className="text-xl font-semibold">Q-Tee</h1>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
        가입 유형을 선택해주세요
      </h2>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg mx-auto">
        {/* 선생님 카드 */}
        <div
          className={`relative overflow-hidden h-32 w-full rounded-xl cursor-pointer transition-all duration-500 ease-out transform-gpu border border-white/30 shadow-lg hover:shadow-xl ${
            userType === 'teacher'
              ? 'scale-105 z-10 ring-2 ring-white/40 shadow-xl bg-white/80'
              : hoveredCard === 'teacher'
              ? 'scale-105 z-10 bg-white/70'
              : hoveredCard && hoveredCard !== 'teacher'
              ? 'scale-95 blur-sm opacity-70'
              : 'bg-white/25 hover:bg-white/35 backdrop-blur-xl'
          }`}
          onMouseEnter={() => handleMouseEnter('teacher')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleCardClick('teacher')}
        >
          {/* 글라스모피즘 배경 레이어 */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            {/* 메인 글라스 배경 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/35 to-white/20"></div>

            {/* 컬러 그라데이션 오버레이 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br opacity-25 transition-all duration-500 ${
                userType === 'teacher' || hoveredCard === 'teacher'
                  ? 'from-blue-400/35 via-blue-300/25 to-cyan-200/15'
                  : 'from-blue-400/25 via-blue-300/15 to-transparent'
              }`}
            />

            {/* 하이라이트 효과 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-transparent to-transparent"></div>

            {/* 블러 배경 원 */}
            {(userType === 'teacher' || hoveredCard === 'teacher') && (
              <>
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl bg-blue-400/30 transition-all duration-500"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full blur-2xl bg-cyan-300/20 transition-all duration-500"></div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
            <div
              className={`mb-2 transition-all duration-500 drop-shadow-xl ${
                userType === 'teacher' || hoveredCard === 'teacher'
                  ? 'text-blue-600 scale-110'
                  : 'text-gray-500'
              }`}
            >
              <FaChalkboardTeacher className="w-10 h-10" />
            </div>

            <h3
              className={`text-lg font-bold mb-1 text-center transition-all duration-300 drop-shadow-lg ${
                userType === 'teacher' || hoveredCard === 'teacher'
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              선생님
            </h3>

            <div className="h-4 flex items-center justify-center min-w-0 w-full">
              <span
                className={`text-xs text-center font-medium transition-all duration-300 drop-shadow-md ${
                  userType === 'teacher' || hoveredCard === 'teacher'
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                문제 출제 및 학습 관리
              </span>
            </div>
          </div>
        </div>

        {/* 학생 카드 */}
        <div
          className={`relative overflow-hidden h-32 w-full rounded-xl cursor-pointer transition-all duration-500 ease-out transform-gpu border border-white/30 shadow-lg hover:shadow-xl ${
            userType === 'student'
              ? 'scale-105 z-10 ring-2 ring-white/40 shadow-xl bg-white/80'
              : hoveredCard === 'student'
              ? 'scale-105 z-10 bg-white/70'
              : hoveredCard && hoveredCard !== 'student'
              ? 'scale-95 blur-sm opacity-70'
              : 'bg-white/25 hover:bg-white/35 backdrop-blur-xl'
          }`}
          onMouseEnter={() => handleMouseEnter('student')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleCardClick('student')}
        >
          {/* 글라스모피즘 배경 레이어 */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            {/* 메인 글라스 배경 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/35 to-white/20"></div>

            {/* 컬러 그라데이션 오버레이 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br opacity-25 transition-all duration-500 ${
                userType === 'student' || hoveredCard === 'student'
                  ? 'from-green-400/35 via-emerald-300/25 to-teal-200/15'
                  : 'from-green-400/25 via-emerald-300/15 to-transparent'
              }`}
            />

            {/* 하이라이트 효과 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-transparent to-transparent"></div>

            {/* 블러 배경 원 */}
            {(userType === 'student' || hoveredCard === 'student') && (
              <>
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl bg-green-400/30 transition-all duration-500"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full blur-2xl bg-emerald-300/20 transition-all duration-500"></div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
            <div
              className={`mb-2 transition-all duration-500 drop-shadow-xl ${
                userType === 'student' || hoveredCard === 'student'
                  ? 'text-green-600 scale-110'
                  : 'text-gray-500'
              }`}
            >
              <FaUserGraduate className="w-10 h-10" />
            </div>

            <h3
              className={`text-lg font-bold mb-1 text-center transition-all duration-300 drop-shadow-lg ${
                userType === 'student' || hoveredCard === 'student'
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              학생
            </h3>

            <div className="h-4 flex items-center justify-center min-w-0 w-full">
              <span
                className={`text-xs text-center font-medium transition-all duration-300 drop-shadow-md ${
                  userType === 'student' || hoveredCard === 'student'
                    ? 'text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                문제 풀이 및 학습 참여
              </span>
            </div>
          </div>
        </div>
      </div>

      {userType && (
        <div
          className="mt-8 text-center gentle-entrance"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
          <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
        </div>
      )}
    </div>
  );
});

JoinUserTypeSelection.displayName = 'JoinUserTypeSelection';
