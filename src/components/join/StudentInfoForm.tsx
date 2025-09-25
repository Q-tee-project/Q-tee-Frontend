'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface StudentInfoFormProps {
  formData: FormData;
  fieldErrors: { [key: string]: string };
  touchedFields: { [key: string]: boolean };
  onInputChange: (e: any) => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const StudentInfoForm: React.FC<StudentInfoFormProps> = ({
  formData,
  fieldErrors,
  touchedFields,
  onInputChange,
  onInputBlur,
}) => {
  return (
    <>
      <InputField
        name="parent_phone"
        type="tel"
        label="보호자 연락처"
        placeholder="010-1234-5678"
        value={formData.parent_phone}
        onChange={onInputChange}
        onBlur={onInputBlur}
        inputMode="numeric"
        hasError={!!fieldErrors.parent_phone}
        errorMessage={fieldErrors.parent_phone}
        isTouched={!!touchedFields.parent_phone}
      />
      
      {/* 학급 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-800 mb-3 block tracking-wide">학급</label>
        <Select 
          value={formData.school_level} 
          onValueChange={(value) => onInputChange({
            target: { name: 'school_level', value }
          })}
        >
          <SelectTrigger className="w-full h-12 px-4 text-gray-900 bg-gray-50/50 border-0 rounded-xl transition-all duration-300 ease-out focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg hover:bg-white">
            <SelectValue placeholder="학급을 선택해주세요" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-xl">
            <SelectItem value="middle" className="px-4 py-3 text-gray-900 hover:bg-blue-50 rounded-lg">중학교</SelectItem>
            <SelectItem value="high" className="px-4 py-3 text-gray-900 hover:bg-blue-50 rounded-lg">고등학교</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 학년 */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-800 mb-3 block tracking-wide">학년</label>
        <Select 
          value={formData.grade.toString()} 
          onValueChange={(value) => onInputChange({
            target: { name: 'grade', value: parseInt(value) }
          })}
        >
          <SelectTrigger className="w-full h-12 px-4 text-gray-900 bg-gray-50/50 border-0 rounded-xl transition-all duration-300 ease-out focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg hover:bg-white">
            <SelectValue placeholder="학년을 선택해주세요" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-xl">
            <SelectItem value="1" className="px-4 py-3 text-gray-900 hover:bg-blue-50 rounded-lg">1학년</SelectItem>
            <SelectItem value="2" className="px-4 py-3 text-gray-900 hover:bg-blue-50 rounded-lg">2학년</SelectItem>
            <SelectItem value="3" className="px-4 py-3 text-gray-900 hover:bg-blue-50 rounded-lg">3학년</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
