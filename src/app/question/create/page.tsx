'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import KoreanGenerator from '@/components/subjects/KoreanGenerator';
import EnglishGenerator from '@/components/subjects/EnglishGenerator';
import MathGenerator from '@/components/subjects/MathGenerator';
import { QuestionPreview } from '@/components/question/QuestionPreview';
import { EnglishWorksheetDetail } from '@/app/question/bank/components/EnglishWorksheetDetail';
import { ErrorToast } from '@/app/question/bank/components/ErrorToast';
import { ValidationDashboard } from '@/components/validation/ValidationDashboard';
import { ValidationReportModal } from '@/components/validation/ValidationReportModal';
import { useKoreanGeneration } from '@/hooks/useKoreanGeneration';
import { useMathGeneration } from '@/hooks/useMathGeneration';
import { useEnglishGeneration } from '@/hooks/useEnglishGeneration';
import { useWorksheetSave } from '@/hooks/useWorksheetSave';
import { useEnglishWorksheetSave } from '@/hooks/useEnglishWorksheetSave';
import { EnglishWorksheet } from '@/types/english';
import { EnglishService } from '@/services/englishService';

const SUBJECTS = ['국어', '영어', '수학'];

// EnglishUIData를 EnglishWorksheetDetail 형식으로 역변환하는 함수
const convertUIDataToWorksheetDetail = (uiData: any) => {
  if (!uiData) return null;

  return {
    selectedWorksheet: {
      worksheet_id: uiData.worksheetInfo.id || 'temp-generation',
      worksheet_name: uiData.worksheetInfo.name,
      worksheet_date: uiData.worksheetInfo.date,
      worksheet_time: uiData.worksheetInfo.time,
      worksheet_duration: uiData.worksheetInfo.duration,
      worksheet_subject: uiData.worksheetInfo.subject,
      worksheet_level: uiData.worksheetInfo.level,
      worksheet_grade: uiData.worksheetInfo.grade,
      total_questions: uiData.questions.length,
    },
    worksheetProblems: {
      passages: uiData.passages.map((p: any) => ({
        passage_id: p.id,
        passage_type: p.type,
        passage_content: p.content,
        original_content: p.originalContent,
        korean_translation: p.koreanTranslation,
        related_questions: p.relatedQuestionIds,
      })),
      questions: uiData.questions.map((q: any) => ({
        question_id: q.id,
        question_text: q.text || q.questionText,
        question_type: q.type,
        question_subject: q.subject,
        question_difficulty: q.difficulty,
        question_detail_type: q.detailType,
        question_passage_id: q.passageId,
        example_content: q.exampleContent,
        example_original_content: q.exampleOriginalContent,
        example_korean_translation: q.exampleKoreanTranslation,
        question_choices: q.choices,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        learning_point: q.learningPoint,
      })),
    }
  };
};


export default function CreatePage() {
  const [subject, setSubject] = useState<string>('');
  const [forceUpdateKey, setForceUpdateKey] = useState(0); // 강제 리렌더링을 위한 키
  const [showValidationReport, setShowValidationReport] = useState(false); // 검증 리포트 모달 상태
  const [isEditingTitle, setIsEditingTitle] = useState(false); // 제목 편집 상태
  const [showAnswerSheet, setShowAnswerSheet] = useState(false); // 정답지 표시 상태
  const [isWorksheetSaved, setIsWorksheetSaved] = useState(false); // 워크시트 저장 상태

  // 과목별 생성 훅들
  const koreanGeneration = useKoreanGeneration();
  const mathGeneration = useMathGeneration();
  const englishGeneration = useEnglishGeneration();

  // 문제지 저장 훅
  const worksheetSave = useWorksheetSave();
  const englishWorksheetSave = useEnglishWorksheetSave();

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
    if (newSubject === '영어') {
      englishWorksheetSave.resetWorksheet();
    } else {
      worksheetSave.resetWorksheet();
    }
  };

  // 과목별 문제 생성 핸들러
  const handleGenerate = (data: any) => {
    if (subject === '수학') {
      // 검증 기능이 활성화된 경우 검증 포함 생성 사용
      if (mathGeneration.enableValidation) {
        mathGeneration.generateMathProblemsWithValidation(data);
      } else {
        mathGeneration.generateMathProblems(data);
      }
    } else if (subject === '국어') {
      koreanGeneration.generateKoreanProblems(data);
    } else if (subject === '영어') {
      englishGeneration.generateEnglishProblems(data);
    }
  };

  // 문제 재생성 핸들러 - bank 페이지와 동일한 방식 사용
  const handleRegenerateQuestion = async (questionId: number, prompt?: string) => {
    console.log('🔄 재생성 시작:', { questionId, prompt });

    if (!prompt) {
      alert('재생성 요구사항을 입력해주세요.');
      return;
    }

    try {
      // 현재 문제 찾기
      const currentQuestion = currentGeneration.previewQuestions.find(q => q.id === questionId);
      console.log('📝 현재 문제:', currentQuestion);

      if (!currentQuestion) {
        alert('문제를 찾을 수 없습니다.');
        return;
      }

      // 재생성 시작 상태로 설정
      currentGeneration.updateState({
        regeneratingQuestionId: questionId
      });

      // MathService의 재생성 API 직접 호출
      const { MathService } = await import('@/services/mathService');

      // backendId가 실제 데이터베이스의 문제 ID
      const backendProblemId = currentQuestion.backendId;
      if (!backendProblemId) {
        alert('백엔드 문제 ID를 찾을 수 없습니다. 문제가 아직 저장되지 않았을 수 있습니다.');
        return;
      }

      const regenerateData = {
        problem_id: backendProblemId,
        requirements: prompt,
        current_problem: {
          question: currentQuestion.question,
          problem_type: currentQuestion.problem_type || 'multiple_choice',
          choices: currentQuestion.choices || [],
          correct_answer: currentQuestion.correct_answer || '',
          explanation: currentQuestion.explanation || '',
        }
      };

      const taskResponse = await MathService.regenerateProblemAsync(regenerateData);

      if (taskResponse?.task_id) {
        // 작업 상태 폴링
        let attempts = 0;
        const maxAttempts = 300;
        const interval = 2000;

        const pollTaskStatus = async () => {
          while (attempts < maxAttempts) {
            try {
              const statusResponse = await MathService.getTaskStatus(taskResponse.task_id);

              if (statusResponse?.status === 'SUCCESS') {
                // 성공 시 문제 업데이트 (LaTeX 변환 제거 - LaTeXRenderer가 처리)
                const result = statusResponse.result;

                // questionId는 프론트엔드 ID, backendId와 매칭해야 함
                const updatedQuestions = currentGeneration.previewQuestions.map(q => {
                  // 프론트엔드 ID 또는 백엔드 ID 중 하나라도 매칭되면 업데이트
                  const isTargetQuestion = q.id === questionId || q.backendId === backendProblemId;

                  if (isTargetQuestion) {
                    console.log('🎯 문제 매칭됨:', {
                      frontendId: q.id,
                      backendId: q.backendId,
                      questionId,
                      backendProblemId
                    });

                    return {
                      ...q,
                      question: result.question || q.question,
                      problem_type: result.problem_type || q.problem_type,
                      choices: result.choices || q.choices,
                      correct_answer: result.correct_answer || q.correct_answer,
                      explanation: result.explanation || q.explanation,
                    };
                  }
                  return q;
                });

                console.log('🔄 재생성 결과 업데이트:', {
                  originalQuestions: currentGeneration.previewQuestions.length,
                  updatedQuestions: updatedQuestions.length,
                  questionId,
                  result
                });

                // 상태 업데이트 with 강제 리렌더링
                if (subject === '수학') {
                  // 완전히 새로운 배열과 객체 참조로 업데이트
                  const newQuestions = updatedQuestions.map(q => ({
                    ...q,
                    // 수학 문제의 경우 choices를 options로도 매핑
                    options: q.choices || q.options,
                    title: q.question || q.title
                  }));

                  mathGeneration.updateState({
                    previewQuestions: newQuestions,
                    regeneratingQuestionId: null,
                    showRegenerationInput: null,
                    regenerationPrompt: ''
                  });
                  console.log('✅ mathGeneration 상태 업데이트 완료');
                } else {
                  const newQuestions = updatedQuestions.map(q => ({
                    ...q,
                    // 다른 과목의 경우도 동일하게 매핑
                    options: q.choices || q.options,
                    title: q.question || q.title
                  }));

                  currentGeneration.updateState({
                    previewQuestions: newQuestions,
                    regeneratingQuestionId: null,
                    showRegenerationInput: null,
                    regenerationPrompt: ''
                  });
                  console.log('✅ currentGeneration 상태 업데이트 완료');
                }

                // 컴포넌트 강제 리렌더링
                setForceUpdateKey(prev => prev + 1);
                console.log('🔄 컴포넌트 강제 리렌더링 트리거');

                alert('문제가 성공적으로 재생성되었습니다.');
                return;
              } else if (statusResponse?.status === 'FAILURE') {
                throw new Error(statusResponse.error || '재생성 작업이 실패했습니다.');
              }

              // 아직 진행 중이면 잠시 대기
              await new Promise(resolve => setTimeout(resolve, interval));
              attempts++;
            } catch (error) {
              console.error('작업 상태 확인 중 오류:', error);
              attempts++;
              await new Promise(resolve => setTimeout(resolve, interval));
            }
          }

          throw new Error('재생성 작업이 시간 초과되었습니다.');
        };

        await pollTaskStatus();
      }
    } catch (error: any) {
      console.error('문제 재생성 실패:', error);
      alert(`재생성 실패: ${error.message}`);

      // 실패 시 재생성 상태 해제
      currentGeneration.updateState({
        regeneratingQuestionId: null,
        showRegenerationInput: null,
        regenerationPrompt: ''
      });
    }
  };

  // 문제지 저장 핸들러
  const handleSaveWorksheet = () => {
    if (subject === '영어') {
      // 영어 전용 저장 로직
      if (!englishGeneration.uiData) {
        currentGeneration.updateState({ errorMessage: '저장할 영어 문제가 없습니다.' });
        return;
      }

      // 제목이 없으면 기본 제목 설정
      if (!englishWorksheetSave.worksheetName.trim()) {
        englishWorksheetSave.setWorksheetName(`영어 문제지 ${new Date().toLocaleDateString()}`);
      }

      englishWorksheetSave.saveEnglishWorksheet(
        englishGeneration.uiData,
        () => {
          currentGeneration.updateState({
            errorMessage: '영어 문제지가 성공적으로 저장되었습니다! ✅',
          });
        },
        (error) => {
          currentGeneration.updateState({ errorMessage: error });
        },
      );
    } else {
      // 기존 저장 로직 (수학, 국어)
      worksheetSave.saveWorksheet(
        subject,
        currentGeneration.previewQuestions,
        () => {
          currentGeneration.updateState({
            errorMessage: '문제지가 성공적으로 저장되었습니다! ✅',
          });
        },
        (error) => {
          currentGeneration.updateState({ errorMessage: error });
        },
      );
    }
  };


  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 영역 */}
      <PageHeader
        icon={<PlusCircle />}
        title="문제 생성"
        variant="question"
        description="과목별 문제를 생성할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0">
        <div className="flex gap-6 h-full">
          <Card className="w-1/3 flex flex-col shadow-sm h-[calc(100vh-200px)]" style={{ gap: '0', padding: '0' }}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100" style={{ padding: '20px' }}>
              <CardTitle className="text-lg font-semibold text-gray-900">문제 생성</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0" style={{ padding: '20px' }}>
              {/* 과목 탭 */}
              <div className="mb-4">
                <div className="flex gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSubjectChange(s)}
                      className={`py-2 px-4 text-sm font-medium rounded transition-colors duration-150 cursor-pointer ${
                        subject === s
                          ? 'bg-[#E6F3FF] text-[#0085FF]'
                          : 'bg-[#f5f5f5] text-[#999999]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 과목별 컴포넌트 렌더링 */}
              <div className="overflow-y-auto pr-2" style={{ height: 'calc(100vh - 400px)' }}>
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
                  <div className="space-y-4">
                    {/* 검증 옵션 토글 */}
                    <div className="border rounded-lg p-3 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">AI 문제 검증</h4>
                          <p className="text-xs text-blue-700">
                            생성된 문제의 정확성을 AI가 자동으로 검증합니다
                          </p>
                        </div>
                        <button
                          onClick={mathGeneration.toggleValidation}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            mathGeneration.enableValidation ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              mathGeneration.enableValidation ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 수학 생성 컴포넌트 */}
                    <MathGenerator
                      onGenerate={handleGenerate}
                      isGenerating={currentGeneration.isGenerating}
                    />

                    {/* 검증 대시보드 (수학일 때만, 검증 요약이 있을 때만) */}
                    {mathGeneration.validationSummary && (
                      <ValidationDashboard
                        summary={mathGeneration.validationSummary}
                        compact={true}
                        className="mt-4"
                      />
                    )}
                  </div>
                )}
                {!subject && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">
                      과목을 선택해주세요
                      <div className="mt-2">
                        위의 탭에서 과목을 선택하면 문제 생성 폼이 나타납니다.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽 영역 - 결과 미리보기 자리 */}
          <Card className="flex-1 flex flex-col shadow-sm h-[calc(100vh-200px)]" style={{ gap: '0', padding: '0' }}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100" style={{ padding: '20px' }}>
              <CardTitle className="text-lg font-semibold text-gray-900">문제지</CardTitle>
              {/* 수학 과목이고 검증이 활성화된 경우 검증 버튼 표시 */}
              {subject === '수학' && mathGeneration.enableValidation && mathGeneration.validationSummary && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    검증 완료: {mathGeneration.validationSummary.auto_approved}개 승인
                  </span>
                  <ValidationDashboard
                    summary={mathGeneration.validationSummary}
                    compact={true}
                    className="max-w-xs"
                  />
                  <button
                    onClick={() => setShowValidationReport(true)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                  >
                    상세 리포트
                  </button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* 영어는 EnglishWorksheetDetail 컴포넌트 사용 */}
              {subject === '영어' ? (
                englishGeneration.uiData && englishGeneration.uiData.questions.length > 0 ? (
                  (() => {
                    const convertedData = convertUIDataToWorksheetDetail(englishGeneration.uiData);
                    return (
                      <EnglishWorksheetDetail
                        selectedWorksheet={convertedData?.selectedWorksheet as EnglishWorksheet | null}
                        worksheetProblems={convertedData?.worksheetProblems || {}}
                        showAnswerSheet={showAnswerSheet}
                        isEditingTitle={isEditingTitle}
                        editedTitle={englishWorksheetSave.worksheetName || `영어 문제지 ${new Date().toLocaleDateString()}`}
                        onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
                        onEditProblem={() => {}}
                        onStartEditTitle={() => setIsEditingTitle(true)}
                        onCancelEditTitle={() => {
                          setIsEditingTitle(false);
                          englishWorksheetSave.setWorksheetName(englishWorksheetSave.worksheetName);
                        }}
                        onSaveTitle={() => {
                          setIsEditingTitle(false);
                        }}
                        onEditedTitleChange={englishWorksheetSave.setWorksheetName}
                        onRefresh={() => {
                          // 강제 리렌더링으로 데이터 새로고침
                          setForceUpdateKey(prev => prev + 1);
                        }}
                        mode="generation"
                        onSaveWorksheet={handleSaveWorksheet}
                        isSaving={englishWorksheetSave.isSaving}
                        onUpdateQuestion={(questionId, updatedQuestion, updatedPassage, updatedRelatedQuestions) => {
                          // 영어 생성 상태의 questions 배열 업데이트
                          const currentUIData = englishGeneration.uiData;
                          if (currentUIData) {
                            let updatedQuestions = [...currentUIData.questions];

                            // 현재 문제 업데이트
                            updatedQuestions = updatedQuestions.map((q: any) => {
                              if (q.question_id === questionId) {
                                return {
                                  ...q,
                                  ...updatedQuestion,
                                  // 객관식 정답 인덱스 변환 (0-based -> 1-based for UI)
                                  correct_answer: updatedQuestion.question_type === '객관식' &&
                                    typeof updatedQuestion.correct_answer === 'string' &&
                                    !isNaN(parseInt(updatedQuestion.correct_answer))
                                    ? (parseInt(updatedQuestion.correct_answer) + 1).toString()
                                    : updatedQuestion.correct_answer
                                };
                              }
                              return q;
                            });

                            // 연계 문제들도 업데이트 (다중 재생성의 경우)
                            if (updatedRelatedQuestions && updatedRelatedQuestions.length > 0) {
                              updatedRelatedQuestions.forEach((relatedQ: any) => {
                                updatedQuestions = updatedQuestions.map((q: any) => {
                                  if (q.question_id === relatedQ.question_id) {
                                    return {
                                      ...q,
                                      ...relatedQ,
                                      // 객관식 정답 인덱스 변환 (0-based -> 1-based for UI)
                                      correct_answer: relatedQ.question_type === '객관식' &&
                                        typeof relatedQ.correct_answer === 'string' &&
                                        !isNaN(parseInt(relatedQ.correct_answer))
                                        ? (parseInt(relatedQ.correct_answer) + 1).toString()
                                        : relatedQ.correct_answer
                                    };
                                  }
                                  return q;
                                });
                              });
                            }

                            // 지문이 업데이트된 경우 passages 배열도 업데이트
                            let updatedPassages = currentUIData.passages;
                            if (updatedPassage) {
                              updatedPassages = currentUIData.passages.map((p: any) => {
                                if (p.passage_id === updatedPassage.passage_id) {
                                  return {
                                    ...p,
                                    ...updatedPassage,
                                    id: p.id, // 기존 id 유지
                                  };
                                }
                                return p;
                              });
                            }

                            // UIData 업데이트
                            englishGeneration.updateUIData({
                              ...currentUIData,
                              questions: updatedQuestions,
                              passages: updatedPassages,
                            });

                            // 강제 리렌더링
                            setForceUpdateKey(prev => prev + 1);
                          }
                        }}
                      />
                    );
                  })()
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    {currentGeneration.isGenerating
                      ? '영어 문제를 생성하고 있습니다...'
                      : '영어 과목을 선택하고 문제를 생성해주세요'
                    }
                  </div>
                )
              ) : (
                // 다른 과목은 기존 방식 (forceUpdateKey로 강제 리렌더링)
                <QuestionPreview
                  key={`${subject}-${forceUpdateKey}`}
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

      {/* Validation Toast 제거 - 문제지 섹션에 통합 */}

      {/* 개발용: 검증 상태 모니터링 */}
      {subject === '수학' && process.env.NODE_ENV === 'development' && mathGeneration.enableValidation && (
        <div className="fixed bottom-4 left-4 bg-blue-900 text-white p-2 rounded text-xs z-50 max-w-xs">
          <div className="font-bold mb-1">🔍 AI 검증 시스템</div>
          <div>상태: {mathGeneration.showValidationToast ? '검증 완료' : '대기 중'}</div>
          <div>문제 수: {mathGeneration.previewQuestions.length}</div>
          {mathGeneration.validationSummary && (
            <div className="mt-1 pt-1 border-t border-blue-700">
              <div>승인: {mathGeneration.validationSummary.auto_approved}</div>
              <div>검토: {mathGeneration.validationSummary.manual_review_needed}</div>
            </div>
          )}
        </div>
      )}

      {/* 검증 상세 리포트 모달 */}
      <ValidationReportModal
        isOpen={showValidationReport}
        onClose={() => setShowValidationReport(false)}
        summary={mathGeneration.validationSummary}
      />
    </div>
  );
}
