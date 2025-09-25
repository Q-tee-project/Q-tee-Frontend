'use client';

import React from 'react';
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
  onInputChange: (e: any) => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  fieldErrors,
  touchedFields,
  onInputChange,
  onInputBlur,
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
      
      <InputField
        name="email"
        type="email"
        label="이메일"
        placeholder="이메일을 입력해주세요"
        value={formData.email}
        onChange={onInputChange}
        onBlur={onInputBlur}
        hasError={!!fieldErrors.email}
        errorMessage={fieldErrors.email}
        isTouched={!!touchedFields.email}
      />
      
      <InputField
        name="phone"
        type="tel"
        label="연락처"
        placeholder="010-1234-5678"
        value={formData.phone}
        onChange={onInputChange}
        onBlur={onInputBlur}
        inputMode="numeric"
        hasError={!!fieldErrors.phone}
        errorMessage={fieldErrors.phone}
        isTouched={!!touchedFields.phone}
      />
    </>
  );
};
