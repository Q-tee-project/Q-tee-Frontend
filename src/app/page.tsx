'use client';

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import { BackgroundAnimation, LogoSection, UserTypeSelection, LoginForm } from '@/components/login'

const LoginPage: React.FC = React.memo(() => {
  const router = useRouter()
  const { login } = useAuth()
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoginSubmit = useCallback(async (formData: { username: string; password: string }) => {
    if (!userType) return;
    
    setIsLoading(true)
    setError('')
    
    try {
      if (userType === 'teacher') {
        await authService.teacherLogin({
          username: formData.username,
          password: formData.password
        })
        const profile = await authService.getTeacherProfile()
        login('teacher', profile)
        setError('') // 성공 시에만 에러 지우기
        router.push('/teacher') // 선생님은 선생님 대시보드로
      } else {
        await authService.studentLogin({
          username: formData.username,
          password: formData.password
        })
        const profile = await authService.getStudentProfile()
        login('student', profile)
        setError('') // 성공 시에만 에러 지우기
        router.push('/student') // 학생은 학생 대시보드로
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError('아이디 또는 비밀번호가 올바르지 않습니다')
      setShowLoginForm(true)
      if (!userType) {
        setUserType('teacher')
      }
    } finally {
      setIsLoading(false)
    }
  }, [userType, login, router])

  const handleSignupClick = useCallback(() => {
    router.push('/join')
  }, [router])



  const handleCardSelect = useCallback((type: 'teacher' | 'student') => {
    if (userType === type && showLoginForm) {
      // 같은 카드를 다시 클릭하면 폼 닫기
      setShowLoginForm(false)
      setTimeout(() => {
        setUserType(null)
      }, 300)
    } else {
      // 다른 카드를 클릭하거나 처음 클릭
      setUserType(type)
      
      // 다른 카드를 선택하는 경우에만 초기화 (에러 발생한 같은 카드는 유지)
      if (userType !== type) {
        setError('')
      }
      
      // 로그인 폼 열기
      setShowLoginForm(true)
    }
  }, [userType, showLoginForm])

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-100/80 to-blue-200/60 flex items-start justify-center p-4 pt-16 relative overflow-hidden">
      <BackgroundAnimation />

      <div className="w-full max-w-2xl relative z-10">
        <div className="p-8">
          <LogoSection 
            showLoginForm={showLoginForm}
            userType={userType}
            onSignupClick={handleSignupClick}
          />

          <UserTypeSelection 
            userType={userType}
              onCardSelect={handleCardSelect}
            />

           {/* Login Form - Slide down animation */}
           <div className={`transition-all duration-500 ease-out ${
             (showLoginForm && userType) 
               ? 'max-h-[500px] opacity-100 mt-4' 
               : 'max-h-0 opacity-0 mt-0'
           }`}>
            {userType && (
              <LoginForm 
                userType={userType}
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
});

LoginPage.displayName = 'LoginPage';

export default LoginPage;
