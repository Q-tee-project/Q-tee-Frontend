'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { authService } from '@/services/authService';
import { StepNavigation } from '@/components/join';
import { Step, UserType, FormData, FieldErrors, TouchedFields } from '@/types/join';

// Lazy load form components for better performance
const BasicInfoForm = lazy(() => import('@/components/join/BasicInfoForm').then(module => ({ default: module.BasicInfoForm })));
const AccountInfoForm = lazy(() => import('@/components/join/AccountInfoForm').then(module => ({ default: module.AccountInfoForm })));
const StudentInfoForm = lazy(() => import('@/components/join/StudentInfoForm').then(module => ({ default: module.StudentInfoForm })));
const JoinBackgroundAnimation = lazy(() => import('@/components/join/JoinBackgroundAnimation').then(module => ({ default: module.JoinBackgroundAnimation })));
const JoinLoginLink = lazy(() => import('@/components/join/JoinLoginLink').then(module => ({ default: module.JoinLoginLink })));

// Memoized constants to prevent re-creation
const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
  parent_phone: '',
  school_level: 'middle',
  grade: 1,
};

const FORBIDDEN_USERNAMES = [
  'admin', 'administrator', 'root', 'test', 'user', 'null', 'undefined', 'guest', 'system',
];

export default function JoinPage() {
  const router = useRouter();
  
  // Consolidated state to reduce re-renders
  const [state, setState] = useState({
    currentStep: 1 as Step,
    userType: null as UserType | null,
    formData: INITIAL_FORM_DATA,
    isLoading: false,
    isSuccess: false,
    error: '',
    isUsernameChecked: false,
    isUsernameAvailable: false,
    isEmailChecked: false,
    isEmailAvailable: false,
    fieldErrors: {} as FieldErrors,
    touchedFields: {} as TouchedFields,
    canScrollToNext: false,
    isScrolling: false,
    isTypingPhone: false,
    hoveredCard: null as string | null,
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized scroll functions
  const scrollToSection = useCallback((sectionIndex: number) => {
    const section = sectionRefs.current[sectionIndex];
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  const handleUserTypeSelect = useCallback((type: 'teacher' | 'student') => {
    setState(prev => ({
      ...prev,
      userType: type,
      formData: INITIAL_FORM_DATA,
      fieldErrors: {},
      touchedFields: {},
      isUsernameChecked: false,
      isUsernameAvailable: false,
      isEmailChecked: false,
      isEmailAvailable: false,
      error: '',
    }));
    
    setTimeout(() => {
      setState(prev => ({ ...prev, currentStep: 2 }));
      scrollToSection(1);
    }, 100);
  }, [scrollToSection]);

  // Optimized scroll position detection
  const getMaxStep = useCallback(() => {
    return state.userType === 'teacher' ? 3 : 4;
  }, [state.userType]);

  useEffect(() => {
    const handleScrollPosition = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const currentSectionIndex = Math.round(scrollTop / sectionHeight);
      const newStep = (currentSectionIndex + 1) as Step;

      if (newStep !== state.currentStep && newStep >= 1 && newStep <= getMaxStep()) {
        setState(prev => ({ ...prev, currentStep: newStep }));
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollPosition, { passive: true });
      return () => container.removeEventListener('scroll', handleScrollPosition);
    }
  }, [state.currentStep, getMaxStep]);

  // Optimized wheel event handler
  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      // Prevent scroll if already scrolling or typing phone
      if (state.isScrolling || state.isTypingPhone) {
        e.preventDefault();
        return;
      }

      // Ignore small scroll movements
      if (Math.abs(e.deltaY) < 10) return;

      const maxStep = getMaxStep();

      // Scroll down (next section) - removed canScrollToNext requirement
      if (e.deltaY > 0 && state.currentStep < maxStep) {
        e.preventDefault();
        setState(prev => ({ ...prev, isScrolling: true }));

        const nextStep = state.currentStep + 1;
        setState(prev => ({ ...prev, currentStep: nextStep as Step }));

        setTimeout(() => scrollToSection(nextStep - 1), 50);

        // Clear scroll timeout if exists
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, isScrolling: false }));
        }, 1000);
      }
      // Scroll up (previous section)
      else if (e.deltaY < 0 && state.currentStep > 1) {
        e.preventDefault();
        setState(prev => ({ ...prev, isScrolling: true }));

        const prevStep = state.currentStep - 1;
        setState(prev => ({ ...prev, currentStep: prevStep as Step }));

        setTimeout(() => scrollToSection(prevStep - 1), 50);

        // Clear scroll timeout if exists
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, isScrolling: false }));
        }, 1000);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [state.currentStep, state.isScrolling, state.isTypingPhone, getMaxStep, scrollToSection]);

  // Memoized phone formatting function
  const formatPhoneNumber = useCallback((value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    const truncated = numbers.slice(0, 11);

    if (truncated.length <= 3) {
      return truncated;
    } else if (truncated.length <= 7) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
    } else {
      return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(7)}`;
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format phone numbers
    if (name === 'phone' || name === 'parent_phone') {
      processedValue = formatPhoneNumber(value);
    }

    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: name === 'grade' ? Number(processedValue) : processedValue,
      },
      error: '',
      // Reset validation states when input changes
      ...(name === 'username' && {
        isUsernameChecked: false,
        isUsernameAvailable: false,
        fieldErrors: Object.fromEntries(
          Object.entries(prev.fieldErrors).filter(([key]) => key !== 'username')
        ),
      }),
      ...(name === 'email' && {
        isEmailChecked: false,
        isEmailAvailable: false,
        fieldErrors: Object.fromEntries(
          Object.entries(prev.fieldErrors).filter(([key]) => key !== 'email')
        ),
      }),
      // Clear field error when user starts typing
      fieldErrors: Object.fromEntries(
        Object.entries(prev.fieldErrors).filter(([key]) => key !== name)
      ),
    }));
  }, [formatPhoneNumber]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setState(prev => {
      const updatedState = {
        ...prev,
        // Clear typing phone state
        ...(name === 'phone' || name === 'parent_phone' ? { isTypingPhone: false } : {}),
        // Mark field as touched
        touchedFields: { ...prev.touchedFields, [name]: true },
      };

      // Validate field using current state
      const trimmedValue = value.toString().trim();

      if (!trimmedValue) {
        return {
          ...updatedState,
          fieldErrors: Object.fromEntries(
            Object.entries(prev.fieldErrors).filter(([key]) => key !== name)
          ),
        };
      }

      let errorMessage: string | undefined;

      switch (name) {
        case 'name':
          errorMessage = trimmedValue.length < 2 ? '이름은 2자 이상 입력해주세요.' : undefined;
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          errorMessage = !emailRegex.test(trimmedValue) ? '올바른 이메일 형식이 아닙니다.' : undefined;
          break;
        case 'phone':
          const phoneNumbers = trimmedValue.replace(/[^\d]/g, '');
          if (phoneNumbers.length < 10) {
            errorMessage = '전화번호는 최소 10자리 이상 입력해주세요.';
          } else if (phoneNumbers.length > 11) {
            errorMessage = '전화번호는 최대 11자리까지 입력 가능합니다.';
          }
          break;
        case 'username':
          errorMessage = trimmedValue.length < 4 ? '아이디는 4자 이상 입력해주세요.' : undefined;
          break;
        case 'password':
          errorMessage = trimmedValue.length < 8 ? '비밀번호는 8자 이상 입력해주세요.' : undefined;
          break;
        case 'confirmPassword':
          errorMessage = trimmedValue !== prev.formData.password ? '비밀번호가 일치하지 않습니다.' : undefined;
          break;
        case 'parent_phone':
          if (prev.userType === 'student') {
            const parentPhoneNumbers = trimmedValue.replace(/[^\d]/g, '');
            if (parentPhoneNumbers.length < 10) {
              errorMessage = '전화번호는 최소 10자리 이상 입력해주세요.';
            } else if (parentPhoneNumbers.length > 11) {
              errorMessage = '전화번호는 최대 11자리까지 입력 가능합니다.';
            }
          }
          break;
      }

      return {
        ...updatedState,
        fieldErrors: errorMessage
          ? { ...prev.fieldErrors, [name]: errorMessage }
          : Object.fromEntries(
              Object.entries(prev.fieldErrors).filter(([key]) => key !== name)
            ),
      };
    });
  }, []);

  const handlePhoneFocus = useCallback(() => {
    setState(prev => ({ ...prev, isTypingPhone: true }));
  }, []);

  const handlePhoneKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setState(prev => ({ ...prev, isTypingPhone: false }));
      e.currentTarget.blur();
    }
  }, []);

  // Optimized validation function
  const validateField = useCallback((fieldName: string, value: string | number) => {
    const trimmedValue = value.toString().trim();
    
    if (!trimmedValue) {
      setState(prev => ({
        ...prev,
        fieldErrors: Object.fromEntries(
          Object.entries(prev.fieldErrors).filter(([key]) => key !== fieldName)
        ),
      }));
      return;
    }

    let errorMessage: string | undefined;

    switch (fieldName) {
      case 'name':
        errorMessage = trimmedValue.length < 2 ? '이름은 2자 이상 입력해주세요.' : undefined;
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        errorMessage = !emailRegex.test(trimmedValue) ? '올바른 이메일 형식이 아닙니다.' : undefined;
        break;
      case 'phone':
        const phoneNumbers = trimmedValue.replace(/[^\d]/g, '');
        if (phoneNumbers.length < 10) {
          errorMessage = '전화번호는 최소 10자리 이상 입력해주세요.';
        } else if (phoneNumbers.length > 11) {
          errorMessage = '전화번호는 최대 11자리까지 입력 가능합니다.';
        }
        break;
      case 'username':
        errorMessage = trimmedValue.length < 4 ? '아이디는 4자 이상 입력해주세요.' : undefined;
        break;
      case 'password':
        errorMessage = trimmedValue.length < 8 ? '비밀번호는 8자 이상 입력해주세요.' : undefined;
        break;
      case 'confirmPassword':
        errorMessage = trimmedValue !== state.formData.password ? '비밀번호가 일치하지 않습니다.' : undefined;
        break;
      case 'parent_phone':
        if (state.userType === 'student') {
          const parentPhoneNumbers = trimmedValue.replace(/[^\d]/g, '');
          if (parentPhoneNumbers.length < 10) {
            errorMessage = '전화번호는 최소 10자리 이상 입력해주세요.';
          } else if (parentPhoneNumbers.length > 11) {
            errorMessage = '전화번호는 최대 11자리까지 입력 가능합니다.';
          }
        }
        break;
    }

    setState(prev => ({
      ...prev,
      fieldErrors: errorMessage 
        ? { ...prev.fieldErrors, [fieldName]: errorMessage }
        : Object.fromEntries(
            Object.entries(prev.fieldErrors).filter(([key]) => key !== fieldName)
          ),
    }));
  }, [state.formData.password, state.userType]);

  // Update scroll capability when step completion changes
  useEffect(() => {
    const { currentStep, userType, formData, fieldErrors, isUsernameChecked, isUsernameAvailable } = state;
    
    const isFieldValid = (fieldName: string, value: any, additionalChecks?: () => boolean): boolean => {
      const hasValue = typeof value === 'string' ? value.trim() : Boolean(value);
      const hasNoError = !fieldErrors[fieldName];
      const passesAdditionalChecks = additionalChecks ? additionalChecks() : true;
      return Boolean(hasValue && hasNoError && passesAdditionalChecks);
    };

    let canScroll = false;
    switch (currentStep) {
      case 1:
        canScroll = userType !== null;
        break;
      case 2:
        canScroll = (
          isFieldValid('name', formData.name) &&
          isFieldValid('email', formData.email) &&
          isFieldValid('phone', formData.phone)
        );
        break;
      case 3:
        canScroll = (
          isFieldValid('username', formData.username, () => isUsernameChecked && isUsernameAvailable) &&
          isFieldValid('password', formData.password, () => formData.password.length >= 8) &&
          isFieldValid('confirmPassword', formData.confirmPassword, () => formData.password === formData.confirmPassword)
        );
        break;
      case 4:
        canScroll = userType === 'student' ? isFieldValid('parent_phone', formData.parent_phone) : true;
        break;
      default:
        canScroll = false;
    }

    setState(prev => ({ ...prev, canScrollToNext: canScroll }));
  }, [
    state.currentStep,
    state.userType,
    state.formData.name,
    state.formData.email,
    state.formData.phone,
    state.formData.username,
    state.formData.password,
    state.formData.confirmPassword,
    state.formData.parent_phone,
    state.fieldErrors,
    state.isUsernameChecked,
    state.isUsernameAvailable,
  ]);

  // Optimized username check function
  const handleUsernameCheck = useCallback(async () => {
    const { formData, isLoading } = state;
    
    if (!formData.username.trim()) {
      setState(prev => ({ ...prev, error: '아이디를 입력해주세요.' }));
      return;
    }

    const username = formData.username.trim();
    
    if (username.length < 4) {
      setState(prev => ({ 
        ...prev, 
        error: `💡 아이디는 4자 이상 입력해주세요. (현재 ${username.length}자)` 
      }));
      return;
    }

    if (username.length > 20) {
      setState(prev => ({ ...prev, error: '아이디는 20자 이하로 입력해주세요.' }));
      return;
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
      setState(prev => ({ ...prev, error: '아이디는 영문으로 시작하고, 영문, 숫자, 밑줄(_)만 사용 가능합니다.' }));
      return;
    }

    if (FORBIDDEN_USERNAMES.includes(username.toLowerCase())) {
      setState(prev => ({ ...prev, error: '사용할 수 없는 아이디입니다.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const result = await authService.checkUsernameAvailability(username);
      setState(prev => ({
        ...prev,
        isUsernameChecked: true,
        isUsernameAvailable: result.available,
        error: result.available ? '' : (result.message || '이미 사용 중인 아이디입니다.'),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Username check failed:', error);
      setState(prev => ({
        ...prev,
        error: '중복 체크 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUsernameChecked: false,
        isUsernameAvailable: false,
        isLoading: false,
      }));
    }
  }, [state.formData.username, state.isLoading]);

  // Optimized email check function
  const handleEmailCheck = useCallback(async () => {
    const { formData, isLoading } = state;
    
    if (!formData.email.trim()) {
      setState(prev => ({ ...prev, error: '이메일을 입력해주세요.' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setState(prev => ({ ...prev, error: '올바른 이메일 형식이 아닙니다.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const result = await authService.checkEmailAvailability(formData.email.trim());
      setState(prev => ({
        ...prev,
        isEmailChecked: true,
        isEmailAvailable: result.available,
        error: result.available ? '' : '이미 사용 중인 이메일입니다.',
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Email check failed:', error);
      setState(prev => ({
        ...prev,
        error: '중복 체크 중 오류가 발생했습니다. 다시 시도해주세요.',
        isEmailChecked: false,
        isEmailAvailable: false,
        isLoading: false,
      }));
    }
  }, [state.formData.email, state.isLoading]);

  // Optimized submit handlers
  const handleSubmitStep = useCallback(() => {
    const { userType, currentStep } = state;
    
    if ((userType === 'teacher' && currentStep === 3) || 
        (userType === 'student' && currentStep === 4)) {
      handleSubmit();
    }
  }, [state.userType, state.currentStep]);

  const handleSubmit = useCallback(async () => {
    const { userType, formData } = state;
    
    setState(prev => ({ ...prev, isLoading: true, error: '' }));

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

      setState(prev => ({ ...prev, isSuccess: true }));
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
      
      if (error?.message) {
        if (error.message.includes('Network connection failed')) {
          errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (error.message.includes('already exists') || error.message.includes('이미 존재')) {
          errorMessage = '이미 사용 중인 아이디입니다. 다른 아이디를 선택해주세요.';
          setState(prev => ({
            ...prev,
            isUsernameChecked: false,
            isUsernameAvailable: false,
            currentStep: 3,
          }));
        } else if (error.message.includes('email') && error.message.includes('already')) {
          errorMessage = '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.';
          setState(prev => ({ ...prev, currentStep: 2 }));
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [state.userType, state.formData, router]);

  const handleLoginClick = useCallback(() => {
    router.push('/');
  }, [router]);

  // Memoized render functions
  const renderCurrentSection = useMemo(() => {
    const { currentStep, formData, fieldErrors, touchedFields, isLoading, isUsernameChecked, isUsernameAvailable, isEmailChecked, isEmailAvailable } = state;
    
    switch (currentStep) {
      case 2:
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl" />}>
            <BasicInfoForm
              formData={formData}
              fieldErrors={fieldErrors}
              touchedFields={touchedFields}
              onInputChange={handleInputChange}
              onInputBlur={handleInputBlur}
              onPhoneFocus={handlePhoneFocus}
              onPhoneKeyDown={handlePhoneKeyDown}
              isLoading={isLoading}
              isEmailChecked={isEmailChecked}
              isEmailAvailable={isEmailAvailable}
              onEmailCheck={handleEmailCheck}
            />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl" />}>
            <AccountInfoForm
              formData={formData}
              fieldErrors={fieldErrors}
              touchedFields={touchedFields}
              isLoading={isLoading}
              isUsernameChecked={isUsernameChecked}
              isUsernameAvailable={isUsernameAvailable}
              onInputChange={handleInputChange}
              onInputBlur={handleInputBlur}
              onUsernameCheck={handleUsernameCheck}
            />
          </Suspense>
        );
      case 4:
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl" />}>
            <StudentInfoForm
              formData={formData}
              fieldErrors={fieldErrors}
              touchedFields={touchedFields}
              onInputChange={handleInputChange}
              onInputBlur={handleInputBlur}
              onPhoneFocus={handlePhoneFocus}
              onPhoneKeyDown={handlePhoneKeyDown}
            />
          </Suspense>
        );
      default:
        return null;
    }
  }, [
    state.currentStep,
    state.formData,
    state.fieldErrors,
    state.touchedFields,
    state.isLoading,
    state.isUsernameChecked,
    state.isUsernameAvailable,
    state.isEmailChecked,
    state.isEmailAvailable,
    handleInputChange,
    handleInputBlur,
    handlePhoneFocus,
    handlePhoneKeyDown,
    handleEmailCheck,
    handleUsernameCheck,
  ]);

  // Memoized utility functions
  const getStepTitle = useCallback(() => {
    switch (state.currentStep) {
      case 1: return '가입 유형 선택';
      case 2: return '기본 정보 입력';
      case 3: return '계정 정보 입력';
      case 4: return '추가 정보 입력';
      default: return '회원가입';
    }
  }, [state.currentStep]);

  const getButtonText = useCallback(() => {
    const maxStep = getMaxStep();
    if (state.currentStep === maxStep) {
      return state.isLoading ? '가입 중...' : '회원가입';
    }
    return '다음';
  }, [state.currentStep, state.isLoading, getMaxStep]);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100/80 to-blue-200/60 relative"
    >
      {/* Optimized background - reduced animations for better performance */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100" />}>
        <JoinBackgroundAnimation />
      </Suspense>
      {/* Step Navigation */}
      <StepNavigation 
        currentStep={state.currentStep} 
        maxStep={getMaxStep()} 
        userType={state.userType} 
      />

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="snap-y snap-mandatory h-screen overflow-y-auto relative z-10"
      >
        {/* Section 1: User Type Selection */}
        <div
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
        >
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
              {/* Teacher Card */}
              <div
                className={`relative overflow-hidden h-32 w-full rounded-xl cursor-pointer transition-all duration-300 ease-out transform-gpu border border-white/30 shadow-lg hover:shadow-xl ${
                  state.userType === 'teacher'
                    ? 'scale-105 z-10 ring-2 ring-white/40 shadow-xl bg-white/80'
                    : state.hoveredCard === 'teacher'
                    ? 'scale-105 z-10 bg-white/70'
                    : state.hoveredCard && state.hoveredCard !== 'teacher'
                    ? 'scale-95 blur-sm opacity-70'
                    : 'bg-white/25 hover:bg-white/35 backdrop-blur-xl'
                }`}
                onMouseEnter={() => setState(prev => ({ ...prev, hoveredCard: 'teacher' }))}
                onMouseLeave={() => setState(prev => ({ ...prev, hoveredCard: null }))}
                onClick={() => handleUserTypeSelect('teacher')}
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/35 to-white/20"></div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-25 transition-all duration-300 ${
                      state.userType === 'teacher' || state.hoveredCard === 'teacher'
                        ? 'from-blue-400/35 via-blue-300/25 to-cyan-200/15'
                        : 'from-blue-400/25 via-blue-300/15 to-transparent'
                    }`}
                  />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                  <div
                    className={`mb-2 transition-all duration-300 ${
                      state.userType === 'teacher' || state.hoveredCard === 'teacher'
                        ? 'text-blue-600 scale-110'
                        : 'text-gray-500'
                    }`}
                  >
                    <FaChalkboardTeacher className="w-10 h-10" />
                  </div>

                  <h3
                    className={`text-lg font-bold mb-1 text-center transition-all duration-300 ${
                      state.userType === 'teacher' || state.hoveredCard === 'teacher'
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    선생님
                  </h3>

                  <div className="h-4 flex items-center justify-center min-w-0 w-full">
                    <span
                      className={`text-xs text-center font-medium transition-all duration-300 ${
                        state.userType === 'teacher' || state.hoveredCard === 'teacher'
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      문제 출제 및 학습 관리
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Card */}
              <div
                className={`relative overflow-hidden h-32 w-full rounded-xl cursor-pointer transition-all duration-300 ease-out transform-gpu border border-white/30 shadow-lg hover:shadow-xl ${
                  state.userType === 'student'
                    ? 'scale-105 z-10 ring-2 ring-white/40 shadow-xl bg-white/80'
                    : state.hoveredCard === 'student'
                    ? 'scale-105 z-10 bg-white/70'
                    : state.hoveredCard && state.hoveredCard !== 'student'
                    ? 'scale-95 blur-sm opacity-70'
                    : 'bg-white/25 hover:bg-white/35 backdrop-blur-xl'
                }`}
                onMouseEnter={() => setState(prev => ({ ...prev, hoveredCard: 'student' }))}
                onMouseLeave={() => setState(prev => ({ ...prev, hoveredCard: null }))}
                onClick={() => handleUserTypeSelect('student')}
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/35 to-white/20"></div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-25 transition-all duration-300 ${
                      state.userType === 'student' || state.hoveredCard === 'student'
                        ? 'from-green-400/35 via-emerald-300/25 to-teal-200/15'
                        : 'from-green-400/25 via-emerald-300/15 to-transparent'
                    }`}
                  />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                  <div
                    className={`mb-2 transition-all duration-300 ${
                      state.userType === 'student' || state.hoveredCard === 'student'
                        ? 'text-green-600 scale-110'
                        : 'text-gray-500'
                    }`}
                  >
                    <FaUserGraduate className="w-10 h-10" />
                  </div>

                  <h3
                    className={`text-lg font-bold mb-1 text-center transition-all duration-300 ${
                      state.userType === 'student' || state.hoveredCard === 'student'
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    학생
                  </h3>

                  <div className="h-4 flex items-center justify-center min-w-0 w-full">
                    <span
                      className={`text-xs text-center font-medium transition-all duration-300 ${
                        state.userType === 'student' || state.hoveredCard === 'student'
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

            {state.userType && (
              <div className="mt-8 text-center animate-fade-in">
                <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
                <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Basic Info */}
        {state.userType && (
          <div
            ref={(el) => { sectionRefs.current[1] = el; }}
            className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
          >
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
                기본 정보를 입력해주세요
              </h2>

              {state.error && (
                <div className="text-red-600 text-sm text-center bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-100 font-medium mb-6">
                  {state.error}
                </div>
              )}

              <div className="space-y-6">{renderCurrentSection}</div>
            </div>

            {state.canScrollToNext && state.currentStep === 2 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center animate-fade-in">
                <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
                <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
              </div>
            )}
          </div>
        )}

        {/* Section 3: Account Info */}
        {state.userType && (
          <div
            ref={(el) => { sectionRefs.current[2] = el; }}
            className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
          >
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
                계정 정보를 입력해주세요
              </h2>

              <div className="space-y-6">{renderCurrentSection}</div>
            </div>

            {/* Teacher Submit Button */}
            {state.userType === 'teacher' && state.canScrollToNext && state.currentStep === 3 && (
              <div className="absolute bottom-32 left-1/2 w-full max-w-md text-center animate-fade-in">
                <Button
                  type="button"
                  className={`w-full h-12 glass-button font-semibold transition-all duration-300 ${
                    state.isSuccess
                      ? 'bg-green-600/70 hover:bg-green-600/80 border border-green-400/60 hover:border-green-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 focus:ring-2 focus:ring-green-400/60 focus:bg-green-600/85'
                      : 'bg-blue-600/70 hover:bg-blue-600/80 border border-blue-400/60 hover:border-blue-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400/60 focus:bg-blue-600/85'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={handleSubmitStep}
                  disabled={state.isLoading}
                >
                  <div className="flex items-center justify-center">
                    {state.isSuccess ? (
                      <Check className="w-5 h-5 text-white success-check" strokeWidth={3} />
                    ) : state.isLoading ? (
                      '가입 중...'
                    ) : (
                      '회원가입'
                    )}
                  </div>
                </Button>
              </div>
            )}

            {/* Student Continue Hint */}
            {state.userType === 'student' && state.canScrollToNext && state.currentStep === 3 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center animate-fade-in">
                <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
                <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
              </div>
            )}
          </div>
        )}

        {/* Section 4: Student Additional Info */}
        {state.userType === 'student' && (
          <div
            ref={(el) => { sectionRefs.current[3] = el; }}
            className="snap-start h-screen flex items-center justify-center p-4 pt-8 relative"
          >
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
                학생 정보를 입력해주세요
              </h2>

              <div className="space-y-6">{renderCurrentSection}</div>
            </div>

            {state.canScrollToNext && state.currentStep === 4 && (
              <div className="absolute bottom-32 left-1/2 w-full max-w-md text-center animate-fade-in">
                <Button
                  type="button"
                  className={`w-full h-12 glass-button font-semibold transition-all duration-300 ${
                    state.isSuccess
                      ? 'bg-green-600/70 hover:bg-green-600/80 border border-green-400/60 hover:border-green-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 focus:ring-2 focus:ring-green-400/60 focus:bg-green-600/85'
                      : 'bg-blue-600/70 hover:bg-blue-600/80 border border-blue-400/60 hover:border-blue-300/80 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400/60 focus:bg-blue-600/85'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={handleSubmitStep}
                  disabled={state.isLoading}
                >
                  <div className="flex items-center justify-center">
                    {state.isSuccess ? (
                      <Check className="w-5 h-5 text-white success-check" strokeWidth={3} />
                    ) : state.isLoading ? (
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

      {/* Login Link */}
      <Suspense fallback={<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-48 h-12 bg-white/20 rounded-full animate-pulse" />}>
        <JoinLoginLink onLoginClick={handleLoginClick} />
      </Suspense>
    </div>
  );
}
