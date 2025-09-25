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

// english.ts 타입 정의에 따라 데이터를 정제하는 헬퍼 함수
const sanitizeQuestionData = (question: EnglishQuestion): EnglishQuestion => ({
  question_id: question.question_id,
  question_text: question.question_text,
  question_type: question.question_type,
  question_subject: question.question_subject,
  question_difficulty: question.question_difficulty,
  question_detail_type: question.question_detail_type,
  question_passage_id: question.question_passage_id,
  example_content: question.example_content,
  example_original_content: question.example_original_content,
  example_korean_translation: question.example_korean_translation,
  question_choices: question.question_choices,
  correct_answer: question.correct_answer,
  explanation: question.explanation,
  learning_point: question.learning_point,
});

const sanitizePassageData = (passage: EnglishPassage): EnglishPassage => ({
  passage_id: passage.passage_id,
  passage_type: passage.passage_type,
  passage_content: passage.passage_content,
  original_content: passage.original_content,
  korean_translation: passage.korean_translation,
  related_questions: passage.related_questions,
});

const RegenerationPreviewModal: React.FC<RegenerationPreviewModalProps> = ({
  isOpen,
  onClose,
  onApply,
  previewData,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);

  if (!isOpen || !previewData) {
    return null;
  }

  const { original, regenerated } = previewData;

  // "재생성된 결과" 컬럼에 표시할 콘텐츠 결정
  const regeneratedPassageToShow = regenerated.passage || original.passage;
  const mainRegeneratedQuestion = regenerated.question;
  // 연관 문제가 재생성되었다면 해당 데이터를, 아니라면 원본 연관 문제 데이터를 사용
  const relatedRegeneratedQuestions = regenerated.relatedQuestions || original.relatedQuestions;

  const originalQuestions = [original.question, ...(original.relatedQuestions || [])].filter(Boolean) as EnglishQuestion[];
  const regeneratedQuestions = [mainRegeneratedQuestion, ...(relatedRegeneratedQuestions || [])].filter(Boolean) as EnglishQuestion[];

  const renderContent = (
    title: string,
    passage: EnglishPassage | null | undefined,
    questions: EnglishQuestion[],
    isOriginal: boolean
  ) => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-center sticky top-0 bg-white py-2 z-10 border-b">{title}</h3>
      <div className="p-4 border rounded-lg bg-gray-50/50 flex-1">
        {passage && (
          <PassageRenderer
            passage={passage}
            showAnswerSheet={showAnswers}
            // 미리보기에서는 편집 비활성화
            editingPassageId={null}
            editFormData={{}}
            isLoading={false}
            onStartEdit={() => {}}
            onSave={() => {}}
            onCancelEdit={() => {}}
            onEditFormDataChange={() => {}}
          />
        )}
        {questions.map((q, index) => (
          <QuestionRenderer
            key={isOriginal ? `orig-${q.question_id}` : `regen-${q.question_id}`}
            question={q}
            questionIndex={index}
            showAnswerSheet={showAnswers}
            // 미리보기에서는 편집 및 재생성 비활성화
            editingQuestionId={null}
            editFormData={{}}
            isLoading={false}
            showRegenerateButtons={false}
            onStartEdit={() => {}}
            onSave={() => {}}
            onCancelEdit={() => {}}
            onEditFormDataChange={() => {}}
            onOpenRegenerateModal={() => {}}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>재생성 결과 비교</DialogTitle>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowAnswers(!showAnswers)}>
              {showAnswers ? '문제 보기' : '정답/해설 보기'}
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1 border-t">
          {renderContent("원본", original.passage, originalQuestions, true)}
          {renderContent("재생성된 결과", regeneratedPassageToShow, regeneratedQuestions, false)}
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={onApply} className="bg-green-600 hover:bg-green-700">적용하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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

  // 재생성 결과 비교를 위한 상태
  const [previewData, setPreviewData] = useState<{
    original: { question: EnglishQuestion; passage?: EnglishPassage | null; relatedQuestions?: EnglishQuestion[] };
    regenerated: { question?: EnglishQuestion; passage?: EnglishPassage | null; relatedQuestions?: EnglishQuestion[] };
  } | null>(null);
  const [isRegenerationPreviewModalOpen, setIsRegenerationPreviewModalOpen] = useState(false);

  // 문제 편집 시작
  const handleStartEditQuestion = (question: any) => {
    setEditingQuestionId(question.question_id);
    setEditingQuestion(question); // 원본 문제 정보 저장

    // 정답은 이미 1-based로 저장되어 있으므로 그대로 사용
    let displayCorrectAnswer = question.correct_answer || '';

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

    // 깊은 복사로 데이터 준비
    const deepCopy = (obj: any) => obj ? JSON.parse(JSON.stringify(obj)) : {};

    setEditFormData({
      passage_content: deepCopy(passage.passage_content),
      original_content: deepCopy(passage.original_content),
      korean_translation: deepCopy(passage.korean_translation),
    });

    console.log('📝 지문 편집 시작:', {
      passageId: passage.passage_id,
      passageContent: passage.passage_content,
      hasTitle: !!passage.passage_content?.title,
      hasParagraphs: !!passage.passage_content?.paragraphs,
      hasContent: !!passage.passage_content?.content,
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

    try {
      let response: EnglishRegenerationResponse | null = null;

      if (mode === 'generation') {
        const currentPassage = selectedQuestionForRegeneration.question_passage_id
          ? passages.find((p: EnglishPassage) => p.passage_id === selectedQuestionForRegeneration.question_passage_id)
          : null;

        let questionsToSend = [selectedQuestionForRegeneration];
        // '지문 유지'가 해제되었을 때만 연관 문제들을 포함
        if (regenerationFormData.keep_passage === false) {
          const relatedQuestions = currentPassage
            ? questions.filter(q => q.question_passage_id === currentPassage.passage_id && q.question_id !== selectedQuestionForRegeneration.question_id)
            : [];
          questionsToSend.push(...relatedQuestions);
        }

        const sanitizedQuestions = questionsToSend.map(q => sanitizeQuestionData(q));
        const sanitizedPassage = currentPassage ? sanitizePassageData(currentPassage) : null;

        response = await EnglishService.regenerateEnglishQuestionFromData(
          sanitizedQuestions,
          sanitizedPassage,
          regenerationFormData as EnglishRegenerationRequest
        );
      } else { // bank mode
        response = await EnglishService.regenerateEnglishQuestion(
          selectedWorksheet.worksheet_id as number,
          selectedQuestionForRegeneration.question_id,
          regenerationFormData as EnglishRegenerationRequest
        );
      }

      if (response && response.status === 'success') {
        const originalQuestion = selectedQuestionForRegeneration;
        const originalPassage = originalQuestion.question_passage_id
          ? passages.find(p => p.passage_id === originalQuestion.question_passage_id)
          : null;
        const originalRelatedQuestions = originalPassage
          ? questions.filter(q => q.question_passage_id === originalPassage.passage_id && q.question_id !== originalQuestion.question_id)
          : [];

        // regenerated_questions 배열에서 메인 문제와 연관 문제 분리
        const regeneratedQuestions = response.regenerated_questions || [];
        const mainRegeneratedQuestion = regeneratedQuestions.find((q: EnglishQuestion) => q.question_id === originalQuestion.question_id) || regeneratedQuestions[0];
        const relatedRegeneratedQuestions = regeneratedQuestions.filter((q: EnglishQuestion) => q.question_id !== originalQuestion.question_id);

        setPreviewData({
          original: {
            question: originalQuestion,
            passage: originalPassage,
            relatedQuestions: originalRelatedQuestions
          },
          regenerated: {
            question: mainRegeneratedQuestion,
            passage: response.regenerated_passage,
            relatedQuestions: relatedRegeneratedQuestions
          }
        });

        setIsRegenerationPreviewModalOpen(true);
        setIsRegenerateModalOpen(false); // Close the options modal
      } else {
        alert(`재생성 실패: ${response?.message || '알 수 없는 오류'}`);
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

  // 디버깅: 지문 데이터 확인
  console.log('📚 지문 데이터 확인:', {
    worksheetProblems: worksheetProblems,
    passagesCount: passages.length,
    passages: passages,
    questionsWithPassage: questions.filter(q => q.question_passage_id).length,
  });

  // 각 문제별 지문 연결 상태 확인
  questions.forEach((question, index) => {
    const passage = question.question_passage_id ?
      passages.find((p: EnglishPassage) => p.passage_id === question.question_passage_id) : null;
    console.log(`📝 문제 ${index + 1} (ID: ${question.question_id}):`, {
      question_passage_id: question.question_passage_id,
      passageFound: !!passage,
      passageId: passage?.passage_id,
    });
  });

  const ContentWrapper = mode === 'generation' ? 'div' : Card;
  const HeaderWrapper = mode === 'generation' ? 'div' : CardHeader;
  const BodyWrapper = mode === 'generation' ? 'div' : CardContent;

  return (
    <ContentWrapper className={mode === 'generation'
      ? "flex-1 flex flex-col overflow-hidden"
      : "flex-1 flex flex-col shadow-sm h-[calc(100vh-200px)]"}>
      <HeaderWrapper className={mode === 'generation'
        ? "flex flex-row items-center py-4 px-6 border-b border-gray-100 flex-shrink-0"
        : "flex flex-row items-center py-6 px-6 border-b border-gray-100 flex-shrink-0"}>
        <div className="flex-1"></div>
        <div className="flex items-center justify-center gap-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                defaultValue={editedTitle}
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
                onFocus={(e) => e.target.select()}
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
      </HeaderWrapper>

      <BodyWrapper className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea style={{
          height: mode === 'generation'
            ? 'calc(100vh - 360px)'
            : 'calc(100vh - 280px)'
        }} className="w-full">
          {questions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              영어 문제 데이터를 불러오는 중입니다...
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {questions.map((question: EnglishQuestion, questionIndex: number) => {
                // 연관된 지문 찾기
                const passage = question.question_passage_id ?
                  passages.find((p: EnglishPassage) => p.passage_id === question.question_passage_id) : null;

                // 이전 문제와 같은 지문인지 확인 (지문 중복 렌더링 방지)
                const prevQuestion = questionIndex > 0 ? questions[questionIndex - 1] : null;
                const shouldShowPassage = passage &&
                  (!prevQuestion || prevQuestion.question_passage_id !== question.question_passage_id);

                // 지문 렌더링 디버깅
                console.log(`🎯 문제 ${questionIndex + 1} 지문 렌더링 조건:`, {
                  hasPassage: !!passage,
                  shouldShowPassage: shouldShowPassage,
                  passageId: passage?.passage_id,
                  prevQuestionPassageId: prevQuestion?.question_passage_id,
                  currentQuestionPassageId: question.question_passage_id,
                });

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
      </BodyWrapper>

      {/* 재생성 모달 */}
      <Dialog open={isRegenerateModalOpen} onOpenChange={setIsRegenerateModalOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-green-600" />
              문제 재생성
            </DialogTitle>
          </DialogHeader>

          {regenerationInfo && (
            <div className="space-y-6 pt-4">
              {/* 지문 연계 경고 */}
              {regenerationInfo.has_passage && regenerationInfo.related_questions?.length && regenerationInfo.related_questions.length > 0 && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-blue-800">
                      <div className="font-semibold mb-1 text-blue-900">📝 지문 연계 문제 안내</div>
                      <div className="text-sm">
                        이 문제는 지문에 연결된 다른 문제들이 있습니다. '지문 유지'를 체크 해제하면 지문과 모든 연관 문제가 함께 변경될 수 있습니다.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 피드백 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  어떻게 수정하고 싶으신가요? (필수)
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

              {/* 지문 옵션 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">지문 옵션</div>
                {regenerationInfo.has_passage ? (
                  <div className="p-3 rounded-md border bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keep_passage"
                        checked={regenerationFormData.keep_passage !== false}
                        onCheckedChange={(checked) => setRegenerationFormData({
                          ...regenerationFormData,
                          keep_passage: checked as boolean,
                        })}
                      />
                      <label htmlFor="keep_passage" className="text-sm font-medium">
                        지문 유지
                      </label>
                    </div>
                    {/* '지문 유지' 해제 시 경고 메시지 */}
                    {!regenerationFormData.keep_passage && regenerationInfo.related_questions && regenerationInfo.related_questions.length > 0 && (
                      <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-3 mt-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-yellow-800">
                            <div className="font-semibold text-yellow-900">주의!</div>
                            <p className="text-sm mt-1">
                              지문이 변경되므로, 이 지문과 연결된 다른 모든 문제({regenerationInfo.related_questions.length}개)도 함께 재생성됩니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3 rounded-md border bg-gray-50">이 문제는 지문이 없습니다.</p>
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

              <div className="text-xs text-gray-500 bg-slate-50 p-3 rounded-md border">
                <strong>참고:</strong> 문제의 난이도, 영역, 유형 등은 변경되지 않고 현재 값으로 유지됩니다.
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
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
              {isRegenerating ? '문제를 재생성 중...' : '문제 재생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 재생성 결과 비교 모달 */}
      <RegenerationPreviewModal
        isOpen={isRegenerationPreviewModalOpen}
        onClose={() => setIsRegenerationPreviewModalOpen(false)}
        onApply={() => {
          if (!previewData) return;

          if (mode === 'generation' && onUpdateQuestion) {
            onUpdateQuestion(
              previewData.original.question.question_id,
              previewData.regenerated.question,
              previewData.regenerated.passage,
              previewData.regenerated.relatedQuestions
            );
          } else if (mode === 'bank') {
            onRefresh();
          }

          setIsRegenerationPreviewModalOpen(false);
          setPreviewData(null);
          alert('재생성된 내용이 적용되었습니다.');
        }}
        previewData={previewData}
      />
    </ContentWrapper>
  );
};