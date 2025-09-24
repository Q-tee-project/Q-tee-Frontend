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

interface EnglishProblemEditDialogProps {
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

export const EnglishProblemEditDialog: React.FC<EnglishProblemEditDialogProps> = ({
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
    }
    setShowRegenerateInput(false);
    setRegenerateRequirements('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>영어 문제 편집</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 왼쪽 열 - 문제 정보 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">문제 유형</label>
              <Select
                value={editFormData.question_type}
                onValueChange={(value) => onFormChange('question_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="객관식">객관식</SelectItem>
                  <SelectItem value="주관식">주관식</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">영역</label>
              <Select
                value={editFormData.question_subject}
                onValueChange={(value) => onFormChange('question_subject', value)}
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
              <label className="text-sm font-medium mb-2 block">난이도</label>
              <Select
                value={editFormData.question_difficulty}
                onValueChange={(value) => onFormChange('question_difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="하">하</SelectItem>
                  <SelectItem value="중">중</SelectItem>
                  <SelectItem value="상">상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">세부 유형</label>
              <Input
                value={editFormData.question_detail_type}
                onChange={(e) => onFormChange('question_detail_type', e.target.value)}
                placeholder="예: 빈칸추론, 내용일치, 어법"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">예문/지문</label>
              <Textarea
                value={editFormData.example_content}
                onChange={(e) => onFormChange('example_content', e.target.value)}
                placeholder="예문이나 지문 내용"
                rows={4}
              />
            </div>
          </div>

          {/* 오른쪽 열 - 문제 내용 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">문제 내용</label>
              <Textarea
                value={editFormData.question_text}
                onChange={(e) => onFormChange('question_text', e.target.value)}
                placeholder="문제 내용을 입력하세요"
                rows={3}
              />
            </div>

            {editFormData.question_type === '객관식' && (
              <div>
                <label className="text-sm font-medium mb-2 block">선택지</label>
                <div className="space-y-2">
                  {editFormData.question_choices?.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-6 text-center text-sm font-medium">
                        {index + 1}.
                      </span>
                      <Input
                        value={choice}
                        onChange={(e) => onChoiceChange(index, e.target.value)}
                        placeholder={`선택지 ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">정답</label>
              {editFormData.question_type === '객관식' ? (
                <Select
                  value={editFormData.correct_answer}
                  onValueChange={(value) => onFormChange('correct_answer', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="정답 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {editFormData.question_choices?.map((_, index) => (
                      <SelectItem key={index} value={String(index + 1)}>
                        {index + 1}번
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={editFormData.correct_answer}
                  onChange={(e) => onFormChange('correct_answer', e.target.value)}
                  placeholder="정답 입력"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">해설</label>
              <Textarea
                value={editFormData.explanation}
                onChange={(e) => onFormChange('explanation', e.target.value)}
                placeholder="해설을 입력하세요"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">학습 포인트</label>
              <Input
                value={editFormData.learning_point}
                onChange={(e) => onFormChange('learning_point', e.target.value)}
                placeholder="학습 포인트를 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 문제 재생성 섹션 */}
        {onRegenerate && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-medium">문제 재생성</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegenerateInput(!showRegenerateInput)}
              >
                {showRegenerateInput ? '취소' : 'AI로 다시 만들기'}
              </Button>
            </div>

            {showRegenerateInput && (
              <div className="space-y-3">
                <Textarea
                  value={regenerateRequirements}
                  onChange={(e) => setRegenerateRequirements(e.target.value)}
                  placeholder="재생성 요구사항을 입력하세요 (예: 더 어렵게 만들어주세요, 다른 주제로 바꿔주세요)"
                  rows={2}
                />
                <Button onClick={handleRegenerate} className="bg-green-600 hover:bg-green-700">
                  재생성하기
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};