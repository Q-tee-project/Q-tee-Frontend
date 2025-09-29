'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaArrowLeft } from "react-icons/fa6";
import { BookOpen } from 'lucide-react';

interface KoreanProblem {
  id: number;
  sequence_order: number;
  korean_type: string;
  question_type: string;
  difficulty: string;
  question: string;
  choices: string[] | null;
  correct_answer: string;
  explanation: string;
  source_text?: string;
  source_title?: string;
  source_author?: string;
}

interface Worksheet {
  id: number;
  title: string;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  status: string;
  subject: string;
}

interface KoreanTestInterfaceProps {
  selectedWorksheet: Worksheet;
  currentProblem: KoreanProblem;
  worksheetProblems: KoreanProblem[];
  currentProblemIndex: number;
  answers: Record<number, string>;
  timeRemaining: number;
  isSubmitting: boolean;
  onAnswerChange: (problemId: number, answer: string) => void;
  onPreviousProblem: () => void;
  onNextProblem: () => void;
  onSubmitTest: () => void;
  onBackToAssignmentList: () => void;
  formatTime: (seconds: number) => string;
}

export function KoreanTestInterface({
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
  formatTime,
}: KoreanTestInterfaceProps) {
  const currentAnswer = answers[currentProblem.id] || '';

  const handleChoiceClick = (choice: string) => {
    onAnswerChange(currentProblem.id, choice);
  };

  return (
    <Card className="w-5/6 flex flex-col shadow-sm">
      {/* 상단 네비게이션 */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToAssignmentList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
            <span>과제 목록으로</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              남은 시간: <span className="font-mono text-blue-600">{formatTime(timeRemaining)}</span>
            </div>
            <Badge variant="outline">
              {currentProblemIndex + 1} / {worksheetProblems.length}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">{selectedWorksheet.title}</h2>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {currentProblem.korean_type}
          </Badge>
          <Badge variant="outline">
            {currentProblem.difficulty}
          </Badge>
        </div>
      </CardHeader>

      {/* 문제 내용 */}
      <CardContent className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* 출처 텍스트 */}
          {currentProblem.source_text && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">출처</span>
                {currentProblem.source_title && (
                  <Badge variant="outline" className="text-xs">
                    {currentProblem.source_title}
                  </Badge>
                )}
                {currentProblem.source_author && (
                  <span className="text-xs text-gray-500">- {currentProblem.source_author}</span>
                )}
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {currentProblem.source_text}
              </div>
            </div>
          )}

          {/* 문제 */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-lg font-semibold text-blue-600 mt-1">
                {currentProblem.sequence_order}.
              </span>
              <div className="flex-1">
                <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentProblem.question}
                </div>
              </div>
            </div>

            {/* 객관식 선택지 */}
            {currentProblem.choices && Array.isArray(currentProblem.choices) && currentProblem.choices.length > 0 && (
              <div className="space-y-3 ml-8">
                {currentProblem.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoiceClick(choice)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      currentAnswer === choice
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`font-semibold ${
                        currentAnswer === choice ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {'①②③④⑤⑥⑦⑧⑨⑩'[index] || `${index + 1}.`}
                      </span>
                      <span className="flex-1">{choice.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* 하단 네비게이션 */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPreviousProblem}
            disabled={currentProblemIndex === 0}
          >
            이전 문제
          </Button>

          <div className="flex items-center gap-3">
            {currentProblemIndex === worksheetProblems.length - 1 ? (
              <Button
                onClick={onSubmitTest}
                disabled={isSubmitting || Object.keys(answers).length < worksheetProblems.length}
                className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400"
              >
                {isSubmitting ? '제출 중...' : Object.keys(answers).length < worksheetProblems.length ? `과제 제출 (${Object.keys(answers).length}/${worksheetProblems.length})` : '과제 제출'}
              </Button>
            ) : (
              <Button
                onClick={onNextProblem}
                disabled={currentProblemIndex === worksheetProblems.length - 1}
              >
                다음 문제
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}