'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { classroomService } from '@/services/authService';
import type { StudentJoinRequest } from '@/services/authService';

interface ApprovalTabProps {
  classId: string;
}

export function ApprovalTab({ classId }: ApprovalTabProps) {
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
      setPendingRequests(requests);
      setSelectedApprovals(Array(requests.length).fill(false));
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
      
      // 목록 새로고침
      await loadPendingRequests();
      
      setIsApprovalModalOpen(false);
      setApprovingRequest(null);
    } catch (error: any) {
      console.error('승인/거절 처리 실패:', error);
      setError(error?.message || '승인/거절 처리에 실패했습니다.');
    }
  };

  const handleBatchApproval = async (action: 'approve' | 'reject') => {
    const selectedRequests = pendingRequests.filter((_, index) => selectedApprovals[index]);
    
    if (selectedRequests.length === 0) return;

    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      // 선택된 모든 요청을 처리
      await Promise.all(
        selectedRequests.map(request => 
          classroomService.approveJoinRequest(request.id, status)
        )
      );
      
      // 목록 새로고침
      await loadPendingRequests();
      
    } catch (error: any) {
      console.error('일괄 처리 실패:', error);
      setError(error?.message || '일괄 처리에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6" style={{ padding: '10px' }}>
      {/* 승인 대기 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>
          승인 대기 목록 ({pendingRequests.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleBatchApproval('approve')}
            disabled={!selectedApprovals.some(selected => selected)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            일괄 승인
          </button>
          <button
            onClick={() => handleBatchApproval('reject')}
            disabled={!selectedApprovals.some(selected => selected)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm" style={{ padding: '10px' }}>
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
            <TableHeader style={{ background: '#fff', borderBottom: '1px solid #666' }}>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={approvalSelectAll}
                      onCheckedChange={handleApprovalSelectAll}
                      className="data-[state=checked]:bg-[#0085FF] data-[state=checked]:border-[#0085FF]"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  학생명
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  학교/학년
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  이메일
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  학생 연락처
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  학부모 연락처
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  신청일시
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  상태
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  액션
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {pendingRequests.map((request, index) => (
                <TableRow key={request.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedApprovals[index] || false}
                        onCheckedChange={(checked: boolean) => handleApprovalRowSelect(index, checked)}
                        className="data-[state=checked]:bg-[#0085FF] data-[state=checked]:border-[#0085FF]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 font-medium">
                    {request.student.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="flex gap-2">
                        <Badge
                          className="text-sm"
                          style={{
                            backgroundColor: request.student.school_level === 'middle' ? '#E6F3FF' : '#FFF5E9',
                            border: 'none',
                            color: request.student.school_level === 'middle' ? '#0085FF' : '#FF9F2D',
                            padding: '6px 12px',
                            minWidth: '60px',
                            textAlign: 'center',
                          }}
                        >
                          {request.student.school_level === 'middle' ? '중학교' : '고등학교'}
                        </Badge>
                        <Badge
                          className="text-sm"
                          style={{
                            backgroundColor: '#f5f5f5',
                            border: 'none',
                            color: '#999999',
                            padding: '6px 12px',
                            minWidth: '60px',
                            textAlign: 'center',
                          }}
                        >
                          {request.student.grade}학년
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {request.student.email}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {request.student.phone}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {request.student.parent_phone}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {new Date(request.requested_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: '#FEF3C7',
                        color: '#D97706',
                        border: 'none',
                        padding: '4px 8px'
                      }}
                    >
                      대기중
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApprovalAction(request, 'approve')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleApprovalAction(request, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 승인/거절 확인 모달 */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? '가입 승인' : '가입 거절'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {approvingRequest && (
              <div>
                <p className="text-gray-600 mb-4">
                  <strong>{approvingRequest.student.name}</strong> 학생의 가입을{' '}
                  {approvalAction === 'approve' ? '승인' : '거절'}하시겠습니까?
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="grid grid-cols-2 gap-2">
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
          <DialogFooter>
            <button
              onClick={() => setIsApprovalModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={confirmApprovalAction}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                approvalAction === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
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