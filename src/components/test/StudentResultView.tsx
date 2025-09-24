'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaDotCircle,
  FaInfoCircle,
} from 'react-icons/fa';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';

interface StudentResultViewProps {
  assignmentId: number;
  studentId: number;
  assignmentTitle: string;
  onBack: () => void;
  problems: any[];
  subject?: 'korean' | 'math' | 'english';
}

export function StudentResultView({
  assignmentId,
  studentId,
  assignmentTitle,
  onBack,
  problems,
  subject = 'korean'
}: StudentResultViewProps) {
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isKorean = subject === 'korean';
  const isMath = subject === 'math';
  const isEnglish = subject === 'english';

  useEffect(() => {
    loadSessionDetails();
  }, [assignmentId, studentId, subject]);

  const loadSessionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isKorean) {
        // 국어 과제 결과 로드 - 학생별 채점 결과 API 사용
        console.log('🇰🇷 국어 과제 결과 로드 시도:', { assignmentId, studentId });
        try {
          const result = await koreanService.getStudentGradingResult(assignmentId, studentId);
          console.log('🇰🇷 국어 결과:', result);
          setSessionDetails(result);
        } catch (error) {
          console.error('🇰🇷 국어 getStudentGradingResult 실패, 대안 시도:', error);
          // 대안: 과제 결과 목록에서 해당 학생 찾기
          const assignmentResults = await koreanService.getAssignmentResults(assignmentId);
          console.log('🇰🇷 국어 과제 결과 목록:', assignmentResults);

          const studentResult = Array.isArray(assignmentResults)
            ? assignmentResults.find((r: any) => r.student_id === studentId)
            : (assignmentResults as any)?.results?.find((r: any) => r.student_id === studentId);

          if (studentResult) {
            setSessionDetails(studentResult);
          } else {
            throw new Error('국어 과제 결과를 찾을 수 없습니다');
          }
        }
      } else if (isEnglish) {
        // 영어 과제 결과 로드
        console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 영어 과제 결과 로드 시도:', { assignmentId, studentId });
        const assignmentResults = await EnglishService.getEnglishAssignmentResults(assignmentId);
        console.log('🎯 영어 과제 결과들:', assignmentResults);

        const studentResult = Array.isArray(assignmentResults)
          ? assignmentResults.find((r: any) => r.student_id === studentId)
          : null;

        if (studentResult) {
          // Get detailed result using result_id
          const detailResult = await EnglishService.getEnglishAssignmentResultDetail(studentResult.result_id || studentResult.id);
          console.log('🎯 영어 상세 결과:', detailResult);
          setSessionDetails(detailResult);
        } else {
          throw new Error('영어 과제 결과를 찾을 수 없습니다');
        }
      } else {
        // 수학 과제 결과 로드
        console.log('🔢 수학 과제 결과 로드 시도:', { assignmentId, studentId });
        const assignmentResults = await mathService.getAssignmentResults(assignmentId);
        console.log('🔢 수학 과제 결과들:', assignmentResults);

        // 응답이 배열인지 확인
        if (!Array.isArray(assignmentResults)) {
          console.error('🔢 수학 결과가 배열이 아님:', assignmentResults);
          throw new Error('수학 과제 결과 형식이 올바르지 않습니다');
        }

        const studentResult = assignmentResults.find((r: any) => r.student_id === studentId || r.graded_by === studentId.toString());

        if (studentResult) {
          // 세션 상세 정보 추가 로드
          if (studentResult.id || studentResult.grading_session_id) {
            const sessionId = studentResult.id || studentResult.grading_session_id;
            const sessionDetail = await mathService.getGradingSessionDetails(sessionId);
            setSessionDetails(sessionDetail);
          } else {
            setSessionDetails(studentResult);
          }
        } else {
          throw new Error('수학 과제 결과를 찾을 수 없습니다');
        }
      }
    } catch (error: any) {
      console.error('Failed to load session details:', error);
      setError(error.message || '결과를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getAnswerStatus = (problemId: string) => {
    if (!sessionDetails) return null;

    if (isKorean) {
      // Korean 과제의 경우
      let studentAnswer = sessionDetails.multiple_choice_answers?.[problemId] ||
                         sessionDetails.answers?.[problemId] ||
                         sessionDetails.student_answers?.[problemId];

      // problem_results에서 답안 찾기 시도
      if (!studentAnswer && sessionDetails.problem_results) {
        const problemResult = sessionDetails.problem_results.find((pr: any) =>
          pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId
        );
        if (problemResult) {
          studentAnswer = problemResult.user_answer || problemResult.student_answer;
        }
      }

      const problem = problems.find((p) => p.id.toString() === problemId);

      if (!problem) {
        return null;
      }

      if (!studentAnswer) {
        return {
          isCorrect: false,
          studentAnswer: '(답안 없음)',
          correctAnswer: problem.correct_answer,
          studentAnswerText: '(답안 없음)',
          correctAnswerText: problem.correct_answer,
        };
      }

      const isCorrect = studentAnswer === problem.correct_answer;

      // Extract choice number from answer text
      const extractChoiceNumber = (answerText: string) => {
        const numberMatch = answerText.match(/^(\d+)번?\./);
        if (numberMatch) {
          return numberMatch[1];
        }

        if (problem.choices) {
          const choiceIndex = problem.choices.findIndex((choice: string) => choice === answerText);
          if (choiceIndex !== -1) {
            return (choiceIndex + 1).toString();
          }
        }

        return answerText;
      };

      const studentAnswerNumber = extractChoiceNumber(studentAnswer);
      const correctAnswerNumber = extractChoiceNumber(problem.correct_answer);

      return {
        isCorrect,
        studentAnswer: studentAnswerNumber,
        correctAnswer: correctAnswerNumber,
        studentAnswerText: studentAnswer,
        correctAnswerText: problem.correct_answer,
      };
    } else if (isEnglish) {
      // English 과제의 경우
      const questionResult = sessionDetails.question_results?.find((qr: any) => qr.question_id.toString() === problemId);

      if (!questionResult) return null;

      return {
        isCorrect: questionResult.is_correct,
        studentAnswer: questionResult.student_answer,
        correctAnswer: questionResult.correct_answer,
        studentAnswerText: questionResult.student_answer,
        correctAnswerText: questionResult.correct_answer,
        score: questionResult.score,
        maxScore: questionResult.max_score,
        aiFeedback: questionResult.ai_feedback,
      };
    } else {
      // Math 과제의 경우
      const problemResult = sessionDetails.problem_results?.find((pr: any) => pr.problem_id.toString() === problemId);

      if (!problemResult) return null;

      return {
        isCorrect: problemResult.is_correct,
        studentAnswer: problemResult.user_answer,
        correctAnswer: problemResult.correct_answer,
        studentAnswerText: problemResult.user_answer,
        correctAnswerText: problemResult.correct_answer,
        explanation: problemResult.explanation,
        score: problemResult.score,
        maxScore: problemResult.max_score,
      };
    }
  };

  const calculateScoreFromCorrectness = () => {
    if (!problems || !sessionDetails) return 0;

    let totalScore = 0;
    let totalProblems = 0;

    if (isEnglish && sessionDetails.question_results) {
      totalScore = sessionDetails.question_results.reduce((sum: number, qr: any) => sum + (qr.score || 0), 0);
      totalProblems = sessionDetails.question_results.length;
    } else if (isMath && sessionDetails.problem_results) {
      totalScore = sessionDetails.problem_results.reduce((sum: number, pr: any) => sum + (pr.score || 0), 0);
      totalProblems = sessionDetails.problem_results.length;
    } else {
      // Korean의 경우
      totalProblems = problems.length;
      let correctCount = 0;

      problems.forEach((problem) => {
        const answerStatus = getAnswerStatus(problem.id.toString());
        if (answerStatus?.isCorrect) {
          correctCount++;
        }
      });

      const pointsPerProblem = totalProblems <= 10 ? 10 : 5;
      totalScore = correctCount * pointsPerProblem;
    }

    return totalScore;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onBack}>뒤로 가기</Button>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">결과가 없습니다</p>
        <Button onClick={onBack}>뒤로 가기</Button>
      </div>
    );
  }

  // 서버에 저장된 실제 점수 사용 (선생님이 수정한 점수 반영)
  const currentScore = sessionDetails.total_score || sessionDetails.score || 0;
  const maxScore = sessionDetails.max_score || sessionDetails.max_possible_score || (problems.length * (problems.length <= 10 ? 10 : 5));
  const correctCount = isEnglish
    ? sessionDetails.question_results?.filter((qr: any) => qr.is_correct).length || 0
    : isMath
      ? sessionDetails.problem_results?.filter((pr: any) => pr.is_correct).length || 0
      : problems.filter(p => getAnswerStatus(p.id.toString())?.isCorrect).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{assignmentTitle} - 내 결과</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          {subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학'}
        </Badge>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>채점 결과 요약</span>
            <Badge variant={sessionDetails.is_reviewed ? "default" : "secondary"}>
              {sessionDetails.is_reviewed ? "검수 완료" : "자동 채점"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">총점</p>
              <p className="text-2xl font-bold text-blue-600">
                {currentScore}/{maxScore}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">정답 수</p>
              <p className="text-2xl font-bold text-green-600">
                {correctCount}/{problems.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">정답률</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((correctCount / problems.length) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">완료 시간</p>
              <p className="text-2xl font-bold text-gray-600">
                {sessionDetails.completion_time ? `${sessionDetails.completion_time}분` : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems Table */}
      <Card>
        <CardHeader>
          <CardTitle>문제별 상세 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">번호</TableHead>
                <TableHead className="w-20">결과</TableHead>
                <TableHead className="min-w-96">문제</TableHead>
                <TableHead className="w-32">내 답안</TableHead>
                <TableHead className="w-32">정답</TableHead>
                {(isEnglish || isMath) && <TableHead className="w-24">점수</TableHead>}
                {(isEnglish || isMath) && <TableHead className="w-40">피드백</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map((problem) => {
                  const answerStatus = getAnswerStatus(problem.id.toString());

                  return (
                    <TableRow key={problem.id}>
                      {/* 문제 번호 */}
                      <TableCell className="font-medium text-center">
                        {problem.sequence_order || problem.question_id}
                      </TableCell>

                      {/* 정답/오답 상태 */}
                      <TableCell className="text-center">
                        {answerStatus ? (
                          answerStatus.isCorrect ? (
                            <FaCheckCircle className="text-green-500 text-xl mx-auto" title="정답" />
                          ) : (
                            <FaTimesCircle className="text-red-500 text-xl mx-auto" title="오답" />
                          )
                        ) : (
                          <FaDotCircle className="text-gray-400 text-xl mx-auto" title="답안 없음" />
                        )}
                      </TableCell>

                      {/* 문제 내용 */}
                      <TableCell>
                        <div className="space-y-2">
                          {/* 문제 텍스트 */}
                          <div className="font-medium">
                            {isKorean ? (
                              problem.question
                            ) : isEnglish ? (
                              problem.question_text || problem.question
                            ) : (
                              <LaTeXRenderer content={problem.question || `문제 ${problem.sequence_order}`} />
                            )}
                          </div>

                          {/* 선택지 (객관식인 경우) */}
                          {(problem.choices || problem.question_choices) && (
                            <div className="text-sm space-y-1 ml-4">
                              {(problem.choices || problem.question_choices)?.map((choice: string, idx: number) => (
                                <div key={idx} className="flex items-start">
                                  <span className="font-medium mr-2 text-gray-500">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-gray-700">
                                    {isKorean || isEnglish ? choice : <LaTeXRenderer content={choice} />}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* 내 답안 */}
                      <TableCell>
                        <div className="text-center">
                          {answerStatus ? (
                            <Badge
                              variant={answerStatus.isCorrect ? "default" : "destructive"}
                              className="text-sm"
                            >
                              {(isKorean || isEnglish) ?
                                answerStatus.studentAnswer === '(답안 없음)' ?
                                  answerStatus.studentAnswer :
                                  `${answerStatus.studentAnswer}번`
                                : answerStatus.studentAnswer}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">답안 없음</span>
                          )}
                        </div>
                      </TableCell>

                      {/* 정답 */}
                      <TableCell>
                        <div className="text-center">
                          <Badge variant="outline" className="text-sm text-green-600">
                            {(isKorean || isEnglish) ?
                              answerStatus?.correctAnswer === '(답안 없음)' ?
                                answerStatus.correctAnswer :
                                `${answerStatus.correctAnswer}번`
                              : answerStatus?.correctAnswer}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* 점수 (영어/수학만) */}
                      {(isEnglish || isMath) && (
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">
                            {answerStatus?.score || 0}/{answerStatus?.maxScore || (problems.length <= 10 ? 10 : 5)}
                          </span>
                        </TableCell>
                      )}

                      {/* AI 피드백 (영어/수학만) */}
                      {(isEnglish || isMath) && (
                        <TableCell>
                          {answerStatus?.aiFeedback || answerStatus?.explanation ? (
                            <div className="text-sm text-gray-600 max-w-xs">
                              <FaInfoCircle className="inline mr-1 text-blue-500" />
                              {answerStatus.aiFeedback || answerStatus.explanation}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}