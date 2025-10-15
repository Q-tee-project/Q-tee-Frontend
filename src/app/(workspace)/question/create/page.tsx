'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import KoreanGenerator from '@/components/generator/KoreanGenerator';
import EnglishGenerator from '@/components/generator/EnglishGenerator';
import MathGenerator from '@/components/generator/MathGenerator';
import { EnglishWorksheetDetail } from '@/components/bank/english/EnglishWorksheetDetail';
import { MathWorksheetDetail } from '@/components/bank/math/MathWorksheetDetail';
import { KoreanWorksheetDetail } from '@/components/bank/korean/KoreanWorksheetDetail';
import { ErrorToast } from '@/components/bank/common/ErrorToast';
import {
  useKoreanGeneration,
  useMathGeneration,
  useEnglishGeneration,
  useWorksheetSave,
  useEnglishWorksheetSave,
} from '@/hooks';
import { EnglishWorksheetData } from '@/types/english';

const SUBJECTS = ['국어', '영어', '수학'];

// 더 이상 변환 필요 없음 - 서버 데이터 직접 사용

export default function CreatePage() {
  const [subject, setSubject] = useState<string>('');
  const [forceUpdateKey, setForceUpdateKey] = useState(0); // 강제 리렌더링을 위한 키
  const [isEditingTitle, setIsEditingTitle] = useState(false); // 제목 편집 상태
  const [showAnswerSheet, setShowAnswerSheet] = useState(true); // 정답지 표시 상태 (기본값 true - 시험지 보기)

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
      mathGeneration.generateMathProblems(data);
    } else if (subject === '국어') {
      koreanGeneration.generateKoreanProblems(data);
    } else if (subject === '영어') {
      englishGeneration.generateEnglishProblems(data);
    }
  };

  // 문제 재생성 핸들러 - bank 페이지와 동일한 방식 사용
  const handleRegenerateQuestion = async (questionId: number, prompt?: string) => {
    if (!prompt) {
      alert('재생성 요구사항을 입력해주세요.');
      return;
    }

    try {
      // 현재 문제 찾기
      const currentQuestion = currentGeneration.previewQuestions.find((q) => q.id === questionId);

      if (!currentQuestion) {
        alert('문제를 찾을 수 없습니다.');
        return;
      }

      // 재생성 시작 상태로 설정
      currentGeneration.updateState({
        regeneratingQuestionId: questionId,
      });

      // MathService의 재생성 API 직접 호출
      const { mathService } = await import('@/services/mathService');

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
        },
      };

      const taskResponse = await mathService.regenerateProblemAsync(regenerateData);

      if (taskResponse?.task_id) {
        // 작업 상태 폴링
        let attempts = 0;
        const maxAttempts = 300;
        const interval = 2000;

        const pollTaskStatus = async () => {
          while (attempts < maxAttempts) {
            try {
              const statusResponse = await mathService.getTaskStatus(taskResponse.task_id);

              if (statusResponse?.status === 'SUCCESS') {
                // 성공 시 문제 업데이트 (LaTeX 변환 제거 - LaTeXRenderer가 처리)
                const result = statusResponse.result;

                // questionId는 프론트엔드 ID, backendId와 매칭해야 함
                const updatedQuestions = currentGeneration.previewQuestions.map((q) => {
                  // 프론트엔드 ID 또는 백엔드 ID 중 하나라도 매칭되면 업데이트
                  const isTargetQuestion = q.id === questionId || q.backendId === backendProblemId;

                  if (isTargetQuestion) {
                    console.log('🎯 문제 매칭됨:', {
                      frontendId: q.id,
                      backendId: q.backendId,
                      questionId,
                      backendProblemId,
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
                  result,
                });

                // 상태 업데이트 with 강제 리렌더링
                if (subject === '수학') {
                  // 완전히 새로운 배열과 객체 참조로 업데이트
                  const newQuestions = updatedQuestions.map((q) => ({
                    ...q,
                    // 수학 문제의 경우 choices를 options로도 매핑
                    options: q.choices || q.options,
                    title: q.question || q.title,
                  }));

                  mathGeneration.updateState({
                    previewQuestions: newQuestions,
                    regeneratingQuestionId: null,
                    showRegenerationInput: null,
                    regenerationPrompt: '',
                  });
                  console.log('✅ mathGeneration 상태 업데이트 완료');
                } else {
                  const newQuestions = updatedQuestions.map((q) => ({
                    ...q,
                    // 다른 과목의 경우도 동일하게 매핑
                    options: q.choices || q.options,
                    title: q.question || q.title,
                  }));

                  currentGeneration.updateState({
                    previewQuestions: newQuestions,
                    regeneratingQuestionId: null,
                    showRegenerationInput: null,
                    regenerationPrompt: '',
                  });
                  console.log('✅ currentGeneration 상태 업데이트 완료');
                }

                // 컴포넌트 강제 리렌더링
                setForceUpdateKey((prev) => prev + 1);
                console.log('🔄 컴포넌트 강제 리렌더링 트리거');

                alert('문제가 성공적으로 재생성되었습니다.');
                return;
              } else if (statusResponse?.status === 'FAILURE') {
                throw new Error(statusResponse.error || '재생성 작업이 실패했습니다.');
              }

              // 아직 진행 중이면 잠시 대기
              await new Promise((resolve) => setTimeout(resolve, interval));
              attempts++;
            } catch (error) {
              console.error('작업 상태 확인 중 오류:', error);
              attempts++;
              await new Promise((resolve) => setTimeout(resolve, interval));
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
        regenerationPrompt: '',
      });
    }
  };

  // 문제지 저장 핸들러
  const handleSaveWorksheet = () => {
    if (subject === '영어') {
      // 영어 전용 저장 로직
      if (!englishGeneration.worksheetData) {
        currentGeneration.updateState({ errorMessage: '저장할 영어 문제가 없습니다.' });
        return;
      }

      // 제목이 없으면 기본 제목 설정
      if (!englishWorksheetSave.worksheetName.trim()) {
        englishWorksheetSave.setWorksheetName(`영어 문제지 ${new Date().toLocaleDateString()}`);
      }

      englishWorksheetSave.saveEnglishWorksheet(
        englishGeneration.worksheetData as EnglishWorksheetData,
        () => {
          currentGeneration.updateState({
            errorMessage: null,
          });
          alert('영어 문제지가 성공적으로 저장되었습니다! ✅');
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
    <div className="flex flex-col h-screen p-5 gap-5">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<PlusCircle />}
        title="문제 생성"
        variant="question"
        description="과목별 문제를 생성할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-6 h-full">
          <Card className="w-1/3 flex flex-col shadow-sm gap-0 p-0">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 flex-shrink-0 p-5">
              <CardTitle className="text-lg font-semibold text-gray-900">문제 생성</CardTitle>
            </CardHeader>

            <CardContent
              className="flex-1 min-h-0 flex flex-col"
              style={{ padding: '20px', gap: '16px' }}
            >
              {/* 과목 탭 */}
              <div>
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

              {/* 과목별 컴포넌트 렌더링 - 스크롤 영역 */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
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
                    {/* 수학 생성 컴포넌트 */}
                    <MathGenerator
                      onGenerate={handleGenerate}
                      isGenerating={currentGeneration.isGenerating}
                    />
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
          {/* 과목별 WorksheetDetail 컴포넌트 사용 */}
          {subject === '수학' && currentGeneration.previewQuestions.length > 0 ? (
            <MathWorksheetDetail
              selectedWorksheet={
                {
                  id: 0,
                  title:
                    worksheetSave.worksheetName || `수학 문제지 ${new Date().toLocaleDateString()}`,
                  school_level: '중학교',
                  grade: 1,
                  semester: '1학기',
                  unit_name: '',
                  chapter_name: '',
                  problem_count: currentGeneration.previewQuestions.length,
                  status: 'completed',
                } as any
              }
              worksheetProblems={currentGeneration.previewQuestions.map(
                (q: any, index: number) => ({
                  id: q.id || index + 1,
                  sequence_order: index + 1,
                  question: q.question || q.title,
                  problem_type: q.problem_type || 'multiple_choice',
                  difficulty: q.difficulty || 'B',
                  correct_answer: q.correct_answer || q.answer,
                  choices: q.choices || q.options || [],
                  explanation: q.explanation || q.solution || '',
                  tikz_code: q.tikz_code || null,
                  created_at: new Date().toISOString(),
                }),
              )}
              showAnswerSheet={showAnswerSheet}
              isEditingTitle={isEditingTitle}
              editedTitle={
                worksheetSave.worksheetName || `수학 문제지 ${new Date().toLocaleDateString()}`
              }
              onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
              onOpenDistributeDialog={() => {}}
              onOpenEditDialog={() => {}}
              onEditProblem={() => {}}
              onStartEditTitle={() => setIsEditingTitle(true)}
              onCancelEditTitle={() => {
                setIsEditingTitle(false);
                worksheetSave.setWorksheetName(worksheetSave.worksheetName);
              }}
              onSaveTitle={() => {
                setIsEditingTitle(false);
              }}
              onEditedTitleChange={worksheetSave.setWorksheetName}
            />
          ) : subject === '국어' && currentGeneration.previewQuestions.length > 0 ? (
            <KoreanWorksheetDetail
              selectedWorksheet={
                {
                  id: 0,
                  title:
                    worksheetSave.worksheetName || `국어 문제지 ${new Date().toLocaleDateString()}`,
                  school_level: '중학교',
                  grade: 1,
                  korean_type: '문학',
                  problem_count: currentGeneration.previewQuestions.length,
                  passage_title: '',
                  passage_content: '',
                  passage_author: '',
                  status: 'completed',
                } as any
              }
              worksheetProblems={currentGeneration.previewQuestions.map(
                (q: any, index: number) => ({
                  id: q.id || index + 1,
                  sequence_order: index + 1,
                  question: q.question || q.title,
                  problem_type: q.problem_type || 'multiple_choice',
                  question_type: q.question_type || q.problem_type || 'multiple_choice',
                  korean_type: q.korean_type || '문학',
                  difficulty: q.difficulty || 'B',
                  correct_answer: q.correct_answer || q.answer,
                  choices: q.choices || q.options || [],
                  explanation: q.explanation || q.solution || '',
                  source_text: q.source_text || q.passage_content || '',
                  source_title: q.source_title || q.passage_title || '',
                  source_author: q.source_author || q.passage_author || '',
                  created_at: new Date().toISOString(),
                }),
              )}
              showAnswerSheet={showAnswerSheet}
              isEditingTitle={isEditingTitle}
              editedTitle={
                worksheetSave.worksheetName || `국어 문제지 ${new Date().toLocaleDateString()}`
              }
              onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
              onOpenDistributeDialog={() => {}}
              onOpenEditDialog={() => {}}
              onEditProblem={() => {}}
              onStartEditTitle={() => setIsEditingTitle(true)}
              onCancelEditTitle={() => {
                setIsEditingTitle(false);
                worksheetSave.setWorksheetName(worksheetSave.worksheetName);
              }}
              onSaveTitle={() => {
                setIsEditingTitle(false);
              }}
              onEditedTitleChange={worksheetSave.setWorksheetName}
            />
          ) : subject === '영어' &&
            englishGeneration.worksheetData &&
            englishGeneration.worksheetData.questions &&
            englishGeneration.worksheetData.questions.length > 0 ? (
            <EnglishWorksheetDetail
              selectedWorksheet={englishGeneration.worksheetData}
              worksheetProblems={englishGeneration.worksheetData}
              worksheetPassages={englishGeneration.worksheetData.passages || []}
              showAnswerSheet={showAnswerSheet}
              isEditingTitle={isEditingTitle}
              editedTitle={
                worksheetSave.worksheetName || `영어 문제지 ${new Date().toLocaleDateString()}`
              }
              onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
              onOpenDistributeDialog={() => {}}
              onOpenEditDialog={() => {}}
              onEditProblem={() => {}}
              onStartEditTitle={() => setIsEditingTitle(true)}
              onCancelEditTitle={() => {
                setIsEditingTitle(false);
                worksheetSave.setWorksheetName(worksheetSave.worksheetName);
              }}
              onSaveTitle={() => {
                setIsEditingTitle(false);
              }}
              onEditedTitleChange={worksheetSave.setWorksheetName}
              onRefresh={() => setForceUpdateKey((prev) => prev + 1)}
            />
          ) : subject === '영어' &&
            englishGeneration.worksheetData &&
            englishGeneration.worksheetData.questions &&
            englishGeneration.worksheetData.questions.length > 0 ? (
            <div className="w-2/3 h-full overflow-hidden">
              <EnglishWorksheetDetail
                selectedWorksheet={englishGeneration.worksheetData}
                worksheetProblems={englishGeneration.worksheetData}
                worksheetPassages={englishGeneration.worksheetData.passages || []}
                showAnswerSheet={showAnswerSheet}
                isEditingTitle={isEditingTitle}
                editedTitle={
                  englishWorksheetSave.worksheetName ||
                  englishGeneration.worksheetData?.worksheet_name ||
                  `영어 문제지 ${new Date().toLocaleDateString()}`
                }
                onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
                onEditProblem={() => {}}
                onStartEditTitle={() => setIsEditingTitle(true)}
                onCancelEditTitle={() => {
                  setIsEditingTitle(false);
                  englishWorksheetSave.setWorksheetName(englishWorksheetSave.worksheetName);
                }}
                onSaveTitle={() => {
                  // 워크시트 데이터에 제목 반영
                  if (englishGeneration.worksheetData) {
                    englishGeneration.updateWorksheetData({
                      ...englishGeneration.worksheetData,
                      worksheet_name: englishWorksheetSave.worksheetName,
                    });
                  }
                  setIsEditingTitle(false);
                }}
                onEditedTitleChange={englishWorksheetSave.setWorksheetName}
                onRefresh={() => {
                  // 강제 리렌더링으로 데이터 새로고침
                  setForceUpdateKey((prev) => prev + 1);
                }}
                mode="generation"
                onSaveWorksheet={handleSaveWorksheet}
                isSaving={englishWorksheetSave.isSaving}
                onUpdateQuestion={(
                  questionId,
                  updatedQuestion,
                  updatedPassage,
                  updatedRelatedQuestions,
                ) => {
                  // 영어 생성 상태의 questions 배열 업데이트
                  const currentWorksheetData = englishGeneration.worksheetData;
                  if (currentWorksheetData) {
                    let updatedQuestions = [...(currentWorksheetData.questions || [])];

                    // 현재 문제 업데이트
                    updatedQuestions = updatedQuestions.map((q: any) => {
                      if (q.question_id === questionId) {
                        return {
                          ...q,
                          ...updatedQuestion,
                          // 객관식 정답 인덱스 변환 (0-based -> 1-based for UI)
                          correct_answer:
                            updatedQuestion.question_type === '객관식' &&
                            typeof updatedQuestion.correct_answer === 'string' &&
                            !isNaN(parseInt(updatedQuestion.correct_answer))
                              ? (parseInt(updatedQuestion.correct_answer) + 1).toString()
                              : updatedQuestion.correct_answer,
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
                              correct_answer:
                                relatedQ.question_type === '객관식' &&
                                typeof relatedQ.correct_answer === 'string' &&
                                !isNaN(parseInt(relatedQ.correct_answer))
                                  ? (parseInt(relatedQ.correct_answer) + 1).toString()
                                  : relatedQ.correct_answer,
                            };
                          }
                          return q;
                        });
                      });
                    }

                    // 지문이 업데이트된 경우 passages 배열도 업데이트
                    let updatedPassages = [...(currentWorksheetData.passages || [])];
                    if (updatedPassage) {
                      console.log('🔄 지문 업데이트 중:', {
                        updatedPassage,
                        updatedPassageKeys: Object.keys(updatedPassage),
                        currentPassages: currentWorksheetData.passages,
                        passageId: updatedPassage.passage_id,
                        currentPassageIds: currentWorksheetData.passages?.map((p) => p.passage_id),
                      });

                      // 기존 지문을 찾아서 업데이트
                      let passageUpdated = false;
                      updatedPassages = updatedPassages.map((p: any) => {
                        if (p.passage_id === updatedPassage.passage_id) {
                          console.log('✅ 지문 매칭됨 - 업데이트 중:', {
                            originalPassage: p,
                            updatedPassage,
                          });
                          passageUpdated = true;
                          return {
                            ...updatedPassage, // 새 지문 데이터로 완전 교체
                            id: p.id, // 기존 id만 유지
                          };
                        }
                        return p;
                      });

                      if (!passageUpdated) {
                        console.log('⚠️ 지문 매칭 실패 - ID가 일치하지 않음');
                      }
                    }

                    // WorksheetData 업데이트
                    englishGeneration.updateWorksheetData({
                      ...currentWorksheetData,
                      questions: updatedQuestions,
                      passages: updatedPassages,
                    });

                    // 강제 리렌더링
                    setForceUpdateKey((prev) => prev + 1);
                  }
                }}
              />
            </div>
          ) : currentGeneration.isGenerating ? (
            <Card className="w-2/3 h-full flex items-center justify-center shadow-sm">
              <div className="text-gray-500">
                {subject === '수학'
                  ? '수학 문제를 생성하고 있습니다...'
                  : subject === '영어'
                  ? '영어 문제를 생성하고 있습니다...'
                  : '문제를 생성하고 있습니다...'}
              </div>
            </Card>
          ) : !subject ? (
            <Card className="w-2/3 h-full flex items-center justify-center shadow-sm">
              <div className="text-gray-500">과목을 선택하고 문제를 생성해주세요</div>
            </Card>
          ) : currentGeneration.previewQuestions.length === 0 && subject !== '영어' ? (
            <Card className="w-2/3 h-full flex items-center justify-center shadow-sm">
              <div className="text-gray-500">문제를 생성해주세요</div>
            </Card>
          ) : subject === '영어' &&
            (!englishGeneration.worksheetData ||
              !englishGeneration.worksheetData.questions ||
              englishGeneration.worksheetData.questions.length === 0) ? (
            <Card className="w-2/3 h-full flex items-center justify-center shadow-sm">
              <div className="text-gray-500">
                {currentGeneration.isGenerating
                  ? '영어 문제를 생성하고 있습니다...'
                  : '영어 과목을 선택하고 문제를 생성해주세요'}
              </div>
            </Card>
          ) : null}
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
