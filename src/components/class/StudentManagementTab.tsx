'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { classroomService } from '@/services/authService';
import type { StudentProfile } from '@/services/authService';


interface StudentManagementTabProps {
  classId: string;
  refreshTrigger?: number; // 새로고침 트리거
}

export function StudentManagementTab({ classId, refreshTrigger }: StudentManagementTabProps) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // 클래스 학생 목록 로드
  useEffect(() => {
    loadStudents();
  }, [classId, refreshTrigger]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const studentList = await classroomService.getClassroomStudents(parseInt(classId));
      setStudents(studentList);
    } catch (error: any) {
      console.error('학생 목록 로드 실패:', error);
      setError('학생 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" style={{ padding: '10px' }}>
      {/* 학생 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>
          학생 목록 ({students.length})
        </h3>
        <button 
          onClick={() => router.push(`/class/${classId}/register`)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          학생 등록
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* 학생 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm" style={{ padding: '10px' }}>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">학생 목록을 불러오는 중...</div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">등록된 학생이 없습니다.</div>
            <div className="text-sm text-gray-400">
              학생을 직접 등록하거나 승인 대기 탭에서 가입 신청을 승인해주세요.
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader style={{ background: '#fff', borderBottom: '1px solid #666' }}>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  학교/학년
                </TableHead>
                <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                  이름
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
                  가입일
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="flex gap-2">
                        <Badge
                          className="text-sm"
                          style={{
                            backgroundColor: student.school_level === 'middle' ? '#E6F3FF' : '#FFF5E9',
                            border: 'none',
                            color: student.school_level === 'middle' ? '#0085FF' : '#FF9F2D',
                            padding: '6px 12px',
                            minWidth: '60px',
                            textAlign: 'center',
                          }}
                        >
                          {student.school_level === 'middle' ? '중학교' : '고등학교'}
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
                          {student.grade}학년
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600 font-medium">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {student.phone}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {student.parent_phone}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {new Date(student.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}