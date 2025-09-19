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

interface KoreanProblemEditDialogProps {
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
  onRegenerate?: (requirements?: string) => void;
}

export const KoreanProblemEditDialog: React.FC<KoreanProblemEditDialogProps> = ({
  isOpen,
  onOpenChange,
  editFormData,
  onFormChange,
  onChoiceChange,
  onSave,
  onRegenerate,
}) => {
  const [showRegenerateInput, setShowRegenerateInput] = useState(false);
  const [regenerateRequirements, setRegenerateRequirements] = useState('');

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(regenerateRequirements);
      setShowRegenerateInput(false);
      setRegenerateRequirements('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col overflow-hidden !max-w-[90vw] !w-[90vw] !h-[80vh]">
        <DialogHeader className="pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-medium">국어 문제 편집</DialogTitle>
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
                      <SelectItem value="상">상</SelectItem>
                      <SelectItem value="중">중</SelectItem>
                      <SelectItem value="하">하</SelectItem>
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
                  placeholder="문제 내용을 입력하세요"
                  rows={5}
                  className="w-full text-sm"
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
                          placeholder={`${String.fromCharCode(65 + index)}번 선택지`}
                          className="text-sm h-8"
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
                    placeholder="정답을 입력하세요"
                    rows={3}
                    className="text-sm"
                  />
                )}
              </div>

              {/* 해설 */}
              <div>
                <label className="block text-sm font-medium mb-1">해설</label>
                <Textarea
                  value={editFormData.explanation}
                  onChange={(e) => onFormChange('explanation', e.target.value)}
                  placeholder="해설을 입력하세요"
                  rows={4}
                  className="text-sm"
                />
              </div>

              {/* 재생성 요구사항 입력 */}
              {showRegenerateInput && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-1">재생성 요구사항</label>
                  <Textarea
                    value={regenerateRequirements}
                    onChange={(e) => setRegenerateRequirements(e.target.value)}
                    placeholder="문제 재생성을 위한 구체적인 요구사항을 입력하세요&#10;예: 다른 작품으로 바꿔주세요, 난이도를 조정해주세요"
                    rows={3}
                    className="text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={handleRegenerate}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      재생성 실행
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRegenerateInput(false);
                        setRegenerateRequirements('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽 미리보기 영역 */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700">미리보기</h3>

              {/* 문제 미리보기 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">문제</label>
                <div className="bg-white p-3 border rounded text-sm min-h-[120px] overflow-y-auto whitespace-pre-wrap">
                  {editFormData.question || '문제 내용을 입력하면 여기에 미리보기가 표시됩니다.'}
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
                          {choice || `${String.fromCharCode(65 + index)}번 선택지`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 정답 미리보기 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">정답</label>
                <div className="bg-white p-3 border rounded text-sm min-h-[60px] overflow-y-auto whitespace-pre-wrap">
                  {editFormData.correct_answer
                    ? editFormData.problem_type === 'multiple_choice'
                      ? `${editFormData.correct_answer}번`
                      : editFormData.correct_answer
                    : '정답을 입력하세요'}
                </div>
              </div>

              {/* 해설 미리보기 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">해설</label>
                <div className="bg-white p-3 border rounded text-sm min-h-[100px] overflow-y-auto whitespace-pre-wrap">
                  {editFormData.explanation || '해설을 입력하세요'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            {onRegenerate && (
              <Button
                variant="outline"
                onClick={() => setShowRegenerateInput(!showRegenerateInput)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {showRegenerateInput ? '재생성 취소' : '문제 재생성'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
