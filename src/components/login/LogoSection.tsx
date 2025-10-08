'use client';

import React from 'react';
import Image from 'next/image';
import { SplitTextAnimation } from '@/components/ui/SplitTextAnimation';
import { LayoutTextFlip } from '@/components/ui/LayoutTextFlip';

interface LogoSectionProps {
  showLoginForm: boolean;
  userType: 'teacher' | 'student' | null;
  onSignupClick: () => void;
}

export const LogoSection: React.FC<LogoSectionProps> = React.memo(({ 
  showLoginForm, 
  userType, 
  onSignupClick 
}) => {
  const teacherWords = ["문제 출제 도구", "학습 관리 시스템", "성적 분석 플랫폼", "Q-Tee 교사용"];
  const studentWords = ["학습 도우미", "문제 풀이 공간", "성장 파트너", "Q-Tee 학습용"];

  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="transform transition-all duration-300 ease-out opacity-0 animate-[fadeInUp_0.3s_ease-out_0.05s_forwards]">
          <Image 
            src="/logo.svg" 
            alt="Q-Tee Logo" 
            width={48} 
            height={48}
            className="w-12 h-12"
          />
        </div>
        <SplitTextAnimation 
          text="Q-Tee" 
          className="text-4xl font-bold text-gray-800"
          delay={50}
        />
      </div>
      
      {/* Text Flip Section */}
      <div className="mb-4">
        {!showLoginForm ? (
          <LayoutTextFlip 
            text="Q-Tee, "
            words={["스마트 학습", "스마트 채점","맞춤형 교육", "디지털 교실"]}
            duration={4000}
            className="text-lg text-gray-600"
          />
        ) : (
          <LayoutTextFlip 
            text={userType === 'teacher' ? "선생님을 위한 " : "학생을 위한 "}
            words={userType === 'teacher' ? teacherWords : studentWords}
            duration={3500}
            className="text-lg text-gray-600"
          />
        )}
      </div>
      
      {/* 회원가입 텍스트 */}
      <div className="text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 group cursor-pointer" 
          onClick={onSignupClick}
        >
          <span className="text-sm text-gray-700 font-medium">아직 계정이 없으신가요?</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-200">회원가입</span>
            <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

LogoSection.displayName = 'LogoSection';
