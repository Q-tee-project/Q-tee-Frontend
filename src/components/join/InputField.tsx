'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: any) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  hasError: boolean;
  errorMessage?: string;
  isTouched: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  inputMode,
  hasError,
  errorMessage,
  isTouched,
}) => {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-semibold text-gray-800 mb-3 block tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`w-full h-12 px-4 text-gray-900 bg-gray-50/50 border-0 rounded-xl transition-all duration-300 ease-out focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg hover:bg-white ${
            isTouched && hasError ? 'border-red-500' : ''
          }`}
        />
        {isTouched && hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in fade-in zoom-in-50 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      {isTouched && hasError && errorMessage && (
        <p className="text-red-600 text-sm font-medium transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
