'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  userType: 'teacher' | 'student';
  onSubmit: (formData: { username: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export const LoginForm: React.FC<LoginFormProps> = React.memo(({ 
  userType, 
  onSubmit, 
  isLoading, 
  error 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [keepLogin, setKeepLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  }, [formData, onSubmit]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleKeepLoginChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeepLogin(e.target.checked);
  }, []);

  const errorMessage = useMemo(() => error, [error]);

  const showPasswordField = useMemo(() => formData.username.length > 0, [formData.username.length]);
  const showLoginButton = useMemo(() => formData.password.length > 0, [formData.password.length]);

  return (
    <div className="space-y-6 p-8 m-2 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="text-center text-sm text-orange-800 bg-orange-50/90 border border-orange-200/60 backdrop-blur-md rounded-xl p-3 mb-4 shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium whitespace-nowrap">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* 아이디 */}
        <div className="relative p-1">
          <div className="absolute inset-y-0 left-1 pl-4 flex items-center pointer-events-none z-10">
            <User className="h-5 w-5 text-gray-900" />
          </div>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="아이디"
            value={formData.username}
            onChange={handleInputChange}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-white/30 bg-white/25 backdrop-blur-xl text-gray-900 placeholder:text-gray-600 focus:bg-white/35 focus:border-white/40 focus:outline-none transition-all duration-300 text-sm shadow-lg hover:shadow-xl focus:shadow-xl focus:ring-2 focus:ring-white/20"
            disabled={isLoading}
          />
        </div>

        {/* 비밀번호 - 아이디 입력 시 나타남 */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${
          showPasswordField 
            ? 'max-h-20 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="relative p-1">
            <div className="absolute inset-y-0 left-1 pl-4 flex items-center pointer-events-none z-10">
              <Lock className="h-5 w-5 text-gray-900" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full h-14 pl-12 pr-12 rounded-xl border border-white/30 bg-white/25 backdrop-blur-xl text-gray-900 placeholder:text-gray-600 focus:bg-white/35 focus:border-white/40 focus:outline-none transition-all duration-300 text-sm shadow-lg hover:shadow-xl focus:shadow-xl focus:ring-2 focus:ring-white/20"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-1 pr-4 flex items-center z-10 transition-colors duration-200"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* 로그인 상태 유지 & 버튼 - 패스워드 입력 시 나타남 */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${
          showLoginButton 
            ? 'max-h-32 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className={`space-y-4 transform transition-all duration-500 ease-out ${
            showLoginButton 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-4 opacity-0'
          }`}>
            {/* 로그인 상태 유지 */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="keepLogin"
                  checked={keepLogin}
                  onChange={handleKeepLoginChange}
                  className="sr-only"
                />
                <label
                  htmlFor="keepLogin"
                  className={`relative flex items-center justify-center w-5 h-5 rounded cursor-pointer transition-all duration-300 border backdrop-blur-sm ${
                    keepLogin
                      ? 'bg-blue-500/60 border-blue-400/70 shadow-lg shadow-blue-500/20'
                      : 'bg-white/15 border-white/25 hover:bg-white/20 hover:border-white/30'
                  }`}
                >
                  {keepLogin && (
                    <svg
                      className="w-3 h-3 text-white drop-shadow-sm"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </label>
              </div>
              <label 
                htmlFor="keepLogin" 
                className={`text-sm cursor-pointer transition-colors duration-200 select-none ${
                  keepLogin ? 'text-gray-900 font-medium' : 'text-gray-900'
                }`}
              >
                로그인 상태 유지
              </label>
            </div>

            {/* 로그인 버튼 */}
            <div className="pt-2 transform transition-all duration-500 ease-out">
              <Button 
                type="submit" 
                className="w-full h-11 glass-button bg-blue-600/70 hover:bg-blue-600/80 border border-blue-400/60 hover:border-blue-300/80 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 focus:ring-2 focus:ring-blue-400/60 focus:bg-blue-600/85 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl transform transition-all duration-500 ease-out"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
});

LoginForm.displayName = 'LoginForm';
