'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface PurchasedWorksheet {
  purchase_id: number;
  product_id: number;
  title: string;
  worksheet_title: string;
  service: string;
  original_worksheet_id: number;
  purchased_at: string;
  access_granted: boolean;
}

interface KoreanProblem {
  id: number;
  sequence_order: number;
  question: string;
  problem_type: string;
  difficulty: string;
  correct_answer: string;
  choices?: string[];
  explanation?: string;
  passage?: string;
}

interface PurchasedKoreanWorksheetDetailProps {
  worksheet: PurchasedWorksheet;
  problems: KoreanProblem[];
  showAnswerSheet: boolean;
  onToggleAnswerSheet: () => void;
}

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

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'A':
      return 'bg-green-100 text-green-700';
    case 'B':
      return 'bg-yellow-100 text-yellow-700';
    case 'C':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const PurchasedKoreanWorksheetDetail: React.FC<PurchasedKoreanWorksheetDetailProps> = ({
  worksheet,
  problems,
  showAnswerSheet,
}) => {
  if (!worksheet) {
    return (
      <Card className="flex-1 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">워크시트를 선택하세요.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 shadow-sm">
      <CardHeader className="py-3 px-6 border-b border-gray-100">
        <CardTitle className="text-lg font-medium">
          {showAnswerSheet ? '정답지' : '문제지'} ({problems.length}문제)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6">
            {problems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                문제를 불러올 수 없습니다.
              </div>
            ) : (
              <div className="space-y-8">
                {problems.map((problem, index) => (
                  <div key={problem.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    {/* 문제 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-600 text-white text-sm font-medium px-3 py-1 rounded">
                          {problem.sequence_order || index + 1}번
                        </div>
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}단계
                        </Badge>
                        <Badge variant="outline">
                          {getProblemTypeInKorean(problem.problem_type)}
                        </Badge>
                      </div>
                    </div>

                    {/* 지문 (있는 경우) */}
                    {problem.passage && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-800 mb-3">지문</h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {problem.passage}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 문제 내용 */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-800 mb-3">문제</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {problem.question}
                        </div>
                      </div>
                    </div>

                    {/* 객관식 선택지 */}
                    {problem.problem_type === 'multiple_choice' && problem.choices && problem.choices.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-3">선택지</h4>
                        <div className="space-y-2">
                          {problem.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-start gap-3">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5
                                ${showAnswerSheet && problem.correct_answer === String.fromCharCode(65 + choiceIndex)
                                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                  : 'bg-gray-100 text-gray-600'
                                }
                              `}>
                                {String.fromCharCode(65 + choiceIndex)}
                              </div>
                              <div className={`
                                flex-1 py-1 text-gray-700
                                ${showAnswerSheet && problem.correct_answer === String.fromCharCode(65 + choiceIndex)
                                  ? 'font-medium text-green-700'
                                  : ''
                                }
                              `}>
                                {choice}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 정답 (정답지일 때만 표시) */}
                    {showAnswerSheet && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">정답</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <span className="text-green-700 font-medium text-lg">
                            {problem.correct_answer}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 해설 (정답지일 때만 표시) */}
                    {showAnswerSheet && problem.explanation && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">해설</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-blue-800 leading-relaxed whitespace-pre-line">
                            {problem.explanation}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};