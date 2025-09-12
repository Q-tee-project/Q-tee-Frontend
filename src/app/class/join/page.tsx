'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { studentClassService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus } from 'lucide-react';

export default function ClassJoinPage() {
  const router = useRouter();
  const { isAuthenticated, userType } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, userType, router]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classCode.trim()) {
      setError('클래스 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await studentClassService.requestJoinClass({
        class_code: classCode.trim(),
      });

      setSuccess('클래스 가입 요청이 완료되었습니다! 선생님의 승인을 기다려주세요.');
      setClassCode('');
    } catch (error: any) {
      console.error('Class join error:', error);
      setError(error?.message || '클래스 가입 요청에 실패했습니다. 클래스 코드를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<Users />}
        title="클래스 가입"
        variant="question"
        description="클래스 코드를 입력하여 클래스에 가입하세요"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                클래스 가입하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 성공 메시지 */}
              {success && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded border border-green-200">
                  {success}
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleJoinClass} className="space-y-4">
                <div>
                  <label
                    htmlFor="classCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    클래스 코드 *
                  </label>
                  <Input
                    id="classCode"
                    type="text"
                    placeholder="예: ABC123XY"
                    value={classCode}
                    onChange={(e) => {
                      setClassCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    className="w-full text-center text-lg font-mono tracking-wider"
                    maxLength={8}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    선생님으로부터 받은 8자리 클래스 코드를 입력하세요
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !classCode.trim()}
                >
                  {isLoading ? '가입 요청 중...' : '클래스 가입 요청'}
                </Button>
              </form>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">클래스 코드가 없으신가요?</p>
                <p className="text-xs text-gray-500">
                  선생님께 클래스 코드를 요청하거나, 선생님이 직접 등록해주실 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 안내사항 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">📋 가입 안내</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">1.</span>
                <span>선생님으로부터 받은 클래스 코드를 정확히 입력하세요.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">2.</span>
                <span>가입 요청 후 선생님의 승인을 기다려야 합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">3.</span>
                <span>승인이 완료되면 해당 클래스의 과제를 확인할 수 있습니다.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
