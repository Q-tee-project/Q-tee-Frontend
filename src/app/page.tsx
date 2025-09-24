'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [userType, setUserType] = useState<'teacher' | 'student'>('teacher')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [keepLogin, setKeepLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        router.push('/question/bank') // 선생님은 문제 관리 페이지로
      } else {
        await authService.studentLogin({
          username: formData.username,
          password: formData.password
        })
        const profile = await authService.getStudentProfile()
        login('student', profile)
        router.push('/test') // 학생은 시험 페이지로
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupClick = () => {
    router.push('/join')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image 
                src="/logo.svg" 
                alt="Q-Tee Logo" 
                width={24} 
                height={24}
                className="w-6 h-6"
              />
              <h1 className="text-xl font-semibold">Q-Tee</h1>
            </div>
          </div>

          <h2 className="text-lg font-medium text-center mb-6">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 사용자 유형 선택 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">사용자 유형</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                    userType === 'teacher'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUserType('teacher')}
                >
                  <div className="font-medium text-sm">선생님</div>
                </div>
                <div
                  className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-all ${
                    userType === 'student'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUserType('student')}
                >
                  <div className="font-medium text-sm">학생</div>
                </div>
              </div>
            </div>
            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* 아이디 */}
            <div>
              <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2 block">아이디</label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="아이디를 입력해 주세요"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">비밀번호</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* 로그인 상태 유지 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keepLogin"
                checked={keepLogin}
                onCheckedChange={(checked) => setKeepLogin(checked as boolean)}
              />
              <label 
                htmlFor="keepLogin" 
                className="text-sm text-gray-700 cursor-pointer"
              >
                로그인 상태 유지
              </label>
            </div>

            {/* 로그인 버튼 */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </div>

            {/* 회원가입 버튼 */}
            <div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleSignupClick}
                disabled={isLoading}
              >
                회원가입
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
