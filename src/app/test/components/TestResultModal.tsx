'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { MathProblem } from '@/types/math';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  session_id: string;
  correct_count: number;
  total_problems: number;
  score: number;
  problem_results: Array<{
    problem_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    problem: MathProblem;
  }>;
}

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResult: TestResult;
}

export const TestResultModal: React.FC<TestResultModalProps> = ({
  isOpen,
  onClose,
  testResult,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!testResult?.problem_results) return null;

  const currentResult = testResult.problem_results[currentIndex];
  const currentProblem = currentResult?.problem;

  const goToNext = () => {
    if (currentIndex < testResult.problem_results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getProblemTypeInKorean = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'multiple_choice':
        return '객관식';
      case 'essay':
        return '서술형';
      case 'short_answer':
        return '단답형';
      default:
        return type;
    }
  };

  const getResultIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getResultBadge = (isCorrect: boolean) => {
    return isCorrect ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">정답</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">오답</Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">채점 결과</DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-sm text-gray-600">
                  총 {testResult.total_problems}문제 중 {testResult.correct_count}문제 정답
                </div>
                <div className="text-lg font-bold text-blue-600">{testResult.score}점</div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {currentProblem && (
          <div className="space-y-6 mt-6">
            {/* 문제 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                  {currentProblem.sequence_order}
                </span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {getProblemTypeInKorean(currentProblem.problem_type)}
                  </Badge>
                  <Badge
                    className={`${
                      currentProblem.difficulty === 'A'
                        ? 'border-red-300 text-red-600 bg-red-50'
                        : currentProblem.difficulty === 'B'
                        ? 'border-green-300 text-green-600 bg-green-50'
                        : 'border-purple-300 text-purple-600 bg-purple-50'
                    }`}
                  >
                    {currentProblem.difficulty}
                  </Badge>
                  {getResultBadge(currentResult.is_correct)}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {currentIndex + 1} / {testResult.problem_results.length}
              </div>
            </div>

            {/* 문제 내용 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                ❓ 문제
              </h3>
              <div className="text-base leading-relaxed text-gray-900">
                <LaTeXRenderer content={currentProblem.question} />
              </div>

              {/* 객관식 선택지 */}
              {currentProblem.problem_type === 'multiple_choice' && currentProblem.choices && (
                <div className="mt-4 space-y-2">
                  {currentProblem.choices.map((choice, index) => {
                    const optionLabel = String.fromCharCode(65 + index);
                    const isUserAnswer = currentResult.user_answer === optionLabel;
                    const isCorrectAnswer = currentResult.correct_answer === optionLabel;

                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 border rounded-lg ${
                          isCorrectAnswer
                            ? 'bg-green-50 border-green-200'
                            : isUserAnswer && !isCorrectAnswer
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{optionLabel}.</span>
                          {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {isUserAnswer && !isCorrectAnswer && (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 text-gray-900">
                          <LaTeXRenderer content={choice} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 답안 비교 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 내 답안 */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {getResultIcon(currentResult.is_correct)}내 답안
                </h3>
                <div className="bg-gray-50 p-4 rounded border min-h-20">
                  {currentResult.user_answer ? (
                    currentProblem.problem_type === 'multiple_choice' ? (
                      <div className="text-lg font-medium text-gray-900">
                        {currentResult.user_answer}번
                      </div>
                    ) : (
                      <LaTeXRenderer content={currentResult.user_answer} />
                    )
                  ) : (
                    <div className="text-gray-500 italic">답안을 입력하지 않았습니다</div>
                  )}
                </div>
              </div>

              {/* 정답 */}
              <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  ✅ 정답
                </h3>
                <div className="bg-white p-4 rounded border min-h-20">
                  {currentProblem.problem_type === 'multiple_choice' ? (
                    <div className="text-lg font-medium text-green-700">
                      {currentResult.correct_answer}번
                    </div>
                  ) : (
                    <LaTeXRenderer content={currentResult.correct_answer} />
                  )}
                </div>
              </div>
            </div>

            {/* 해설 */}
            {currentProblem.explanation && (
              <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  💡 해설
                </h3>
                <div className="text-base leading-relaxed text-gray-900">
                  <LaTeXRenderer content={currentProblem.explanation} />
                </div>
              </div>
            )}

            {/* 네비게이션 */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전 문제
              </Button>

              <div className="flex gap-2">
                {testResult.problem_results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-8 h-8 rounded-full border-2 font-medium text-sm ${
                      index === currentIndex
                        ? 'bg-blue-600 text-white border-blue-600'
                        : result.is_correct
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <Button
                onClick={goToNext}
                disabled={currentIndex === testResult.problem_results.length - 1}
                variant="outline"
                className="flex items-center gap-2"
              >
                다음 문제
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <Button onClick={onClose} className="bg-[#0072CE] hover:bg-[#0056A3] text-white">
            결과 확인 완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
