'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  authService,
  TeacherStatistics,
  StudentStatistics,
  RecentActivity,
} from '@/services/authService';
import {
  LuUser,
  LuPencil,
  LuMail,
  LuCalendar,
  LuBookOpen,
  LuTrendingUp,
  LuBadge,
} from 'react-icons/lu';

export default function ProfilePage() {
  const { userProfile, userType, isAuthenticated } = useAuth();
  const [statistics, setStatistics] = useState<TeacherStatistics | StudentStatistics | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const isTeacher = userType === 'teacher';

  useEffect(() => {
    if (!isAuthenticated || !userType) return;

    const fetchStatistics = async () => {
      try {
        setIsLoadingStats(true);
        console.log('[Profile] Fetching statistics for:', userType, 'isTeacher:', isTeacher);
        if (isTeacher) {
          const stats = await authService.getTeacherStatistics();
          console.log('[Profile] Teacher stats:', stats);
          setStatistics(stats);
        } else {
          const stats = await authService.getStudentStatistics();
          console.log('[Profile] Student stats:', stats);
          setStatistics(stats);
        }
      } catch (error) {
        console.error('[Profile] Failed to fetch statistics:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        setIsLoadingActivities(true);
        console.log('[Profile] Fetching recent activities for:', userType);
        if (isTeacher) {
          const activities = await authService.getTeacherRecentActivities(5);
          console.log('[Profile] Teacher activities:', activities);
          setRecentActivities(activities);
        } else {
          const activities = await authService.getStudentRecentActivities(5);
          console.log('[Profile] Student activities:', activities);
          setRecentActivities(activities);
        }
      } catch (error) {
        console.error('[Profile] Failed to fetch recent activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchStatistics();
    fetchRecentActivities();
  }, [isAuthenticated, userType, isTeacher]);

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">마이페이지를 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {userProfile?.name || '사용자'}
                </h2>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    isTeacher ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}
                >
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
                            day: 'numeric',
                          })
                        : '정보 없음'}
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

                {isLoadingStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {isTeacher ? (
                      <>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {(statistics as TeacherStatistics)?.created_worksheets || 0}
                          </div>
                          <div className="text-sm text-gray-600">생성한 문제</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {(statistics as TeacherStatistics)?.total_classrooms || 0}
                          </div>
                          <div className="text-sm text-gray-600">관리 중인 반</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {(statistics as TeacherStatistics)?.total_students || 0}
                          </div>
                          <div className="text-sm text-gray-600">총 학생 수</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {(statistics as StudentStatistics)?.completed_assignments || 0}
                          </div>
                          <div className="text-sm text-gray-600">완료한 과제</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {(statistics as StudentStatistics)?.joined_classrooms || 0}
                          </div>
                          <div className="text-sm text-gray-600">참여 중인 반</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {(statistics as StudentStatistics)?.average_score
                              ? `${(statistics as StudentStatistics).average_score}%`
                              : '0%'}
                          </div>
                          <div className="text-sm text-gray-600">평균 정답률</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <LuBookOpen size={24} className="text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">최근 활동</h3>
                </div>

                {isLoadingActivities ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center p-3 border border-gray-200 rounded-lg animate-pulse"
                      >
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">아직 활동 내역이 없습니다.</div>
                ) : (
                  <div className="space-y-3">
                    {/* 최신 5개의 활동만 보이도록 설정 */}
                    {recentActivities.slice(0, 5).map((activity, index) => {
                      const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
                      const color = colors[index % colors.length];

                      return (
                        <div
                          key={activity.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg"
                        >
                          <div className={`w-2 h-2 bg-${color}-500 rounded-full mr-3`}></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
