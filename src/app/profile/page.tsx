'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LuUser, LuPencil, LuMail, LuCalendar, LuBookOpen, LuTrendingUp, LuBadge } from 'react-icons/lu';

export default function ProfilePage() {
  const { userProfile, userType, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">마이페이지를 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  const isTeacher = userType === 'teacher';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">내 정보와 활동 현황을 확인해보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <LuUser size={48} className="text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{userProfile?.name || '사용자'}</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  isTeacher 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  <LuBadge size={16} className="mr-1" />
                  {isTeacher ? '선생님' : '학생'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <LuMail size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">이메일</p>
                    <p className="font-medium">{userProfile?.email || '이메일 없음'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <LuCalendar size={20} className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">가입일</p>
                    <p className="font-medium">
                      {userProfile?.created_at 
                        ? new Date(userProfile.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '2024년 1월'
                      }
                    </p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                  <LuPencil size={18} />
                  프로필 수정
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <LuTrendingUp size={24} className="text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">활동 통계</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {isTeacher ? (
                    <>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">15</div>
                        <div className="text-sm text-gray-600">생성한 문제</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">3</div>
                        <div className="text-sm text-gray-600">관리 중인 반</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">47</div>
                        <div className="text-sm text-gray-600">총 학생 수</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
                        <div className="text-sm text-gray-600">완료한 과제</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">2</div>
                        <div className="text-sm text-gray-600">참여 중인 반</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
                        <div className="text-sm text-gray-600">평균 정답률</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <LuBookOpen size={24} className="text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">최근 활동</h3>
                </div>
                
                <div className="space-y-3">
                  {isTeacher ? (
                    <>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">수학 문제 5개 생성</p>
                          <p className="text-sm text-gray-500">2시간 전</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">3학년 2반 과제 출제</p>
                          <p className="text-sm text-gray-500">1일 전</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">학생 성적 리포트 확인</p>
                          <p className="text-sm text-gray-500">2일 전</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">수학 과제 완료</p>
                          <p className="text-sm text-gray-500">1시간 전</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">영어 레벨 테스트 응시</p>
                          <p className="text-sm text-gray-500">1일 전</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">오답노트 복습</p>
                          <p className="text-sm text-gray-500">2일 전</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}