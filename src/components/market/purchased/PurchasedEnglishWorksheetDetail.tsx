'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EnglishContentRenderer } from '@/components/EnglishContentRenderer';

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

// 영어 문제 타입 (API 응답에 맞춤)
interface EnglishProblem {
  id: number;
  sequence_order: number;
  question: string;
  problem_type: string;
  question_subject: string;
  difficulty: string;
  correct_answer: string;
  choices?: string[];
  explanation?: string;
  learning_point?: string;
  example_content?: string;
  passage?: string; // 기존 호환성
  passage_content?: string; // 영어 서비스에서 반환하는 지문 필드
  source_text?: string;
  source_title?: string;
  audio_url?: string;
}

interface PurchasedEnglishWorksheetDetailProps {
  worksheet: PurchasedWorksheet;
  problems: EnglishProblem[];
  showAnswerSheet: boolean;
  onToggleAnswerSheet: () => void;
}

const getProblemTypeInKorean = (type: string): string => {
  switch (type) {
    case '객관식':
    case 'multiple_choice':
      return '객관식';
    case '서술형':
    case 'essay':
      return '서술형';
    case '단답형':
    case 'short_answer':
      return '단답형';
    case 'listening':
      return '듣기';
    case 'reading':
      return '독해';
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

export const PurchasedEnglishWorksheetDetail: React.FC<PurchasedEnglishWorksheetDetailProps> = ({
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
                        <div className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded">
                          {problem.sequence_order || index + 1}번
                        </div>
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {getProblemTypeInKorean(problem.problem_type)}
                        </Badge>
                        {/* 문제 영역 표시 */}
                        {problem.question_subject && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {problem.question_subject}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 오디오 (듣기 문제인 경우) */}
                    {problem.audio_url && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-800 mb-3">오디오</h3>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <audio controls className="w-full">
                            <source src={problem.audio_url} type="audio/mpeg" />
                            브라우저에서 오디오를 지원하지 않습니다.
                          </audio>
                        </div>
                      </div>
                    )}

                    {/* 지문 (있는 경우) */}
                    {(problem.passage || problem.passage_content) && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-800 mb-3">지문</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <EnglishContentRenderer
                            content={problem.passage || problem.passage_content || ''}
                            className="text-gray-700 leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* 문제 내용 */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-800 mb-3">문제</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <EnglishContentRenderer
                          content={problem.question}
                          className="text-gray-700 leading-relaxed"
                        />
                        {/* 예문 표시 */}
                        {problem.example_content && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-blue-600">📝 예문</span>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <EnglishContentRenderer
                                content={problem.example_content}
                                className="text-gray-800 leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 객관식 선택지 */}
                    {(problem.problem_type === 'multiple_choice' || problem.problem_type === '객관식') && problem.choices && problem.choices.length > 0 && (
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
                                <EnglishContentRenderer content={choice} />
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
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">해설</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <EnglishContentRenderer
                            content={problem.explanation}
                            className="text-blue-800 leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* 학습 포인트 (정답지일 때만 표시) */}
                    {showAnswerSheet && problem.learning_point && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">학습 포인트</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <EnglishContentRenderer
                            content={problem.learning_point}
                            className="text-green-800 leading-relaxed"
                          />
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