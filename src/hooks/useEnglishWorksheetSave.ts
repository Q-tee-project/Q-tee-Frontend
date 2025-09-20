import { useState } from 'react';
import { EnglishService } from '@/services/englishService';
import { EnglishLLMResponseAndRequest } from '@/types/english';
import { EnglishUIData, ParsedPassage, ParsedQuestion } from '@/types/englishUI';

export const useEnglishWorksheetSave = () => {
  const [worksheetName, setWorksheetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentWorksheetId, setCurrentWorksheetId] = useState<string | null>(null);

  const resetWorksheet = () => {
    setWorksheetName('');
    setCurrentWorksheetId(null);
  };

  // UIData를 EnglishLLMResponseAndRequest 형식으로 변환
  const convertUIDataToSaveFormat = (uiData: EnglishUIData): EnglishLLMResponseAndRequest => {
    const now = new Date();

    // 현재 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    return {
      worksheet_id: currentWorksheetId || `worksheet_${Date.now()}`,
      teacher_id: userId, // 현재 사용자 ID 설정
      worksheet_name: worksheetName,
      worksheet_date: now.toISOString().split('T')[0], // YYYY-MM-DD
      worksheet_time: now.toTimeString().split(' ')[0], // HH:MM:SS
      worksheet_duration: '60', // 분 단위 문자열
      worksheet_subject: uiData.worksheetInfo.subject,
      worksheet_level: uiData.worksheetInfo.level,
      worksheet_grade: uiData.worksheetInfo.grade,
      problem_type: uiData.worksheetInfo.problemType,
      total_questions: uiData.worksheetInfo.totalQuestions,
      passages: uiData.passages.map((passage: ParsedPassage) => ({
        passage_id: passage.id,
        passage_type: passage.type,
        passage_content: passage.content,
        original_content: passage.originalContent,
        korean_translation: passage.koreanTranslation,
        related_questions: passage.relatedQuestionIds,
      })),
      questions: uiData.questions.map((question: ParsedQuestion) => ({
        question_id: question.id,
        question_text: question.questionText,
        question_type: question.type,
        question_subject: question.subject,
        question_difficulty: question.difficulty,
        question_detail_type: question.detailType,
        question_passage_id: question.passageId || null,
        example_content: question.exampleContent || '',
        example_original_content: question.exampleOriginalContent || '',
        example_korean_translation: question.exampleKoreanTranslation || '',
        question_choices: question.choices,
        correct_answer: question.correctAnswer.toString(),
        explanation: question.explanation,
        learning_point: question.learningPoint,
      })),
    };
  };

  // 영어 워크시트 저장 함수
  const saveEnglishWorksheet = async (
    uiData: EnglishUIData,
    onSuccess?: (worksheetId: string) => void,
    onError?: (error: string) => void,
  ) => {
    if (!worksheetName.trim()) {
      alert('문제지 이름을 입력해주세요.');
      return;
    }

    if (!uiData || uiData.questions.length === 0) {
      alert('저장할 문제가 없습니다.');
      return;
    }

    try {
      setIsSaving(true);

      // UIData를 저장 형식으로 변환
      const saveData = convertUIDataToSaveFormat(uiData);

      console.log('💾 영어 워크시트 저장 요청:', saveData);

      // 영어 워크시트 저장 API 호출
      const result = await EnglishService.saveEnglishWorksheet(saveData);

      if (result.worksheet_id) {
        setCurrentWorksheetId(result.worksheet_id);
        onSuccess?.(result.worksheet_id);
      } else {
        throw new Error('워크시트 ID를 받지 못했습니다.');
      }

    } catch (error) {
      console.error('영어 워크시트 저장 오류:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : '영어 워크시트 저장 중 오류가 발생했습니다. 다시 시도해주세요.';
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    worksheetName,
    setWorksheetName,
    isSaving,
    currentWorksheetId,
    setCurrentWorksheetId,
    saveEnglishWorksheet,
    resetWorksheet,
  };
};