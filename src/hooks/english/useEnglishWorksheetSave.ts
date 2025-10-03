import { useState } from 'react';
import { EnglishService } from '@/services/englishService';
import { EnglishWorksheetData } from '@/types/english';

// 타입 별칭 (기존 코드 호환성)
type EnglishLLMResponseAndRequest = EnglishWorksheetData;
// EnglishUIData는 더 이상 사용하지 않음 - 서버 데이터 직접 사용

export const useEnglishWorksheetSave = () => {
  const [worksheetName, setWorksheetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentWorksheetId, setCurrentWorksheetId] = useState<number | null>(null);

  const resetWorksheet = () => {
    setWorksheetName('');
    setCurrentWorksheetId(null);
  };

  // 서버 데이터에 제목 추가 및 null 값 처리
  const addTitleToWorksheetData = (worksheetData: EnglishWorksheetData): EnglishWorksheetData => {
    const now = new Date();
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    // questions 배열의 null 값들을 빈 문자열로 처리하고 correct_answer를 문자열로 변환
    const processedQuestions = worksheetData.questions?.map(question => ({
      ...question,
      example_content: question.example_content || '',
      example_original_content: question.example_original_content || '',
      example_korean_translation: question.example_korean_translation || '',
      correct_answer: String(question.correct_answer), // 모든 답안을 문자열로 변환
      // difficulty 필드가 있으면 question_difficulty로 변환 (백엔드 스키마와 맞춤)
      question_difficulty: (question as any).difficulty || question.question_difficulty || '중',
    })) || [];

    return {
      ...worksheetData,
      worksheet_id: currentWorksheetId || 0,
      teacher_id: userId,
      worksheet_name: worksheetName,
      worksheet_date: now.toISOString().split('T')[0],
      worksheet_time: now.toTimeString().split(' ')[0],
      worksheet_duration: '60',
      questions: processedQuestions,
    };
  };

  // 영어 워크시트 저장 함수 (변환 없이 서버 데이터 직접 사용)
  const saveEnglishWorksheet = async (
    worksheetData: EnglishWorksheetData,
    onSuccess?: (worksheetId: number) => void,
    onError?: (error: string) => void,
  ) => {
    if (!worksheetName.trim()) {
      alert('문제지 이름을 입력해주세요.');
      return;
    }

    if (!worksheetData || !worksheetData.questions || worksheetData.questions.length === 0) {
      alert('저장할 문제가 없습니다.');
      return;
    }

    try {
      setIsSaving(true);

      // 서버 데이터에 제목만 추가
      const saveData = addTitleToWorksheetData(worksheetData);

      console.log('💾 원본 워크시트 데이터:', worksheetData);
      console.log('💾 변환된 저장 데이터:', saveData);
      console.log('💾 첫 번째 문제 데이터:', saveData.questions?.[0]);

      // 각 문제의 필드 검증
      saveData.questions?.forEach((question, index) => {
        console.log(`💾 문제 ${index + 1} 필드 검증:`, {
          question_id: question.question_id,
          question_difficulty: question.question_difficulty,
          difficulty: (question as any).difficulty,
          question_type: question.question_type,
          question_subject: question.question_subject,
        });
      });

      // 영어 워크시트 저장 API 호출
      const result = await EnglishService.saveEnglishWorksheet(saveData);

      if (result.worksheet_id) {
        setCurrentWorksheetId(Number(result.worksheet_id));
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