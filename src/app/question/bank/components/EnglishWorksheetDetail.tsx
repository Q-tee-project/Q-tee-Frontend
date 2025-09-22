'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnglishQuestion, EnglishWorksheetData, EnglishRegenerationInfo, EnglishRegenerationRequest, EnglishPassage } from '@/types/english';
import { Edit3, RotateCcw, AlertTriangle } from 'lucide-react';
import { EnglishService } from '@/services/englishService';
import { PassageRenderer } from './PassageRenderer';
import { QuestionRenderer } from './QuestionRenderer';

interface EnglishWorksheetDetailProps {
  selectedWorksheet: EnglishWorksheetData | null;
  worksheetProblems: EnglishWorksheetData;
  worksheetPassages: EnglishPassage[];
  showAnswerSheet: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  onToggleAnswerSheet: () => void;
  onOpenDistributeDialog?: () => void;
  onOpenEditDialog?: () => void;
  onEditProblem: (question: any) => void;
  onStartEditTitle: () => void;
  onCancelEditTitle: () => void;
  onSaveTitle: () => void;
  onEditedTitleChange: (value: string) => void;
  onRefresh: () => void;
  mode?: 'generation' | 'bank';
  onSaveWorksheet?: () => void;
  isSaving?: boolean;
  showRegenerateButtons?: boolean;
  onUpdateQuestion?: (questionId: number, updatedQuestion: any, updatedPassage?: any, updatedRelatedQuestions?: any[]) => void;
}

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

export const EnglishWorksheetDetail: React.FC<EnglishWorksheetDetailProps> = ({
  selectedWorksheet,
  worksheetProblems,
  worksheetPassages,
  showAnswerSheet,
  isEditingTitle,
  editedTitle,
  onToggleAnswerSheet,
  onOpenDistributeDialog,
  onOpenEditDialog,
  onEditProblem,
  onStartEditTitle,
  onCancelEditTitle,
  onSaveTitle,
  onEditedTitleChange,
  onRefresh,
  mode = 'bank',
  onSaveWorksheet,
  isSaving = false,
  showRegenerateButtons = true,
  onUpdateQuestion,
}) => {
  // 편집 상태 관리
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingPassageId, setEditingPassageId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({});
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 재생성 상태 관리
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerationInfo, setRegenerationInfo] = useState<EnglishRegenerationInfo | null>(null);
  const [selectedQuestionForRegeneration, setSelectedQuestionForRegeneration] = useState<EnglishQuestion | null>(null);
  const [regenerationFormData, setRegenerationFormData] = useState<Partial<EnglishRegenerationRequest>>({});
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 문제 편집 시작
  const handleStartEditQuestion = (question: any) => {
    setEditingQuestionId(question.question_id);
    setEditingQuestion(question); // 원본 문제 정보 저장

    // 객관식 정답을 인덱스에서 사용자 번호로 변환 (0,1,2,3 -> 1,2,3,4)
    let displayCorrectAnswer = question.correct_answer || '';
    if (question.question_type === '객관식' && !isNaN(question.correct_answer)) {
      displayCorrectAnswer = (parseInt(question.correct_answer) + 1).toString();
    }

    setEditFormData({
      question_text: question.question_text || '',
      question_type: question.question_type || '객관식',
      question_subject: question.question_subject || '독해',
      question_difficulty: question.question_difficulty || '중',
      question_detail_type: question.question_detail_type || '',
      question_choices: question.question_choices || ['', '', '', ''],
      correct_answer: displayCorrectAnswer,
      explanation: question.explanation || '',
      learning_point: question.learning_point || '',
      example_content: question.example_content || '',
    });
  };

  // 지문 편집 시작
  const handleStartEditPassage = (passage: any) => {
    setEditingPassageId(passage.passage_id);
    setEditFormData({
      passage_content: JSON.parse(JSON.stringify(passage.passage_content)),
      original_content: JSON.parse(JSON.stringify(passage.original_content)),
      korean_translation: JSON.parse(JSON.stringify(passage.korean_translation)),
    });
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingPassageId(null);
    setEditingQuestion(null);
    setEditFormData({});
  };

  // 문제 저장
  const handleSaveQuestion = async () => {
    if (!selectedWorksheet || !editingQuestionId) return;

    setIsLoading(true);
    try {
      // 저장용 데이터 준비 (객관식 정답을 사용자 번호에서 인덱스로 변환: 1,2,3,4 -> 0,1,2,3)
      const saveData = { ...editFormData };
      if (editFormData.question_type === '객관식' && !isNaN(editFormData.correct_answer as any)) {
        saveData.correct_answer = (parseInt(editFormData.correct_answer as string) - 1).toString();
      }

      await EnglishService.updateEnglishQuestion(
        selectedWorksheet.worksheet_id as number,
        editingQuestionId,
        saveData
      );

      setEditingQuestionId(null);
      setEditingQuestion(null);
      setEditFormData({});
      onRefresh(); // 데이터 새로고침
      alert('문제가 성공적으로 수정되었습니다.');
    } catch (error: any) {
      alert(`문제 수정 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 지문 저장
  const handleSavePassage = async () => {
    if (!selectedWorksheet || !editingPassageId) return;

    setIsLoading(true);
    try {
      await EnglishService.updateEnglishPassage(
        selectedWorksheet.worksheet_id as number,
        editingPassageId,
        editFormData
      );

      setEditingPassageId(null);
      setEditFormData({});
      onRefresh(); // 데이터 새로고침
      alert('지문이 성공적으로 수정되었습니다.');
    } catch (error: any) {
      alert(`지문 수정 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 재생성 모달 열기
  const handleOpenRegenerateModal = async (question: EnglishQuestion) => {
    if (!selectedWorksheet) return;

    try {
      setIsLoading(true);
      setSelectedQuestionForRegeneration(question);

      // 생성 모드일 때는 DB 조회 없이 현재 데이터로 구성
      if (mode === 'generation') {
        // 현재 메모리에 있는 데이터로 재생성 정보 구성
        const currentPassage = question.question_passage_id ?
          passages.find((p: EnglishPassage) => p.passage_id === question.question_passage_id) : null;

        const relatedQuestions = currentPassage ?
          questions.filter((q: EnglishQuestion) => q.question_passage_id === question.question_passage_id && q.question_id !== question.question_id)
            .map((q: EnglishQuestion) => ({ id: q.question_id, text: q.question_text })) : [];

        const info = {
          question: {
            id: question.question_id,
            question_type: question.question_type,
            question_subject: question.question_subject,
            question_detail_type: question.question_detail_type,
            question_difficulty: question.question_difficulty,
            passage_id: question.question_passage_id,
          },
          worksheet: {
            school_level: selectedWorksheet.worksheet_level,
            grade: selectedWorksheet.worksheet_grade,
            problem_type: selectedWorksheet.problem_type || '혼합형',
          },
          has_passage: !!question.question_passage_id,
          related_questions: relatedQuestions,
        };

        setRegenerationInfo(info as EnglishRegenerationInfo);

        // 생성 모드 폼 초기값 설정
        setRegenerationFormData({
          feedback: '',
          keep_passage: true,
          regenerate_related_questions: false,
          keep_question_type: true,
          keep_difficulty: true,
          keep_subject: true,
          keep_detail_type: true,
          worksheet_context: {
            school_level: info.worksheet.school_level,
            grade: info.worksheet.grade,
            worksheet_type: info.worksheet.problem_type,
          },
          current_question_type: info.question.question_type,
          current_subject: info.question.question_subject,
          current_detail_type: info.question.question_detail_type,
          current_difficulty: info.question.question_difficulty,
          additional_requirements: '',
        });
      } else {
        // 뱅크 모드일 때는 기존대로 API 조회
        const info = await EnglishService.getEnglishQuestionRegenerationInfo(
          selectedWorksheet.worksheet_id as number,
          question.question_id
        );

        setRegenerationInfo(info);

        // 뱅크 모드 폼 초기값 설정
        setRegenerationFormData({
          feedback: '',
          keep_passage: true,
          regenerate_related_questions: false,
          keep_question_type: true,
          keep_difficulty: true,
          keep_subject: true,
          keep_detail_type: true,
          worksheet_context: {
            school_level: info.worksheet.school_level,
            grade: info.worksheet.grade,
            worksheet_type: info.worksheet.problem_type,
          },
          current_question_type: info.question.question_type,
          current_subject: info.question.question_subject,
          current_detail_type: info.question.question_detail_type,
          current_difficulty: info.question.question_difficulty,
          additional_requirements: '',
        });
      }

      setIsRegenerateModalOpen(true);
    } catch (error: any) {
      alert(`재생성 정보 조회 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 재생성 실행
  const handleRegenerate = async () => {
    if (!selectedWorksheet || !selectedQuestionForRegeneration || !regenerationFormData.feedback) {
      alert('피드백을 입력해주세요.');
      return;
    }

    setIsRegenerating(true);

    // 로딩 메시지 결정
    const isMultipleRegeneration = regenerationFormData.regenerate_related_questions &&
      regenerationInfo?.related_questions?.length && regenerationInfo?.related_questions?.length > 0;

    try {
      if (mode === 'generation') {
        // 생성 모드: 데이터 기반 재생성 API 사용
        const currentPassage = selectedQuestionForRegeneration.question_passage_id ?
          passages.find((p: EnglishPassage) => p.passage_id === selectedQuestionForRegeneration.question_passage_id) : null;

        const response = await EnglishService.regenerateEnglishQuestionFromData(
          selectedQuestionForRegeneration,
          currentPassage,
          regenerationFormData as EnglishRegenerationRequest
        );

        if (response.status === 'success') {
          // 성공 메시지 개선
          if (response.regenerated_related_questions && response.regenerated_related_questions.length > 0) {
            alert(`지문과 ${response.regenerated_related_questions.length + 1}개 문제가 함께 재생성되었습니다!`);
          } else {
            alert('문제가 성공적으로 재생성되었습니다!');
          }

          // 생성 모드에서는 로컬 상태를 업데이트
          if (onUpdateQuestion) {
            onUpdateQuestion(
              selectedQuestionForRegeneration.question_id,
              response.regenerated_question,
              response.regenerated_passage,
              response.regenerated_related_questions
            );
          }

          setIsRegenerateModalOpen(false);
        } else {
          alert(`재생성 실패: ${response.message}`);
        }
      } else {
        // 뱅크 모드: 기존 DB 기반 재생성 API 사용
        const response = await EnglishService.regenerateEnglishQuestion(
          selectedWorksheet.worksheet_id as number,
          selectedQuestionForRegeneration.question_id,
          regenerationFormData as EnglishRegenerationRequest
        );

        if (response.status === 'success') {
          // 성공 메시지 개선
          if (response.regenerated_related_questions && response.regenerated_related_questions.length > 0) {
            alert(`지문과 ${response.regenerated_related_questions.length + 1}개 문제가 함께 재생성되었습니다!`);
          } else {
            alert('문제가 성공적으로 재생성되었습니다!');
          }

          setIsRegenerateModalOpen(false);
          onRefresh(); // 데이터 새로고침
        } else {
          alert(`재생성 실패: ${response.message}`);
        }
      }
    } catch (error: any) {
      alert(`재생성 실패: ${error.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // 재생성 모달 닫기
  const handleCloseRegenerateModal = () => {
    setIsRegenerateModalOpen(false);
    setRegenerationInfo(null);
    setSelectedQuestionForRegeneration(null);
    setRegenerationFormData({});
  };
  if (!selectedWorksheet) {
    return (
      <Card className="w-2/3 flex items-center justify-center shadow-sm h-[calc(100vh-200px)]">
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <div className="text-gray-500 text-sm">영어 문제지를 선택하세요</div>
        </div>
      </Card>
    );
  }

  const questions = (worksheetProblems?.questions || []).sort((a: EnglishQuestion, b: EnglishQuestion) => a.question_id - b.question_id);
  const passages: EnglishPassage[] = worksheetProblems?.passages || [];

  return (
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
                {selectedWorksheet.worksheet_name || "제목 없음"}
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
          {questions.length > 0 && (
            <Button
              onClick={onToggleAnswerSheet}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
            >
              {showAnswerSheet ? '시험지 보기' : '정답 및 해설'}
            </Button>
          )}

          {/* 생성 모드: 저장 버튼 */}
          {mode === 'generation' && onSaveWorksheet && (
            <Button
              onClick={onSaveWorksheet}
              disabled={isSaving}
              className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
            >
              {isSaving ? '저장 중...' : '문제지 저장'}
            </Button>
          )}

          {/* 뱅크 모드: 배포 및 편집 버튼 */}
          {mode === 'bank' && (
            <>
              {onOpenDistributeDialog && (
                <Button
                  onClick={onOpenDistributeDialog}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                >
                  문제지 배포
                </Button>
              )}
              {onOpenEditDialog && (
                <Button
                  onClick={onOpenEditDialog}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                >
                  문제지 편집
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea style={{ height: 'calc(100vh - 350px)' }} className="w-full">
          {questions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              영어 문제 데이터를 불러오는 중입니다...
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {questions.map((question: EnglishQuestion, questionIndex: number) => {
                // 연관된 지문 찾기
                const passage = question.question_passage_id ?
                  passages.find((p: EnglishPassage) => p.passage_id === question.question_passage_id) : null;

                // 이전 문제와 같은 지문인지 확인 (지문 중복 렌더링 방지)
                const prevQuestion = questionIndex > 0 ? questions[questionIndex - 1] : null;
                const shouldShowPassage = passage &&
                  (!prevQuestion || prevQuestion.question_passage_id !== question.question_passage_id);

                return (
                  <div key={question.question_id}>
                    {/* 지문 렌더링 */}
                    {shouldShowPassage && passage && (
                      <PassageRenderer
                        passage={passage}
                        showAnswerSheet={showAnswerSheet}
                        editingPassageId={editingPassageId}
                        editFormData={editFormData}
                        isLoading={isLoading}
                        onStartEdit={handleStartEditPassage}
                        onSave={handleSavePassage}
                        onCancelEdit={handleCancelEdit}
                        onEditFormDataChange={setEditFormData}
                      />
                    )}

                    {/* 문제 카드 */}
                    <QuestionRenderer
                      question={question}
                      questionIndex={questionIndex}
                      showAnswerSheet={showAnswerSheet}
                      editingQuestionId={editingQuestionId}
                      editFormData={editFormData}
                      isLoading={isLoading}
                      showRegenerateButtons={showRegenerateButtons}
                      onStartEdit={handleStartEditQuestion}
                      onSave={handleSaveQuestion}
                      onCancelEdit={handleCancelEdit}
                      onEditFormDataChange={setEditFormData}
                      onOpenRegenerateModal={handleOpenRegenerateModal}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* 재생성 모달 */}
      <Dialog open={isRegenerateModalOpen} onOpenChange={setIsRegenerateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-green-600" />
              문제 재생성
            </DialogTitle>
          </DialogHeader>

          {regenerationInfo && (
            <div className="space-y-6">
              {/* 지문 연계 경고 */}
              {regenerationInfo.has_passage && regenerationInfo.related_questions?.length && regenerationInfo.related_questions.length > 0 && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-blue-800">
                      <div className="font-semibold mb-2 text-blue-900">📝 지문 연계 문제 안내</div>
                      <div className="text-sm">
                        이 문제는 지문에 연결된 다른 문제들이 있습니다:
                        <ul className="mt-1 ml-4 list-disc">
                          {regenerationInfo.related_questions.map(q => (
                            <li key={q.id}>문제 {q.id}: {q.text.substring(0, 30)}...</li>
                          ))}
                        </ul>
                        <div className="mt-2 font-medium">
                          💡 지문을 변경하려면 "지문과 모든 연계 문제 함께 재생성" 옵션을 선택하세요.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 피드백 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  어떻게 수정하고 싶으신가요? *
                </label>
                <Textarea
                  value={regenerationFormData.feedback || ''}
                  onChange={(e) => setRegenerationFormData({
                    ...regenerationFormData,
                    feedback: e.target.value
                  })}
                  placeholder="예: 문제를 더 쉽게 만들어주세요"
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* 유지/변경 옵션 */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">유지할 조건들</div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keep_difficulty"
                      checked={regenerationFormData.keep_difficulty || false}
                      onCheckedChange={(checked) => setRegenerationFormData({
                        ...regenerationFormData,
                        keep_difficulty: checked as boolean
                      })}
                    />
                    <label htmlFor="keep_difficulty" className="text-sm">
                      난이도 유지 (현재: {regenerationInfo.question.question_difficulty})
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keep_subject"
                      checked={regenerationFormData.keep_subject || false}
                      onCheckedChange={(checked) => setRegenerationFormData({
                        ...regenerationFormData,
                        keep_subject: checked as boolean
                      })}
                    />
                    <label htmlFor="keep_subject" className="text-sm">
                      영역 유지 (현재: {regenerationInfo.question.question_subject})
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keep_question_type"
                      checked={regenerationFormData.keep_question_type || false}
                      onCheckedChange={(checked) => setRegenerationFormData({
                        ...regenerationFormData,
                        keep_question_type: checked as boolean
                      })}
                    />
                    <label htmlFor="keep_question_type" className="text-sm">
                      문제 유형 유지 (현재: {regenerationInfo.question.question_type})
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keep_detail_type"
                      checked={regenerationFormData.keep_detail_type || false}
                      onCheckedChange={(checked) => setRegenerationFormData({
                        ...regenerationFormData,
                        keep_detail_type: checked as boolean
                      })}
                    />
                    <label htmlFor="keep_detail_type" className="text-sm">
                      세부 영역 유지 (현재: {regenerationInfo.question.question_detail_type})
                    </label>
                  </div>

                  {regenerationInfo.has_passage && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <Checkbox
                        id="keep_passage"
                        checked={regenerationFormData.keep_passage || false}
                        onCheckedChange={(checked) => setRegenerationFormData({
                          ...regenerationFormData,
                          keep_passage: checked as boolean
                        })}
                      />
                      <label htmlFor="keep_passage" className="text-sm">
                        지문 유지 (현재 지문을 그대로 사용)
                      </label>
                    </div>
                  )}

                  {/* 연계 문제 재생성 옵션 (지문이 있고 연계 문제가 있을 때만 표시) */}
                  {regenerationInfo.has_passage && regenerationInfo.related_questions?.length && regenerationInfo.related_questions.length > 0 && !regenerationFormData.keep_passage && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <Checkbox
                        id="regenerate_related_questions"
                        checked={regenerationFormData.regenerate_related_questions || false}
                        onCheckedChange={(checked) => setRegenerationFormData({
                          ...regenerationFormData,
                          regenerate_related_questions: checked as boolean
                        })}
                      />
                      <label htmlFor="regenerate_related_questions" className="text-sm">
                        지문과 모든 연계 문제 함께 재생성 ({regenerationInfo.related_questions?.length && regenerationInfo.related_questions.length + 1}개 문제)
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 변경할 값들 (조건부 표시) */}
              <div className="space-y-4">
                {!regenerationFormData.keep_difficulty && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">변경할 난이도</label>
                    <Select
                      value={regenerationFormData.target_difficulty || ''}
                      onValueChange={(value) => setRegenerationFormData({
                        ...regenerationFormData,
                        target_difficulty: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="난이도 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="하">하</SelectItem>
                        <SelectItem value="중">중</SelectItem>
                        <SelectItem value="상">상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!regenerationFormData.keep_subject && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">변경할 영역</label>
                    <Select
                      value={regenerationFormData.target_subject || ''}
                      onValueChange={(value) => setRegenerationFormData({
                        ...regenerationFormData,
                        target_subject: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="영역 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="독해">독해</SelectItem>
                        <SelectItem value="문법">문법</SelectItem>
                        <SelectItem value="어휘">어휘</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 추가 요구사항 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  추가 요구사항 (선택)
                </label>
                <Textarea
                  value={regenerationFormData.additional_requirements || ''}
                  onChange={(e) => setRegenerationFormData({
                    ...regenerationFormData,
                    additional_requirements: e.target.value
                  })}
                  placeholder="예: 스포츠 관련 주제로 만들어주세요"
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseRegenerateModal}
              disabled={isRegenerating}
            >
              취소
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating || !regenerationFormData.feedback}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRegenerating ? (
                regenerationFormData.regenerate_related_questions && regenerationInfo?.related_questions?.length && regenerationInfo?.related_questions?.length > 0
                  ? '지문과 연계 문제들을 함께 생성 중...'
                  : '문제를 재생성 중...'
              ) : (
                regenerationFormData.regenerate_related_questions && regenerationInfo?.related_questions?.length && regenerationInfo?.related_questions?.length > 0
                  ? `지문과 ${regenerationInfo?.related_questions?.length + 1}개 문제 재생성`
                  : '문제 재생성'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};