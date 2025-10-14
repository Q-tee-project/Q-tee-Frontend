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

  return (
    <Card className="flex flex-col shadow-sm h-full">
      {/* 상단 네비게이션 */}
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-100 flex-shrink-0">
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

      {/* 문제 내용 */}
      <CardContent className="flex-1 overflow-y-auto p-6 min-h-0">
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
              <div className="text-sm text-gray-800 leading-relaxed">
                {renderFormattedText(currentProblem.source_text)}
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
                <div className="text-lg text-gray-800 leading-relaxed">
                  {renderFormattedText(currentProblem.question)}
                </div>
              </div>
            </div>

            {/* 객관식 선택지 (수학 인터페이스 방식 적용) */}
            {currentProblem.choices && Array.isArray(currentProblem.choices) && currentProblem.choices.length > 0 && (
              <div className="space-y-3 ml-8">
                {currentProblem.choices.map((choice, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // 'A', 'B', 'C'...
                  const isSelected = currentAnswer === optionLabel;
                  const displayChoice = choice.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '');

                  return (
                    <label
                      key={index}
                      className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`problem-${currentProblem.id}`}
                        value={optionLabel}
                        checked={isSelected}
                        onChange={(e) => onAnswerChange(currentProblem.id, e.target.value)}
                        className="mt-1"
                      />
                      <span className="flex-1">{renderFormattedText(displayChoice)}</span>
                    </label>
                  );
                })}
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
            <Button
              onClick={onNextProblem}
              disabled={currentProblemIndex === worksheetProblems.length - 1}
            >
              다음 문제
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}