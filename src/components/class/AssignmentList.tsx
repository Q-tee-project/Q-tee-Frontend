'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { classroomService } from '@/services/authService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar, Users } from 'lucide-react';
import { IoBookOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";

interface AssignmentListProps {
  assignments: any[];
  onSelectAssignment: (assignment: any) => void;
  onDeployAssignment?: (assignment: any) => void;
  onDeleteAssignment?: (assignment: any) => void;
  onViewStudentResult?: (assignment: any, studentId: number, studentName: string) => void;
  classId: string;
  onRefresh?: () => void;
}

export function AssignmentList({ assignments, onSelectAssignment, onDeployAssignment, onDeleteAssignment, onViewStudentResult, classId, onRefresh }: AssignmentListProps) {
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // 클래스 학생 정보 로드
  useEffect(() => {
    const loadClassStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const students = await classroomService.getClassroomStudents(parseInt(classId));
        setClassStudents(students);
      } catch (error) {
        console.error('클래스 학생 정보 로드 실패:', error);
        setClassStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    if (classId) {
      loadClassStudents();
    }
  }, [classId]);

  // 주기적으로 과제 상태 업데이트 (30초마다)
  useEffect(() => {
    if (!onRefresh) return;
    
    const interval = setInterval(() => {
      console.log('과제 상태 자동 새로고침');
      onRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  if (assignments.length === 0) {
    return null; // Let the parent component handle the empty state
  }

  return (
    <div className="flex flex-col gap-[15px]">
      <Accordion type="single" collapsible className="w-full">
        {assignments.map((assignment) => (
          <div key={assignment.id}>
          <AccordionItem value={`assignment-${assignment.id}`} className="border-0">
            <AccordionTrigger 
              className="border rounded-lg p-4 hover:no-underline data-[state=open]:border-[#0072CE] transition-colors" 
              style={{ alignItems: 'center' }}
            >
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(assignment.created_at).toLocaleDateString('ko-KR')} 
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{classStudents.length}명 배포</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IoBookOutline className="w-4 h-4" />
                    <span>{assignment.unit_name} {assignment.chapter_name}</span>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{assignment.title}</h4>
                
                {/* 배포 및 삭제 버튼 */}
                <div className="flex gap-2">
                  {onDeployAssignment && (
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeployAssignment(assignment);
                      }}
                    >
                      배포하기
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteAssignment) {
                        onDeleteAssignment(assignment);
                      } else {
                        console.log('과제 삭제:', assignment.title);
                      }
                    }}
                    className="hover:bg-red-50 hover:border-red-200"
                    style={{ padding: '10px' }}
                  >
                    <FaRegTrashAlt className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            </AccordionTrigger>
            <AccordionContent className="border rounded-lg mt-2 p-4">
            <div className="space-y-4">
              {/* 학생별 풀이 결과 테이블 */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">학생별 풀이 결과</h2>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '12%'
                        }}
                      >
                        이름
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '10%'
                        }}
                      >
                        학교
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '8%'
                        }}
                      >
                        학년
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '10%'
                        }}
                      >
                        응시 현황
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '8%'
                        }}
                      >
                        점수
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '10%'
                        }}
                      >
                        소요 시간
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '12%'
                        }}
                      >
                        완료일시
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '10%'
                        }}
                      >
                        재전송
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-center border-b"
                        style={{ 
                          fontSize: '16px', 
                          color: '#666666',
                          borderBottomColor: '#666666',
                          padding: '10px 12px',
                          width: '12%'
                        }}
                      >
                        채점 결과
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingStudents ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <span style={{ fontSize: '14px', color: '#666666' }}>학생 정보를 불러오는 중...</span>
                        </TableCell>
                      </TableRow>
                    ) : classStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <span style={{ fontSize: '14px', color: '#666666' }}>등록된 학생이 없습니다.</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      classStudents.map((student) => {
                        // 실제 과제 제출 데이터 매칭
                        // assignment.student_submissions 또는 assignment.student_results에서 해당 학생의 데이터 찾기
                        const studentSubmission = assignment.student_submissions?.find(
                          (submission: any) => submission.student_id === student.id
                        ) || assignment.student_results?.find(
                          (result: any) => result.student_id === student.id
                        );
                        
                        // 첫 번째, 두 번째 학생은 임시로 응시 상태로 설정 (테스트용)
                        const isFirstStudent = student.id === classStudents[0]?.id;
                        const isSecondStudent = student.id === classStudents[1]?.id;
                        const hasSubmitted = isFirstStudent || isSecondStudent ? true : (studentSubmission?.status === 'completed' || studentSubmission?.submitted_at !== null);
                        const score = isFirstStudent ? 85 : isSecondStudent ? 92 : (studentSubmission?.score || null);
                        const duration = isFirstStudent ? '15분 30초' : isSecondStudent ? '12분 45초' : (studentSubmission?.duration || null);
                        const completedAt = isFirstStudent ? new Date().toLocaleString('ko-KR') : isSecondStudent ? new Date(Date.now() - 3600000).toLocaleString('ko-KR') : (studentSubmission?.completed_at || studentSubmission?.submitted_at || null);
                        
                        return (
                      <TableRow
                        key={student.id}
                        className="hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: '1px solid #e1e1e1' }}
                      >
                        <TableCell 
                          className="font-medium text-center"
                          style={{ 
                            fontSize: '14px', 
                            color: '#666666',
                            padding: '10px 12px'
                          }}
                        >
                          {student.name || '이름 없음'}
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ padding: '10px 12px' }}
                        >
                          <Badge
                            className="rounded-[4px]"
                            style={{
                              backgroundColor: student.school_level === 'middle' ? '#E6F3FF' : '#FFF5E9',
                              color: student.school_level === 'middle' ? '#0085FF' : '#FF9F2D',
                              padding: '5px 10px',
                              fontSize: '14px',
                            }}
                          >
                            {student.school_level === 'middle' ? '중학교' : '고등학교'}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ padding: '10px 12px' }}
                        >
                          <Badge
                            className="rounded-[4px]"
                            style={{
                              backgroundColor: '#f5f5f5',
                              color: '#999999',
                              padding: '5px 10px',
                              fontSize: '14px',
                            }}
                          >
                            {student.grade}학년
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ padding: '10px 12px' }}
                        >
                          <Badge
                            className="rounded-[4px]"
                            style={{
                              backgroundColor: hasSubmitted ? '#E6F3FF' : '#ffebeb',
                              color: hasSubmitted ? '#0085FF' : '#f00',
                              padding: '5px 10px',
                              fontSize: '14px',
                            }}
                          >
                            {hasSubmitted ? '응시' : '미응시'}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ padding: '10px 12px' }}
                        >
                          <span style={{ fontSize: '14px', color: '#666666' }}>
                            {hasSubmitted && score !== null ? `${score}점` : '-'}
                          </span>
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ 
                            fontSize: '14px', 
                            color: '#666666',
                            padding: '10px 12px'
                          }}
                        >
                          {hasSubmitted && duration ? duration : '-'}
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ 
                            fontSize: '14px', 
                            color: '#666666',
                            padding: '10px 12px'
                          }}
                        >
                          {hasSubmitted && completedAt ? completedAt : '-'}
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ padding: '10px 12px' }}
                        >
                          {!hasSubmitted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600 bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 재전송 로직
                                console.log('재전송:', student.name);
                              }}
                            >
                              재전송
                            </Button>
                          ) : (
                            <span style={{ fontSize: '14px', color: '#999999' }}>-</span>
                          )}
                        </TableCell>
                        <TableCell 
                          className="text-center"
                          style={{ padding: '10px 12px' }}
                        >
                          {hasSubmitted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 해당 학생의 과제 결과로 바로 이동
                                if (onViewStudentResult) {
                                  onViewStudentResult(assignment, student.id, student.name);
                                } else {
                                  // 기존 방식 fallback
                                  onSelectAssignment({
                                    ...assignment,
                                    selectedStudentId: student.id,
                                    selectedStudentName: student.name
                                  });
                                }
                              }}
                            >
                              결과
                            </Button>
                          ) : (
                            <span style={{ fontSize: '14px', color: '#999999' }}>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            </AccordionContent>
          </AccordionItem>
        </div>
        ))}
      </Accordion>
    </div>
  );
}
