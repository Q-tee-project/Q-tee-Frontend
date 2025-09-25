'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FiSend, FiUser, FiArrowLeft
} from 'react-icons/fi';
import { IoMailOutline } from 'react-icons/io5';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, UserProfile } from '@/services/authService';
import { messageService, MessageRecipient } from '@/services/messageService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Phone, Mail, User } from 'lucide-react';
import { IoBookOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";


interface ClassroomInfo {
  id: number;
  name: string;
  school_level: 'middle' | 'high';
  grade: number;
}

export default function MessagePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [classroomInfo, setClassroomInfo] = useState<ClassroomInfo | null>(null);

  // 쪽지 작성 상태
  const [recipients, setRecipients] = useState<MessageRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 받는 사람 선택 모달
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  // 사용자 정보 및 수신자 목록 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const profile = await authService.getUserProfile();
        setUserProfile(profile);
        setUserType(profile.userType);

        const recipientsData = await messageService.getMessageRecipients();
        const uniqueRecipients = Array.from(new Map(recipientsData.map(item => [item.id, item])).values());
        setRecipients(uniqueRecipients);

      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
      }
    };
    loadInitialData();
  }, []);

  // URL 파라미터로 받는 사람이 지정된 경우 처리
  useEffect(() => {
    const recipientIdStr = searchParams?.get('recipient');
    if (recipientIdStr && recipients.length > 0) {
      const recipientIdNum = parseInt(recipientIdStr, 10);
      if (!isNaN(recipientIdNum)) {
        const targetRecipient = recipients.find(r => r.id === recipientIdNum);
        if (targetRecipient) {
          setSelectedRecipients([recipientIdNum]);
        }
      }
    }
  }, [searchParams, recipients]);


  const handleRecipientSelect = (recipientId: number) => {
    if (userType === 'student') {
      // 학생은 한 명(선생님)에게만 보낼 수 있음
      setSelectedRecipients([recipientId]);
      return;
    }
    // 선생님은 여러 명 선택 가능
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(prev => prev.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients(prev => [...prev, recipientId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.id));
    }
  };

  const handleSendMessage = async () => {
    if (selectedRecipients.length === 0) {
      alert('받는 사람을 선택해주세요.');
      return;
    }
    if (!subject.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setIsSending(true);
      await messageService.sendMessage({
        recipient_ids: selectedRecipients,
        subject: subject.trim(),
        content: content.trim()
      });
      alert(`${selectedRecipients.length}명에게 쪽지를 전송했습니다.`);
      router.push('/message');
    } catch (error) {
      console.error('쪽지 전송 실패:', error);
      alert('쪽지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleProfileClick = (recipientId: number) => {
    setSelectedProfileId(recipientId);
    setIsProfileModalOpen(true);
  };

  const selectedRecipientData = recipients.filter(r => selectedRecipients.includes(r.id));
  const profileData = selectedProfileId ? recipients.find(r => r.id === selectedProfileId) : null;

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<IoMailOutline />}
        title="쪽지 작성"
        variant="default"
        description="새로운 쪽지를 작성하고 전송할 수 있습니다"
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
              돌아가기
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || selectedRecipients.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              {isSending ? '전송 중...' : `${selectedRecipients.length}명에게 전송`}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람
            </label>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setIsRecipientModalOpen(true)}
                className="w-full justify-start h-auto p-4"
              >
                <div className="flex flex-col items-start gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    <span>받는 사람 선택 ({selectedRecipients.length}/{recipients.length})</span>
                  </div>
                  {selectedRecipientData.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipientData.map(recipient => (
                        <Badge key={recipient.id} variant="secondary" className="text-xs">
                          {recipient.name}
                          {recipient.type === 'student' && recipient.school_level && recipient.grade && (
                            <span className="ml-1">
                              ({recipient.school_level === 'middle' ? '중' : '고'}{recipient.grade})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="쪽지 제목을 입력해주세요"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="쪽지 내용을 입력해주세요"
              className="w-full min-h-[300px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRecipientModalOpen} onOpenChange={setIsRecipientModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              받는 사람 선택 - {userType === 'teacher' ? '학생 목록' : '선생님'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {userType === 'teacher' && (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id="select-all"
                  checked={selectedRecipients.length === recipients.length && recipients.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  전체 선택 ({selectedRecipients.length}/{recipients.length})
                </label>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2">
              {recipients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {userType === 'teacher' ? '등록된 학생이 없습니다.' : '선생님 정보가 없습니다.'}
                </div>
              ) : (
                recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`recipient-${recipient.id}`}
                      checked={selectedRecipients.includes(recipient.id)}
                      onCheckedChange={() => handleRecipientSelect(recipient.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{recipient.name}</span>
                        {recipient.type === 'student' && recipient.school_level && recipient.grade && (
                          <Badge variant="outline" className="text-xs">
                            {recipient.school_level === 'middle' ? '중학교' : '고등학교'} {recipient.grade}학년
                          </Badge>
                        )}
                        {recipient.type === 'teacher' && (
                          <Badge variant="outline" className="text-xs">
                            선생님
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {recipient.email} • {recipient.phone}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProfileClick(recipient.id)}
                    >
                      프로필
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRecipientModalOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DialogTitle className="flex items-center gap-2">
                {profileData?.type === 'teacher' ? '선생님 정보' : '학생 정보'}
              </DialogTitle>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>

          {profileData && (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{profileData.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{profileData.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {profileData.phone}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}