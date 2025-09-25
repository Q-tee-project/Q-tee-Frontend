'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FiSearch, FiStar, FiTrash2, FiMoreVertical,
  FiUser, FiUsers, FiPlus, FiX, FiCalendar
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { IoMailOutline, IoMailOpenOutline } from 'react-icons/io5';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { messageService, MessageResponse, MessageListResponse } from '@/services/messageService';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Message {
  id: string;
  isRead: boolean;
  isStarred: boolean;
  isChecked: boolean;
  sender: {
    name: string;
    avatar?: string;
  };
  subject: string;
  timestamp: string;
}

export default function MessagePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'read' | 'unread' | 'starred'>('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchType, setSearchType] = useState<'sender' | 'subject'>('subject');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 새로 추가된 상태
  const [isCheckboxMode, setIsCheckboxMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const itemsPerPage = 15;
  const [messages, setMessages] = useState<Message[]>(
    Array.from({ length: 45 }, (_, idx) => {
      const now = new Date();
      const messageDate = new Date(now.getTime() - idx * 2 * 60 * 60 * 1000);
      const formattedDate = `${messageDate.getFullYear()}년 ${String(messageDate.getMonth() + 1).padStart(2, '0')}월 ${String(messageDate.getDate()).padStart(2, '0')}일 ${String(messageDate.getHours()).padStart(2, '0')}시 ${String(messageDate.getMinutes()).padStart(2, '0')}분`;

      return {
        id: (idx + 1).toString(),
        isRead: idx % 3 === 0,
        isStarred: idx % 4 === 0,
        isChecked: false,
        sender: { name: `사용자${(idx % 5) + 1}` },
        subject: `메시지 제목 ${idx + 1}`,
        timestamp: formattedDate,
      };
    })
  );

  // 필터링
  const filteredMessages = messages.filter((message) => {
    if (searchPerformed && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      if (searchType === 'sender' && !message.sender.name.toLowerCase().includes(query)) {
        return false;
      }
      if (searchType === 'subject' && !message.subject.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (showStarredOnly) return message.isStarred;
    if (activeFilter === 'read') return message.isRead;
    if (activeFilter === 'unread') return !message.isRead;
    if (activeFilter === 'starred') return message.isStarred;
    return true;
  });

  // 체크박스 모드에서는 별 달린 메시지 숨김
  const effectiveMessages = isCheckboxMode
    ? filteredMessages.filter((m) => !m.isStarred)
    : filteredMessages;

  // Pagination
  const totalPages = Math.ceil(effectiveMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedMessages = effectiveMessages.slice(startIndex, endIndex);

  // 상태 핸들러
  const handleCheckboxChange = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isChecked: !msg.isChecked } : msg
      )
    );
  };

  const handleStarToggle = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
      )
    );
  };

  const toggleDropdown = (messageId: string) => {
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };

  const handleStarFilterToggle = () => {
    setShowStarredOnly(!showStarredOnly);
    if (!showStarredOnly) setActiveFilter('all');
  };

  const handleSearch = () => setSearchPerformed(true);

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

  // 쓰레기통 버튼 동작
  const handleTrashModeToggle = () => {
    if (isCheckboxMode && hasSelectedMessages) {
      setIsDeleteModalOpen(true);
    } else {
      setIsCheckboxMode(!isCheckboxMode);
      setMessages((prev) => prev.map((m) => ({ ...m, isChecked: false })));
      setSelectAll(false);
    }
  };

  // 전체선택
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setMessages((prev) =>
      prev.map((msg) =>
        displayedMessages.some((d) => d.id === msg.id)
          ? { ...msg, isChecked: newSelectAll }
          : msg
      )
    );
  };

  // 삭제
  const handleDeleteConfirm = () => {
    if (messageToDelete) {
      // 개별 삭제
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
      setMessageToDelete(null);
    } else {
      // 선택된 메시지들 삭제
      setMessages((prev) => prev.filter((m) => !m.isChecked));
      setIsCheckboxMode(false);
      setSelectAll(false);
    }
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setMessageToDelete(null);
  };

  // 개별 삭제 시작
  const handleIndividualDelete = (messageId: string) => {
    setMessageToDelete(messageId);
    setIsDeleteModalOpen(true);
    setSelectedMessageId(null); // 모달 닫기
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<IoMailOutline />}
        title="쪽지함"
        variant="default"
        description="받은 쪽지를 확인하고 관리할 수 있습니다"
      />

      <Card className="flex-1 flex flex-col shadow-sm" style={{ margin: '2rem' }}>
        <CardHeader className="py-4 px-6 border-b border-gray-100">
          <div className="flex items-center justify-between min-h-[40px]">
            {/* 왼쪽 - 필터 */}
            <Select
              value={activeFilter}
              onValueChange={(value) => {
                setActiveFilter(value as 'all' | 'read' | 'unread' | 'starred');
                setShowStarredOnly(false);
              }}
            >
              <SelectTrigger className="w-32 h-10 text-sm flex items-center">
                <SelectValue placeholder="필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="read">읽음</SelectItem>
                <SelectItem value="unread">안읽음</SelectItem>
              </SelectContent>
            </Select>

            {/* 검색 */}
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

            {/* 오른쪽 - 액션 */}
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
                    showStarredOnly
                      ? 'text-yellow-500 bg-yellow-50 border-yellow-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiStar className={`w-5 h-5 ${showStarredOnly ? 'fill-current' : ''}`} />
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
                onClick={() => router.push('/post')}
              >
                작성하기
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>

          {/* 메시지 리스트 */}
          <div className="rounded-lg p-1">
            {searchPerformed && searchQuery.trim() && effectiveMessages.length === 0 ? (
              <div className="flex justify-center items-center text-gray-500 py-4">
                검색 결과가 없습니다.
              </div>
            ) : displayedMessages.length === 0 ? (
              <div className="flex justify-center items-center text-gray-500 py-4">
                메시지가 없습니다.
              </div>
            ) : (
              <div className="space-y-0.5">
                {displayedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-white rounded-md p-2 border border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all relative"
                  >
                    <div className="flex items-center justify-between">
                      {/* 왼쪽 영역: 체크박스/별표 + 읽음상태 + 보낸사람 */}
                      <div className="flex items-center gap-20">
                        {/* 체크박스/즐겨찾기 */}
                        <div className="flex-shrink-0">
                          {isCheckboxMode ? (
                            <Checkbox
                              checked={message.isChecked}
                              onCheckedChange={() => handleCheckboxChange(message.id)}
                            />
                          ) : (
                            <button
                              onClick={() => handleStarToggle(message.id)}
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
                        
                        {/* 읽음 상태 */}
                        <div className="flex-shrink-0">
                          {message.isRead ? (
                            <IoMailOpenOutline className="w-5 h-5 text-gray-500" title="읽음" />
                          ) : (
                            <IoMailOutline className="w-5 h-5 text-blue-600" title="안읽음" />
                          )}
                        </div>
                        
                        {/* 보낸 사람 */}
                        <div className="text-sm text-gray-600 flex items-center gap-2 min-w-0">
                          <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{message.sender.name}</span>
                        </div>
                      </div>
                      
                      {/* 중앙 영역: 제목 */}
                      <div className="flex-1 mx-30 min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">
                          {message.subject}
                        </div>
                      </div>
                      
                      {/* 오른쪽 영역: 날짜 + 더보기 */}
                      <div className="flex items-center gap-80 flex-shrink-0">
                        <div className="text-xs text-gray-500 mr-4 flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {message.timestamp}
                        </div>
                        <button
                          onClick={() => toggleDropdown(message.id)}
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
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                            <FiUser className="w-4 h-4" />
                            프로필
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            onClick={() => {
                              // 발신자에게 답장하기 위한 recipient 설정 (실제 구현시 발신자 ID 사용)
                              router.push(`/post?recipient=sender_${message.id}`);
                              setSelectedMessageId(null);
                            }}
                          >
                            <FiPlus className="w-4 h-4" />
                            쪽지 작성
                          </button>
                          <button 
                            onClick={() => handleIndividualDelete(message.id)}
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

          {/* 페이지네이션 */}
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
                      className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} [&>span]:hidden`}
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
                      className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} [&>span]:hidden`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 모달 */}
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
                : '정말로 선택된 메시지를 삭제하시겠습니까?'
              }
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
    </div>
  );
}
