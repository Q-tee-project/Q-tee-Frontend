'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';
import { HandwritingCanvas } from '@/components/HandwritingCanvas';
import { FaArrowLeft } from "react-icons/fa6";
import { BookOpen } from 'lucide-react';
import { Worksheet, MathProblem } from '@/types/math';

interface TestInterfaceProps {
  selectedWorksheet: Worksheet;
  currentProblem: MathProblem;
  worksheetProblems: MathProblem[];
  currentProblemIndex: number;
  answers: Record<number, string>;
  timeRemaining: number;
  isSubmitting: boolean;
  onAnswerChange: (problemId: number, answer: string) => void;
  onPreviousProblem: () => void;
  onNextProblem: () => void;
  onSubmitTest: () => void;
  onBackToAssignmentList: () => void;
  onOpenScratchpad: () => void;
  getProblemTypeInKorean: (type: string) => string;
  formatTime: (seconds: number) => string;
  onOCRCapture?: (problemId: number, imageBlob: Blob) => void;
}

export function TestInterface({
  selectedWorksheet,
  currentProblem,
  worksheetProblems,
  currentProblemIndex,
  answers,
  timeRemaining,
  isSubmitting,
  onAnswerChange,
  onPreviousProblem,
  onNextProblem,
  onSubmitTest,
  onBackToAssignmentList,
  onOpenScratchpad,
  getProblemTypeInKorean,
  formatTime,
  onOCRCapture,
}: TestInterfaceProps) {
  return (
    <Card className="flex flex-col shadow-sm h-full">
      {/* 상단 네비게이션 */}
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-100">
        {/* 이전으로 돌아가기 버튼 */}
        <button
          onClick={onBackToAssignmentList}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          style={{ backgroundColor: '#f5f5f5', borderRadius: '50%', cursor: 'pointer' }}
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>

        {/* 문제지명과 남은 시간 */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              {selectedWorksheet.title}
            </span>
          </div>
          <div className="px-3 py-2 rounded-md" style={{ backgroundColor: '#f5f5f5' }}>
            <span className="text-lg font-semibold text-gray-900">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* 제출하기 버튼 */}
        <Button
          onClick={onSubmitTest}
          disabled={isSubmitting || Object.keys(answers).length < worksheetProblems.length}
          className="bg-[#0072CE] hover:bg-[#0056A3] text-white disabled:bg-gray-400"
        >
          {isSubmitting ? '제출 중...' : Object.keys(answers).length < worksheetProblems.length ? `제출하기 (${Object.keys(answers).length}/${worksheetProblems.length})` : '제출하기'}
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-6 min-h-0">
        <div className="h-full custom-scrollbar overflow-y-auto">
          <div className="space-y-6">
            {/* 문제 정보 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm border border-[#0072CE]/30 text-[#0072CE] rounded-full text-sm font-bold">
                  {currentProblem.sequence_order}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
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
                </div>

                {/* 문제 내용 */}
                <div className="text-base leading-relaxed text-gray-900 mb-6">
                  <LaTeXRenderer
                    content={currentProblem.question.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '').trim()}
                  />
                </div>

                {/* TikZ 그래프 (있는 경우) */}
                {currentProblem.tikz_code && (
                  <div className="mb-6">
                    <TikZRenderer tikzCode={currentProblem.tikz_code} />
                  </div>
                )}

                {/* 답안 입력 영역 */}
                <div className="space-y-4">
                  {currentProblem.problem_type === 'multiple_choice' &&
                  currentProblem.choices &&
                  Array.isArray(currentProblem.choices) ? (
                    <div className="space-y-3">
                      {currentProblem.choices.map((choice, index) => {
                        const optionLabel = String.fromCharCode(65 + index);
                        const isSelected = answers[currentProblem.id] === optionLabel;
                        const displayChoice = choice.replace(/^[A-E][\.\):\s]+/, '');
                        return (
                          <label
                            key={index}
                            className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              name={`problem-${currentProblem.id}`}
                              value={optionLabel}
                              checked={isSelected}
                              onChange={(e) =>
                                onAnswerChange(currentProblem.id, e.target.value)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 text-gray-900">
                              <LaTeXRenderer content={displayChoice} />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : currentProblem.problem_type === 'short_answer' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          답 (핸드라이팅):
                        </label>
                        <Button
                          onClick={onOpenScratchpad}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-[#0072CE] border-[#0072CE]"
                        >
                          <BookOpen className="w-4 h-4" />
                          연습장
                        </Button>
                      </div>
                      <HandwritingCanvas
                        key={`short-answer-${currentProblem.id}`}
                        width={580}
                        height={120}
                        value={answers[currentProblem.id] || ''}
                        onChange={(value) => onAnswerChange(currentProblem.id, value)}
                        onImageCapture={(blob) => onOCRCapture?.(currentProblem.id, blob)}
                        enableOCR={true}
                        problemType={currentProblem.problem_type}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          풀이 과정 (핸드라이팅):
                        </label>
                        <Button
                          onClick={onOpenScratchpad}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-[#0072CE] border-[#0072CE]"
                        >
                          <BookOpen className="w-4 h-4" />
                          연습장
                        </Button>
                      </div>
                      <HandwritingCanvas
                        key={`essay-${currentProblem.id}`}
                        width={580}
                        height={300}
                        value={answers[currentProblem.id] || ''}
                        onChange={(value) => onAnswerChange(currentProblem.id, value)}
                        onImageCapture={(blob) => onOCRCapture?.(currentProblem.id, blob)}
                        enableOCR={true}
                        problemType={currentProblem.problem_type}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 하단 네비게이션 */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={onPreviousProblem}
            disabled={currentProblemIndex === 0}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
          >
            이전
          </Button>

          <div className="text-sm text-gray-500">
            {currentProblemIndex + 1} / {worksheetProblems.length}
          </div>

          <Button
            onClick={onNextProblem}
            disabled={currentProblemIndex === worksheetProblems.length - 1}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
          >
            다음
          </Button>
        </div>
      </div>
    </Card>
  );
}
