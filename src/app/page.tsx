'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import { SplitTextAnimation } from '@/components/ui/SplitTextAnimation'
import { FocusCards } from '@/components/ui/FocusCards'
import { LayoutTextFlip } from '@/components/ui/LayoutTextFlip'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [keepLogin, setKeepLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 에러 메시지를 바로 지우지 않고 사용자가 수정할 수 있도록 유지
    // setError('')를 제거하여 에러가 지속적으로 표시되도록 함
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // 새로운 로그인 시도 시에만 이전 에러 지우기
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
        router.push('/dashboard/teacher') // 선생님은 선생님 대시보드로
      } else {
        await authService.studentLogin({
          username: formData.username,
          password: formData.password
        })
        const profile = await authService.getStudentProfile()
        login('student', profile)
        setError('') // 성공 시에만 에러 지우기
        router.push('/dashboard/student') // 학생은 학생 대시보드로
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // 모든 로그인 에러를 통일된 메시지로 처리
      const errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다'
      
      setError(errorMessage)
      // 에러 발생 시 폼과 사용자 타입 상태 강제 유지
      setShowLoginForm(true)
      // userType이 없어진 경우를 대비한 안전장치
      if (!userType) {
        setUserType('teacher') // 기본값으로 복원 (실제로는 이미 선택된 타입이 유지되어야 함)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupClick = () => {
    router.push('/join')
  }



  const handleCardSelect = (type: 'teacher' | 'student') => {
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
        setFormData({ username: '', password: '' })
      }
      
      // 로그인 폼 열기
      setShowLoginForm(true)
    }
  }

  const handleBackToSelection = () => {
    setShowLoginForm(false)
    setUserType(null)
    setError('')
    setFormData({ username: '', password: '' })
  }

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-100/80 to-blue-200/60 flex items-start justify-center p-4 pt-16 relative overflow-hidden">
      {/* Geometric pattern background */}
      <div className="absolute inset-0 bg-geometric-pattern opacity-20"></div>
      
      {/* Dynamic mesh gradient */}
      <div className="absolute inset-0 bg-dynamic-mesh"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large floating shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rotate-45 rounded-lg blur-sm animate-float-slow"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/25 rotate-12 rounded-full blur-sm animate-float-medium"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-blue-600/15 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
        
        {/* Medium shapes */}
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-blue-400/30 rotate-45 rounded-lg blur-sm animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-indigo-400/25 rotate-12 rounded-full blur-sm animate-float-medium"></div>
        <div className="absolute top-1/2 left-20 w-28 h-28 bg-blue-500/20 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
        
        {/* Small accent shapes */}
        <div className="absolute top-16 right-1/4 w-12 h-12 bg-blue-300/35 rotate-45 rounded-lg blur-sm animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-14 h-14 bg-indigo-300/30 rotate-12 rounded-full blur-sm animate-float-slow"></div>
        <div className="absolute top-2/3 right-10 w-18 h-18 bg-blue-400/25 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/15 via-transparent to-indigo-200/10 animate-gradient-shift"></div>
      
      {/* Subtle depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-300/8 via-transparent to-blue-100/5"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="p-8">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="transform transition-all duration-300 ease-out opacity-0 animate-[fadeInUp_0.3s_ease-out_0.05s_forwards]">
                <Image 
                  src="/logo.svg" 
                  alt="Q-Tee Logo" 
                  width={48} 
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <SplitTextAnimation 
                text="Q-Tee" 
                className="text-4xl font-bold text-gray-800"
                delay={50}
              />
            </div>
            
            {/* Text Flip Section */}
            <div className="mb-4">
              {!showLoginForm ? (
                <LayoutTextFlip 
                  text="Q-Tee, "
                  words={["스마트 학습", "스마트 채점","맞춤형 교육", "디지털 교실"]}
                  duration={4000}
                  className="text-lg text-gray-600"
                />
              ) : (
                <LayoutTextFlip 
                  text={userType === 'teacher' ? "선생님을 위한 " : "학생을 위한 "}
                  words={
                    userType === 'teacher' 
                      ? ["문제 출제 도구", "학습 관리 시스템", "성적 분석 플랫폼", "Q-Tee 교사용"]
                      : ["학습 도우미", "문제 풀이 공간", "성장 파트너", "Q-Tee 학습용"]
                  }
                  duration={3500}
                  className="text-lg text-gray-600"
                  
                />
              )}
            </div>
             {/* 회원가입 텍스트 */}
             <div className="text-center">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 group cursor-pointer" onClick={handleSignupClick}>
                 <span className="text-sm text-gray-700 font-medium">아직 계정이 없으신가요?</span>
                 <div className="flex items-center gap-1">
                   <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-200">회원가입</span>
                   <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                   </svg>
                 </div>
               </div>
             </div>
          </div>


          {/* User Type Selection */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-center mb-8">사용자 유형을 선택해주세요</h2>
            <FocusCards 
              onCardSelect={handleCardSelect}
              selectedType={userType}
            />
          </div>

           {/* Login Form - Slide down animation */}
           <div className={`transition-all duration-500 ease-out ${
             (showLoginForm && userType) 
               ? 'max-h-[500px] opacity-100 mt-4' 
               : 'max-h-0 opacity-0 mt-0'
           }`}>
             <div className="space-y-6 p-8 m-2 max-w-xl mx-auto">

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* 에러 메시지 */}
            {error && (
              <div className="text-center text-sm text-orange-800 bg-orange-50/90 border border-orange-200/60 backdrop-blur-md rounded-xl p-3 mb-4 shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium whitespace-nowrap">{error}</span>
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
               formData.username.length > 0 
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
                   onClick={() => setShowPassword(!showPassword)}
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
              formData.password.length > 0 
                ? 'max-h-32 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              <div className={`space-y-4 transform transition-all duration-500 ease-out ${
                formData.password.length > 0 
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
                      onChange={(e) => setKeepLogin(e.target.checked)}
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
          </div>
        </div>
      </div>

    </div>
  )
}
