import { useProblemGeneration, PreviewQuestion } from '../common/useProblemGeneration';
import { getCurrentUserId, apiRequest, pollTaskStatus, fetchWorksheet } from '../common/useGenerationHelpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';

export const useMathGeneration = () => {
  const {
    isGenerating,
    generationProgress,
    previewQuestions,
    regeneratingQuestionId,
    regenerationPrompt,
    showRegenerationInput,
    lastGenerationData,
    errorMessage,
    currentWorksheetId,
    updateState,
    resetGeneration,
    clearError,
  } = useProblemGeneration();

  // 수학 문제 생성 API 호출
  const generateMathProblems = async (requestData: any) => {
    try {
      updateState({
        isGenerating: true,
        generationProgress: 0,
        previewQuestions: [],
        lastGenerationData: requestData,
      });

      const userId = getCurrentUserId();
      const url = `${API_BASE_URL}/api/worksheets/generate?user_id=${userId}`;
      const data = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      await pollTaskStatus({
        taskId: data.task_id,
        apiBaseUrl: API_BASE_URL,
        taskEndpoint: '/api/tasks',
        onProgress: (progress) => updateState({ generationProgress: progress }),
        onSuccess: async (result) => {
          if (result?.worksheet_id) {
            await fetchWorksheetResult(result.worksheet_id);
          } else {
            updateState({
              errorMessage: '문제 생성은 완료되었지만 결과를 불러올 수 없습니다.',
              isGenerating: false,
            });
          }
        },
        onError: (error) => updateState({ errorMessage: error, isGenerating: false }),
      });
    } catch (error) {
      updateState({
        errorMessage: error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.',
        isGenerating: false,
      });
    }
  };

  // 개별 문제 재생성 함수
  const regenerateQuestion = async (questionId: number, prompt?: string) => {
    if (!lastGenerationData) {
      alert('원본 생성 데이터가 없습니다.');
      return;
    }

    try {
      updateState({ regeneratingQuestionId: questionId });

      const userId = getCurrentUserId();
      const url = `${API_BASE_URL}/api/problems/regenerate-async`;

      const data = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          ...lastGenerationData,
          regeneration_prompt: prompt || '',
        }),
      });

      await pollTaskStatus({
        taskId: data.task_id,
        apiBaseUrl: API_BASE_URL,
        taskEndpoint: '/api/tasks',
        onSuccess: async (result) => {
          if (result?.problem) {
            const newQuestion: PreviewQuestion = {
              id: questionId,
              title: result.problem.question || '',
              options: result.problem.choices,
              answerIndex: result.problem.correct_answer_index ?? 0,
              explanation: result.problem.explanation || '',
              correct_answer: result.problem.correct_answer,
              question: result.problem.question,
              choices: result.problem.choices,
              backendId: result.problem.id,
            };

            updateState({
              previewQuestions: previewQuestions.map((q) =>
                q.id === questionId ? newQuestion : q
              ),
              regeneratingQuestionId: null,
            });
          }
        },
        onError: (error) => {
          alert(`재생성 실패: ${error}`);
          updateState({ regeneratingQuestionId: null });
        },
      });
    } catch (error) {
      alert('문제 재생성 중 오류가 발생했습니다.');
      updateState({ regeneratingQuestionId: null });
    }
  };

  // 워크시트 결과 조회
  const fetchWorksheetResult = async (worksheetId: number) => {
    try {
      const data = await fetchWorksheet({
        worksheetId,
        apiBaseUrl: API_BASE_URL,
        worksheetEndpoint: '/api/worksheets',
      });

      updateState({ currentWorksheetId: worksheetId });

      if (data.problems && Array.isArray(data.problems)) {
        const convertedQuestions: PreviewQuestion[] = data.problems.map(
          (problem: any, index: number) => ({
            id: index + 1,
            title: problem.question || '',
            options: problem.choices,
            answerIndex: problem.correct_answer_index ?? 0,
            explanation: problem.explanation || '',
            correct_answer: problem.correct_answer,
            question: problem.question,
            choices: problem.choices,
            backendId: problem.id,
            problem_type: problem.problem_type,
          })
        );

        updateState({
          previewQuestions: convertedQuestions,
          isGenerating: false,
          generationProgress: 100,
        });
      } else {
        updateState({
          errorMessage: '문제 데이터를 불러오는 중 오류가 발생했습니다.',
          isGenerating: false,
        });
      }
    } catch (error) {
      updateState({
        errorMessage: '워크시트를 불러오는 중 오류가 발생했습니다.',
        isGenerating: false,
      });
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
    currentWorksheetId,
    generateMathProblems,
    regenerateQuestion,
    updateState,
    resetGeneration,
    clearError,
  };
};
