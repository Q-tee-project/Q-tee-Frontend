'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';
import { Worksheet, MathProblem, ProblemType } from '@/types/math';
import { Edit3, RotateCcw, FileDown } from 'lucide-react';
import { ProblemRegenerateDialog } from '../common/ProblemRegenerateDialog';
import { useReactToPrint } from 'react-to-print';
import { SolutionPrintLayout } from '@/components/pdf/SolutionPrintLayout';
import { ExamPrintLayout } from '@/components/pdf/ExamPrintLayout';

interface MathWorksheetDetailProps {
  selectedWorksheet: Worksheet | null;
  worksheetProblems: MathProblem[];
  showAnswerSheet: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  onToggleAnswerSheet: () => void;
  onOpenDistributeDialog: () => void;
  onOpenEditDialog: () => void;
  onEditProblem: (problem: MathProblem) => void;
  onRegenerateProblem?: (problem: MathProblem, feedback?: string) => void;
  onStartEditTitle: () => void;
  onCancelEditTitle: () => void;
  onSaveTitle: () => void;
  onEditedTitleChange: (value: string) => void;
}

const getProblemTypeInKorean = (type: string): string => {
  switch (type.toLowerCase()) {
    case ProblemType.MULTIPLE_CHOICE:
      return '객관식';

    case ProblemType.SHORT_ANSWER:
      return '단답형';
    default:
      return type;
  }
};

export const MathWorksheetDetail: React.FC<MathWorksheetDetailProps> = ({
  selectedWorksheet,
  worksheetProblems,
  showAnswerSheet,
  isEditingTitle,
  editedTitle,
  onToggleAnswerSheet,
  onOpenDistributeDialog,
  onOpenEditDialog,
  onEditProblem,
  onRegenerateProblem,
  onStartEditTitle,
  onCancelEditTitle,
  onSaveTitle,
  onEditedTitleChange,
}) => {
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [selectedProblemForRegenerate, setSelectedProblemForRegenerate] = useState<MathProblem | null>(null);
  const [isPrintingExam, setIsPrintingExam] = useState(false);
  const [isPrintingSolution, setIsPrintingSolution] = useState(false);
  const examRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  const handleRegenerateClick = (problem: MathProblem) => {
    setSelectedProblemForRegenerate(problem);
    setIsRegenerateDialogOpen(true);
  };

  const handleRegenerateConfirm = (feedback: string) => {
    if (selectedProblemForRegenerate && onRegenerateProblem) {
      onRegenerateProblem(selectedProblemForRegenerate, feedback);
    }
  };

  const handlePrintExam = useReactToPrint({
    contentRef: examRef,
    documentTitle: `${selectedWorksheet?.title || 'worksheet'}_시험지`,
    onAfterPrint: () => {
      setIsPrintingExam(false);
    },
  });

  const handlePrintSolution = useReactToPrint({
    contentRef: solutionRef,
    documentTitle: `${selectedWorksheet?.title || 'worksheet'}_해설지`,
    onAfterPrint: () => {
      setIsPrintingSolution(false);
    },
  });

  const handleDownloadExam = () => {
    if (!selectedWorksheet || worksheetProblems.length === 0) {
      alert('문제를 먼저 불러와주세요.');
      return;
    }
    setIsPrintingExam(true);
    setTimeout(() => {
      if (handlePrintExam) {
        handlePrintExam();
      }
    }, 500);
  };

  const handleDownloadSolution = () => {
    if (!selectedWorksheet || worksheetProblems.length === 0) {
      alert('문제를 먼저 불러와주세요.');
      return;
    }
    setIsPrintingSolution(true);
    setTimeout(() => {
      if (handlePrintSolution) {
        handlePrintSolution();
      }
    }, 500);
  };

  if (!selectedWorksheet) {
    return (
      <Card className="w-2/3 flex items-center justify-center shadow-sm h-[calc(100vh-200px)]">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <div className="text-gray-500 text-sm">수학 문제지를 선택하세요</div>
        </div>
      </Card>
    );
  }

  return (
    <>
    <Card className="w-2/3 flex flex-col shadow-sm h-[calc(100vh-200px)]">
      <CardHeader className="flex flex-row items-center py-6 px-6 border-b border-gray-100">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center gap-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => onEditedTitleChange(e.target.value)}
                className="text-2xl font-bold text-gray-900 text-center border-2 border-[#0072CE]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveTitle();
                  } else if (e.key === 'Escape') {
                    onCancelEditTitle();
                  }
                }}
                autoFocus
              />
              <Button
                onClick={onSaveTitle}
                size="sm"
                className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
              >
                저장
              </Button>
              <Button onClick={onCancelEditTitle} variant="outline" size="sm">
                취소
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CardTitle
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-[#0072CE] transition-colors"
                onClick={onStartEditTitle}
                title="클릭하여 타이틀 편집"
              >
                {selectedWorksheet.title}
              </CardTitle>
              <Button
                onClick={onStartEditTitle}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-[#0072CE] opacity-60 hover:opacity-100"
                title="타이틀 편집"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
          {showAnswerSheet && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              정답지
            </span>
          )}
        </div>
        <div className="flex-1 flex justify-end gap-3">
          {worksheetProblems.length > 0 && (
            <>
              <Button
                onClick={handleDownloadExam}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                disabled={isPrintingExam}
              >
                <FileDown className="w-4 h-4 mr-2" />
                문제지 다운로드
              </Button>
              <Button
                onClick={handleDownloadSolution}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                disabled={isPrintingSolution}
              >
                <FileDown className="w-4 h-4 mr-2" />
                해설지 다운로드
              </Button>
              <Button
                onClick={onToggleAnswerSheet}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
              >
                {showAnswerSheet ? '시험지 보기' : '정답 및 해설'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea style={{ height: 'calc(100vh - 350px)' }} className="w-full">
          {worksheetProblems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              수학 문제 데이터를 불러오는 중입니다...
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {worksheetProblems.map((problem, problemIndex) => (
                <Card
                  key={problem.id}
                  className="page-break-inside-avoid border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm border border-[#0072CE]/30 text-[#0072CE] rounded-full text-sm font-bold">
                          {problem.sequence_order}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {getProblemTypeInKorean(problem.problem_type)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                problem.difficulty === 'A'
                                  ? 'bg-red-100 text-red-800'
                                  : problem.difficulty === 'B'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => onEditProblem(problem)}
                              variant="ghost"
                              size="sm"
                              className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF] p-1"
                              title="문제 편집"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            {onRegenerateProblem && (
                              <Button
                                onClick={() => handleRegenerateClick(problem)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
                                title="문제 재생성"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="text-base leading-relaxed text-gray-900 mb-4">
                          <LaTeXRenderer content={(() => {
                            let cleanedQuestion = problem.question;

                            // 1. 완전한 TikZ 환경 제거 (백슬래시 있는 경우)
                            cleanedQuestion = cleanedQuestion.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '');

                            // 2. 백슬래시가 없는 깨진 TikZ 코드 제거 (사진처럼)
                            cleanedQuestion = cleanedQuestion.replace(/\[tikz[^\]]*\][^[]*standalone[^[]*tikz[\s\S]*?;/g, '');

                            // 3. documentclass, usepackage 등 제거
                            cleanedQuestion = cleanedQuestion
                              .replace(/\\documentclass\[.*?\]\{.*?\}/g, '')
                              .replace(/\\usepackage\{.*?\}/g, '')
                              .replace(/\\begin\{document\}/g, '')
                              .replace(/\\end\{document\}/g, '');

                            cleanedQuestion = cleanedQuestion.trim();

                            return cleanedQuestion;
                          })()} />
                        </div>

                        {/* TikZ 그래프 */}
                        {problem.tikz_code && (
                          <div className="mb-4">
                            <TikZRenderer tikzCode={problem.tikz_code} />
                          </div>
                        )}

                        {problem.choices && problem.choices.length > 0 && (
                          <div className="ml-4 space-y-3">
                            {problem.choices.map((choice: string, choiceIndex: number) => {
                              const displayChoice = choice.replace(/^[A-E][\.\):\s]+/, '');
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
                                    <LaTeXRenderer content={displayChoice} />
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

                        {problem.choices && problem.choices.length > 0 && showAnswerSheet && (
                          <div className="mt-4 ml-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-blue-800">해설:</span>
                            </div>
                            <div className="text-sm text-blue-800">
                              <LaTeXRenderer
                                content={problem.explanation || '해설 정보가 없습니다'}
                              />
                            </div>
                          </div>
                        )}

                        {(!problem.choices || problem.choices.length === 0) && (
                          <div className="mt-4 ml-4">
                            {problem.problem_type === 'short_answer' ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700">답:</span>
                                  {showAnswerSheet ? (
                                    <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-green-800 font-medium">
                                      <LaTeXRenderer
                                        content={problem.correct_answer || '답안 정보가 없습니다'}
                                      />
                                    </div>
                                  ) : (
                                    <div className="border-b-2 border-gray-300 flex-1 h-8"></div>
                                  )}
                                </div>
                                {showAnswerSheet && (
                                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-semibold text-blue-800">
                                        해설:
                                      </span>
                                    </div>
                                    <div className="text-sm text-blue-800">
                                      <LaTeXRenderer
                                        content={problem.explanation || '해설 정보가 없습니다'}
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {!showAnswerSheet && (
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
                                {showAnswerSheet && (
                                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-semibold text-blue-800">
                                        모범답안:
                                      </span>
                                    </div>
                                    <div className="text-sm text-blue-900">
                                      <LaTeXRenderer
                                        content={problem.correct_answer || '답안 정보가 없습니다'}
                                      />
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                      <span className="text-sm font-semibold text-blue-800">
                                        해설:
                                      </span>
                                      <div className="text-sm text-blue-800 mt-1">
                                        <LaTeXRenderer
                                          content={problem.explanation || '해설 정보가 없습니다'}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>

    {/* 재생성 모달 */}
    <ProblemRegenerateDialog
      isOpen={isRegenerateDialogOpen}
      onOpenChange={setIsRegenerateDialogOpen}
      onConfirm={handleRegenerateConfirm}
      subject="수학"
    />

    {/* 숨겨진 프린트 레이아웃 */}
    <div style={{ display: 'none' }}>
      {isPrintingExam && selectedWorksheet && (
        <ExamPrintLayout
          ref={examRef}
          worksheet={selectedWorksheet}
          problems={worksheetProblems}
        />
      )}
      {isPrintingSolution && selectedWorksheet && (
        <SolutionPrintLayout
          ref={solutionRef}
          worksheet={selectedWorksheet}
          problems={worksheetProblems}
        />
      )}
    </div>
    </>
  );
};
