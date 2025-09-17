import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';
import { EnglishService } from '@/services/englishService';
import { EnglishFormData, EnglishGenerationResponse } from '@/types/english';

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

  // 실제 영어 문제 생성
  const generateEnglishProblems = async (formData: EnglishFormData) => {
    try {
      updateState({
        isGenerating: true,
        generationProgress: 0,
        previewQuestions: [],
        errorMessage: '',
      });

      // 실제 API 호출
      const response: EnglishGenerationResponse = await EnglishService.generateEnglishProblems(formData);

      // 원본 응답 데이터 저장
      updateState({
        lastGenerationData: response,
        generationProgress: 100
      });

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
    generateEnglishProblems,
    updateState,
    resetGeneration,
    clearError,
  };
};
