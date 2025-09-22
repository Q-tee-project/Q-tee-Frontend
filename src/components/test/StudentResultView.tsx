'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaDotCircle } from 'react-icons/fa';

interface StudentResultViewProps {
  assignmentId: number;
  studentId: number;
  assignmentTitle: string;
  onBack: () => void;
  problems: any[];
}

export function StudentResultView({
  assignmentId,
  studentId,
  assignmentTitle,
  onBack,
  problems
}: StudentResultViewProps) {
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGradingResult();
  }, [assignmentId, studentId]);

  // Add a refresh button for debugging
  const handleRefresh = () => {
    loadGradingResult();
  };

  const loadGradingResult = async () => {
    try {
      setIsLoading(true);
      const result = await koreanService.getStudentGradingResult(assignmentId, studentId);
      setGradingResult(result);
    } catch (error: any) {
      console.error('Failed to load grading result:', error);
      setError(error.message || 'Failed to load grading result');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  if (!gradingResult) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No results available yet</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const getAnswerStatus = (problemId: string) => {
    const studentAnswer = gradingResult.multiple_choice_answers?.[problemId];
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{assignmentTitle} - 결과</h1>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          새로고침
        </Button>
      </div>

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
                {gradingResult.total_score}/{gradingResult.max_possible_score}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">정답률</p>
              <p className="text-2xl font-bold text-green-600">
                {gradingResult.correct_count}/{gradingResult.total_problems}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">백분율</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((gradingResult.correct_count / gradingResult.total_problems) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">상태</p>
              <Badge
                variant={gradingResult.status === 'approved' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {gradingResult.status === 'approved' ? '승인됨' : '대기중'}
              </Badge>
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
                                      <FaDotCircle className="text-blue-600 text-sm" title="내가 선택한 답" />
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
                                <span className="text-sm">내 답안: <strong>{answerStatus.studentAnswer}번</strong></span>
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
    </div>
  );
}