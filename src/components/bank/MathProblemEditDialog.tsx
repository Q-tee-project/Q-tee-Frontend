'use client';

import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';
import { autoConvertToLatex } from '@/utils/mathLatexConverter';

interface MathProblemEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editFormData: {
    question: string;
    problem_type: string;
    difficulty: string;
    choices: string[];
    correct_answer: string;
    explanation: string;
  };
  onFormChange: (field: string, value: string | string[]) => void;
  onChoiceChange: (index: number, value: string) => void;
  onSave: () => void;
}

export const MathProblemEditDialog: React.FC<MathProblemEditDialogProps> = ({
  isOpen,
  onOpenChange,
  editFormData,
  onFormChange,
  onChoiceChange,
  onSave,
}) => {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col overflow-hidden !max-w-[95vw] !w-[95vw] !h-[85vh]">
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-medium">수학 문제 편집</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 h-full p-4">
            {/* 왼쪽 편집 영역 */}
            <div className="space-y-4">
              {/* 문제 기본 정보 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">문제 유형</label>
                  <Select
                    value={editFormData.problem_type}
                    onValueChange={(value) => onFormChange('problem_type', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="문제 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">객관식</SelectItem>
                      <SelectItem value="short_answer">단답형</SelectItem>
                      <SelectItem value="essay">서술형</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">난이도</label>
                  <Select
                    value={editFormData.difficulty}
                    onValueChange={(value) => onFormChange('difficulty', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="난이도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A단계</SelectItem>
                      <SelectItem value="B">B단계</SelectItem>
                      <SelectItem value="C">C단계</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 문제 내용 */}
              <div>
                <label className="block text-sm font-medium mb-1">문제 내용</label>
                <Textarea
                  value={editFormData.question}
                  onChange={(e) => onFormChange('question', e.target.value)}
                  placeholder="문제 내용을 입력하세요 (LaTeX 수식 지원)&#10;예: x^2 + y^2 = r^2"
                  rows={4}
                  className="w-full font-mono text-sm"
                />
              </div>

              {/* 선택지 (객관식일 때만) */}
              {editFormData.problem_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium mb-1">선택지</label>
                  <div className="space-y-2">
                    {editFormData.choices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={choice}
                          onChange={(e) => onChoiceChange(index, e.target.value)}
                          placeholder={`${String.fromCharCode(65 + index)}번 선택지 (LaTeX 지원)`}
                          className="font-mono text-sm h-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 정답 */}
              <div>
                <label className="block text-sm font-medium mb-1">정답</label>
                {editFormData.problem_type === 'multiple_choice' ? (
                  <Select
                    value={editFormData.correct_answer}
                    onValueChange={(value) => onFormChange('correct_answer', value)}
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="정답 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A번</SelectItem>
                      <SelectItem value="B">B번</SelectItem>
                      <SelectItem value="C">C번</SelectItem>
                      <SelectItem value="D">D번</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Textarea
                    value={editFormData.correct_answer}
                    onChange={(e) => onFormChange('correct_answer', e.target.value)}
                    placeholder="정답을 입력하세요 (LaTeX 지원)"
                    rows={2}
                    className="font-mono text-sm"
                  />
                )}
              </div>

              {/* 해설 */}
              <div>
                <label className="block text-sm font-medium mb-1">해설</label>
                <Textarea
                  value={editFormData.explanation}
                  onChange={(e) => onFormChange('explanation', e.target.value)}
                  placeholder="해설을 입력하세요 (LaTeX 지원)"
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* 오른쪽 미리보기 영역 */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">실시간 미리보기</h3>

              {/* 문제 미리보기 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">문제</label>
                <div className="bg-white p-3 border rounded text-sm min-h-[100px] overflow-y-auto">
                  <LaTeXRenderer
                    content={
                      editFormData.question
                        ? autoConvertToLatex(editFormData.question)
                        : '문제 내용을 입력하면 여기에 미리보기가 표시됩니다.'
                    }
                  />
                </div>
              </div>

              {/* 선택지 미리보기 */}
              {editFormData.problem_type === 'multiple_choice' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">선택지</label>
                  <div className="space-y-1">
                    {editFormData.choices.map((choice, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 border rounded text-sm flex items-start gap-2"
                      >
                        <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="flex-1">
                          <LaTeXRenderer
                            content={
                              choice
                                ? autoConvertToLatex(choice.replace(/^[A-E][\.\):\s]+/, ''))
                                : `${String.fromCharCode(65 + index)}번 선택지`
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 정답 미리보기 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">정답</label>
                <div className="bg-white p-3 border rounded text-sm min-h-[60px] overflow-y-auto">
                  <LaTeXRenderer
                    content={
                      editFormData.correct_answer
                        ? editFormData.problem_type === 'multiple_choice'
                          ? `${editFormData.correct_answer}번`
                          : autoConvertToLatex(editFormData.correct_answer)
                        : '정답을 입력하세요'
                    }
                  />
                </div>
              </div>

              {/* 해설 미리보기 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">해설</label>
                <div className="bg-white p-3 border rounded text-sm min-h-[80px] overflow-y-auto">
                  <LaTeXRenderer
                    content={
                      editFormData.explanation
                        ? autoConvertToLatex(editFormData.explanation)
                        : '해설을 입력하세요'
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end items-center pt-4 border-t flex-shrink-0 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
