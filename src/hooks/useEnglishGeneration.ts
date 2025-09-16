import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';

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

  // 목업 문제 생성 (영어용)
  const generateMockProblems = async (data: any) => {
    updateState({
      isGenerating: true,
      generationProgress: 0,
      previewQuestions: [],
    });

    const cnt = Math.min(data.questionCount ?? 2, 5);

    // 문제들 생성
    const questions: PreviewQuestion[] = [];
    for (let i = 0; i < cnt; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // 문제 간 지연

      const newQuestion: PreviewQuestion = {
        id: i + 1,
        title: `문제 ${i + 1}. ${data.subject} 관련 예시 질문입니다.`,
        options: ['선택지 1', '선택지 2', '선택지 3', '선택지 4', '선택지 5'],
        answerIndex: 1,
        explanation:
          '해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트.',
      };

      questions.push(newQuestion);
      updateState({ previewQuestions: [...questions] });
      updateState({ generationProgress: ((i + 1) / cnt) * 100 });
    }

    updateState({ isGenerating: false });
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
    generateMockProblems,
    updateState,
    resetGeneration,
    clearError,
  };
};
