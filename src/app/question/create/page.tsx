'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import KoreanGenerator from '@/components/subjects/KoreanGenerator';
import EnglishGenerator from '@/components/subjects/EnglishGenerator';
import MathGenerator from '@/components/subjects/MathGenerator';
import { QuestionPreview } from '@/components/question/QuestionPreview';
import { EnglishQuestionPreview } from '@/components/question/EnglishQuestionPreview';
import { ErrorToast } from '@/app/question/bank/components/ErrorToast';
import { useKoreanGeneration } from '@/hooks/useKoreanGeneration';
import { useMathGeneration } from '@/hooks/useMathGeneration';
import { useEnglishGeneration } from '@/hooks/useEnglishGeneration';
import { useWorksheetSave } from '@/hooks/useWorksheetSave';

const SUBJECTS = ['국어', '영어', '수학'];

// 과목명을 영어 코드로 변환하는 함수
const getSubjectCode = (subjectName: string): 'korean' | 'math' | 'english' => {
  switch (subjectName) {
    case '국어':
      return 'korean';
    case '수학':
      return 'math';
    case '영어':
      return 'english';
    default:
      return 'math'; // 기본값
  }
};

export default function CreatePage() {
  const [subject, setSubject] = useState<string>('');

  // 과목별 생성 훅들
  const koreanGeneration = useKoreanGeneration();
  const mathGeneration = useMathGeneration();
  const englishGeneration = useEnglishGeneration();

  // 문제지 저장 훅
  const worksheetSave = useWorksheetSave();

  // 현재 선택된 과목에 따른 상태
  const currentGeneration =
    subject === '국어' ? koreanGeneration : subject === '수학' ? mathGeneration : englishGeneration;

  // Toast 자동 닫기
  React.useEffect(() => {
    if (currentGeneration.errorMessage) {
      const timer = setTimeout(() => {
        currentGeneration.clearError();
      }, 5000); // 5초 후 자동 닫기

      return () => clearTimeout(timer);
    }
  }, [currentGeneration.errorMessage]);

  // 과목 변경 시 초기화
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    currentGeneration.resetGeneration();
    worksheetSave.resetWorksheet();
  };

  // 과목별 문제 생성 핸들러
  const handleGenerate = (data: any) => {
    if (subject === '수학') {
      mathGeneration.generateMathProblems(data);
    } else if (subject === '국어') {
      koreanGeneration.generateKoreanProblems(data);
    } else if (subject === '영어') {
      englishGeneration.generateEnglishProblems(data);
    }
  };

  // 문제 재생성 핸들러 (수학만 지원)
  const handleRegenerateQuestion = (questionId: number, prompt?: string) => {
    if (subject === '수학' && mathGeneration.regenerateQuestion) {
      mathGeneration.regenerateQuestion(questionId, prompt);
    }
  };

  // 문제지 저장 핸들러
  const handleSaveWorksheet = () => {
    // 영어의 경우 uiData 기반으로 저장, 다른 과목은 기존 방식
    const questionsToSave = subject === '영어' && englishGeneration.uiData
      ? convertUIDataToPreviewQuestions(englishGeneration.uiData)
      : currentGeneration.previewQuestions;

    worksheetSave.saveWorksheet(
      subject,
      questionsToSave,
      (worksheetId) => {
        currentGeneration.updateState({
          errorMessage: '문제지가 성공적으로 저장되었습니다! ✅',
        });
      },
      (error) => {
        currentGeneration.updateState({ errorMessage: error });
      },
    );
  };

  // uiData를 previewQuestions 형식으로 변환하는 함수
  const convertUIDataToPreviewQuestions = (uiData: any) => {
    return uiData.questions.map((question: any) => ({
      id: question.id,
      title: question.questionText,
      options: question.choices,
      answerIndex: typeof question.correctAnswer === 'number' ? question.correctAnswer : undefined,
      correct_answer: typeof question.correctAnswer === 'string' ? question.correctAnswer : undefined,
      explanation: question.explanation,
      backendId: question.id,
      problem_type: question.subject,
    }));
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<PlusCircle />}
        title="문제 생성"
        variant="question"
        description="과목별 문제를 생성할 수 있습니다"
      />

      {/* 과목 탭 */}
      <div className="px-6 pb-2 flex-shrink-0">
        <nav className="flex space-x-8">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => handleSubjectChange(s)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                subject === s
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-4 min-h-0">
        <div className="flex gap-4 h-full">
          <Card className="w-[400px] flex flex-col shadow-sm h-[calc(100vh-200px)]">
            <CardHeader className="flex flex-row items-center justify-center py-1 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-medium">문제 생성</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {/* 과목별 컴포넌트 렌더링 */}
              {subject === '국어' && (
                <KoreanGenerator
                  onGenerate={handleGenerate}
                  isGenerating={currentGeneration.isGenerating}
                />
              )}
              {subject === '영어' && (
                <EnglishGenerator
                  onGenerate={handleGenerate}
                  isGenerating={currentGeneration.isGenerating}
                />
              )}
              {subject === '수학' && (
                <MathGenerator
                  onGenerate={handleGenerate}
                  isGenerating={currentGeneration.isGenerating}
                />
              )}
              {!subject && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">과목을 선택해주세요</div>
                    <div className="text-sm">
                      위의 탭에서 과목을 선택하면 문제 생성 폼이 나타납니다.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 오른쪽 영역 - 결과 미리보기 자리 */}
          <Card className="flex-1 flex flex-col shadow-sm h-[calc(100vh-200px)]">
            <CardHeader className="flex flex-row items-center justify-center py-1 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-medium">문제지</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* 영어는 새로운 UI 컴포넌트 사용 */}
              {subject === '영어' ? (
                <EnglishQuestionPreview
                  uiData={englishGeneration.uiData || undefined}
                  isGenerating={currentGeneration.isGenerating}
                  generationProgress={currentGeneration.generationProgress}
                  worksheetName={worksheetSave.worksheetName}
                  setWorksheetName={worksheetSave.setWorksheetName}
                  regeneratingQuestionId={currentGeneration.regeneratingQuestionId}
                  regenerationPrompt={currentGeneration.regenerationPrompt}
                  setRegenerationPrompt={(prompt) =>
                    currentGeneration.updateState({ regenerationPrompt: prompt })
                  }
                  showRegenerationInput={currentGeneration.showRegenerationInput}
                  setShowRegenerationInput={(id) =>
                    currentGeneration.updateState({ showRegenerationInput: id })
                  }
                  onRegenerateQuestion={handleRegenerateQuestion}
                  onSaveWorksheet={handleSaveWorksheet}
                  isSaving={worksheetSave.isSaving}
                />
              ) : (
                // 다른 과목은 기존 방식
                <QuestionPreview
                  subject={getSubjectCode(subject)}
                  previewQuestions={currentGeneration.previewQuestions}
                  isGenerating={currentGeneration.isGenerating}
                  generationProgress={currentGeneration.generationProgress}
                  worksheetName={worksheetSave.worksheetName}
                  setWorksheetName={worksheetSave.setWorksheetName}
                  regeneratingQuestionId={currentGeneration.regeneratingQuestionId}
                  regenerationPrompt={currentGeneration.regenerationPrompt}
                  setRegenerationPrompt={(prompt) =>
                    currentGeneration.updateState({ regenerationPrompt: prompt })
                  }
                  showRegenerationInput={currentGeneration.showRegenerationInput}
                  setShowRegenerationInput={(id) =>
                    currentGeneration.updateState({ showRegenerationInput: id })
                  }
                  onRegenerateQuestion={handleRegenerateQuestion}
                  onSaveWorksheet={handleSaveWorksheet}
                  isSaving={worksheetSave.isSaving}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Toast */}
      <ErrorToast
        error={currentGeneration.errorMessage}
        onClose={() => currentGeneration.clearError()}
      />
    </div>
  );
}
