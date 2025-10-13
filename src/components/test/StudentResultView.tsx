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
import { TikZRenderer } from '@/components/TikZRenderer';

interface StudentResultViewProps {
  assignmentId: number;
  studentId: number;
  assignmentTitle: string;
  onBack: () => void;
  problems: any[];
  subject?: 'korean' | 'math' | 'english';
  classes?: any[];
  selectedClass?: string;
  onClassChange?: (classId: string) => void;
  selectedWorksheet?: any;
  onGetAnswerStatus?: (problemId: string) => { 
    studentAnswer?: string; 
    correctAnswer?: string; 
    isCorrect?: boolean;
    aiFeedback?: string;
    explanation?: string;
  } | null;
  onSessionDetailsChange?: (sessionDetails: any) => void;
  currentProblemIndex?: number;
  onProblemIndexChange?: (index: number) => void;
}

export function StudentResultView({
  assignmentId,
  studentId,
  assignmentTitle,
  onBack,
  problems,
  subject = 'korean',
  classes = [],
  selectedClass = 'all',
  onClassChange,
  selectedWorksheet,
  onGetAnswerStatus,
  onSessionDetailsChange,
  currentProblemIndex: externalProblemIndex = 0,
  onProblemIndexChange,
}: StudentResultViewProps) {
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 외부에서 제공된 currentProblemIndex를 사용하거나, 없으면 내부 상태 사용
  const currentProblemIndex = externalProblemIndex;
  const setCurrentProblemIndex = onProblemIndexChange || (() => {});

  const isKorean = subject === 'korean';
  const isMath = subject === 'math';
  const isEnglish = subject === 'english';

  // 정렬된 문제 목록
  const sortedProblems = (() => {
    if (!problems || problems.length === 0) return [];
    
    return [...problems].sort((a: any, b: any) => {
      if (isKorean) return a.sequence_order - b.sequence_order;
      if (isEnglish) return (a.question_id || 0) - (b.question_id || 0);
      return (a.sequence_order || 0) - (b.sequence_order || 0);
    });
  })();

  // 현재 문제
  const currentProblem = sortedProblems[currentProblemIndex];

  // 문제 네비게이션 함수들
  const goToPreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  const goToNextProblem = () => {
    if (currentProblemIndex < sortedProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  const goToProblem = (index: number) => {
    setCurrentProblemIndex(index);
  };

  // 문제 목록 표 컴포넌트 (미응시 화면과 동일한 스타일)
  const ProblemListTable = () => {
    if (!sortedProblems.length) return null;

    return (
      <div className="border rounded-lg">
        <div className="p-3 border-b bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700">문제 목록</h4>
        </div>
        <div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-center font-medium text-gray-600">번호</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">정답</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">답안</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">맞춘여부</th>
              </tr>
            </thead>
            <tbody>
              {sortedProblems.map((problem: any, index: number) => {
                const problemId = isKorean
                  ? problem.id
                  : isEnglish
                  ? problem.question_id
                  : problem.id;
                
                const answerStatus = getAnswerStatus(problemId?.toString());
                const isCurrentProblem = index === currentProblemIndex;
                
                return (
                  <tr
                    key={problemId}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                      isCurrentProblem ? 'bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => goToProblem(index)}
                  >
                    <td className="px-3 py-2 text-center font-medium">{index + 1}</td>
                    <td className="px-3 py-2 text-center text-xs text-gray-600">
                      {answerStatus?.correctAnswer || '-'}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-600">
                      {answerStatus?.studentAnswer || '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center">
                        {answerStatus?.isCorrect ? (
                          <FaCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <FaTimesCircle className="text-red-500 text-sm" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 현재 문제 렌더링 컴포넌트
  const CurrentProblemView = () => {
    if (!currentProblem) return null;

    const problemId = isKorean
      ? currentProblem.id
      : isEnglish
      ? currentProblem.question_id
      : currentProblem.id;

    const answerStatus = getAnswerStatus(problemId?.toString());
    const problemNumber = currentProblemIndex + 1;

    return (
      <div className="space-y-6">
        {/* 문제 번호와 상태 */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
            {problemNumber}
          </div>
          {answerStatus && (
            <div className="flex items-center gap-2">
              {answerStatus.isCorrect ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaTimesCircle className="text-red-500 text-xl" />
              )}
              <span className="text-sm font-medium">
                {answerStatus.isCorrect ? '정답' : '오답'}
              </span>
            </div>
          )}
        </div>

        {/* Source Text (Korean only) */}
        {isKorean && currentProblem.source_text && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              {currentProblem.source_title && (
                <span className="font-medium">{currentProblem.source_title}</span>
              )}
              {currentProblem.source_author && <span> - {currentProblem.source_author}</span>}
            </div>
            <div className="text-sm leading-relaxed">
              {renderFormattedText(currentProblem.source_text)}
            </div>
          </div>
        )}

        {/* Question */}
        <div>
          <div className="text-gray-900 font-medium">
            {isKorean ? (
              <div>{renderFormattedText(currentProblem.question)}</div>
            ) : isEnglish ? (
              <div>
                {currentProblem.question_text && <p>{currentProblem.question_text}</p>}
                {(currentProblem.passage || currentProblem.example_content) && (
                  <div className="bg-gray-50 p-3 rounded mt-2 mb-2">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {currentProblem.passage || currentProblem.example_content}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <LaTeXRenderer
                content={
                  (currentProblem.question || `문제 ${problemNumber}`)
                    .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '')
                    .trim()
                }
              />
            )}
          </div>

          {/* TikZ 그래프 */}
          {currentProblem.tikz_code && (
            <div className="mb-4">
              <TikZRenderer tikzCode={currentProblem.tikz_code} />
            </div>
          )}
        </div>

        {/* Choices */}
        {(currentProblem.choices || currentProblem.question_choices) && (
          <div className="space-y-2">
            {(currentProblem.choices || currentProblem.question_choices).map((choice: string, choiceIndex: number) => {
              const choiceLetter = String.fromCharCode(65 + choiceIndex);
              const isStudentAnswer = answerStatus?.studentAnswer === choiceLetter;
              const isCorrectAnswer = answerStatus?.correctAnswer === choiceLetter;

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
                      {isStudentAnswer && (
                        <FaDotCircle className="text-blue-600 text-sm" title="학생이 선택한 답" />
                      )}
                      {isCorrectAnswer && (
                        <FaCheckCircle className="text-green-600 text-sm" title="정답" />
                      )}
                    </div>
                    <div className="flex-1">
                      {isKorean ? (
                        <span>{renderFormattedText(choice)}</span>
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
        {isEnglish && !currentProblem.choices && answerStatus && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 font-medium">학생 답안:</span>
                <div className="mt-1 p-2 bg-white rounded border">
                  <p className="text-sm">{answerStatus.studentAnswer || '(답안 없음)'}</p>
                </div>
              </div>
              {answerStatus.correctAnswer !== '(수동 채점 필요)' && (
                <div>
                  <span className="text-sm text-gray-600 font-medium">예시 답안:</span>
                  <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">{answerStatus.correctAnswer}</p>
                  </div>
                </div>
              )}
              {answerStatus.aiFeedback && (
                <div>
                  <span className="text-sm text-gray-600 font-medium">AI 채점 피드백:</span>
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

        {/* Explanation */}
        {((isKorean && currentProblem.explanation) ||
          (isEnglish && currentProblem.explanation) ||
          (!isKorean && !isEnglish && answerStatus?.explanation)) && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">해설</h4>
            <div className="text-blue-800 text-sm">
              {isKorean ? (
                <div>{renderFormattedText(currentProblem.explanation)}</div>
              ) : isEnglish ? (
                <p>{currentProblem.explanation}</p>
              ) : (
                <LaTeXRenderer content={answerStatus?.explanation || ''} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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
          onSessionDetailsChange?.(result);
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
              onSessionDetailsChange?.(studentResult);
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
          onSessionDetailsChange?.(detailResult);
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
            onSessionDetailsChange?.(sessionDetail);
          } else {
            console.log('🔢 수학 직접 결과 사용:', studentResult);
            console.log('🔢 수학 problem_results:', studentResult.problem_results);
            setSessionDetails(studentResult);
            onSessionDetailsChange?.(studentResult);
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
    // 외부에서 전달받은 함수가 있으면 사용
    if (onGetAnswerStatus) {
      return onGetAnswerStatus(problemId);
    }

    // 기존 로직 (하위 호환성)
    if (!sessionDetails) return null;

    if (isKorean) {
      const problemResult = sessionDetails.problem_results?.find(
        (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
      );

      const problem = problems.find((p) => p.id.toString() === problemId);
      if (!problem) {
        return null;
      }

      const studentAnswer = problemResult?.user_answer || '(답안 없음)';
      const rawCorrectAnswer = problemResult?.correct_answer || problem.correct_answer;

      const normalize = (answer: string) => {
        if (!answer || !problem.choices || typeof answer !== 'string') return answer;
        const upperAnswer = answer.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(upperAnswer)) {
          return upperAnswer;
        }
        const choiceIndex = problem.choices.findIndex((c: string) => c === answer);
        if (choiceIndex !== -1) {
          return String.fromCharCode(65 + choiceIndex);
        }
        return answer; // fallback
      };

      const normalizedCorrectAnswer = normalize(rawCorrectAnswer);

      const isCorrect =
        problemResult?.is_correct !== undefined
          ? problemResult.is_correct
          : studentAnswer === normalizedCorrectAnswer;

      return {
        isCorrect,
        studentAnswer: studentAnswer,
        correctAnswer: normalizedCorrectAnswer,
        studentAnswerText: studentAnswer,
        correctAnswerText: rawCorrectAnswer,
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

  const renderFormattedText = (text: string | undefined | null) => {
    if (!text) return null;

    const parseLine = (line: string): React.ReactNode => {
      // Regex to find **bold** or <u>underline</u> tags, non-greedy
      const regex = /(\*\*.*?\*\*|<[uU]>.*?<\/[uU]>)/g;
      const parts = line.split(regex).filter(Boolean);

      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          // Recursively call parseLine for the content to handle nesting
          return <strong key={index}>{parseLine(content)}</strong>;
        }
        if (part.toLowerCase().startsWith('<u>') && part.toLowerCase().endsWith('</u>')) {
          const content = part.slice(3, -4);
          // Recursively call parseLine for the content to handle nesting
          return <u key={index}>{parseLine(content)}</u>;
        }
        return part; // Plain text part
      });
    };

    return text.split('\n').map((line, lineIndex, arr) => (
      <React.Fragment key={lineIndex}>
        {parseLine(line)}
        {lineIndex < arr.length - 1 && <br />}
      </React.Fragment>
    ));
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
    <Card className="flex flex-col shadow-sm h-full">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-100 flex-shrink-0">
        {/* 이전으로 돌아가기 버튼 */}
        <button
          onClick={onBack}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          style={{ backgroundColor: '#f5f5f5', borderRadius: '50%', cursor: 'pointer' }}
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>

        {/* 과제명 */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              {assignmentTitle}
            </span>
          </div>
        </div>

        {/* 과목 뱃지 */}
        <Badge variant="outline" className="text-sm">
          {subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학'}
        </Badge>
      </CardHeader>

      {/* 결과 내용 */}
      <CardContent className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="space-y-4">
          {/* 풀이 결과 헤더와 점수 요약 섹션 */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex flex-col gap-8">
              {/* 풀이 결과 텍스트 */}
              <h2 className="text-xl font-semibold">풀이 결과</h2>
              
              {/* 점수 요약 카드들 */}
              <div className="flex gap-4">
                {/* 점수 카드 */}
                <div className="flex-1 relative">
                  <span className="text-sm text-gray-600 absolute -top-6 left-0">점수</span>
                  <div className="p-4 bg-gray-50 rounded text-center">
                    <p className="text-lg font-bold text-gray-600">{currentScore}점</p>
                  </div>
                </div>
                
                {/* 맞춘 개수 카드 */}
                <div className="flex-1 relative">
                  <span className="text-sm text-gray-600 absolute -top-6 left-0">맞춘 개수</span>
                  <div className="p-4 bg-gray-50 rounded text-center">
                    <p className="text-lg font-bold text-gray-600">
                      {correctCount}/{problems.length}개
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 풀이 내역 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">풀이 내역</h3>
            
            {/* 현재 문제 */}
            <div className="h-full overflow-y-auto">
              <CurrentProblemView />
            </div>
            
            {/* 하단 네비게이션 */}
            {sortedProblems.length > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={goToPreviousProblem}
                  disabled={currentProblemIndex === 0}
                  className="flex items-center gap-2"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  이전 문제
                </Button>
                
                <div className="text-sm text-gray-600">
                  {currentProblemIndex + 1} / {sortedProblems.length}
                </div>
                
                <Button
                  variant="outline"
                  onClick={goToNextProblem}
                  disabled={currentProblemIndex === sortedProblems.length - 1}
                  className="flex items-center gap-2"
                >
                  다음 문제
                  <FaArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
