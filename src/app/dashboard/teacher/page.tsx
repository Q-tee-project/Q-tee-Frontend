'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  BookOpen,
  Calendar,
  Settings,
  MessageSquare
} from 'lucide-react';

const TeacherDashboard = () => {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const dashboardItems = [
    {
      title: '클래스 관리',
      description: '학급 생성, 학생 관리',
      icon: <Users className="h-8 w-8" />,
      href: '/class',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '문제 은행',
      description: '문제 생성 및 관리',
      icon: <FileText className="h-8 w-8" />,
      href: '/question/bank',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '과제 관리',
      description: '과제 생성 및 배포',
      icon: <ClipboardList className="h-8 w-8" />,
      href: '/assignment',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: '문제 생성',
      description: '새로운 문제 만들기',
      icon: <BookOpen className="h-8 w-8" />,
      href: '/question/create',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: '마켓플레이스',
      description: '문제 공유 및 구매',
      icon: <BarChart3 className="h-8 w-8" />,
      href: '/market',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: '메시지',
      description: '학생과의 소통',
      icon: <MessageSquare className="h-8 w-8" />,
      href: '/message',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              선생님 대시보드
            </h1>
            <p className="text-gray-600 mt-2">
              안녕하세요, {userProfile?.name || '선생님'}! 오늘도 좋은 하루 되세요.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              프로필
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              로그아웃
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 클래스</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 문제</p>
                  <p className="text-2xl font-bold text-gray-900">248</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">진행 중 과제</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <ClipboardList className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 학생</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Card 
              key={index}
              className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${item.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                최근 활동
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">수학 1-1반에 새로운 과제를 배포했습니다</span>
                  </div>
                  <span className="text-sm text-gray-500">2시간 전</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">새로운 방정식 문제 15개를 생성했습니다</span>
                  </div>
                  <span className="text-sm text-gray-500">4시간 전</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">국어 2-3반 학생 5명이 과제를 제출했습니다</span>
                  </div>
                  <span className="text-sm text-gray-500">6시간 전</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
