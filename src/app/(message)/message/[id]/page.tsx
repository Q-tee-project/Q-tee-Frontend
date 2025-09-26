'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { messageService, MessageResponse } from '@/services/messageService';
import { FiArrowLeft, FiUser, FiClock } from 'react-icons/fi';
import { IoMailOpenOutline } from 'react-icons/io5';
import { Badge } from '@/components/ui/badge';

export default function MessageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [message, setMessage] = useState<MessageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      const fetchMessageDetail = async () => {
        setLoading(true);
        setError(null);
        try {
          const msg = await messageService.getMessageDetail(parseInt(id));
          setMessage(msg);
        } catch (err) {
          setError('메시지를 불러오는데 실패했습니다.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMessageDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">로딩 중...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
  }

  if (!message) {
    return (
      <div className="flex justify-center items-center h-full">메시지를 찾을 수 없습니다.</div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<IoMailOpenOutline />}
        title="쪽지 상세 보기"
        variant="default"
        description="받은 쪽지의 상세 내용을 확인합니다."
      />

      <Card className="flex-1 flex flex-col shadow-sm" style={{ margin: '2rem' }}>
        <CardHeader className="py-4 px-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/message')}
              className="flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
            <Button
              onClick={() => router.push(`/message/post?recipient=${message.sender.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              답장하기
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* 제목 */}
          <div className="pb-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">{message.subject}</h1>
          </div>

          {/* 보낸 사람 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <FiUser className="w-4 h-4" />
              <span className="font-medium text-gray-700">{message.sender.name}</span>
              <Badge variant="outline">
                {message.sender.type === 'teacher' ? '선생님' : '학생'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <FiClock className="w-4 h-4" />
              <span>{new Date(message.sent_at).toLocaleString('ko-KR')}</span>
            </div>
          </div>

          {/* 내용 */}
          <div className="pt-6">
            <div
              className="prose max-w-none text-gray-800"
              style={{ minHeight: '300px', whiteSpace: 'pre-wrap' }}
            >
              {message.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
