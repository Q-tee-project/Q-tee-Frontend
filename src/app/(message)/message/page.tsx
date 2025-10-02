'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FiSearch,
  FiStar,
  FiTrash2,
  FiMoreVertical,
  FiUser,
  FiPlus,
  FiCalendar,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { IoMailOutline, IoMailOpenOutline } from 'react-icons/io5';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { messageService, MessageRecipient } from '@/services/messageService';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Phone, Mail, User } from 'lucide-react';
import { IoIosClose } from 'react-icons/io';

interface Message {
  id: string;
  isRead: boolean;
  isStarred: boolean;
  isChecked: boolean;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  subject: string;
  timestamp: string;
}

export default function MessagePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'read' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchType, setSearchType] = useState<'sender' | 'subject'>('subject');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isCheckboxMode, setIsCheckboxMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const itemsPerPage = 15;
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MessageRecipient | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.getMessages(
        currentPage,
        itemsPerPage,
        activeFilter,
        searchPerformed ? searchQuery : '',
        searchType,
      );

      const formattedMessages = response.messages.map((msg) => ({
        id: msg.id.toString(),
        isRead: msg.is_read,
        isStarred: msg.is_starred,
        isChecked: false,
        sender: { id: msg.sender.id, name: msg.sender.name },
        subject: msg.subject,
        timestamp: new Date(msg.sent_at).toLocaleString('ko-KR'),
      }));

      setMessages(formattedMessages);
      setTotalMessages(response.total_count);
      setTotalPages(response.total_pages);
    } catch (error) {
      setError('메시지를 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilter, searchPerformed, searchQuery, searchType, itemsPerPage]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const effectiveMessages = isCheckboxMode ? messages.filter((m) => !m.isStarred) : messages;

  const displayedMessages = effectiveMessages;

  const handleCheckboxChange = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isChecked: !msg.isChecked } : msg)),
    );
  };

  const handleStarToggle = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const newStarredState = !message.isStarred;

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isStarred: newStarredState } : msg)),
    );

    try {
      await messageService.toggleStar(parseInt(messageId), newStarredState);
    } catch (error) {
      console.error('Failed to toggle star:', error);
      // Revert on error
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isStarred: !newStarredState } : msg)),
      );
      alert('즐겨찾기 상태 변경에 실패했습니다.');
    }
  };

  const toggleDropdown = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };

  const handleStarFilterToggle = () => {
    if (activeFilter === 'starred') {
      setActiveFilter('all');
    } else {
      setActiveFilter('starred');
    }
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchPerformed(true);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (searchPerformed) setSearchPerformed(false);
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as 'sender' | 'subject');
    if (searchPerformed) setSearchPerformed(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const hasSelectedMessages = messages.some((m) => m.isChecked);

  const handleTrashModeToggle = () => {
    if (isCheckboxMode && hasSelectedMessages) {
      setIsDeleteModalOpen(true);
    } else {
      setIsCheckboxMode(!isCheckboxMode);
      setMessages((prev) => prev.map((m) => ({ ...m, isChecked: false })));
      setSelectAll(false);
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setMessages((prev) =>
      prev.map((msg) =>
        displayedMessages.some((d) => d.id === msg.id) ? { ...msg, isChecked: newSelectAll } : msg,
      ),
    );
  };

  const handleDeleteConfirm = async () => {
    const idsToDelete = messageToDelete
      ? [messageToDelete]
      : messages.filter((m) => m.isChecked).map((m) => m.id);

    if (idsToDelete.length === 0) {
      setIsDeleteModalOpen(false);
      return;
    }

    const originalMessages = [...messages];
    setMessages((prev) => prev.filter((m) => !idsToDelete.includes(m.id)));
    setIsDeleteModalOpen(false);
    setMessageToDelete(null);

    try {
      await Promise.all(idsToDelete.map((id) => messageService.deleteMessage(parseInt(id))));
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete messages:', error);
      setMessages(originalMessages);
      alert('메시지 삭제에 실패했습니다.');
    } finally {
      if (isCheckboxMode) {
        setIsCheckboxMode(false);
        setSelectAll(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setMessageToDelete(null);
  };

  const handleIndividualDelete = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    setMessageToDelete(messageId);
    setIsDeleteModalOpen(true);
    setSelectedMessageId(null);
  };

  const handleProfileClick = async (e: React.MouseEvent, senderId: number) => {
    e.stopPropagation();
    try {
      // the full profile from a dedicated endpoint.
      const message = messages.find((m) => m.sender.id === senderId);
      if (message) {
        const recipient = await messageService
          .getMessageRecipients()
          .then((rs) => rs.find((r) => r.id === senderId));
        if (recipient) {
          setSelectedProfile(recipient);
          setIsProfileModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to get profile:', error);
      alert('프로필 정보를 불러오는데 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<IoMailOutline />}
        title="쪽지함"
        variant="default"
        description="받은 쪽지를 확인하고 관리할 수 있습니다"
      />

      <Card className="flex-1 flex flex-col shadow-sm" style={{ margin: '2rem' }}>
        <CardHeader className="py-4 px-6 border-b border-gray-100">
          <div className="flex items-center justify-between min-h-[40px]">
            <Select
              value={activeFilter}
              onValueChange={(value) => {
                setActiveFilter(value as 'all' | 'read' | 'unread' | 'starred');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32 h-10 text-sm flex items-center">
                <SelectValue placeholder="필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="read">읽음</SelectItem>
                <SelectItem value="unread">안읽음</SelectItem>
                <SelectItem value="starred">즐겨찾기</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Select value={searchType} onValueChange={handleSearchTypeChange}>
                <SelectTrigger className="w-32 h-10 text-sm flex items-center">
                  <SelectValue placeholder="검색" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sender">보낸 사람</SelectItem>
                  <SelectItem value="subject">제목</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder={searchType === 'sender' ? '보낸 사람 검색' : '메일 제목 검색'}
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                className="w-64 h-10 pl-3 pr-3"
              />
              <button
                onClick={handleSearch}
                className="h-10 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors shadow-sm flex items-center justify-center"
              >
                <FiSearch className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isCheckboxMode ? (
                <button
                  onClick={handleSelectAll}
                  className="h-10 px-3 border border-gray-300 rounded-md transition-colors shadow-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  {selectAll ? '전체해제' : '전체선택'}
                </button>
              ) : (
                <button
                  onClick={handleStarFilterToggle}
                  className={`h-10 px-3 hover:text-gray-900 border border-gray-300 rounded-md transition-colors shadow-sm flex items-center justify-center ${
                    activeFilter === 'starred'
                      ? 'text-yellow-500 bg-yellow-50 border-yellow-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiStar
                    className={`w-5 h-5 ${activeFilter === 'starred' ? 'fill-current' : ''}`}
                  />
                </button>
              )}
              <button
                onClick={handleTrashModeToggle}
                className={`h-10 px-3 border border-gray-300 rounded-md transition-colors shadow-sm flex items-center justify-center ${
                  isCheckboxMode
                    ? hasSelectedMessages
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer'
                      : 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10"
                onClick={() => router.push('/message/post')}
              >
                작성하기
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg p-1">
            {loading ? (
              <div className="flex justify-center items-center text-gray-500 py-4">로딩 중...</div>
            ) : error ? (
              <div className="flex justify-center items-center text-red-500 py-4">{error}</div>
            ) : displayedMessages.length === 0 ? (
              <div className="flex justify-center items-center text-gray-500 py-4">
                메시지가 없습니다.
              </div>
            ) : (
              <div className="space-y-0.5">
                {displayedMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => router.push(`/message/${message.id}`)}
                    className="bg-white rounded-md p-2 border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all relative cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-20">
                        <div className="flex-shrink-0">
                          {isCheckboxMode ? (
                            <Checkbox
                              checked={message.isChecked}
                              onCheckedChange={() => handleCheckboxChange(message.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <button
                              onClick={(e) => handleStarToggle(e, message.id)}
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              <FiStar
                                className={`w-4 h-4 ${
                                  message.isStarred ? 'fill-current text-yellow-500' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {message.isRead ? (
                            <IoMailOpenOutline className="w-5 h-5 text-gray-500" title="읽음" />
                          ) : (
                            <IoMailOutline className="w-5 h-5 text-blue-600" title="안읽음" />
                          )}
                        </div>

                        <div className="text-sm text-gray-600 flex items-center gap-2 min-w-0">
                          <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{message.sender.name}</span>
                        </div>
                      </div>

                      <div className="flex-1 mx-30 min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">
                          {message.subject}
                        </div>
                      </div>

                      <div className="flex items-center gap-80 flex-shrink-0">
                        <div className="text-xs text-gray-500 mr-4 flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {message.timestamp}
                        </div>
                        <button
                          onClick={(e) => toggleDropdown(e, message.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {selectedMessageId === message.id && (
                      <div className="absolute right-8 top-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-48">
                        <div className="py-2">
                          <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                            {message.sender.name}
                          </div>
                          <button
                            onClick={(e) => handleProfileClick(e, message.sender.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <FiUser className="w-4 h-4" />
                            프로필
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/message/post?recipient=${message.sender.id}`);
                              setSelectedMessageId(null);
                            }}
                          >
                            <FiPlus className="w-4 h-4" />
                            쪽지 작성
                          </button>
                          <button
                            onClick={(e) => handleIndividualDelete(e, message.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(idx + 1);
                        }}
                        isActive={currentPage === idx + 1}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={`${
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <FiTrash2 className="w-5 h-5" />
              메시지 삭제 확인
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-2">
              {messageToDelete
                ? '정말로 이 메시지를 삭제하시겠습니까?'
                : `정말로 선택된 ${
                    messages.filter((m) => m.isChecked).length
                  }개의 메시지를 삭제하시겠습니까?`}
            </p>
            <p className="text-sm text-gray-500">삭제된 메시지는 복구할 수 없습니다.</p>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DialogTitle className="flex items-center gap-2">
                {selectedProfile?.type === 'teacher' ? '선생님 정보' : '학생 정보'}
              </DialogTitle>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedProfile.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedProfile.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedProfile.phone}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
