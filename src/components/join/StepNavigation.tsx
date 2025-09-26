'use client';

import React from 'react';
import { User, Mail, Lock, GraduationCap } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  maxStep: number;
  userType: 'teacher' | 'student' | null;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  maxStep,
  userType,
}) => {
  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-4 h-4" />;
      case 2: return <Mail className="w-4 h-4" />;
      case 3: return <Lock className="w-4 h-4" />;
      case 4: return <GraduationCap className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!userType) return null;

  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-[420px] -translate-y-1/2 z-50 animate-in fade-in slide-in-from-left-2 duration-700 ease-out delay-300">
      <div className="flex flex-col items-center bg-transparent backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/50">
        {Array.from({ length: maxStep }, (_, index) => (
          <React.Fragment key={index + 1}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-600 ease-in-out relative overflow-hidden ${
                currentStep >= index + 1
                  ? 'text-white shadow-lg scale-110 transform'
                  : currentStep === index + 1
                  ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200 scale-105 transform'
                  : 'bg-gray-100 text-gray-400 scale-100 transform'
              }`}
            >
              {/* 배경 그라데이션 - 아래에서 위로 채워짐/위에서 아래로 빠짐 */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-600 transition-all duration-700 ease-in-out ${
                  currentStep >= index + 1 
                    ? 'translate-y-0 delay-500' 
                    : currentStep < index + 1 
                    ? '-translate-y-full'
                    : 'translate-y-full delay-300'
                }`}
              />
              
              {/* 진행 중일 때 펄스 효과 */}
              {currentStep === index + 1 && (
                <div className="absolute inset-0 rounded-full bg-blue-600 animate-pulse opacity-30 transition-opacity duration-500"></div>
              )}
              
              {/* 완료된 단계에 대한 추가 글로우 효과 */}
              {currentStep >= index + 1 && (
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-10 animate-pulse transition-all duration-700"></div>
              )}
              
              {/* 아이콘 */}
              <div className="relative z-10 transition-all duration-300">
                {getStepIcon(index + 1)}
              </div>
            </div>
            
            {index < maxStep - 1 && (
              <div className="h-6 w-0.5 bg-gray-200 relative overflow-hidden my-2">
                <div
                  className={`w-full bg-gradient-to-b from-blue-500 to-blue-600 transition-all duration-600 ease-in-out ${
                    currentStep > index + 1 
                      ? 'h-full' 
                      : 'h-0 delay-500'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
