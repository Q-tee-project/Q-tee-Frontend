'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaDotCircle } from 'react-icons/fa';
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
  subject = 'korean',
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
          try {
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
          } catch (secondError) {
            console.error('🇰🇷 국어 getAssignmentResults도 실패:', secondError);
            throw new Error(`국어 과제 결과를 불러올 수 없습니다: ${secondError}`);
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
          console.log('🎯 영어 학생 결과:', studentResult);

          // result_id 찾기 - 여러 가능한 필드 확인
          const resultId =
            studentResult.result_id ||
            studentResult.id ||
            studentResult.grading_session_id ||
            studentResult.grading_result_id;

          console.log('🎯 사용할 result_id:', resultId);

          if (!resultId) {
            console.error('🎯 result_id를 찾을 수 없습니다:', studentResult);
            throw new Error('영어 과제 결과 ID를 찾을 수 없습니다');
          }

          const detailResult = await EnglishService.getEnglishAssignmentResultDetail(resultId);
          console.log('🎯 영어 상세 결과:', detailResult);
          console.log('🎯 영어 question_results:', detailResult.question_results);
          console.log('🎯 영어 answers:', detailResult.answers);
          setSessionDetails(detailResult);
        } else {
          throw new Error('영어 과제 결과를 찾을 수 없습니다');
        }
      } else {
        // 수학 과제 결과 로드
        console.log('🔢 수학 과제 결과 로드 시도:', { assignmentId, studentId });
        const assignmentResults = await mathService.getAssignmentResults(assignmentId);
        console.log('🔢 수학 과제 결과들:', assignmentResults);

        // 응답 형식 확인 및 처리
        let resultsList: any[] = [];

        if (Array.isArray(assignmentResults)) {
          resultsList = assignmentResults;
        } else if (assignmentResults && (assignmentResults as any).results) {
          // {results: [...]} 형태인 경우
          resultsList = (assignmentResults as any).results;
        } else if (assignmentResults && (assignmentResults as any).grading_sessions) {
          // {grading_sessions: [...]} 형태인 경우
          resultsList = (assignmentResults as any).grading_sessions;
        } else if (assignmentResults && typeof assignmentResults === 'object') {
          // 단일 객체인 경우 배열로 변환
          console.log('🔢 수학 결과가 단일 객체, 배열로 변환:', assignmentResults);
          resultsList = [assignmentResults];
        } else {
          console.error('🔢 수학 결과 형식을 처리할 수 없음:', assignmentResults);
          throw new Error('수학 과제 결과 형식이 올바르지 않습니다');
        }

        console.log('🔢 처리된 결과 목록:', resultsList);

        const studentResult = resultsList.find(
          (r: any) =>
            r.student_id === studentId ||
            r.graded_by === studentId.toString() ||
            r.graded_by === studentId,
        );

        if (studentResult) {
          // 세션 상세 정보 추가 로드
          if (studentResult.id || studentResult.grading_session_id) {
            const sessionId = studentResult.id || studentResult.grading_session_id;
            const sessionDetail = await mathService.getGradingSessionDetails(sessionId);
            console.log('🔢 수학 상세 결과:', sessionDetail);
            console.log('🔢 수학 problem_results:', sessionDetail.problem_results);
            setSessionDetails(sessionDetail);
          } else {
            console.log('🔢 수학 직접 결과 사용:', studentResult);
            console.log('🔢 수학 problem_results:', studentResult.problem_results);
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
      // Korean 과제의 경우 - problem_results에서만 찾기 (multiple_choice_answers 제거)
      const problemResult = sessionDetails.problem_results?.find(
        (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
      );

      let studentAnswer = problemResult?.user_answer || problemResult?.student_answer;

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
      let questionResult = sessionDetails.question_results?.find(
        (qr: any) => qr.question_id?.toString() === problemId || qr.id?.toString() === problemId,
      );

      // question_results에서 찾지 못했다면 answers 배열에서 찾기
      if (!questionResult && sessionDetails.answers) {
        questionResult = sessionDetails.answers.find(
          (answer: any) =>
            answer.question_id?.toString() === problemId || answer.id?.toString() === problemId,
        );
      }

      if (!questionResult) {
        console.log(`영어 문제 ${problemId} 결과를 찾을 수 없음:`, {
          question_results: sessionDetails.question_results,
          answers: sessionDetails.answers,
          sessionDetails: sessionDetails,
        });
        return null;
      }

      return {
        isCorrect: questionResult.is_correct || false,
        studentAnswer: questionResult.student_answer || questionResult.user_answer || '(답안 없음)',
        correctAnswer: questionResult.correct_answer || '정답 정보 없음',
        studentAnswerText:
          questionResult.student_answer || questionResult.user_answer || '(답안 없음)',
        correctAnswerText: questionResult.correct_answer || '정답 정보 없음',
        score: questionResult.score || 0,
        maxScore: questionResult.max_score || (problems.length <= 10 ? 10 : 5),
        aiFeedback: questionResult.ai_feedback,
      };
    } else {
      // Math 과제의 경우
      const problemResult = sessionDetails.problem_results?.find(
        (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
      );

      if (!problemResult) {
        console.log(`수학 문제 ${problemId} 결과를 찾을 수 없음:`, {
          problem_results: sessionDetails.problem_results,
          sessionDetails: sessionDetails,
        });
        return null;
      }

      return {
        isCorrect: problemResult.is_correct || false,
        studentAnswer: problemResult.user_answer || '(답안 없음)',
        correctAnswer: problemResult.correct_answer || '정답 정보 없음',
        studentAnswerText: problemResult.user_answer || '(답안 없음)',
        correctAnswerText: problemResult.correct_answer || '정답 정보 없음',
        explanation: problemResult.explanation,
        score: problemResult.score || 0,
        maxScore: problemResult.max_score || (problems.length <= 10 ? 10 : 5),
      };
    }
  };

  const calculateScoreFromCorrectness = () => {
    if (!problems || !sessionDetails) return 0;

    let totalScore = 0;
    let totalProblems = 0;

    if (isEnglish && sessionDetails.question_results) {
      totalScore = sessionDetails.question_results.reduce(
        (sum: number, qr: any) => sum + (qr.score || 0),
        0,
      );
      totalProblems = sessionDetails.question_results.length;
    } else if (isMath && sessionDetails.problem_results) {
      totalScore = sessionDetails.problem_results.reduce(
        (sum: number, pr: any) => sum + (pr.score || 0),
        0,
      );
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
  const maxScore =
    sessionDetails.max_score ||
    sessionDetails.max_possible_score ||
    problems.length * (problems.length <= 10 ? 10 : 5);
  const correctCount = isEnglish
    ? sessionDetails.question_results?.filter((qr: any) => qr.is_correct).length || 0
    : isMath
    ? sessionDetails.problem_results?.filter((pr: any) => pr.is_correct).length || 0
    : problems.filter((p) => getAnswerStatus(p.id.toString())?.isCorrect).length;

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

      {/* Problems Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">문제별 결과</h2>

        {(isEnglish
          ? sessionDetails.worksheet_data?.questions || []
          : isKorean || problems.length > 0
          ? problems
          : sessionDetails.problem_results || []
        )
          .sort((a: any, b: any) => {
            if (isKorean) return a.sequence_order - b.sequence_order;
            if (isEnglish) return (a.question_id || 0) - (b.question_id || 0);
            // 수학: problems 배열이 있으면 sequence_order, 없으면 problem_id
            if (problems.length > 0) return (a.sequence_order || 0) - (b.sequence_order || 0);
            return a.problem_id - b.problem_id;
          })
          .map((item: any, index: number) => {
            // 수학에서 problems 배열이 있으면 문제 정보 사용
            let problemItem = item;

            const problemId = isKorean
              ? item.id
              : isEnglish
              ? item.question_id
              : problems.length > 0
              ? item.id
              : item.problem_id;
            const problemNumber = isKorean
              ? item.sequence_order
              : isEnglish
              ? item.question_id
              : problems.length > 0
              ? item.sequence_order || index + 1
              : index + 1;
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
                            {item.source_title && (
                              <span className="font-medium">{item.source_title}</span>
                            )}
                            {item.source_author && <span> - {item.source_author}</span>}
                          </div>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {item.source_text}
                          </div>
                        </div>
                      )}

                      {/* Question */}
                      <div className="mb-4">
                        <div className="text-gray-900 font-medium">
                          {isKorean ? (
                            <p>{item.question}</p>
                          ) : isEnglish ? (
                            <div>
                              {item.question_text && <p>{item.question_text}</p>}
                              {item.passage && (
                                <div className="bg-gray-50 p-3 rounded mt-2 mb-2">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {item.passage}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <LaTeXRenderer
                              content={
                                problemItem.question || item.question || `문제 ${problemNumber}`
                              }
                            />
                          )}
                        </div>
                      </div>

                      {/* Choices */}
                      {item.choices && (
                        <div className="space-y-2 mb-4">
                          {item.choices.map((choice: string, choiceIndex: number) => {
                            const choiceNumber = (choiceIndex + 1).toString();
                            const isStudentAnswer = isEnglish
                              ? answerStatus?.studentAnswer === choice
                              : answerStatus?.studentAnswer === choiceNumber;
                            const isCorrectAnswer = isEnglish
                              ? answerStatus?.correctAnswer === choice
                              : answerStatus?.correctAnswer === choiceNumber;

                            let choiceStyle = 'p-3 rounded-lg border ';
                            if (isCorrectAnswer) {
                              choiceStyle += 'bg-green-100 border-green-300 text-green-800';
                            } else if (isStudentAnswer && !isCorrectAnswer) {
                              choiceStyle += 'bg-red-100 border-red-300 text-red-800';
                            } else {
                              choiceStyle += 'bg-gray-50 border-gray-200';
                            }

                            return (
                              <div key={choiceIndex} className={choiceStyle}>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{choiceNumber}.</span>
                                    {isStudentAnswer && (
                                      <FaDotCircle
                                        className="text-blue-600 text-sm"
                                        title="학생이 선택한 답"
                                      />
                                    )}
                                    {isCorrectAnswer && (
                                      <FaCheckCircle
                                        className="text-green-600 text-sm"
                                        title="정답"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    {isKorean ? (
                                      <span>{choice}</span>
                                    ) : isEnglish ? (
                                      <span>{choice}</span>
                                    ) : (
                                      <LaTeXRenderer content={choice || ''} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 영어 단답형/서술형 답안 표시 */}
                      {isEnglish && !item.choices && answerStatus && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-600 font-medium">학생 답안:</span>
                              <div className="mt-1 p-2 bg-white rounded border">
                                <p className="text-sm">
                                  {answerStatus.studentAnswer || '(답안 없음)'}
                                </p>
                              </div>
                            </div>
                            {answerStatus.correctAnswer !== '(수동 채점 필요)' && (
                              <div>
                                <span className="text-sm text-gray-600 font-medium">
                                  예시 답안:
                                </span>
                                <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                                  <p className="text-sm text-green-800">
                                    {answerStatus.correctAnswer}
                                  </p>
                                </div>
                              </div>
                            )}
                            {/* AI 피드백 표시 */}
                            {answerStatus.aiFeedback && (
                              <div>
                                <span className="text-sm text-gray-600 font-medium">
                                  AI 채점 피드백:
                                </span>
                                <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                    {answerStatus.aiFeedback}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Answer Summary (ReadOnly) */}
                      {answerStatus && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <FaDotCircle className="text-blue-600" />
                                <span className="text-sm">
                                  학생 답안:{' '}
                                  <strong>
                                    {isKorean
                                      ? `${answerStatus.studentAnswer}번`
                                      : isEnglish
                                      ? answerStatus.studentAnswer || '(답안 없음)'
                                      : answerStatus.studentAnswer}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600" />
                                <span className="text-sm">
                                  {isEnglish && answerStatus.correctAnswer === '(수동 채점 필요)'
                                    ? '수동 채점:'
                                    : '정답:'}{' '}
                                  <strong>
                                    {isKorean
                                      ? `${answerStatus.correctAnswer}번`
                                      : answerStatus.correctAnswer}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            {/* Status Badge (ReadOnly) */}
                            <Badge variant={answerStatus.isCorrect ? 'default' : 'destructive'}>
                              {answerStatus.isCorrect ? '정답' : '오답'}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {((isKorean && item.explanation) ||
                        (!isKorean && answerStatus?.explanation)) && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">해설</h4>
                          <div className="text-blue-800 text-sm">
                            {isKorean ? (
                              <p>{item.explanation}</p>
                            ) : (
                              <LaTeXRenderer content={answerStatus?.explanation || ''} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
