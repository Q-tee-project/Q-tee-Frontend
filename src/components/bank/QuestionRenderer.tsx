'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit3, Check, X, RotateCcw } from 'lucide-react';
import { EnglishContentRenderer } from '@/components/EnglishContentRenderer';
import { EnglishQuestion } from '@/types/english';

interface EditFormData {
  question_text?: string;
  question_type?: string;
  question_subject?: string;
  question_difficulty?: string;
  question_detail_type?: string;
  question_choices?: string[];
  correct_answer?: string;
  explanation?: string;
  learning_point?: string;
  example_content?: string;
  passage_content?: any;
  original_content?: any;
  korean_translation?: any;
}

interface QuestionRendererProps {
  question: EnglishQuestion;
  questionIndex: number;
  showAnswerSheet: boolean;
  editingQuestionId: number | null;
  editFormData: EditFormData;
  isLoading: boolean;
  showRegenerateButtons: boolean;
  onStartEdit: (question: EnglishQuestion) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEditFormDataChange: (data: EditFormData) => void;
  onOpenRegenerateModal: (question: EnglishQuestion) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionIndex,
  showAnswerSheet,
  editingQuestionId,
  editFormData,
  isLoading,
  showRegenerateButtons,
  onStartEdit,
  onSave,
  onCancelEdit,
  onEditFormDataChange,
  onOpenRegenerateModal,
}) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm border border-[#0072CE]/30 text-[#0072CE] rounded-full text-sm font-bold">
                  {question.question_id}
                </span>
              </div>
              <div className="flex-1">
                {/* 문제 메타데이터 */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {question.question_subject}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {question.question_detail_type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        question.question_difficulty === '상'
                          ? 'bg-red-100 text-red-800'
                          : question.question_difficulty === '중'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {question.question_difficulty}
                    </span>
                  </div>
                  {editingQuestionId === question.question_id ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={onSave}
                        disabled={isLoading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={onCancelEdit}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onStartEdit(question)}
                        variant="ghost"
                        size="sm"
                        className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF] p-1"
                        title="문제 편집"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      {showRegenerateButtons && (
                        <Button
                          onClick={() => onOpenRegenerateModal(question)}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
                          title="문제 재생성"
                          disabled={isLoading}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* 문제 텍스트 */}
                {editingQuestionId === question.question_id ? (
                  <div className="space-y-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        문제 텍스트
                      </label>
                      <Textarea
                        value={editFormData.question_text || ''}
                        onChange={(e) =>
                          onEditFormDataChange({ ...editFormData, question_text: e.target.value })
                        }
                        rows={3}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          문제 유형
                        </label>
                        <Select
                          value={editFormData.question_type || '객관식'}
                          onValueChange={(value) =>
                            onEditFormDataChange({ ...editFormData, question_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="객관식">객관식</SelectItem>
                            <SelectItem value="단답형">단답형</SelectItem>
                            <SelectItem value="서술형">서술형</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">영역</label>
                        <Select
                          value={editFormData.question_subject || '독해'}
                          onValueChange={(value) =>
                            onEditFormDataChange({ ...editFormData, question_subject: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="독해">독해</SelectItem>
                            <SelectItem value="문법">문법</SelectItem>
                            <SelectItem value="어휘">어휘</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          난이도
                        </label>
                        <Select
                          value={editFormData.question_difficulty || '중'}
                          onValueChange={(value) =>
                            onEditFormDataChange({ ...editFormData, question_difficulty: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="상">상</SelectItem>
                            <SelectItem value="중">중</SelectItem>
                            <SelectItem value="하">하</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 예문 편집 (원래 예문이 있는 경우만) */}
                    {question.example_content && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">예문</label>
                        <Textarea
                          value={editFormData.example_content || ''}
                          onChange={(e) =>
                            onEditFormDataChange({
                              ...editFormData,
                              example_content: e.target.value,
                            })
                          }
                          rows={2}
                          placeholder="예문 내용을 수정하세요"
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* 선택지 편집 (객관식인 경우) */}
                    {editFormData.question_type === '객관식' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          선택지
                        </label>
                        <div className="space-y-2">
                          {editFormData.question_choices?.map((choice: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <Input
                                value={choice}
                                onChange={(e) => {
                                  const newChoices = [...(editFormData.question_choices || [])];
                                  newChoices[index] = e.target.value;
                                  onEditFormDataChange({
                                    ...editFormData,
                                    question_choices: newChoices,
                                  });
                                }}
                                placeholder={`선택지 ${index + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">정답</label>
                        {editFormData.question_type === '객관식' ? (
                          <Select
                            value={editFormData.correct_answer || ''}
                            onValueChange={(value) =>
                              onEditFormDataChange({ ...editFormData, correct_answer: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="정답 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {editFormData.question_choices?.map(
                                (choice: string, index: number) => (
                                  <SelectItem key={index} value={(index + 1).toString()}>
                                    {index + 1}번:{' '}
                                    {choice.length > 30 ? `${choice.substring(0, 30)}...` : choice}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={editFormData.correct_answer || ''}
                            onChange={(e) =>
                              onEditFormDataChange({
                                ...editFormData,
                                correct_answer: e.target.value,
                              })
                            }
                            placeholder="정답을 입력하세요"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          세부 유형
                        </label>
                        <Input
                          value={editFormData.question_detail_type || ''}
                          onChange={(e) =>
                            onEditFormDataChange({
                              ...editFormData,
                              question_detail_type: e.target.value,
                            })
                          }
                          placeholder="세부 유형"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">해설</label>
                      <Textarea
                        value={editFormData.explanation || ''}
                        onChange={(e) =>
                          onEditFormDataChange({ ...editFormData, explanation: e.target.value })
                        }
                        rows={3}
                        placeholder="해설을 입력하세요"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        학습 포인트
                      </label>
                      <Textarea
                        value={editFormData.learning_point || ''}
                        onChange={(e) =>
                          onEditFormDataChange({ ...editFormData, learning_point: e.target.value })
                        }
                        rows={2}
                        placeholder="학습 포인트를 입력하세요"
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <EnglishContentRenderer
                      content={question.question_text}
                      className="text-base leading-relaxed text-gray-900 mb-4"
                    />

                    {/* 예문 (있는 경우) */}
                    {(showAnswerSheet
                      ? question.example_original_content
                      : question.example_content) && (
                      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700 mb-2">📝 예문</div>
                        <EnglishContentRenderer
                          content={
                            showAnswerSheet
                              ? question.example_original_content
                              : question.example_content
                          }
                          className="text-gray-800 leading-relaxed"
                        />
                        {/* 정답지 모드일 때만 한글 번역 표시 */}
                        {showAnswerSheet && question.example_korean_translation && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm font-medium text-green-700 mb-1">
                              🇰🇷 한글 번역
                            </div>
                            <div className="text-sm text-green-800">
                              {question.example_korean_translation}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 선택지 (객관식인 경우) */}
                {question.question_choices && question.question_choices.length > 0 && (
                  <div className="ml-4 space-y-3">
                    {question.question_choices.map((choice: string, choiceIndex: number) => {
                      const optionLabel = (choiceIndex + 1).toString();
                      const isCorrect = Number(question.correct_answer) === choiceIndex + 1;

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
                          <div className="flex-1 text-gray-900">{choice}</div>
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
              </div>
            </div>
          </div>

          {/* 정답 및 해설 영역 - 오른쪽 컬럼 */}
          <div className="col-span-4">
            {showAnswerSheet && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                {/* 주관식 문제인 경우 정답 표시 */}
                {question.question_type === '단답형' ||
                  (question.question_type === '서술형' && (
                    <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="text-sm font-semibold text-green-800 mb-1">✓ 정답:</div>
                      <div className="text-sm text-green-900 font-medium">
                        {question.correct_answer || '정답 정보가 없습니다'}
                      </div>
                    </div>
                  ))}

                {/* 객관식 정답 표시 */}
                {question.question_type === '객관식' && (
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    정답: {question.correct_answer}번
                  </div>
                )}

                <div className="text-sm font-semibold text-blue-800 mb-2">해설:</div>
                <div className="text-sm text-blue-800 mb-3">
                  {question.explanation || '해설 정보가 없습니다'}
                </div>
                {question.learning_point && (
                  <>
                    <div className="text-sm font-semibold text-blue-800 mb-2">💡 학습 포인트:</div>
                    <div className="text-sm text-blue-800">{question.learning_point}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
