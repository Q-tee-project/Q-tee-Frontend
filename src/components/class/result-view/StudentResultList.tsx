import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AssignmentResult } from './types';
import type { StudentProfile } from '@/services/authService';

interface StudentResultListProps {
  results: AssignmentResult[];
  students: StudentProfile[];
  isLoading: boolean;
  onSelectResult: (result: AssignmentResult) => void;
  onStartAIGrading?: () => void;
  isProcessingAI?: boolean;
  taskProgress?: any;
  subject: 'korean' | 'english' | 'math';
}

export function StudentResultList({
  results,
  students,
  isLoading,
  onSelectResult,
  onStartAIGrading,
  isProcessingAI,
  taskProgress,
  subject,
}: StudentResultListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onStartAIGrading && subject !== 'korean' && (
        <div className="flex justify-end">
          <Button
            onClick={onStartAIGrading}
            disabled={isProcessingAI}
            variant="outline"
          >
            {isProcessingAI
              ? (taskProgress?.info?.status || (subject === 'english' ? 'AI 채점 중...' : 'OCR 처리중...')) +
                (taskProgress?.info?.current && taskProgress?.info?.total
                  ? ` (${taskProgress.info.current}%)`
                  : '')
              : subject === 'english'
              ? 'AI 채점 시작'
              : 'OCR + AI 채점 시작'}
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>학교/학년</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>점수</TableHead>
            <TableHead>완료일시</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => {
            const finalScore = result.total_score ?? 0;
            const studentId = result.student_id || result.graded_by;
            const student = studentId
              ? students.find(
                  (s) =>
                    s.id === studentId ||
                    s.id === parseInt(String(studentId)) ||
                    s.id.toString() === String(studentId) ||
                    s.username === String(studentId),
                )
              : undefined;

            const studentName = student?.name || result.student_name || result.graded_by || '알 수 없음';
            const schoolInfo = student
              ? `${student.school_level === 'middle' ? '중학교' : '고등학교'} ${student.grade}학년`
              : result.school !== '정보없음' && result.grade !== '정보없음'
              ? `${result.school} ${result.grade}`
              : '-';

            const isCompleted =
              result.status === '완료' || result.status === 'final' || result.status === 'approved';

            return (
              <TableRow
                key={result.id || result.grading_session_id || index}
                className="hover:bg-gray-50"
              >
                <TableCell>{studentName}</TableCell>
                <TableCell className="text-sm text-gray-600">{schoolInfo}</TableCell>
                <TableCell>
                  <span className={`text-sm ${isCompleted ? 'text-blue-600' : 'text-gray-500'}`}>
                    {isCompleted ? '완료' : '미완료'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{finalScore}/100</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {result.submitted_at
                    ? new Date(result.submitted_at).toLocaleDateString('ko-KR')
                    : result.graded_at
                    ? new Date(result.graded_at).toLocaleDateString('ko-KR')
                    : '-'}
                </TableCell>
                <TableCell>
                  {isCompleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectResult(result)}
                    >
                      채점 관리
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
