'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, GraduationCap, User, AlertCircle, Mail, Lock, Check } from 'lucide-react';
import { authService } from '@/services/authService';
import { 
  BasicInfoForm, 
  AccountInfoForm, 
  StudentInfoForm, 
  StepNavigation 
} from '@/components/join';
import { Step, UserType, FormData, FieldErrors, TouchedFields } from '@/types/join';

export default function JoinPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    parent_phone: '',
    school_level: 'middle',
    grade: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  
  // 스크롤 관련 refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollToNext, setCanScrollToNext] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isTypingPhone, setIsTypingPhone] = useState(false);

  // 스크롤 함수들
  const scrollToSection = (sectionIndex: number) => {
    const section = sectionRefs.current[sectionIndex];
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleUserTypeSelect = (type: 'teacher' | 'student') => {
    setUserType(type);
    resetFormData();
    setTimeout(() => {
      setCurrentStep(2); // 먼저 단계를 업데이트
      scrollToSection(1); // 기본 정보 입력으로 스크롤
    }, 100);
  };

  // 스크롤 위치 감지 및 currentStep 업데이트
  useEffect(() => {
    const handleScrollPosition = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const currentSectionIndex = Math.round(scrollTop / sectionHeight);
      const newStep = (currentSectionIndex + 1) as Step;
      
      console.log('스크롤 위치 감지:', { scrollTop, sectionHeight, currentSectionIndex, newStep });
      
      if (newStep !== currentStep && newStep >= 1 && newStep <= getMaxStep()) {
        setCurrentStep(newStep);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollPosition);
      return () => container.removeEventListener('scroll', handleScrollPosition);
    }
  }, [currentStep]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = (e: WheelEvent) => {
      console.log('휠 이벤트 감지:', { deltaY: e.deltaY, isScrolling });
      
      // 이미 스크롤 중이면 무시
      if (isScrolling) {
        console.log('스크롤 중이라 무시');
        e.preventDefault();
        return;
      }

      // 스크롤 감도 조절 (더 민감하게)
      if (Math.abs(e.deltaY) < 0.1) {
        console.log('스크롤 감도 부족:', Math.abs(e.deltaY));
        return;
      }

      // 아래로 스크롤 (다음 섹션으로)
      if (e.deltaY > 0) {
        console.log('스크롤 다운 시도:', { currentStep, canScrollToNext, maxStep: getMaxStep() });
        
        if (!canScrollToNext || isTypingPhone) {
          console.log('스크롤 차단됨:', { canScrollToNext, isTypingPhone });
          e.preventDefault();
          return;
        }
        
        if (currentStep < getMaxStep()) {
          e.preventDefault();
          setIsScrolling(true);
          
          const nextStep = currentStep + 1;
          const sectionIndex = nextStep - 1;
          console.log('스크롤 실행:', { currentStep, nextStep, sectionIndex });
          
          // 먼저 아이콘 상태를 업데이트하고 스크롤
          setCurrentStep(nextStep as Step);
          setTimeout(() => {
            scrollToSection(sectionIndex); // 인덱스는 0부터 시작하므로 step에서 1을 빼줌
          }, 50);
          
          // 스크롤 완료 후 1초 뒤에 다시 스크롤 가능하도록
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
          }, 1000);
        } else {
          console.log('스크롤 차단됨: 마지막 단계임');
        }
      } 
      // 위로 스크롤 (이전 섹션으로)
      else if (e.deltaY < 0 && currentStep > 1) {
        console.log('스크롤 업 시도:', { currentStep, deltaY: e.deltaY });
        
        e.preventDefault();
        setIsScrolling(true);
        
        const prevStep = currentStep - 1;
        console.log('스크롤 업 실행:', { currentStep, prevStep });
        
        setCurrentStep(prevStep as Step);
        setTimeout(() => {
          scrollToSection(prevStep - 1); // 인덱스는 0부터 시작
        }, 50);
        
        // 스크롤 완료 후 1초 뒤에 다시 스크롤 가능하도록
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 1000);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
      
      // 전체 document에도 이벤트 리스너 추가 (fallback)
      document.addEventListener('wheel', handleScroll, { passive: false });
      
      return () => {
        container.removeEventListener('wheel', handleScroll);
        document.removeEventListener('wheel', handleScroll);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  }, [currentStep, canScrollToNext, isScrolling, isTypingPhone]);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 11자리 초과 방지
    const truncated = numbers.slice(0, 11);
    
    // 포맷팅 적용
    if (truncated.length <= 3) {
      return truncated;
    } else if (truncated.length <= 7) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
    } else {
      return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(7)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // 연락처 필드인 경우 포맷팅 적용
    if (name === 'phone' || name === 'parent_phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    const newFormData = {
      ...formData,
      [name]: name === 'grade' ? Number(processedValue) : processedValue,
    };
    
    setFormData(newFormData);
    setError('');
    
    // 아이디가 변경되면 중복체크 초기화
    if (name === 'username') {
      setIsUsernameChecked(false);
      setIsUsernameAvailable(false);
      
      // 아이디 필드의 에러도 초기화 (새로운 입력을 위해)
      if (fieldErrors.username) {
        const newFieldErrors = { ...fieldErrors };
        delete newFieldErrors.username;
        setFieldErrors(newFieldErrors);
      }
      
      // 실시간 아이디 형식 검증 (에러는 blur 시에만 표시)
      const username = value.trim();
      if (username.length > 0) {
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        const forbiddenUsernames = ['admin', 'administrator', 'root', 'test', 'user', 'null', 'undefined', 'guest', 'system'];
        
        if (username.length >= 4 && username.length <= 20 && 
            usernameRegex.test(username) && 
            !forbiddenUsernames.includes(username.toLowerCase())) {
          // 유효한 형식이면 에러 제거
          setError('');
        }
      }
    }
    
    // 입력 중에는 기존 에러만 지우고 새로운 에러는 표시하지 않음
    if (fieldErrors[name]) {
      const newFieldErrors = { ...fieldErrors };
      delete newFieldErrors[name];
      setFieldErrors(newFieldErrors);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 필드에서 블러가 발생하면 타이핑 상태 해제
    if (name === 'phone' || name === 'parent_phone') {
      setIsTypingPhone(false);
    }
    
    // 필드가 터치되었음을 표시
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // 유효성 검사 수행
    validateField(name, value);
  };

  // 전화번호 필드 포커스 핸들러
  const handlePhoneFocus = () => {
    setIsTypingPhone(true);
  };

  // 전화번호 필드 키다운 핸들러
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 엔터키를 누르면 타이핑 상태 해제
    if (e.key === 'Enter') {
      setIsTypingPhone(false);
      e.currentTarget.blur(); // 포커스 해제
    }
  };

  const validateField = (fieldName: string, value: string | number) => {
    const newFieldErrors = { ...fieldErrors };
    const trimmedValue = value.toString().trim();
    
    // 입력된 값이 없으면 에러 메시지를 표시하지 않음
    if (!trimmedValue) {
      delete newFieldErrors[fieldName];
      setFieldErrors(newFieldErrors);
      return;
    }
    
    switch (fieldName) {
      case 'name':
        if (trimmedValue.length < 2) {
          newFieldErrors.name = '이름은 2자 이상 입력해주세요.';
        } else {
          delete newFieldErrors.name;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          newFieldErrors.email = '올바른 이메일 형식이 아닙니다.';
        } else {
          delete newFieldErrors.email;
        }
        break;
        
      case 'phone':
        // 숫자만 추출하여 10-11자리 검증
        const phoneNumbers = trimmedValue.replace(/[^\d]/g, '');
        if (phoneNumbers.length < 10) {
          newFieldErrors.phone = '전화번호는 최소 10자리 이상 입력해주세요.';
        } else if (phoneNumbers.length > 11) {
          newFieldErrors.phone = '전화번호는 최대 11자리까지 입력 가능합니다.';
        } else {
          delete newFieldErrors.phone;
        }
        break;
        
      case 'username':
        if (trimmedValue.length < 4) {
          newFieldErrors.username = '아이디는 4자 이상 입력해주세요.';
        } else {
          delete newFieldErrors.username;
        }
        break;
        
      case 'password':
        if (trimmedValue.length < 8) {
          newFieldErrors.password = '비밀번호는 8자 이상 입력해주세요.';
        } else {
          delete newFieldErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (trimmedValue !== formData.password) {
          newFieldErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        } else {
          delete newFieldErrors.confirmPassword;
        }
        break;
        
      case 'parent_phone':
        if (userType === 'student') {
          // 숫자만 추출하여 10-11자리 검증
          const parentPhoneNumbers = trimmedValue.replace(/[^\d]/g, '');
          if (parentPhoneNumbers.length < 10) {
            newFieldErrors.parent_phone = '전화번호는 최소 10자리 이상 입력해주세요.';
          } else if (parentPhoneNumbers.length > 11) {
            newFieldErrors.parent_phone = '전화번호는 최대 11자리까지 입력 가능합니다.';
          } else {
            delete newFieldErrors.parent_phone;
          }
        }
        break;
    }
    
    setFieldErrors(newFieldErrors);
  };

  const isCurrentStepComplete = useCallback(() => {
    // 필드가 유효한지 확인하는 헬퍼 함수
    const isFieldValid = (fieldName: string, value: any, additionalChecks?: () => boolean) => {
      const hasValue = typeof value === 'string' ? value.trim() : Boolean(value);
      const hasNoError = !fieldErrors[fieldName];
      const passesAdditionalChecks = additionalChecks ? additionalChecks() : true;
      
      return hasValue && hasNoError && passesAdditionalChecks;
    };
    
    switch (currentStep) {
      case 1:
        return userType !== null;
        
      case 2:
        return (
          isFieldValid('name', formData.name) &&
          isFieldValid('email', formData.email) &&
          isFieldValid('phone', formData.phone)
        );
        
      case 3:
        return (
          isFieldValid('username', formData.username, () => isUsernameChecked && isUsernameAvailable) &&
          isFieldValid('password', formData.password, () => formData.password.length >= 8) &&
          isFieldValid('confirmPassword', formData.confirmPassword, () => 
            formData.password === formData.confirmPassword
          )
        );
        
      case 4:
        if (userType === 'student') {
          return isFieldValid('parent_phone', formData.parent_phone);
        }
        return true;
        
      default:
        return false;
    }
  }, [currentStep, userType, formData, fieldErrors, isUsernameChecked, isUsernameAvailable]);

  // 현재 단계 완료 상태 확인 시 스크롤 가능 여부 업데이트 및 자동 스크롤
  useEffect(() => {
    const canScroll = !!isCurrentStepComplete();
    console.log(`Step ${currentStep}: canScroll = ${canScroll}`, { 
      userType, 
      formData: { name: formData.name, email: formData.email, phone: formData.phone },
      fieldErrors 
    });
    
    const prevCanScroll = canScrollToNext;
    setCanScrollToNext(canScroll);
    
    // 자동 스크롤 기능을 제거하고 수동 스크롤만 허용
    // 사용자가 직접 스크롤하거나 버튼을 클릭해야 다음 단계로 이동
  }, [isCurrentStepComplete, currentStep, canScrollToNext, isScrolling]);

  const handleUsernameCheck = async () => {
    if (!formData.username.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }

    // 아이디 길이 체크
    if (formData.username.trim().length < 4) {
      setError('💡 아이디는 4자 이상 입력해주세요. (현재 ' + formData.username.trim().length + '자)');
      return;
    }

    if (formData.username.trim().length > 20) {
      setError('아이디는 20자 이하로 입력해주세요.');
      return;
    }

    // 아이디 형식 체크 (영문으로 시작, 영문+숫자+밑줄 조합)
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(formData.username.trim())) {
      setError('아이디는 영문으로 시작하고, 영문, 숫자, 밑줄(_)만 사용 가능합니다.');
      return;
    }

    // 금지된 아이디 체크
    const forbiddenUsernames = ['admin', 'administrator', 'root', 'test', 'user', 'null', 'undefined', 'guest', 'system'];
    if (forbiddenUsernames.includes(formData.username.trim().toLowerCase())) {
      setError('사용할 수 없는 아이디입니다.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // 가능한 API 경로들을 시도
    const possiblePaths = [
      '/api/auth/check-username',
      '/api/auth/username/check',
      '/api/auth/teacher/check-username',
      '/api/auth/student/check-username',
      '/api/auth/check_username',
      '/api/username/check'
    ];

    let apiSuccess = false;
    
    for (const path of possiblePaths) {
      try {
        console.log(`Trying API path: ${path}`);
        const baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || 'http://localhost:8003';
        const response = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: formData.username.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsUsernameChecked(true);
          setIsUsernameAvailable(data.available || data.is_available || true);
          
          if (!data.available && !data.is_available) {
            setError(data.message || '이미 사용 중인 아이디입니다.');
          } else {
            setError('');
          }
          
          apiSuccess = true;
          console.log(`API 성공: ${path}`, data);
          break;
        }
      } catch (error) {
        console.log(`API 실패: ${path}`, error);
        continue;
      }
    }

    if (!apiSuccess) {
      // 회원가입 API로 중복 체크
      try {
        const baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || 'http://localhost:8003';
        const username = formData.username.trim();
        
        // 임시 데이터로 Teacher 회원가입 시도
        const testData = {
          username: username,
          email: `temp_${username}_${Date.now()}@test.com`,
          name: "Test User",
          phone: "01000000000",
          password: "temppassword123"
        };

        const teacherResponse = await fetch(`${baseUrl}/api/auth/teacher/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        });

        if (teacherResponse.status === 400) {
          const errorData = await teacherResponse.json();
          if (errorData.detail && errorData.detail.includes('Username')) {
            setIsUsernameChecked(true);
            setIsUsernameAvailable(false);
            setError('이미 사용 중인 아이디입니다.');
            console.log(`Username ${username} already exists`);
          }
        } else {
          setIsUsernameChecked(true);
          setIsUsernameAvailable(true);
          setError('');
          console.log(`Username ${username} is available`);
        }
      } catch (error) {
        console.log('Username check with signup failed, proceeding with client validation');
        setIsUsernameChecked(true);
        setIsUsernameAvailable(true);
        setError('');
      }
    }
    
    setIsLoading(false);
  };

  const validateCurrentStep = () => {
    setError('');
    
    switch (currentStep) {
      case 1:
    if (!userType) {
      setError('가입 유형을 선택해주세요.');
      return false;
    }
        return true;
        
      case 2:
        if (!formData.name || !formData.email || !formData.phone) {
      setError('모든 필수 항목을 입력해주세요.');
      return false;
    }
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
        return true;
        
      case 3:
        if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('모든 필수 항목을 입력해주세요.');
      return false;
    }
        // 중복체크를 시도했지만 실패한 경우에는 회원가입 진행 허용
        if (!isUsernameChecked && !error.includes('중복체크 기능을 사용할 수 없습니다') && !error.includes('중복체크 중 오류가 발생했습니다')) {
          setError('아이디 중복체크를 완료해주세요.');
          return false;
        }
        
        // 중복체크를 완료했지만 사용 불가능한 경우
        if (isUsernameChecked && !isUsernameAvailable) {
          setError('다른 아이디를 선택해주세요.');
          return false;
        }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    return true;
        
      case 4:
        if (userType === 'student') {
          if (!formData.parent_phone) {
            setError('학부모 연락처를 입력해주세요.');
            return false;
          }
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleSubmitStep = () => {
    if (userType === 'teacher' && currentStep === 3) {
      // 선생님은 3단계에서 바로 회원가입
      handleSubmit();
      return;
    }
    
    if (userType === 'student' && currentStep === 4) {
      // 학생은 4단계에서 회원가입
      handleSubmit();
      return;
    }
  };

  const getMaxStep = () => {
    return userType === 'teacher' ? 3 : 4;
  };


  const handleSubmit = async () => {
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
      
      // 회원가입 성공 처리
      setIsSuccess(true);
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // API 오류 메시지를 더 사용자 친화적으로 변환
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
      
      if (error?.message) {
        if (error.message.includes('Network connection failed')) {
          errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (error.message.includes('already exists') || error.message.includes('이미 존재') || 
                   error.message.includes('username') || error.message.includes('duplicate') ||
                   error.message.includes('중복')) {
          errorMessage = '이미 사용 중인 아이디입니다. 다른 아이디를 선택해주세요.';
          // 중복 아이디 에러 시 중복체크 상태 초기화
          setIsUsernameChecked(false);
          setIsUsernameAvailable(false);
          // 계정 정보 단계로 이동
          setCurrentStep(3);
        } else if (error.message.includes('email') && (error.message.includes('already') || error.message.includes('존재'))) {
          errorMessage = '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.';
          // 기본 정보 단계로 이동
          setCurrentStep(2);
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      // 성공 시에는 로딩 상태 유지, 실패 시에만 해제
      if (!isSuccess) {
        setIsLoading(false);
      }
    }
  };

  const handleLoginClick = () => {
    router.push('/');
  };

  // 현재 섹션 렌더링
  const renderCurrentSection = () => {
    switch (currentStep) {
      case 2: 
        return (
          <BasicInfoForm
            formData={formData}
            fieldErrors={fieldErrors}
            touchedFields={touchedFields}
            onInputChange={handleInputChange}
            onInputBlur={handleInputBlur}
            onPhoneFocus={handlePhoneFocus}
            onPhoneKeyDown={handlePhoneKeyDown}
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
            onInputChange={handleInputChange}
            onInputBlur={handleInputBlur}
            onUsernameCheck={handleUsernameCheck}
          />
        );
      case 4: 
  return (
          <StudentInfoForm
            formData={formData}
            fieldErrors={fieldErrors}
            touchedFields={touchedFields}
            onInputChange={handleInputChange}
            onInputBlur={handleInputBlur}
            onPhoneFocus={handlePhoneFocus}
            onPhoneKeyDown={handlePhoneKeyDown}
          />
        );
      default: 
        return null;
    }
  };

  const resetFormData = () => {
    setFormData({
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
    setFieldErrors({});
    setTouchedFields({});
    setIsUsernameChecked(false);
    setIsUsernameAvailable(false);
    setError('');
  };


  const getStepTitle = () => {
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
  };

  const getButtonText = () => {
    const maxStep = getMaxStep();
    if (currentStep === maxStep) {
      return isLoading ? '가입 중...' : '회원가입';
    }
    return '다음';
  };

  return (
    <div ref={containerRef} className="h-screen overflow-hidden bg-gray-50 relative">
      {/* 단계별 네비게이션 */}
      <StepNavigation 
        currentStep={currentStep}
        maxStep={getMaxStep()}
        userType={userType}
      />

      {/* 스크롤 섹션들 */}
      <div ref={scrollContainerRef} className="snap-y snap-mandatory h-screen overflow-y-auto">
        {/* 섹션 1: 가입 유형 선택 */}
        <div 
          ref={(el) => { sectionRefs.current[0] = el; }}
          className="snap-start h-screen flex items-center justify-center p-4 relative"
        >
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Image src="/logo.svg" alt="Q-Tee Logo" width={24} height={24} className="w-6 h-6" />
                <h1 className="text-xl font-semibold">Q-Tee</h1>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-8 tracking-tight">가입 유형을 선택해주세요</h2>
            
            <div className="space-y-4">
              <Button 
                type="button" 
                className={`w-full h-16 text-lg font-semibold rounded-xl border-2 transition-all duration-300 ease-out ${
                  userType === 'teacher'
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => handleUserTypeSelect('teacher')}
              >
                
                선생님
              </Button>
              
              <Button
                type="button"
                className={`w-full h-16 text-lg font-semibold rounded-xl border-2 transition-all duration-300 ease-out ${
                  userType === 'student'
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => handleUserTypeSelect('student')}
              >

                학생
              </Button>
            </div>

            {userType && (
              <div className="mt-8 text-center gentle-entrance" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
                <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
              </div>
            )}
          </div>
        </div>

        {/* 섹션 2: 기본 정보 */}
        {userType && (
          <div 
            ref={(el) => { sectionRefs.current[1] = el; }}
            className="snap-start h-screen flex items-center justify-center p-4 relative"
          >
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-8 tracking-tight">기본 정보를 입력해주세요</h2>
              
              {/* 에러 메시지 */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-100 font-medium mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
{renderCurrentSection()}
              </div>
            </div>
            
            {/* 절대 위치 하단 영역 */}
            {canScrollToNext && currentStep === 2 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center soft-entrance" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
                <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
              </div>
            )}
          </div>
        )}

        {/* 섹션 3: 계정 정보 */}
        {userType && (
          <div 
            ref={(el) => { sectionRefs.current[2] = el; }}
            className="snap-start h-screen flex items-center justify-center p-4 relative"
          >
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-8 tracking-tight">계정 정보를 입력해주세요</h2>
              
              <div className="space-y-6">
{renderCurrentSection()}
              </div>
            </div>
            
            {/* 절대 위치 하단 영역 */}
            {userType === 'teacher' && canScrollToNext && currentStep === 3 && (
              <div className="absolute bottom-32 left-1/2 w-full max-w-md text-center" style={{ 
                opacity: 0, 
                transform: 'translateX(-50%) translateY(20px)',
                animation: 'slideUpFadeIn 0.8s ease-out 0.3s forwards'
              }}>
                <Button 
                  type="button" 
                  className={`w-full h-12 border-0 rounded-xl font-semibold transition-all duration-500 ease-out ${
                    isSuccess 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                  onClick={handleSubmitStep}
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
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center soft-entrance" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <p className="text-sm text-gray-600 mb-4">아래로 스크롤하여 계속하세요</p>
                <ChevronDown className="w-6 h-6 mx-auto text-blue-600 animate-bounce" />
              </div>
            )}
          </div>
        )}

        {/* 섹션 4: 학생 추가 정보 */}
        {userType === 'student' && (
          <div 
            ref={(el) => { sectionRefs.current[3] = el; }}
            className="snap-start h-screen flex items-center justify-center p-4 relative"
          >
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-8 tracking-tight">학생 정보를 입력해주세요</h2>
              
              <div className="space-y-6">
{renderCurrentSection()}
              </div>
            </div>
        
            {canScrollToNext && currentStep === 4 && (
              <div className="absolute bottom-32 left-1/2 w-full max-w-md text-center" style={{ 
                opacity: 0, 
                transform: 'translateX(-50%) translateY(20px)',
                animation: 'slideUpFadeIn 0.8s ease-out 0.3s forwards'
              }}>
          <Button 
                  type="button" 
                  className={`w-full h-12 border-0 rounded-xl font-semibold transition-all duration-500 ease-out ${
                    isSuccess 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                  onClick={handleSubmitStep}
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

      {/* 로그인 페이지 이동 - 고정 하단 */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-xl px-6 py-3 shadow-lg border border-white/50">
          <p className="text-sm text-gray-600 font-medium">
            이미 계정이 있으신가요?
            <button 
              onClick={handleLoginClick} 
              className="text-blue-600 font-semibold ml-2"
            >
              로그인
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}