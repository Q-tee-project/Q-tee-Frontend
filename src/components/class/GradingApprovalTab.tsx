'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { IoIosClose } from "react-icons/io";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Define types for grading session (should match backend schema)
interface KoreanGradingSession {
  id: number;
  worksheet_id: number;
  graded_by: number; // Student ID who submitted
  total_problems: number;
  correct_count: number;
  total_score: number;
  max_possible_score: number;
  input_method: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  graded_at: string; // ISO 8601 string
  teacher_id: number | null;
  approved_at: string | null;
  // Add other fields as necessary, e.g., student name, assignment name
  student_name?: string; // Placeholder for student name
  assignment_name?: string; // Placeholder for assignment name
}

interface GradingApprovalTabProps {
  classId: string;
  onGradingApproved?: () => void; // Callback after grading approval
}

import { koreanService } from '@/services/koreanService';

export function GradingApprovalTab({ classId, onGradingApproved }: GradingApprovalTabProps) {
  const [pendingGradingSessions, setPendingGradingSessions] = useState<KoreanGradingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSessions, setSelectedSessions] = useState<boolean[]>([]);
  const [approvalSelectAll, setApprovalSelectAll] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingSession, setApprovingSession] = useState<KoreanGradingSession | null>(null);

  useEffect(() => {
    loadPendingGradingSessions();
  }, [classId]);

  const loadPendingGradingSessions = async () => {
    setIsLoading(true);
    try {
      // In a real app, classId would be used to filter sessions relevant to this class
      const sessions = await koreanGradingService.getPendingGradingSessions(classId);
      setPendingGradingSessions(sessions);
      setSelectedSessions(Array(sessions.length).fill(false));
    } catch (err: any) {
      console.error('채점 승인 대기 목록 로드 실패:', err);
      setError('채점 승인 대기 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setApprovalSelectAll(checked);
    setSelectedSessions(Array(pendingGradingSessions.length).fill(checked));
  };

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelectedSessions = [...selectedSessions];
    newSelectedSessions[index] = checked;
    setSelectedSessions(newSelectedSessions);

    const allSelected = newSelectedSessions.every((selected) => selected);
    setApprovalSelectAll(allSelected);
  };

  const handleApproveClick = (session: KoreanGradingSession) => {
    setApprovingSession(session);
    setIsApprovalModalOpen(true);
  };

  const confirmApproveSession = async () => {
    if (!approvingSession) return;

    try {
      await koreanGradingService.approveGradingSession(approvingSession.id);
      await loadPendingGradingSessions(); // Refresh list
      if (onGradingApproved) {
        onGradingApproved();
      }
      setIsApprovalModalOpen(false);
      setApprovingSession(null);
    } catch (err: any) {
      console.error('채점 승인 실패:', err);
      setError(err?.message || '채점 승인에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          채점 승인 대기 목록 ({pendingGradingSessions.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const selected = pendingGradingSessions.filter((_, i) => selectedSessions[i]);
              if (selected.length > 0) {
                // Implement batch approval logic here
                alert(`일괄 승인: ${selected.length}개 세션`);
              }
            }}
            disabled={!selectedSessions.some(selected => selected)}
            className="flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#E8FFE8',
              color: '#04AA04',
              border: 'none',
              padding: '6px 12px'
            }}
          >
            일괄 승인
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm" style={{ padding: '0 20px' }}>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">채점 승인 대기 목록을 불러오는 중...</div>
          </div>
        ) : pendingGradingSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">승인 대기 중인 채점 세션이 없습니다.</div>
            <div className="text-sm text-gray-400">
              학생들이 과제를 제출하면 여기에 표시됩니다.
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader style={{ background: '#fff', borderBottom: '1px solid #666' }}>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-left" style={{ padding: '10px 12px' }}>
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={approvalSelectAll}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-[#0085FF] data-[state=checked]:border-[#0085FF]"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666', padding: '10px 12px' }}>
                  학생명
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666', padding: '10px 12px' }}>
                  과제명
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666', padding: '10px 12px' }}>
                  채점일
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666', padding: '10px 12px' }}>
                  점수
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666', padding: '10px 12px' }}>
                  상태
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666', padding: '10px 12px' }}>
                  승인
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {pendingGradingSessions.map((session, index) => (
                <TableRow key={session.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap" style={{ padding: '10px 12px' }}>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedSessions[index] || false}
                        onCheckedChange={(checked: boolean) => handleRowSelect(index, checked)}
                        disabled={session.status !== 'pending_approval'}
                        className="data-[state=checked]:bg-[#0085FF] data-[state=checked]:border-[#0085FF]"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 font-medium" style={{ padding: '10px 12px' }}>
                    {session.student_name}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600" style={{ padding: '10px 12px' }}>
                    {session.assignment_name}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600" style={{ padding: '10px 12px' }}>
                    {format(new Date(session.graded_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600" style={{ padding: '10px 12px' }}>
                    {session.total_score}점
                  </TableCell>
                  <TableCell className="text-center" style={{ padding: '10px 12px' }}>
                    <Badge
                      className="text-sm"
                      style={{
                        backgroundColor: session.status === 'pending_approval' ? '#FEF3C7' : '#E8FFE8',
                        color: session.status === 'pending_approval' ? '#D97706' : '#04AA04',
                        border: 'none',
                        padding: '6px 12px'
                      }}
                    >
                      {session.status === 'pending_approval' ? '승인 대기' : '승인 완료'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center" style={{ padding: '10px 12px' }}>
                    {session.status === 'pending_approval' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveClick(session)}
                          className="text-sm rounded"
                          style={{
                            backgroundColor: '#E8FFE8',
                            color: '#04AA04',
                            border: 'none',
                            padding: '6px 12px',
                            cursor: 'pointer'
                          }}
                        >
                          승인
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">승인 완료</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 채점 승인 확인 모달 */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <DialogTitle>
                채점 승인
              </DialogTitle>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IoIosClose />
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {approvingSession && (
              <div>
                <p className="text-gray-600 mb-4">
                  <strong>{approvingSession.student_name}</strong> 학생의 <strong>{approvingSession.assignment_name}</strong> 채점 결과를 승인하시겠습니까?
                </p>
                
                <div className="p-3 rounded-lg text-sm" style={{ background: '#f5f5f5' }}>
                  <div className="grid grid-cols-2 gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <span className="text-gray-500">총 문제 수:</span>
                      <span className="ml-2">{approvingSession.total_problems}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">맞은 개수:</span>
                      <span className="ml-2">{approvingSession.correct_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">총 점수:</span>
                      <span className="ml-2">{approvingSession.total_score}점</span>
                    </div>
                    <div>
                      <span className="text-gray-500">채점일:</span>
                      <span className="ml-2">{format(new Date(approvingSession.graded_at), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setIsApprovalModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              style={{ flex: 1 }}
            >
              취소
            </button>
            <button
              onClick={confirmApproveSession}
              className="px-4 py-2 rounded-md transition-colors"
              style={{ 
                flex: 1,
                backgroundColor: '#0b7300',
                color: '#ffffff'
              }}
            >
              승인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}