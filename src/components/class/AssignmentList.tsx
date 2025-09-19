'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Users, Trash2 } from 'lucide-react';
import { IoBookOutline } from "react-icons/io5";
import { StudentProfile } from '@/services/authService';

interface AssignmentStudent {
  id: number;
  name: string;
  school_level: 'middle' | 'high';
  grade: number;
  status: 'completed' | 'incomplete';
  score?: number;
  time_taken?: number;
  completed_at?: string;
}

interface Assignment {
  id: number;
  worksheet_id: number;
  title: string;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  created_at: string;
  students: AssignmentStudent[];
}

interface AssignmentListProps {
  assignments: Assignment[];
  onOpenStudentModal: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: number) => void;
  onStudentAssignmentComplete: (assignmentId: number, assignedStudents: StudentProfile[]) => void;
}

export function AssignmentList({
  assignments,
  onOpenStudentModal,
  onDeleteAssignment,
  onStudentAssignmentComplete,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        생성된 과제가 없습니다. 과제를 생성하여 학생들에게 배포해보세요!
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {assignments.map((assignment) => (
        <AccordionItem key={assignment.id} value={`assignment-${assignment.id}`} className="border-b-0">
          <AccordionTrigger className="hover:no-underline [&[data-state=open]]:border-[#0072CE] border rounded-lg p-4 mb-2 w-full text-left items-center">
            <div className="flex-1"
                 style={{display: 'flex',
                         flexDirection: 'column',
                         justifyContent: 'flex-start',
                         gap: '5px'}}
            >
              {/* 첫 번째 줄: 생성날짜, 배정 인원, 범위 */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(assignment.created_at).toLocaleDateString('ko-KR')}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <div>{assignment.students.length}명 배정</div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <IoBookOutline className="w-4 h-4" />
                  <div>{assignment.unit_name} &gt; {assignment.chapter_name}</div>
                </div>
              </div>
              
              {/* 두 번째 줄: 과제명, 문항수 */}
              <div className="flex items-center gap-4">
                <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                <Badge variant="outline">{assignment.problem_count}문제</Badge>
              </div>
              
              {/* 세 번째 줄: 버튼들 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenStudentModal(assignment)}
                >
                  학생 배정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteAssignment(assignment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* 학생별 결과풀이 테이블 영역 */}
              <div className="border rounded-lg p-4">
                <h5 className="text-base text-lg font-semibold text-gray-800 mb-3">학생별 풀이 결과</h5>
                {assignment.students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    배정된 학생이 없습니다. 학생 배정 버튼을 눌러 학생을 배정해주세요.
                  </div>
                ) : (
                  <Table>
                    <TableHeader style={{ background: '#fff', borderBottom: '1px solid #666' }}>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          이름
                        </TableHead>
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          학교/학년
                        </TableHead>
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          응시 상태
                        </TableHead>
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          점수
                        </TableHead>
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          소요 시간
                        </TableHead>
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          완료일시
                        </TableHead>
                        <TableHead className="text-center text-base font-bold" style={{ color: '#666' }}>
                          재전송
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {assignment.students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-gray-50">
                          <TableCell className="text-center text-sm text-gray-600 font-medium">
                            {student.name}
                          </TableCell>
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
                          <TableCell className="text-center">
                            <Badge 
                              className="text-sm"
                              style={{
                                backgroundColor: student.status === 'completed' ? '#eaffe9' : '#ffebeb',
                                color: student.status === 'completed' ? '#0e870d' : '#f00',
                                border: 'none',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                              }}
                            >
                              {student.status === 'completed' ? '응시' : '미응시'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-600">
                            {student.status === 'completed' ? `${student.score}점` : '-'}
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-600">
                            {student.status === 'completed' ? `${student.time_taken}분` : '-'}
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-600">
                            {student.status === 'completed' ? student.completed_at : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.status === 'incomplete' ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                과제 재전송
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-600">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
