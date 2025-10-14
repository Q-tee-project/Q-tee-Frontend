'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { classroomService } from '@/services/authService';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar, Users } from 'lucide-react';

import { FaRegTrashAlt } from 'react-icons/fa';

interface AssignmentListProps {
  assignments: any[];
  onSelectAssignment: (assignment: any) => void;
  onDeployAssignment?: (assignment: any) => void;
  onDeleteAssignment?: (assignment: any) => void;
  onViewStudentResult?: (assignment: any, studentId: number, studentName: string) => void;
  classId: string;
  onRefresh?: () => void;
  subject: 'korean' | 'english' | 'math';
}

export function AssignmentList({
  assignments,
  onSelectAssignment,
  onDeployAssignment,
  onDeleteAssignment,
  onViewStudentResult,
  classId,
  onRefresh,
  subject,
}: AssignmentListProps) {
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [assignmentResults, setAssignmentResults] = useState<{ [key: number]: any[] }>({});
  const [loadingAssignments, setLoadingAssignments] = useState<{ [key: number]: boolean }>({});

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

  // 모든 과제 결과 한 번에 로드
  useEffect(() => {
    const loadAllAssignmentResults = async () => {
      if (!assignments || assignments.length === 0) {
        return;
      }

      setLoadingAssignments(
        assignments.reduce((acc, a) => ({ ...acc, [a.id]: true }), {}),
      );

      try {
        const resultsPromises = assignments.map(async (assignment) => {
          try {
            const isKorean =
              assignment.question_type !== undefined || assignment.korean_type !== undefined;
            const isEnglish = assignment.problem_type !== undefined && !isKorean;

            let assignmentResultData;
            if (isKorean) {
              assignmentResultData = await koreanService.getAssignmentResults(assignment.id);
            } else if (isEnglish) {
              assignmentResultData = await EnglishService.getEnglishAssignmentResults(assignment.id);
            } else {
              assignmentResultData = await mathService.getAssignmentResults(assignment.id);
            }

            let results = [];
            if (Array.isArray(assignmentResultData)) {
              results = assignmentResultData;
            } else if (
              assignmentResultData &&
              typeof assignmentResultData === 'object' &&
              'results' in assignmentResultData
            ) {
              results = (assignmentResultData as any).results || [];
            }
            return { assignmentId: assignment.id, results };
          } catch (error) {
            console.error(`Failed to load results for assignment ${assignment.id}:`, error);
            return { assignmentId: assignment.id, results: [] };
          }
        });

        const allResults = await Promise.all(resultsPromises);

        setAssignmentResults(
          allResults.reduce(
            (acc, res) => ({ ...acc, [res.assignmentId]: res.results }),
            {},
          ),
        );
      } finally {
        setLoadingAssignments({});
      }
    };

    loadAllAssignmentResults();
  }, [assignments]);

  // 과목 변경 시 결과 초기화
  useEffect(() => {
    setAssignmentResults({});
    setLoadingAssignments({});
  }, [subject]);

  if (assignments.length === 0) {
    return null; // Let the parent component handle the empty state
  }

  return (
    <div className="flex flex-col gap-4">
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
      >
        {assignments.map((assignment) => {
          const results = assignmentResults[assignment.id] || [];
          const isLoadingThisAssignment = loadingAssignments[assignment.id];

          return (
            <AccordionItem
              key={assignment.id}
              value={`assignment-${assignment.id}`}
              className="border rounded-lg data-[state=open]:border-[#0072CE] transition-colors"
            >
              <div className="relative">
                <div className="p-4 pr-16">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(assignment.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{results.length}명 배포</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 break-words overflow-hidden">{assignment.title}</h4>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {onDeployAssignment && (
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => onDeployAssignment(assignment)}
                    >
                      배포하기
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (onDeleteAssignment) {
                        onDeleteAssignment(assignment);
                      }
                    }}
                    className="hover:bg-red-50 hover:border-red-200 p-2.5"
                  >
                    <FaRegTrashAlt className="w-4 h-4" />
                  </Button>
                  <AccordionTrigger className="hover:no-underline p-0 h-auto" />
                </div>
              </div>
              <AccordionContent className="p-4">
                <div className="space-y-4">
                  {/* 학생별 풀이 결과 테이블 */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">학생별 풀이 결과</h2>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[12%]">
                            이름
                          </TableHead>
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[10%]">
                            학교
                          </TableHead>
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[8%]">
                            학년
                          </TableHead>
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[10%]">
                            응시 현황
                          </TableHead>
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[8%]">
                            점수
                          </TableHead>
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[10%]">
                            소요 시간
                          </TableHead>
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[12%]">
                            완료일시
                          </TableHead>
                          {subject === 'math' && (
                            <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[10%]">
                              OCR 채점
                            </TableHead>
                          )}
                          <TableHead className="font-semibold text-center border-b border-[#666666] text-base text-[#666666] p-3 w-[12%]">
                            채점 결과
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingThisAssignment ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <span className="text-sm text-[#666666]">
                                과제 결과를 불러오는 중...
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : isLoadingStudents ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <span className="text-sm text-[#666666]">
                                학생 정보를 불러오는 중...
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : classStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <span className="text-sm text-[#666666]">
                                등록된 학생이 없습니다.
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (() => {
                            let studentsWithInfo;

                            if (subject === 'english') {
                              // 영어의 경우: 실제로 배포된 학생들만 표시 (results에 있는 학생들)
                              const deployedResults = Array.isArray(results) ? results : [];

                              studentsWithInfo = deployedResults.map((result) => {
                                const studentInfo = classStudents.find(
                                  (s) => s.id === result.student_id,
                                );
                                return {
                                  ...result,
                                  name:
                                    studentInfo?.name ||
                                    result.student_name ||
                                    `학생${result.student_id}`,
                                  school_level: studentInfo?.school_level || 'middle',
                                  grade: studentInfo?.grade || result.grade || '1',
                                };
                              });
                            } else {
                              // 수학과 국어: 기존 방식 (results 배열을 직접 사용)
                              const deployedStudents = Array.isArray(results) ? results : [];

                              studentsWithInfo = deployedStudents.map((result) => {
                                const studentInfo = classStudents.find(
                                  (s) => s.id === result.student_id,
                                );
                                return {
                                  ...result,
                                  name:
                                    studentInfo?.name ||
                                    result.student_name ||
                                    `학생${result.student_id}`,
                                  school_level: studentInfo?.school_level || 'middle',
                                  grade: studentInfo?.grade || result.grade || '1',
                                };
                              });
                            }

                            if (studentsWithInfo.length === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={9} className="text-center py-8">
                                    <span className="text-sm text-[#666666]">
                                      배포된 학생이 없습니다.
                                      <br />
                                      <small className="text-[#999]">
                                        학생에게 과제를 배포하면 여기에 표시됩니다.
                                      </small>
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            }

                            return studentsWithInfo.map((studentResult) => {
                              // 상태에 따른 응시 여부 결정 (영어 과제 포함)
                              const hasSubmitted =
                                subject === 'english'
                                  ? !!(
                                      studentResult.completed_at ||
                                      studentResult.submitted_at ||
                                      studentResult.status === '완료' ||
                                      studentResult.status === 'completed'
                                    ) // 영어는 completed_at 우선 확인
                                  : studentResult.status === '완료' ||
                                    studentResult.status === '제출완료' ||
                                    studentResult.status === 'completed';
                              const score = hasSubmitted
                                ? studentResult.score || studentResult.total_score
                                : null;

                              // 소요 시간 계산 (임시로 설정)
                              const duration = hasSubmitted ? '정보없음' : null;
                              const completedAt =
                                hasSubmitted &&
                                (studentResult.completed_at || studentResult.submitted_at)
                                  ? new Date(
                                      studentResult.completed_at || studentResult.submitted_at,
                                    ).toLocaleString('ko-KR')
                                  : null;

                              return (
                                <TableRow
                                  key={studentResult.student_id}
                                  className="hover:bg-gray-50 transition-colors border-b border-[#e1e1e1]"
                                >
                                  <TableCell className="font-medium text-center text-sm text-[#666666] p-3">
                                    {studentResult.name || '이름 없음'}
                                  </TableCell>
                                  <TableCell className="text-center p-3">
                                    <Badge
                                      className={`rounded px-2.5 py-1.5 text-sm ${
                                        studentResult.school_level === 'middle'
                                          ? 'bg-[#E6F3FF] text-[#0085FF]'
                                          : 'bg-[#FFF5E9] text-[#FF9F2D]'
                                      }`}
                                    >
                                      {studentResult.school_level === 'middle'
                                        ? '중학교'
                                        : '고등학교'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center p-3">
                                    <Badge className="rounded px-2.5 py-1.5 text-sm bg-[#f5f5f5] text-[#999999]">
                                      {studentResult.grade}학년
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center p-3">
                                    <Badge
                                      className={`rounded px-2.5 py-1.5 text-sm ${
                                        hasSubmitted
                                          ? 'bg-[#E6F3FF] text-[#0085FF]'
                                          : 'bg-[#ffebeb] text-[#f00]'
                                      }`}
                                    >
                                      {hasSubmitted ? '응시' : '미응시'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center p-3">
                                    <span className="text-sm text-[#666666]">
                                      {hasSubmitted && score !== null && score !== undefined
                                        ? `${score}점`
                                        : '0점'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center text-sm text-[#666666] p-3">
                                    {hasSubmitted && duration ? duration : '-'}
                                  </TableCell>
                                  <TableCell className="text-center text-sm text-[#666666] p-3">
                                    {hasSubmitted && completedAt ? completedAt : '-'}
                                  </TableCell>
                                  {subject === 'math' && (
                                    <TableCell
                                      className="text-center"
                                      style={{ padding: '10px 12px' }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600 bg-white"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            const result = await mathService.startAIGrading(
                                              assignment.id,
                                            );
                                            if (result.task_id) {
                                              alert(
                                                'OCR + AI 채점이 시작되었습니다. 완료 후 결과를 확인하세요.',
                                              );
                                              if (onRefresh) {
                                                onRefresh(); // Refresh assignment list
                                              }
                                            } else {
                                              alert(
                                                result.message || 'OCR 채점을 시작할 수 없습니다.',
                                              );
                                            }
                                          } catch (error) {
                                            console.error('OCR grading error:', error);
                                            alert(
                                              `채점 처리 실패: ${
                                                error instanceof Error
                                                  ? error.message
                                                  : '알 수 없는 오류'
                                              }`,
                                            );
                                          }
                                        }}
                                      >
                                        OCR 채점
                                      </Button>
                                    </TableCell>
                                  )}
                                  <TableCell className="text-center p-3">
                                    {hasSubmitted ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // 채점 편집 기능 - AssignmentResultView로 연결
                                          if (onViewStudentResult) {
                                            onViewStudentResult(
                                              assignment,
                                              studentResult.student_id,
                                              studentResult.name,
                                            );
                                          } else {
                                            // 기존 방식 fallback
                                            onSelectAssignment({
                                              ...assignment,
                                              selectedStudentId: studentResult.student_id,
                                              selectedStudentName: studentResult.name,
                                            });
                                          }
                                        }}
                                      >
                                        편집
                                      </Button>
                                    ) : (
                                      <span className="text-sm text-[#999999]">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            });
                          })()
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
