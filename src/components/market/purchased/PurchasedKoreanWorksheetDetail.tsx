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
  source_text?: string;
  source_title?: string;
  source_author?: string;
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
                {(() => {
                  // 작품별로 문제들을 그룹핑
                  const workGroups = new Map();
                  problems.forEach((problem: any) => {
                    if (problem.source_text && problem.source_title && problem.source_author) {
                      const key = `${problem.source_title}-${problem.source_author}`;
                      if (!workGroups.has(key)) {
                        workGroups.set(key, {
                          title: problem.source_title,
                          author: problem.source_author,
                          text: problem.source_text,
                          problems: [],
                        });
                      }
                      workGroups.get(key).problems.push(problem);
                    } else {
                      // 지문이 없는 문제들은 개별 처리
                      const key = `individual-${problem.id}`;
                      workGroups.set(key, {
                        title: null,
                        author: null,
                        text: null,
                        problems: [problem],
                      });
                    }
                  });
                  return Array.from(workGroups.values());
                })().map((work: any, workIndex: number) => (
                  <div key={workIndex} className="space-y-6">
                    {/* 지문 표시 (있는 경우) */}
                    {work.text && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-gray-700">
                            📖 지문 {workIndex + 1}
                          </span>
                          <span className="text-sm text-gray-600">
                            - {work.title} ({work.author})
                          </span>
                        </div>
                        <div className="text-sm leading-relaxed text-gray-800">
                          {renderFormattedText(work.text)}
                        </div>
                      </div>
                    )}

                    {/* 해당 지문의 문제들 */}
                    <div className="space-y-8">
                      {work.problems.map((problem: any, problemIndex: number) => (
                        <Card
                          key={problem.id}
                          className="border border-gray-200 shadow-sm"
                        >
                          <CardContent className="p-6">
                            {/* 문제 헤더 */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                                  {problem.sequence_order}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline">
                                      {getProblemTypeInKorean(problem.problem_type || '객관식')}
                                    </Badge>
                                    <Badge className={`
                                      ${problem.difficulty === '상'
                                        ? 'bg-red-100 text-red-800'
                                        : problem.difficulty === '중'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-purple-100 text-purple-800'
                                      }`}>
                                      {problem.difficulty}
                                    </Badge>
                                  </div>
                                </div>

                                {/* 문제 내용 */}
                                <div className="text-base leading-relaxed text-gray-900 mb-4">
                                  {renderFormattedText(problem.question)}
                                </div>

                                {/* 객관식 선택지 */}
                                {problem.choices && problem.choices.length > 0 && (
                                  <div className="ml-4 space-y-3">
                                    {problem.choices.map((choice: string, choiceIndex: number) => {
                                      const optionLabel = String.fromCharCode(65 + choiceIndex);
                                      const isCorrect = problem.correct_answer === optionLabel;
                                      return (
                                        <div
                                          key={choiceIndex}
                                          className={`flex items-start gap-3 ${
                                            showAnswerSheet && isCorrect
                                              ? 'bg-green-100 border border-green-300 rounded-lg p-2'
                                              : ''
                                          }`}
                                        >
                                          <span
                                            className={`flex-shrink-0 w-6 h-6 border-2 ${
                                              showAnswerSheet && isCorrect
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-gray-300 text-gray-600'
                                            } rounded-full flex items-center justify-center text-sm font-medium`}
                                          >
                                            {showAnswerSheet && isCorrect ? '✓' : optionLabel}
                                          </span>
                                          <div className="flex-1 text-gray-900">
                                            {renderFormattedText(choice.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, ''))}
                                          </div>
                                          {showAnswerSheet && isCorrect && (
                                            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                                              정답
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* 정답 및 해설 (정답지일 때만 표시) */}
                                {showAnswerSheet && (
                                  <div className="mt-4 ml-4">
                                    {/* 객관식이 아닌 경우 정답 표시 */}
                                    {(!problem.choices || problem.choices.length === 0) && (
                                      <div className="mb-4">
                                        <h4 className="font-medium text-gray-800 mb-2">정답</h4>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                          <span className="text-green-700 font-medium">
                                            {renderFormattedText(problem.correct_answer || '답안 정보가 없습니다')}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {/* 해설 */}
                                    {problem.explanation && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-sm font-semibold text-blue-800">
                                            해설:
                                          </span>
                                        </div>
                                        <div className="text-sm text-blue-800">
                                          {renderFormattedText(problem.explanation)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 단답형/서술형 답안 영역 (문제지일 때) */}
                                {!showAnswerSheet && (!problem.choices || problem.choices.length === 0) && (
                                  <div className="mt-4 ml-4">
                                    {problem.problem_type === 'short_answer' ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-700">답:</span>
                                        <div className="border-b-2 border-gray-300 flex-1 h-8"></div>
                                      </div>
                                    ) : (
                                      <div className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-gray-50">
                                        <div className="text-sm text-gray-500 mb-2">
                                          풀이 과정을 자세히 써주세요.
                                        </div>
                                        <div className="space-y-3">
                                          {[...Array(6)].map((_, lineIndex) => (
                                            <div
                                              key={lineIndex}
                                              className="border-b border-gray-200 h-6"
                                            ></div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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