'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { classroomService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaDotCircle } from 'react-icons/fa';
import type { StudentProfile } from '@/services/authService';

// 과제 결과 데이터 인터페이스
interface AssignmentResult {
  id?: number;
  grading_session_id?: number;
  student_id: number;
  student_name: string;
  school: string;
  grade: string;
  status: string;
  total_score: number;
  max_possible_score: number;
  correct_count: number;
  total_problems: number;
  graded_at?: string;
  submitted_at?: string;
  graded_by?: string;
  problem_results?: any[];
}

export function AssignmentResultView({ assignment, onBack }: { assignment: any, onBack: () => void }) {
  // 과제 유형 구분: Korean 과제는 question_type 필드가 있고, Math 과제는 unit_name 필드가 있음
  const isKorean = assignment.question_type !== undefined || assignment.korean_type !== undefined;

  const [results, setResults] = useState<AssignmentResult[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AssignmentResult | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [taskProgress, setTaskProgress] = useState<any>(null);

  useEffect(() => {
    loadResults();
    loadProblems();
    loadStudents();
  }, [assignment.id]);

  const loadStudents = async () => {
    try {
      console.log('Assignment object:', assignment);
      console.log('Available assignment keys:', Object.keys(assignment));

      const classId = assignment.class_id || assignment.classroom_id || assignment.classId;
      console.log('Trying to use class_id:', classId);

      if (classId) {
        console.log('Making API call to get students for class:', classId);
        const studentList = await classroomService.getClassroomStudents(classId);
        console.log('Loaded students from class:', studentList);
        setStudents(studentList);
      } else {
        console.log('No class_id found in assignment:', assignment);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  const loadProblems = async () => {
    try {
      let data;
      if (isKorean) {
        data = await koreanService.getKoreanWorksheetProblems(assignment.worksheet_id);
        setProblems(data.problems);
      } else {
        // 수학 과제의 경우 문제는 채점 결과에서 가져옴
        console.log("Math assignment - problems will be loaded from grading results");
      }
    } catch (error) {
      console.error("Failed to load problems:", error);
    }
  };

  const loadResults = async () => {
    try {
      setIsLoading(true);
      let data;
      if (isKorean) {
        data = await koreanService.getAssignmentResults(assignment.id);
      } else {
        // 수학 과제 결과 가져오기
        data = await mathService.getAssignmentResults(assignment.id);
      }
      if (Array.isArray(data)) {
        setResults(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setResults((data as any).results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Failed to load assignment results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (sessionId: number) => {
    try {
      if (isKorean) {
        await koreanService.approveGrade(sessionId);
      } else {
        // 수학 과제 승인은 아직 구현되지 않음
        alert("수학 과제 승인 기능은 아직 구현되지 않았습니다.");
        return;
      }
      loadResults(); // Refresh the results
    } catch (error) {
      console.error("Failed to approve grade:", error);
      alert("승인에 실패했습니다.");
    }
  };

  const handleSessionClick = async (session: any) => {
    try {
      setSelectedSession(session);

      if (isKorean) {
        // 한국어 과제의 경우 기존 방식 사용
        const details = await koreanService.getGradingSessionDetails(session.id);
        setSessionDetails(details);
      } else {
        // 수학 과제의 경우 session 자체에 이미 problem_results가 포함되어 있음
        setSessionDetails(session);
      }
    } catch (error) {
      console.error("Failed to load session details:", error);
      alert("세션 상세 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setSessionDetails(null);
  };

  const getAnswerStatus = (problemId: string) => {
    if (!sessionDetails) return null;

    if (isKorean) {
      // Korean 과제의 경우 기존 로직 사용
      const studentAnswer = sessionDetails.multiple_choice_answers?.[problemId];
      const problem = problems.find(p => p.id.toString() === problemId);

      if (!problem || !studentAnswer) return null;

      const isCorrect = studentAnswer === problem.correct_answer;

      // Extract choice number from answer text
      const extractChoiceNumber = (answerText: string) => {
        // Check if answer already contains number (e.g., "1번. 텍스트" or "1. 텍스트")
        const numberMatch = answerText.match(/^(\d+)번?\./);
        if (numberMatch) {
          return numberMatch[1];
        }

        // If no number found, try to find matching choice text
        if (problem.choices) {
          const choiceIndex = problem.choices.findIndex((choice: string) => choice === answerText);
          if (choiceIndex !== -1) {
            return (choiceIndex + 1).toString();
          }
        }

        // Fallback: return original text
        return answerText;
      };

      const studentAnswerNumber = extractChoiceNumber(studentAnswer);
      const correctAnswerNumber = extractChoiceNumber(problem.correct_answer);

      return {
        isCorrect,
        studentAnswer: studentAnswerNumber,
        correctAnswer: correctAnswerNumber,
        studentAnswerText: studentAnswer,
        correctAnswerText: problem.correct_answer
      };
    } else {
      // Math 과제의 경우 problem_results에서 직접 가져오기
      const problemResult = sessionDetails.problem_results?.find((pr: any) => pr.problem_id.toString() === problemId);

      if (!problemResult) return null;

      return {
        isCorrect: problemResult.is_correct,
        studentAnswer: problemResult.user_answer,
        correctAnswer: problemResult.correct_answer,
        studentAnswerText: problemResult.user_answer,
        correctAnswerText: problemResult.correct_answer,
        explanation: problemResult.explanation
      };
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const token = localStorage.getItem('access_token');

    const poll = async () => {
      try {
        const response = await fetch(`/api/grading/tasks/${taskId}/status?subject=math`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const status = await response.json();
          setTaskProgress(status);

          if (status.status === 'SUCCESS') {
            const result = status.result;
            alert(`OCR + AI 채점 완료!\n처리된 손글씨 답안: ${result.processed_count}개\n업데이트된 세션: ${result.updated_sessions}개\n새로 생성된 세션: ${result.newly_graded_sessions}개`);
            setIsProcessingAI(false);
            setTaskProgress(null);
            loadResults();
          } else if (status.status === 'FAILURE') {
            alert(`채점 처리 실패: ${status.info?.error || '알 수 없는 오류'}`);
            setIsProcessingAI(false);
            setTaskProgress(null);
          } else if (status.status === 'PROGRESS') {
            // 진행중인 경우 2초 후 다시 폴링
            setTimeout(poll, 2000);
          } else {
            // PENDING 상태인 경우 1초 후 다시 폴링
            setTimeout(poll, 1000);
          }
        }
      } catch (error) {
        console.error('Task status polling error:', error);
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const handleStartAIGrading = async () => {
    try {
      setIsProcessingAI(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(`/api/grading/assignments/${assignment.id}/start-ai-grading?subject=math`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.task_id) {
          // 태스크 상태 폴링 시작
          pollTaskStatus(result.task_id);
        } else {
          alert(result.message);
          setIsProcessingAI(false);
        }
      } else {
        const error = await response.json();
        alert(`채점 처리 실패: ${error.detail || '알 수 없는 오류'}`);
        setIsProcessingAI(false);
      }
    } catch (error) {
      console.error('AI grading error:', error);
      alert('채점 처리 중 오류가 발생했습니다.');
      setIsProcessingAI(false);
    }
  };

  if (selectedSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToList}
            className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">학생 {selectedSession.graded_by} - 채점 결과</h1>
        </div>

        {sessionDetails ? (
          <>
            {/* Summary Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>채점 결과 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">총점</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {sessionDetails.total_score}/{sessionDetails.max_possible_score}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">정답률</p>
                    <p className="text-2xl font-bold text-green-600">
                      {sessionDetails.correct_count}/{sessionDetails.total_problems}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">백분율</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round((sessionDetails.correct_count / sessionDetails.total_problems) * 100)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">상태</p>
                    <Badge
                      variant={sessionDetails.status === 'approved' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {sessionDetails.status === 'approved' ? '승인됨' : '대기중'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">문제별 결과</h2>

              {(isKorean ? problems : sessionDetails.problem_results || [])
                .sort((a: any, b: any) => isKorean ? a.sequence_order - b.sequence_order : a.problem_id - b.problem_id)
                .map((item: any) => {
                  const problemId = isKorean ? item.id : item.problem_id;
                  const problemNumber = isKorean ? item.sequence_order : item.problem_id;
                  const answerStatus = getAnswerStatus(problemId.toString());

                  return (
                    <Card key={problemId} className="border-l-4 border-l-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Problem Number with Status Icon */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold mb-2">
                              {problemNumber}
                            </div>
                            {answerStatus && (
                              <div className="flex items-center justify-center">
                                {answerStatus.isCorrect ? (
                                  <FaCheckCircle className="text-green-500 text-xl" />
                                ) : (
                                  <FaTimesCircle className="text-red-500 text-xl" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Problem Content */}
                          <div className="flex-1">
                            {/* Source Text if exists (Korean only) */}
                            {isKorean && item.source_text && (
                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="text-sm text-gray-600 mb-2">
                                  {item.source_title && <span className="font-medium">{item.source_title}</span>}
                                  {item.source_author && <span> - {item.source_author}</span>}
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {item.source_text}
                                </div>
                              </div>
                            )}

                            {/* Question */}
                            <div className="mb-4">
                              <p className="text-gray-900 font-medium">
                                {isKorean ? item.question : `문제 ${problemNumber}`}
                              </p>
                            </div>

                            {/* Choices (Korean only) */}
                            {isKorean && item.choices && (
                              <div className="space-y-2 mb-4">
                                {item.choices.map((choice: string, choiceIndex: number) => {
                                  const choiceNumber = (choiceIndex + 1).toString();
                                  const isStudentAnswer = answerStatus?.studentAnswer === choiceNumber;
                                  const isCorrectAnswer = answerStatus?.correctAnswer === choiceNumber;

                                  let choiceStyle = "p-3 rounded-lg border ";
                                  if (isCorrectAnswer) {
                                    choiceStyle += "bg-green-100 border-green-300 text-green-800";
                                  } else if (isStudentAnswer && !isCorrectAnswer) {
                                    choiceStyle += "bg-red-100 border-red-300 text-red-800";
                                  } else {
                                    choiceStyle += "bg-gray-50 border-gray-200";
                                  }

                                  return (
                                    <div key={choiceIndex} className={choiceStyle}>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{choiceNumber}.</span>
                                          {isStudentAnswer && (
                                            <FaDotCircle className="text-blue-600 text-sm" title="학생이 선택한 답" />
                                          )}
                                          {isCorrectAnswer && (
                                            <FaCheckCircle className="text-green-600 text-sm" title="정답" />
                                          )}
                                        </div>
                                        <span className="flex-1">{choice}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Answer Summary */}
                            {answerStatus && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <FaDotCircle className="text-blue-600" />
                                      <span className="text-sm">
                                        학생 답안: <strong>
                                          {isKorean ? `${answerStatus.studentAnswer}번` : answerStatus.studentAnswer}
                                        </strong>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FaCheckCircle className="text-green-600" />
                                      <span className="text-sm">
                                        정답: <strong>
                                          {isKorean ? `${answerStatus.correctAnswer}번` : answerStatus.correctAnswer}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant={answerStatus.isCorrect ? "default" : "destructive"}>
                                    {answerStatus.isCorrect ? "정답" : "오답"}
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            {((isKorean && item.explanation) || (!isKorean && answerStatus?.explanation)) && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">해설</h4>
                                <p className="text-blue-800 text-sm">
                                  {isKorean ? item.explanation : answerStatus?.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Approval Button */}
            {sessionDetails.status === 'pending_approval' && (
              <div className="flex justify-end mt-6">
                <Button onClick={() => handleApprove(sessionDetails.id)} className="bg-green-600 hover:bg-green-700 text-white">
                  결과 승인하기
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p>세션 상세 정보를 불러오는 중...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Results for {assignment.title}</h2>
        </div>

        {/* OCR + AI 채점 버튼 (수학 과제만) */}
        {!isKorean && (
          <Button
            onClick={handleStartAIGrading}
            disabled={isProcessingAI}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessingAI
              ? (taskProgress?.info?.status || 'OCR 처리중...') +
                (taskProgress?.info?.current && taskProgress?.info?.total
                  ? ` (${taskProgress.info.current}%)`
                  : '')
              : 'OCR + AI 채점 시작'
            }
          </Button>
        )}
      </div>

      {isLoading ? (
        <p>Loading results...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>학교/학년</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>점수</TableHead>
              <TableHead>완료일시</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => {
              const totalProblems = result.total_problems || 10;
              const scorePerProblem = 100 / totalProblems;
              const finalScore = Math.round((result.correct_count || 0) * scorePerProblem);

              // 학생 ID로 실제 학생 정보 찾기 - 다양한 타입 변환 시도
              const studentId = result.student_id || result.graded_by;
              const student = studentId ? students.find(s =>
                s.id === studentId ||           // 직접 비교
                s.id === parseInt(String(studentId)) ||  // 숫자로 변환
                s.id.toString() === String(studentId) || // 문자열로 변환
                s.username === String(studentId) // username으로도 시도
              ) : undefined;

              // 디버깅 로그 (첫 번째 결과만)
              if (index === 0) {
                console.log('Assignment type (isKorean):', isKorean);
                console.log('Result data:', result);
                console.log('Available result keys:', Object.keys(result));
                console.log('student_id:', result.student_id);
                console.log('graded_by:', result.graded_by);
                console.log('Calculated studentId:', studentId);
                console.log('Found student:', student);
              }

              // 실제 학생 데이터의 name을 우선 사용
              const studentName = student?.name || result.student_name || result.graded_by || '알 수 없음';

              // 학교/학년 정보는 실제 학생 데이터에서 가져오기
              const schoolInfo = student
                ? `${student.school_level === 'middle' ? '중학교' : '고등학교'} ${student.grade}학년`
                : (result.school !== '정보없음' && result.grade !== '정보없음'
                   ? `${result.school} ${result.grade}`
                   : '-');

              return (
                <TableRow key={result.id || result.grading_session_id || index} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSessionClick(result)}>
                  <TableCell>{studentName}</TableCell>
                  <TableCell>{schoolInfo}</TableCell>
                  <TableCell>
                    <Badge variant={result.status === '완료' || result.status === 'final' || result.status === 'approved' ? 'default' : 'secondary'}>
                      {result.status === '완료' || result.status === 'final' || result.status === 'approved' ? '완료' : '미완료'}
                    </Badge>
                  </TableCell>
                  <TableCell>{finalScore}/100</TableCell>
                  <TableCell>{result.submitted_at ? new Date(result.submitted_at).toLocaleString('ko-KR') : (result.graded_at ? new Date(result.graded_at).toLocaleString('ko-KR') : '-')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
