'use client';

import React from 'react';
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
import { supportedPatterns, autoConvertToLatex } from '@/utils/mathLatexConverter';

interface ProblemEditDialogProps {
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
  autoConvertMode: boolean;
  onAutoConvertModeChange: (enabled: boolean) => void;
  onFormChange: (field: string, value: string | string[]) => void;
  onChoiceChange: (index: number, value: string) => void;
  onSave: () => void;
}

export const ProblemEditDialog: React.FC<ProblemEditDialogProps> = ({
  isOpen,
  onOpenChange,
  editFormData,
  autoConvertMode,
  onAutoConvertModeChange,
  onFormChange,
  onChoiceChange,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">문제 편집</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">문제 정보를 수정하고 미리보기를 확인해보세요</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border">
                <input
                  type="checkbox"
                  checked={autoConvertMode}
                  onChange={(e) => onAutoConvertModeChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                자동 LaTeX 변환
              </label>
            </div>
          </div>
        </DialogHeader>

        {autoConvertMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-4">
            <h4 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
              ✨ LaTeX 자동 변환 가이드
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
              {supportedPatterns.slice(0, 4).map((pattern, index) => (
                <div key={index} className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-semibold">{pattern.name}:</span> 
                  <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">{pattern.example}</code>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
              <span className="text-sm font-medium text-blue-800">예시: </span>
              <code className="text-sm bg-blue-100 px-2 py-1 rounded">"2^2 + sqrt(9) = x"</code>
              <span className="mx-2 text-blue-600">→</span>
              <code className="text-sm bg-blue-100 px-2 py-1 rounded">"2^{2} + \sqrt{9} = x"</code>
            </div>
          </div>
        )}

        <div className="space-y-8 mt-6">
          {/* 문제 기본 정보 섹션 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📋 문제 기본 정보
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">문제 유형</label>
                <Select
                  value={editFormData.problem_type}
                  onValueChange={(value) => onFormChange('problem_type', value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="문제 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice" className="text-base py-3">
                      📝 객관식 (선택지 문제)
                    </SelectItem>
                    <SelectItem value="short_answer" className="text-base py-3">
                      ✏️ 단답형 (짧은 답)
                    </SelectItem>
                    <SelectItem value="essay" className="text-base py-3">
                      📄 서술형 (긴 답)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">난이도</label>
                <Select
                  value={editFormData.difficulty}
                  onValueChange={(value) => onFormChange('difficulty', value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="난이도를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A" className="text-base py-3">⭐ A단계 (기초)</SelectItem>
                    <SelectItem value="B" className="text-base py-3">⭐⭐ B단계 (중급)</SelectItem>
                    <SelectItem value="C" className="text-base py-3">⭐⭐⭐ C단계 (고급)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 문제 내용 섹션 */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              ❓ 문제 내용
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">문제 작성</label>
                <Textarea
                  value={editFormData.question}
                  onChange={(e) => onFormChange('question', e.target.value)}
                  placeholder="문제 내용을 입력하세요&#10;&#10;💡 팁: LaTeX 문법을 사용하여 수식을 입력할 수 있습니다&#10;예: x^2 + y^2 = r^2"
                  rows={6}
                  className="w-full text-base leading-relaxed resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">미리보기</label>
                <div className="h-40 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg overflow-y-auto">
                  <LaTeXRenderer
                    content={editFormData.question 
                      ? (autoConvertMode ? autoConvertToLatex(editFormData.question) : editFormData.question)
                      : '📝 문제 내용을 입력하면 여기에 미리보기가 표시됩니다.'
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 선택지 섹션 (객관식일 때만) */}
          {editFormData.problem_type === 'multiple_choice' && (
            <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📝 선택지 작성
              </h3>
              <div className="space-y-4">
                {editFormData.choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={choice}
                      onChange={(e) => onChoiceChange(index, e.target.value)}
                      placeholder={`${String.fromCharCode(65 + index)}번 선택지를 입력하세요 (LaTeX 사용 가능)`}
                      className="flex-1 text-base h-12 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 정답 섹션 */}
          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              ✅ 정답 설정
            </h3>
            {editFormData.problem_type === 'multiple_choice' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">객관식 정답 선택</label>
                <Select
                  value={editFormData.correct_answer}
                  onValueChange={(value) => onFormChange('correct_answer', value)}
                >
                  <SelectTrigger className="w-48 h-12 text-base bg-white">
                    <SelectValue placeholder="정답을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A" className="text-base py-3">🅰️ A번</SelectItem>
                    <SelectItem value="B" className="text-base py-3">🅱️ B번</SelectItem>
                    <SelectItem value="C" className="text-base py-3">🅾️ C번</SelectItem>
                    <SelectItem value="D" className="text-base py-3">🅾️ D번</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {editFormData.problem_type === 'short_answer' ? '단답형 정답' : '서술형 모범답안'}
                </label>
                <Textarea
                  value={editFormData.correct_answer}
                  onChange={(e) => onFormChange('correct_answer', e.target.value)}
                  placeholder={editFormData.problem_type === 'short_answer' 
                    ? "정답을 입력하세요 (LaTeX 지원)\n예: x = 5, y = 3" 
                    : "모범답안을 입력하세요 (LaTeX 지원)\n단계별 풀이 과정을 포함해주세요"}
                  rows={3}
                  className="w-full text-base bg-white"
                />
              </div>
            )}
          </div>

          {/* 해설 섹션 */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💡 해설 작성
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">해설 입력</label>
                <Textarea
                  value={editFormData.explanation}
                  onChange={(e) => onFormChange('explanation', e.target.value)}
                  placeholder="학생들이 이해하기 쉬운 해설을 작성해주세요&#10;&#10;📌 포함할 내용:&#10;• 문제 풀이 과정&#10;• 핵심 개념 설명&#10;• 자주 하는 실수&#10;• 관련 공식이나 정리"
                  rows={6}
                  className="w-full text-base leading-relaxed bg-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">해설 미리보기</label>
                <div className="h-40 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg overflow-y-auto">
                  <LaTeXRenderer 
                    content={editFormData.explanation 
                      ? (autoConvertMode ? autoConvertToLatex(editFormData.explanation) : editFormData.explanation)
                      : '💭 해설을 입력하면 여기에 미리보기가 표시됩니다.'
                    } 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            💾 변경사항은 저장 버튼을 눌러야 적용됩니다
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 text-base font-medium"
            >
              취소
            </Button>
            <Button 
              onClick={onSave} 
              className="bg-[#0072CE] hover:bg-[#0056A3] h-12 px-8 text-base font-semibold"
            >
              💾 저장하기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};