'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaDotCircle } from 'react-icons/fa';

export function AssignmentResultView({ assignment, onBack }: { assignment: any, onBack: () => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    loadResults();
    loadProblems();
  }, [assignment.id]);

  // selectedStudentId가 있으면 해당 학생의 결과를 바로 로드
  useEffect(() => {
    if (assignment.selectedStudentId && results.length > 0) {
      const studentSession = results.find(result => {
        // API 결과에서 학생 ID는 graded_by 필드에 저장됨
        return result.graded_by === assignment.selectedStudentId || result.graded_by === assignment.selectedStudentId.toString();
      });
      if (studentSession) {
        handleSessionClick(studentSession);
      }
    }
  }, [assignment.selectedStudentId, results]);

  const loadProblems = async () => {
    try {
      const data = await koreanService.getKoreanWorksheetProblems(assignment.worksheet_id);
      setProblems(data.problems);
    } catch (error) {
      console.error("Failed to load problems:", error);
    }
  };

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await koreanService.getAssignmentResults(assignment.id);
      setResults(data);
    } catch (error) {
      console.error("Failed to load assignment results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (sessionId: number) => {
    try {
      await koreanService.approveGrade(sessionId);
      loadResults(); // Refresh the results
    } catch (error) {
      console.error("Failed to approve grade:", error);
      alert("승인에 실패했습니다.");
    }
  };

  const handleSessionClick = async (session: any) => {
    try {
      setSelectedSession(session);
      const details = await koreanService.getGradingSessionDetails(session.id);
      setSessionDetails(details);
    } catch (error) {
      console.error("Failed to load session details:", error);
      alert("세션 상세 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleBackToList = () => {
    // selectedStudentId가 있으면 (학생별 결과에서 온 경우) 과제 목록으로 돌아가기
    if (assignment.selectedStudentId) {
      onBack();
    } else {
      // 일반적인 경우 학생 목록으로 돌아가기
      setSelectedSession(null);
      setSessionDetails(null);
    }
  };

  const getAnswerStatus = (problemId: string) => {
    if (!sessionDetails) return null;

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
  };

  if (selectedSession) {
    return (
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToList}
            className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            학생 {assignment.selectedStudentName || selectedSession.graded_by} - 채점 결과
          </h1>
        </div>

        {sessionDetails ? (
          <>
            {/* Summary Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>채점 결과 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">점수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sessionDetails.total_score} 점
                    </p>
                  </div>
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">풀이시간</p>
                    <p className="text-2xl font-bold text-gray-900">
                      00:00:00
                    </p>
                  </div>
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">맞춘 개수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sessionDetails.correct_count} 개
                    </p>
                  </div>
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">틀린 개수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sessionDetails.total_problems - sessionDetails.correct_count} 개
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">문제별 결과</h2>

              {problems
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map((problem) => {
                  const answerStatus = getAnswerStatus(problem.id.toString());

                  return (
                    <Card key={problem.id} className="border-l-4 border-l-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Problem Number with Status Icon */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold mb-2">
                              {problem.sequence_order}
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
                            {/* Source Text if exists */}
                            {problem.source_text && (
                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="text-sm text-gray-600 mb-2">
                                  {problem.source_title && <span className="font-medium">{problem.source_title}</span>}
                                  {problem.source_author && <span> - {problem.source_author}</span>}
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {problem.source_text}
                                </div>
                              </div>
                            )}

                            {/* Question */}
                            <div className="mb-4">
                              <p className="text-gray-900 font-medium">{problem.question}</p>
                            </div>

                            {/* Choices */}
                            {problem.choices && (
                              <div className="space-y-2 mb-4">
                                {problem.choices.map((choice: string, choiceIndex: number) => {
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
                                      <span className="text-sm">학생 답안: <strong>{answerStatus.studentAnswer}번</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FaCheckCircle className="text-green-600" />
                                      <span className="text-sm">정답: <strong>{answerStatus.correctAnswer}번</strong></span>
                                    </div>
                                  </div>
                                  <Badge variant={answerStatus.isCorrect ? "default" : "destructive"}>
                                    {answerStatus.isCorrect ? "정답" : "오답"}
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            {problem.explanation && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">해설</h4>
                                <p className="text-blue-800 text-sm">{problem.explanation}</p>
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
    <div className="p-6">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">Results for {assignment.title}</h2>
      </div>

      {isLoading ? (
        <p>Loading results...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Correct/Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSessionClick(result)}>
                <TableCell>{result.graded_by}</TableCell>
                <TableCell>{result.total_score}/{result.max_possible_score}</TableCell>
                <TableCell>{result.correct_count}/{result.total_problems}</TableCell>
                <TableCell>
                  <Badge variant={result.status === 'final' ? 'default' : 'secondary'}>
                    {result.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(result.graded_at).toLocaleString('ko-KR')}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {result.status === 'pending_approval' && (
                    <Button onClick={() => handleApprove(result.id)} size="sm">
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
