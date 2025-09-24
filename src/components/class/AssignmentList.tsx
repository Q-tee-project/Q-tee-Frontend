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
import { IoBookOutline } from 'react-icons/io5';
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

  // 과제별 결과 로드 함수
  const loadAssignmentResults = async () => {
    const results: { [key: number]: any[] } = {};

    for (const assignment of assignments) {
      try {
        let assignmentResultData;
        const isKorean =
          assignment.question_type !== undefined || assignment.korean_type !== undefined;
        const isEnglish = assignment.problem_type !== undefined && !isKorean;

        console.log(
          `🔍 Loading results for assignment ${assignment.id} (${
            isKorean ? 'Korean' : isEnglish ? 'English' : 'Math'
          })`,
        );

        if (isKorean) {
          assignmentResultData = await koreanService.getAssignmentResults(assignment.id);
        } else if (isEnglish) {
          assignmentResultData = await EnglishService.getEnglishAssignmentResults(
            assignment.id,
          );
          // 영어 결과를 표준 형식으로 변환 (student_name으로 student_id 매칭)
          assignmentResultData = assignmentResultData.map((result: any) => {
            // student_name으로 student_id 찾기
            const matchedStudent = classStudents.find(
              (student) => student.name === result.student_name,
            );
            const studentId = matchedStudent ? matchedStudent.id : 0;

            return {
              id: parseInt(result.id),
              grading_session_id: result.result_id,
              student_id: studentId, // 매칭된 student_id 사용
              student_name: result.student_name,
              school: '',
              grade: '',
              status: 'completed', // 제출 완료로 설정
              total_score: result.total_score,
              max_possible_score: result.max_score,
              correct_count: Math.floor(result.total_score),
              total_problems: result.max_score,
              graded_at: result.created_at,
              submitted_at: result.created_at,
              graded_by: result.student_name,
              problem_results: [],
            };
          });
        } else {
          assignmentResultData = await mathService.getAssignmentResults(assignment.id);
        }

        console.log(`📊 Raw API response for assignment ${assignment.id}:`, assignmentResultData);

        // API 응답이 배열인지 확인하고 안전하게 처리
        if (Array.isArray(assignmentResultData)) {
          results[assignment.id] = assignmentResultData;
        } else if (
          assignmentResultData &&
          typeof assignmentResultData === 'object' &&
          'results' in assignmentResultData
        ) {
          results[assignment.id] = (assignmentResultData as any).results || [];
        } else {
          results[assignment.id] = [];
        }
      } catch (error) {
        console.error(`Failed to load results for assignment ${assignment.id}:`, error);
        results[assignment.id] = [];
      }
    }

    setAssignmentResults(results);
  };

  // 과제별 결과 로드 (학생 정보가 로드된 후에)
  useEffect(() => {
    if (assignments.length > 0 && classStudents.length > 0) {
      loadAssignmentResults();
    }
  }, [assignments, classStudents]);

  // 과목 변경 시 결과 초기화
  useEffect(() => {
    setAssignmentResults({});
  }, [subject]);

  if (assignments.length === 0) {
    return null; // Let the parent component handle the empty state
  }

  return (
    <div className="flex flex-col gap-[15px]">
      <Accordion type="single" collapsible className="w-full">
        {assignments.map((assignment) => {
          const results = assignmentResults[assignment.id] || [];

          return (
            <AccordionItem
              key={assignment.id}
              value={`assignment-${assignment.id}`}
              className="border rounded-lg data-[state=open]:border-[#0072CE] transition-colors"
            >
              <AccordionTrigger className="p-4 hover:no-underline w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(assignment.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{results.length}명 배포</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoBookOutline className="w-4 h-4" />
                        <span>
                          {assignment.problem_type
                            ? assignment.problem_type
                            : `${assignment.unit_name} ${assignment.chapter_name}`}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4">
                {/* 배포 및 삭제 버튼 */}
                <div className="flex gap-2 justify-end mb-4">
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
                    className="hover:bg-red-50 hover:border-red-200"
                    style={{ padding: '10px' }}
                  >
                    <FaRegTrashAlt className="w-4 h-4" />
                  </Button>
                </div>
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
                              width: '12%',
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
                              width: '10%',
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
                              width: '8%',
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
                              width: '10%',
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
                              width: '8%',
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
                              width: '10%',
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
                              width: '12%',
                            }}
                          >
                            완료일시
                          </TableHead>
                          {subject === 'math' && (
                            <TableHead
                              className="font-semibold text-center border-b"
                              style={{
                                fontSize: '16px',
                                color: '#666666',
                                borderBottomColor: '#666666',
                                padding: '10px 12px',
                                width: '10%',
                              }}
                            >
                              OCR 채점
                            </TableHead>
                          )}
                          <TableHead
                            className="font-semibold text-center border-b"
                            style={{
                              fontSize: '16px',
                              color: '#666666',
                              borderBottomColor: '#666666',
                              padding: '10px 12px',
                              width: '12%',
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
                              <span style={{ fontSize: '14px', color: '#666666' }}>
                                학생 정보를 불러오는 중...
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : classStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
                              <span style={{ fontSize: '14px', color: '#666666' }}>
                                등록된 학생이 없습니다.
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (() => {
                            // 수학과 국어 모두 results 배열을 직접 사용 (API 응답 구조가 통일됨)
                            const deployedStudents = Array.isArray(results) ? results : [];

                            // 클래스 학생 정보와 매치
                            const studentsWithInfo = deployedStudents.map((result) => {
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

                            if (studentsWithInfo.length === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={9} className="text-center py-8">
                                    <span style={{ fontSize: '14px', color: '#666666' }}>
                                      배포된 학생이 없습니다.
                                      <br />
                                      <small style={{ color: '#999' }}>
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
                                studentResult.status === '완료' ||
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
                                  className="hover:bg-gray-50 transition-colors"
                                  style={{ borderBottom: '1px solid #e1e1e1' }}
                                >
                                  <TableCell
                                    className="font-medium text-center"
                                    style={{
                                      fontSize: '14px',
                                      color: '#666666',
                                      padding: '10px 12px',
                                    }}
                                  >
                                    {studentResult.name || '이름 없음'}
                                  </TableCell>
                                  <TableCell
                                    className="text-center"
                                    style={{ padding: '10px 12px' }}
                                  >
                                    <Badge
                                      className="rounded-[4px]"
                                      style={{
                                        backgroundColor:
                                          studentResult.school_level === 'middle'
                                            ? '#E6F3FF'
                                            : '#FFF5E9',
                                        color:
                                          studentResult.school_level === 'middle'
                                            ? '#0085FF'
                                            : '#FF9F2D',
                                        padding: '5px 10px',
                                        fontSize: '14px',
                                      }}
                                    >
                                      {studentResult.school_level === 'middle'
                                        ? '중학교'
                                        : '고등학교'}
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
                                      {studentResult.grade}학년
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
                                      {hasSubmitted && score !== null && score !== undefined
                                        ? `${score}점`
                                        : '0점'}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="text-center"
                                    style={{
                                      fontSize: '14px',
                                      color: '#666666',
                                      padding: '10px 12px',
                                    }}
                                  >
                                    {hasSubmitted && duration ? duration : '-'}
                                  </TableCell>
                                  <TableCell
                                    className="text-center"
                                    style={{
                                      fontSize: '14px',
                                      color: '#666666',
                                      padding: '10px 12px',
                                    }}
                                  >
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
                                            const token = localStorage.getItem('access_token');
                                            const response = await fetch(
                                              `/api/grading/assignments/${assignment.id}/start-ai-grading?subject=math`,
                                              {
                                                method: 'POST',
                                                headers: {
                                                  Authorization: `Bearer ${token}`,
                                                  'Content-Type': 'application/json',
                                                },
                                              },
                                            );

                                            if (response.ok) {
                                              const result = await response.json();
                                              if (result.task_id) {
                                                alert(
                                                  'OCR + AI 채점이 시작되었습니다. 완료 후 결과를 확인하세요.',
                                                );
                                                if (onRefresh) {
                                                  onRefresh(); // Refresh assignment list
                                                }
                                              } else {
                                                alert(
                                                  result.message ||
                                                    'OCR 채점을 시작할 수 없습니다.',
                                                );
                                              }
                                            } else {
                                              const error = await response.json();
                                              alert(
                                                `채점 처리 실패: ${
                                                  error.detail || '알 수 없는 오류'
                                                }`,
                                              );
                                            }
                                          } catch (error) {
                                            console.error('OCR grading error:', error);
                                            alert('채점 처리 중 오류가 발생했습니다.');
                                          }
                                        }}
                                      >
                                        OCR 채점
                                      </Button>
                                    </TableCell>
                                  )}
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
                                      <span style={{ fontSize: '14px', color: '#999999' }}>-</span>
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
