'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from './InputField';
import { AlertCircle } from 'lucide-react';

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

interface AccountInfoFormProps {
  formData: FormData;
  fieldErrors: { [key: string]: string };
  touchedFields: { [key: string]: boolean };
  isLoading: boolean;
  isUsernameChecked: boolean;
  isUsernameAvailable: boolean;
  onInputChange: (e: any) => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onUsernameCheck: () => void;
}

export const AccountInfoForm = memo<AccountInfoFormProps>(({
  formData,
  fieldErrors,
  touchedFields,
  isLoading,
  isUsernameChecked,
  isUsernameAvailable,
  onInputChange,
  onInputBlur,
  onUsernameCheck,
}) => {
  return (
    <>
      {/* 아이디 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-800 mb-3 block tracking-wide">아이디</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <InputField
              name="username"
              type="text"
              label=""
              placeholder="아이디를 입력해주세요"
              value={formData.username}
              onChange={onInputChange}
              onBlur={onInputBlur}
              hasError={!!fieldErrors.username}
              errorMessage={fieldErrors.username}
              isTouched={!!touchedFields.username}
            />
          </div>
          <Button
            type="button"
            onClick={onUsernameCheck}
            disabled={!formData.username?.trim() || formData.username.trim().length < 4 || !!fieldErrors.username || isLoading || (isUsernameChecked && isUsernameAvailable)}
            className="h-12 px-6 bg-white border-2 border-blue-600 text-blue-600 disabled:border-gray-300 disabled:text-gray-400 rounded-xl font-semibold transition-all duration-300 ease-out"
          >
            {isLoading ? '확인중...' : (isUsernameChecked && isUsernameAvailable) ? '확인완료' : '중복체크'}
          </Button>
        </div>
        
        {/* 아이디 길이 힌트 */}
        {formData.username && (
          <div className="text-xs text-gray-500 flex items-center gap-1 transition-all duration-300 ease-out">
            <span>글자 수: {formData.username.trim().length}/20</span>
            {formData.username.trim().length < 4 && (
              <span className="text-amber-600 font-medium">
                (최소 4자 필요)
              </span>
            )}
            {formData.username.trim().length >= 4 && formData.username.trim().length <= 20 && (
              <span className="text-green-600 font-medium">
                ✓ 적정 길이
              </span>
            )}
          </div>
        )}
        
        {/* 중복체크 결과 표시 */}
        {isUsernameChecked && (
          <p className={`text-sm font-medium transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2 ${
            isUsernameAvailable ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isUsernameAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'
            }`}></span>
            {isUsernameAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'}
          </p>
        )}
      </div>

      <InputField
        name="password"
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력해주세요"
        value={formData.password}
        onChange={onInputChange}
        onBlur={onInputBlur}
        hasError={!!fieldErrors.password}
        errorMessage={fieldErrors.password}
        isTouched={!!touchedFields.password}
      />
      
      <InputField
        name="confirmPassword"
        type="password"
        label="비밀번호 확인"
        placeholder="비밀번호를 다시 입력해주세요"
        value={formData.confirmPassword}
        onChange={onInputChange}
        onBlur={onInputBlur}
        hasError={!!fieldErrors.confirmPassword}
        errorMessage={fieldErrors.confirmPassword}
        isTouched={!!touchedFields.confirmPassword}
        disablePaste={true}
      />
      
      {/* 비밀번호 일치 여부 표시 */}
      {formData.password && formData.confirmPassword && (
        <div className="transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
          {formData.password === formData.confirmPassword ? (
            <p className="text-green-600 text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              비밀번호가 일치합니다
            </p>
          ) : (
            <p className="text-amber-600 text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              비밀번호가 일치하지 않습니다
            </p>
          )}
        </div>
      )}
    </>
  );
});

AccountInfoForm.displayName = 'AccountInfoForm';
