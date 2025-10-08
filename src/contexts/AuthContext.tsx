'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, TeacherProfile, StudentProfile } from '@/services/authService';
import { setTokenExpiredCallback } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'teacher' | 'student' | null;
  userProfile: TeacherProfile | StudentProfile | null;
  login: (userType: 'teacher' | 'student', profile: TeacherProfile | StudentProfile) => void;
  logout: () => void;
  refreshAuth: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [userProfile, setUserProfile] = useState<TeacherProfile | StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드시 로컬 스토리지에서 인증 정보 복원
  useEffect(() => {
    refreshAuth();

    // 토큰 만료 시 자동 로그아웃 콜백 설정
    setTokenExpiredCallback(() => {
      console.log('토큰이 만료되어 자동 로그아웃됩니다.');
      logout();
      if (typeof window !== 'undefined' && router) {
        router.push('/');
      }
    });
  }, [router]);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const authenticated = authService.isAuthenticated();
      console.log('[AuthContext] refreshAuth - authenticated:', authenticated);
      if (authenticated) {
        const currentUser = authService.getCurrentUser();
        console.log('[AuthContext] refreshAuth - currentUser:', currentUser);
        if (currentUser.type && currentUser.profile) {
          // 로컬스토리지에 프로필이 있으면 바로 복원
          console.log('[AuthContext] refreshAuth - 프로필 복원');
          setIsAuthenticated(true);
          setUserType(currentUser.type);
          setUserProfile(currentUser.profile);
        } else if (currentUser.type && !currentUser.profile) {
          // 토큰은 있지만 프로필이 없는 경우에만 API 호출
          console.log('[AuthContext] refreshAuth - API로 프로필 가져오기');
          try {
            let freshProfile;
            if (currentUser.type === 'teacher') {
              freshProfile = await authService.getTeacherProfile();
            } else {
              freshProfile = await authService.getStudentProfile();
            }
            setIsAuthenticated(true);
            setUserType(currentUser.type);
            setUserProfile(freshProfile);
          } catch (error) {
            console.error('[AuthContext] 프로필 새로고침 실패:', error);
            // 프로필 가져오기 실패시 로그아웃
            logout();
          }
        } else {
          // 토큰은 있지만 사용자 타입이 없는 경우 로그아웃
          console.log('[AuthContext] refreshAuth - 사용자 타입 없음, 로그아웃');
          logout();
        }
      } else {
        console.log('[AuthContext] refreshAuth - 인증되지 않음');
        setIsAuthenticated(false);
        setUserType(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('[AuthContext] 인증 상태 확인 실패:', error);
      setIsAuthenticated(false);
      setUserType(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (type: 'teacher' | 'student', profile: TeacherProfile | StudentProfile) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserProfile(profile);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserType(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    userType,
    userProfile,
    login,
    logout,
    refreshAuth,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
