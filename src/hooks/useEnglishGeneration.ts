import { useState } from 'react';
import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';
import { EnglishService } from '@/services/englishService';
import { EnglishWorksheetGeneratorFormData, EnglishGenerationResponse, EnglishWorksheetData, EnglishPassage, EnglishQuestion } from '@/types/english';

// 타입 별칭 (기존 코드 호환성)
type EnglishFormData = EnglishWorksheetGeneratorFormData;
type EnglishLLMResponseAndRequest = EnglishWorksheetData;

// 변환 없이 서버 데이터 직접 사용

export const useEnglishGeneration = () => {
  const {
    isGenerating,
    generationProgress,
    previewQuestions,
    regeneratingQuestionId,
    regenerationPrompt,
    showRegenerationInput,
    lastGenerationData,
    errorMessage,
    updateState,
    resetGeneration,
    clearError,
  } = useProblemGeneration();

  // 서버 데이터 상태 직접 사용
  const [worksheetData, setWorksheetData] = useState<EnglishWorksheetData | null>(null);

  // 데이터 리셋 함수
  const resetWorksheetData = () => {
    setWorksheetData(null);
  };

  // 데이터 직접 업데이트 함수
  const updateWorksheetData = (newData: EnglishWorksheetData | null) => {
    setWorksheetData(newData);
  };

  // 실제 영어 문제 생성
  const generateEnglishProblems = async (formData: EnglishFormData) => {
    try {
      updateState({
        isGenerating: true,
        generationProgress: 0,
        previewQuestions: [],
        errorMessage: '',
      });

      // 데이터 초기화
      setWorksheetData(null);

      // 실제 API 호출
      const response: EnglishGenerationResponse = await EnglishService.generateEnglishProblems(formData);

      // 원본 응답 데이터 저장
      updateState({
        lastGenerationData: response,
        generationProgress: 100
      });

      // LLM 응답이 있으면 직접 저장 (변환 없이)
      if (response.llm_response) {
        setWorksheetData(response.llm_response);
        console.log('서버 데이터 직접 사용:', response.llm_response);

        // 지문 데이터 특별히 확인
        console.log('📚 생성된 지문 데이터:', {
          passagesCount: response.llm_response.passages?.length || 0,
          passages: response.llm_response.passages,
          questionsCount: response.llm_response.questions?.length || 0,
          questionsWithPassageId: response.llm_response.questions?.filter(q => q.question_passage_id).length || 0,
        });
      }

      console.log('영어 문제 생성 응답:', response);

      updateState({ isGenerating: false });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.';
      updateState({
        isGenerating: false,
        errorMessage,
        generationProgress: 0
      });
      // 에러 시 데이터 초기화
      setWorksheetData(null);
      throw error;
    }
  };


  return {
    isGenerating,
    generationProgress,
    previewQuestions,
    regeneratingQuestionId,
    regenerationPrompt,
    showRegenerationInput,
    lastGenerationData,
    errorMessage,
    worksheetData,
    generateEnglishProblems,
    updateState,
    resetGeneration,
    resetWorksheetData,
    clearError,
    updateWorksheetData,
  };
};
