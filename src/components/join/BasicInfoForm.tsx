'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from './InputField';

interface FormData {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  parent_phone: string;
  school_level: 'middle' | 'high';
  grade: number;
}

interface BasicInfoFormProps {
  formData: FormData;
  fieldErrors: { [key: string]: string };
  touchedFields: { [key: string]: boolean };
  isLoading: boolean;
  isEmailChecked: boolean;
  isEmailAvailable: boolean;
  onInputChange: (e: any) => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPhoneFocus?: () => void;
  onPhoneKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onEmailCheck: () => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  fieldErrors,
  touchedFields,
  isLoading,
  isEmailChecked,
  isEmailAvailable,
  onInputChange,
  onInputBlur,
  onPhoneFocus,
  onPhoneKeyDown,
  onEmailCheck,
}) => {
  return (
    <>
      <InputField
        name="name"
        type="text"
        label="이름"
        placeholder="이름을 입력해주세요"
        value={formData.name}
        onChange={onInputChange}
        onBlur={onInputBlur}
        hasError={!!fieldErrors.name}
        errorMessage={fieldErrors.name}
        isTouched={!!touchedFields.name}
      />
      
      {/* 이메일 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-800 mb-3 block tracking-wide">이메일</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <InputField
              name="email"
              type="email"
              label=""
              placeholder="이메일을 입력해주세요"
              value={formData.email}
              onChange={onInputChange}
              onBlur={onInputBlur}
              hasError={!!fieldErrors.email}
              errorMessage={fieldErrors.email}
              isTouched={!!touchedFields.email}
            />
          </div>
          <Button
            type="button"
            onClick={onEmailCheck}
            disabled={!formData.email?.trim() || !!fieldErrors.email || isLoading || (isEmailChecked && isEmailAvailable)}
            className="h-12 px-6 bg-white border-2 border-blue-600 text-blue-600 disabled:border-gray-300 disabled:text-gray-400 rounded-xl font-semibold transition-all duration-300 ease-out"
          >
            {isLoading ? '확인중...' : (isEmailChecked && isEmailAvailable) ? '확인완료' : '중복체크'}
          </Button>
        </div>
        
        {/* 중복체크 결과 표시 */}
        {isEmailChecked && (
          <p className={`text-sm font-medium transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2 ${
            isEmailAvailable ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isEmailAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'
            }`}></span>
            {isEmailAvailable ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'}
          </p>
        )}
      </div>
      
      <div onFocus={onPhoneFocus}>
        <InputField
          name="phone"
          type="tel"
          label="연락처"
          placeholder="010-1234-5678"
          value={formData.phone}
          onChange={onInputChange}
          onBlur={onInputBlur}
          onKeyDown={onPhoneKeyDown}
          inputMode="numeric"
          hasError={!!fieldErrors.phone}
          errorMessage={fieldErrors.phone}
          isTouched={!!touchedFields.phone}
        />
      </div>
    </>
  );
};
