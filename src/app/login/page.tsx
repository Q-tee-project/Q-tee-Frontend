'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { HiEye, HiEyeOff } from 'react-icons/hi'

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    id: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [keepLogin, setKeepLogin] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login submitted:', { ...formData, keepLogin })
  }

  const handleJoinClick = () => {
    router.push('/join')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 아이디 */}
            <div>
              <label htmlFor="id" className="text-sm font-medium text-gray-700 mb-2 block">아이디</label>
              <Input
                id="id"
                name="id"
                type="text"
                placeholder="아이디를 입력해 주세요"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* 비밀번호 */}
            <div className="relative">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  비밀번호
                </label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해 주세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-10"
                />
                {/*아이콘 */}
                <div
                  className="absolute top-[38px] right-3 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </div>
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
              >
                로그인
              </Button>
            </div>

            {/* 회원가입 버튼 */}
            <div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleJoinClick}
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
