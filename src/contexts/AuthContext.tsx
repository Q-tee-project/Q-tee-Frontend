'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, TeacherProfile, StudentProfile } from '@/services/authService';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [userProfile, setUserProfile] = useState<TeacherProfile | StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드시 로컬 스토리지에서 인증 정보 복원
  useEffect(() => {
    refreshAuth();
  }, []);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const authenticated = authService.isAuthenticated();
      if (authenticated) {
        const currentUser = authService.getCurrentUser();
        if (currentUser.type && currentUser.profile) {
          setIsAuthenticated(true);
          setUserType(currentUser.type);
          setUserProfile(currentUser.profile);
          
          // 프로필 정보가 없거나 오래된 경우 새로 가져오기
          if (!currentUser.profile) {
            try {
              let freshProfile;
              if (currentUser.type === 'teacher') {
                freshProfile = await authService.getTeacherProfile();
              } else {
                freshProfile = await authService.getStudentProfile();
              }
              setUserProfile(freshProfile);
            } catch (error) {
              console.error('프로필 새로고침 실패:', error);
              // 프로필 가져오기 실패시 로그아웃
              logout();
            }
          }
        } else {
          // 토큰은 있지만 사용자 정보가 없는 경우 로그아웃
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUserType(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};