'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BasicInfoForm, AccountInfoForm, StudentInfoForm } from '@/components/join';
import { Step, UserType, FormData, FieldErrors, TouchedFields } from '@/types/join';

interface JoinScrollContainerProps {
  currentStep: Step;
  userType: UserType | null;
  formData: FormData;
  fieldErrors: FieldErrors;
  touchedFields: TouchedFields;
  isLoading: boolean;
  isSuccess: boolean;
  isUsernameChecked: boolean;
  isUsernameAvailable: boolean;
  error: string;
  canScrollToNext: boolean;
  isTypingPhone: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPhoneFocus: () => void;
  onPhoneKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUsernameCheck: () => void;
  onSubmitStep: () => void;
  onScrollToSection: (sectionIndex: number) => void;
}

export const JoinScrollContainer: React.FC<JoinScrollContainerProps> = React.memo(({
  currentStep,
  userType,
  formData,
  fieldErrors,
  touchedFields,
  isLoading,
  isSuccess,
  isUsernameChecked,
  isUsernameAvailable,
  error,
  canScrollToNext,
  isTypingPhone,
  onInputChange,
  onInputBlur,
  onPhoneFocus,
  onPhoneKeyDown,
  onUsernameCheck,
  onSubmitStep,
  onScrollToSection
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = useCallback((sectionIndex: number) => {
    const section = sectionRefs.current[sectionIndex];
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  // 스크롤 위치 감지 및 currentStep 업데이트
  useEffect(() => {
    const handleScrollPosition = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const currentSectionIndex = Math.round(scrollTop / sectionHeight);
      const newStep = (currentSectionIndex + 1) as Step;

      if (newStep !== currentStep && newStep >= 1 && newStep <= getMaxStep()) {
        onScrollToSection(newStep - 1);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollPosition);
      return () => container.removeEventListener('scroll', handleScrollPosition);
    }
  }, [currentStep, onScrollToSection]);

  const getMaxStep = useCallback(() => {
    return userType === 'teacher' ? 3 : 4;
  }, [userType]);

  const renderCurrentSection = useMemo(() => {
    switch (currentStep) {
      case 2:
        return (
          <BasicInfoForm
            formData={formData}
            fieldErrors={fieldErrors}
            touchedFields={touchedFields}
            onInputChange={onInputChange}
            onInputBlur={onInputBlur}
            onPhoneFocus={onPhoneFocus}
            onPhoneKeyDown={onPhoneKeyDown}
          />
        );
      case 3:
        return (
          <AccountInfoForm
            formData={formData}
            fieldErrors={fieldErrors}
            touchedFields={touchedFields}
            isLoading={isLoading}
            isUsernameChecked={isUsernameChecked}
            isUsernameAvailable={isUsernameAvailable}
            onInputChange={onInputChange}
            onInputBlur={onInputBlur}
            onUsernameCheck={onUsernameCheck}
          />
        );
      case 4:
        return (
          <StudentInfoForm
            formData={formData}
            fieldErrors={fieldErrors}
            touchedFields={touchedFields}
            onInputChange={onInputChange}
            onInputBlur={onInputBlur}
            onPhoneFocus={onPhoneFocus}
            onPhoneKeyDown={onPhoneKeyDown}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    formData,
    fieldErrors,
    touchedFields,
    isLoading,
    isUsernameChecked,
    isUsernameAvailable,
    onInputChange,
    onInputBlur,
    onPhoneFocus,
    onPhoneKeyDown,
    onUsernameCheck
  ]);

  const getStepTitle = useCallback(() => {
    switch (currentStep) {
      case 1:
        return '가입 유형 선택';
      case 2:
        return '기본 정보 입력';
      case 3:
        return '계정 정보 입력';
      case 4:
        return '추가 정보 입력';
      default:
        return '회원가입';
    }
  }, [currentStep]);

  return (
    <div
      ref={scrollContainerRef}
      className="snap-y snap-mandatory h-screen overflow-y-auto relative z-10"
    >
      {/* 섹션 2: 기본 정보 */}
      {userType && (
        <div
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
        >
          <div className="w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
              기본 정보를 입력해주세요
            </h2>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-100 font-medium mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">{renderCurrentSection}</div>
          </div>

          {/* 절대 위치 하단 영역 */}
          {canScrollToNext && currentStep === 2 && (
            <div
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center soft-entrance"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
              <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
            </div>
          )}
        </div>
      )}

      {/* 섹션 3: 계정 정보 */}
      {userType && (
        <div
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
        >
          <div className="w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
              계정 정보를 입력해주세요
            </h2>

            <div className="space-y-6">{renderCurrentSection}</div>
          </div>

          {/* 절대 위치 하단 영역 */}
          {userType === 'teacher' && canScrollToNext && currentStep === 3 && (
            <div
              className="absolute bottom-32 left-1/2 w-full max-w-md text-center"
              style={{
                opacity: 0,
                transform: 'translateX(-50%) translateY(20px)',
                animation: 'slideUpFadeIn 0.8s ease-out 0.3s forwards',
              }}
            >
              <Button
                type="button"
                className={`w-full h-12 glass-button font-semibold transition-all duration-300 ${
                  isSuccess
                    ? 'bg-green-600/70 hover:bg-green-600/80 border border-green-400/60 hover:border-green-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 focus:ring-2 focus:ring-green-400/60 focus:bg-green-600/85'
                    : 'bg-blue-600/70 hover:bg-blue-600/80 border border-blue-400/60 hover:border-blue-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400/60 focus:bg-blue-600/85'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={onSubmitStep}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center">
                  {isSuccess ? (
                    <Check className="w-5 h-5 text-white success-check" strokeWidth={3} />
                  ) : isLoading ? (
                    '가입 중...'
                  ) : (
                    '회원가입'
                  )}
                </div>
              </Button>
            </div>
          )}

          {userType === 'student' && canScrollToNext && currentStep === 3 && (
            <div
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center soft-entrance"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
              <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
            </div>
          )}
        </div>
      )}

      {/* 섹션 4: 학생 추가 정보 */}
      {userType === 'student' && (
        <div
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
        >
          <div className="w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
              학생 정보를 입력해주세요
            </h2>

            <div className="space-y-6">{renderCurrentSection}</div>
          </div>

          {canScrollToNext && currentStep === 4 && (
            <div
              className="absolute bottom-32 left-1/2 w-full max-w-md text-center"
              style={{
                opacity: 0,
                transform: 'translateX(-50%) translateY(20px)',
                animation: 'slideUpFadeIn 0.8s ease-out 0.3s forwards',
              }}
            >
              <Button
                type="button"
                className={`w-full h-12 glass-button font-semibold transition-all duration-300 ${
                  isSuccess
                    ? 'bg-green-600/70 hover:bg-green-600/80 border border-green-400/60 hover:border-green-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 focus:ring-2 focus:ring-green-400/60 focus:bg-green-600/85'
                    : 'bg-blue-600/70 hover:bg-blue-600/80 border border-blue-400/60 hover:border-blue-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400/60 focus:bg-blue-600/85'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={onSubmitStep}
                disabled={isLoading}
              >
                <div className="flex items-center justify-center">
                  {isSuccess ? (
                    <Check className="w-5 h-5 text-white success-check" strokeWidth={3} />
                  ) : isLoading ? (
                    '가입 중...'
                  ) : (
                    '회원가입'
                  )}
                </div>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

JoinScrollContainer.displayName = 'JoinScrollContainer';
