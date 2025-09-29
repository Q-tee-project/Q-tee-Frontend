'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { classroomService } from '@/services/authService';
import type { StudentJoinRequest } from '@/services/authService';
import { IoIosClose } from "react-icons/io";

interface ApprovalTabProps {
  classId: string;
  onStudentApproved?: () => void; // 승인 후 콜백 함수
}

export function ApprovalTab({ classId, onStudentApproved }: ApprovalTabProps) {
  const [pendingRequests, setPendingRequests] = useState<StudentJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [approvalSelectAll, setApprovalSelectAll] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState<boolean[]>([]);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<StudentJoinRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  // 대기 중인 가입 요청 로드
  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setIsLoading(true);
    try {
      const requests = await classroomService.getPendingJoinRequests();
      
      // localStorage에서 초대 완료 상태의 학생들 가져오기
      const invitedStudents = JSON.parse(localStorage.getItem(`invited_students_${classId}`) || '[]');
      
      // 중복 제거: 같은 이메일을 가진 학생이 있으면 백엔드 요청을 우선시
      const mergedRequests = [...invitedStudents];
      
      requests.forEach(backendRequest => {
        const existingIndex = mergedRequests.findIndex(
          invited => invited.student.email === backendRequest.student.email
        );
        
        if (existingIndex !== -1) {
          // 기존 초대 완료 항목을 백엔드 요청으로 교체
          mergedRequests[existingIndex] = backendRequest;
        } else {
          // 새로운 항목 추가
          mergedRequests.push(backendRequest);
        }
      });
      
      setPendingRequests(mergedRequests);
      setSelectedApprovals(Array(mergedRequests.length).fill(false));
    } catch (error: any) {
      console.error('승인 대기 목록 로드 실패:', error);
      setError('승인 대기 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalSelectAll = (checked: boolean) => {
    setApprovalSelectAll(checked);
    setSelectedApprovals(Array(pendingRequests.length).fill(checked));
  };

  const handleApprovalRowSelect = (index: number, checked: boolean) => {
    const newSelectedApprovals = [...selectedApprovals];
    newSelectedApprovals[index] = checked;
    setSelectedApprovals(newSelectedApprovals);

    const allSelected = newSelectedApprovals.every((selected) => selected);
    setApprovalSelectAll(allSelected);
  };

  const handleApprovalAction = (request: StudentJoinRequest, action: 'approve' | 'reject') => {
    setApprovingRequest(request);
    setApprovalAction(action);
    setIsApprovalModalOpen(true);
  };

  const confirmApprovalAction = async () => {
    if (!approvingRequest) return;

    try {
      const status = approvalAction === 'approve' ? 'approved' : 'rejected';
      await classroomService.approveJoinRequest(approvingRequest.id, status);
      
      // localStorage에서 해당 학생 제거 (초대 완료 상태였다면)
      const invitedStudents = JSON.parse(localStorage.getItem(`invited_students_${classId}`) || '[]');
      const updatedInvitedStudents = invitedStudents.filter(
        (invited: any) => invited.student.email !== approvingRequest.student.email
      );
      localStorage.setItem(`invited_students_${classId}`, JSON.stringify(updatedInvitedStudents));
      
      // 목록 새로고침
      await loadPendingRequests();
      
      // 승인된 경우 부모 컴포넌트에 알림
      if (approvalAction === 'approve' && onStudentApproved) {
        onStudentApproved();
      }
      
      setIsApprovalModalOpen(false);
      setApprovingRequest(null);
    } catch (error: any) {
      console.error('승인/거절 처리 실패:', error);
      setError(error?.message || '승인/거절 처리에 실패했습니다.');
    }
  };

  const handleBatchApproval = async (action: 'approve' | 'reject') => {
    // "초대 완료" 상태가 아닌 항목들만 필터링
    const selectedRequests = pendingRequests.filter((request, index) => 
      selectedApprovals[index] && request.status !== 'invited'
    );
    
    if (selectedRequests.length === 0) return;

    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      // 선택된 모든 요청을 처리
      await Promise.all(
        selectedRequests.map(request => 
          classroomService.approveJoinRequest(request.id, status)
        )
      );
      
      // localStorage에서 처리된 학생들 제거
      const invitedStudents = JSON.parse(localStorage.getItem(`invited_students_${classId}`) || '[]');
      const updatedInvitedStudents = invitedStudents.filter(
        (invited: any) => !selectedRequests.some(request => request.student.email === invited.student.email)
      );
      localStorage.setItem(`invited_students_${classId}`, JSON.stringify(updatedInvitedStudents));
      
      // 목록 새로고침
      await loadPendingRequests();
      
      // 승인된 경우 부모 컴포넌트에 알림
      if (action === 'approve' && onStudentApproved) {
        onStudentApproved();
      }
      
    } catch (error: any) {
      console.error('일괄 처리 실패:', error);
      setError(error?.message || '일괄 처리에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 승인 대기 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          승인 대기 목록 ({pendingRequests.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleBatchApproval('approve')}
            disabled={!selectedApprovals.some(selected => selected)}
            className="flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#E8FFE8] text-[#04AA04] border-none px-3 py-1.5"
          >
            일괄 승인
          </button>
          <button
            onClick={() => handleBatchApproval('reject')}
            disabled={!selectedApprovals.some(selected => selected)}
            className="flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#FFEEEE] text-[#FF0004] border-none px-3 py-1.5"
          >
            일괄 거절
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* 승인 대기 목록 테이블 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">승인 대기 목록을 불러오는 중...</div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">승인 대기 중인 학생이 없습니다.</div>
            <div className="text-sm text-gray-400">
              학생들이 클래스 코드로 가입 신청을 하면 여기에 표시됩니다.
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white border-b border-[#666]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left p-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={approvalSelectAll}
                      onCheckedChange={handleApprovalSelectAll}
                      className="data-[state=checked]:bg-[#0085FF] data-[state=checked]:border-[#0085FF]"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  학생명
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  학교/학년
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  이메일
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  학생 연락처
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  학부모 연락처
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  신청일시
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  상태
                </TableHead>
                <TableHead className="text-center text-base font-bold text-[#666] p-3">
                  승인 / 거절
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {pendingRequests.map((request, index) => (
                <TableRow key={request.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap p-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedApprovals[index] || false}
                        onCheckedChange={(checked: boolean) => handleApprovalRowSelect(index, checked)}
                        disabled={request.status === 'invited'}
                        className="data-[state=checked]:bg-[#0085FF] data-[state=checked]:border-[#0085FF]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 font-medium p-3">
                    {request.student.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3">
                    <div className="flex items-center justify-center">
                      <div className="flex gap-2">
                        <Badge
                          className={`text-sm border-none px-3 py-1.5 min-w-[60px] text-center ${
                            request.student.school_level === 'middle' 
                              ? 'bg-[#E6F3FF] text-[#0085FF]' 
                              : 'bg-[#FFF5E9] text-[#FF9F2D]'
                          }`}
                        >
                          {request.student.school_level === 'middle' ? '중학교' : '고등학교'}
                        </Badge>
                        <Badge className="text-sm border-none px-3 py-1.5 min-w-[60px] text-center bg-[#f5f5f5] text-[#999999]">
                          {request.student.grade}학년
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 p-3">
                    {request.student.email}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 p-3">
                    {request.student.phone}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 p-3">
                    {request.student.parent_phone}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 p-3">
                    {new Date(request.requested_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-center p-3">
                    <Badge
                      className={`text-sm border-none px-3 py-1.5 ${
                        request.status === 'invited' 
                          ? 'bg-[#E0F2FE] text-[#0369A1]' 
                          : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}
                    >
                      {request.status === 'invited' ? '초대 완료' : '승인 대기'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center p-3">
                    {request.status === 'invited' ? (
                      <span className="text-sm text-gray-400">학생 코드 입력전</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprovalAction(request, 'approve')}
                          className="text-sm rounded bg-[#E8FFE8] text-[#04AA04] border-none px-3 py-1.5 cursor-pointer"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleApprovalAction(request, 'reject')}
                          className="text-sm rounded bg-[#FFEEEE] text-[#FF0004] border-none px-3 py-1.5 cursor-pointer"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 승인/거절 확인 모달 */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>
                {approvalAction === 'approve' ? '가입 승인' : '가입 거절'}
              </DialogTitle>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer p-0 w-6 h-6 flex items-center justify-center"
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {approvingRequest && (
              <div>
                <p className="text-gray-600 mb-4">
                  <strong>{approvingRequest.student.name}</strong> 학생의 가입을{' '}
                  {approvalAction === 'approve' ? '승인' : '거절'}하시겠습니까?
                </p>
                
                <div className="p-3 rounded-lg text-sm bg-[#f5f5f5]">
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-gray-500">이메일:</span>
                      <span className="ml-2">{approvingRequest.student.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">연락처:</span>
                      <span className="ml-2">{approvingRequest.student.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">학교:</span>
                      <span className="ml-2">
                        {approvingRequest.student.school_level === 'middle' ? '중학교' : '고등학교'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">학년:</span>
                      <span className="ml-2">{approvingRequest.student.grade}학년</span>
                    </div>
                  </div>
                </div>
                
                {approvalAction === 'reject' && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    ⚠️ 거절된 학생은 다시 가입 신청을 할 수 있습니다.
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-4">
            <button
              onClick={() => setIsApprovalModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex-1"
            >
              취소
            </button>
            <button
              onClick={confirmApprovalAction}
              className={`px-4 py-2 rounded-md transition-colors flex-1 text-white ${
                approvalAction === 'approve' ? 'bg-[#0b7300]' : 'bg-[#d30f0f]'
              }`}
            >
              {approvalAction === 'approve' ? '승인' : '거절'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}