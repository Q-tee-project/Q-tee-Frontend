import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';
import { mathService } from '@/services/mathService';
import { useState } from 'react';

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
      });

      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      updateState({ lastGenerationData: requestData });

      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';
      const response = await fetch(
        `${API_URL}/api/worksheets/generate?user_id=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error(`문제 생성 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      await pollTaskStatus(data.task_id);
    } catch (error) {
      console.error('문제 생성 오류:', error);
      updateState({
        errorMessage: '문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
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

      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const regenerationData = {
        ...lastGenerationData,
        regeneration_prompt: prompt || '',
        target_question_id: questionId,
      };

      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';
      const response = await fetch(`${API_URL}/api/regenerate?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(regenerationData),
      });

      if (!response.ok) {
        throw new Error(`문제 재생성 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      // 재생성된 문제로 기존 문제 교체
      if (data.regenerated_problem) {
        const updatedQuestions = previewQuestions.map((q) => {
          if (q.id === questionId) {
            // 문제 유형 자동 수정
            let problemType = data.regenerated_problem.problem_type;
            if (data.regenerated_problem.choices && data.regenerated_problem.choices.length > 0) {
              problemType = 'multiple_choice';
            } else if (
              !data.regenerated_problem.choices ||
              data.regenerated_problem.choices.length === 0
            ) {
              problemType = 'short_answer';
            }

            return {
              id: q.id,
              title: data.regenerated_problem.question,
              options: data.regenerated_problem.choices || undefined,
              answerIndex: data.regenerated_problem.choices
                ? (() => {
                    // correct_answer가 A, B, C, D 형태인 경우
                    if (
                      data.regenerated_problem.correct_answer &&
                      data.regenerated_problem.correct_answer.length === 1
                    ) {
                      const answerChar = data.regenerated_problem.correct_answer.toUpperCase();
                      if (answerChar >= 'A' && answerChar <= 'D') {
                        return answerChar.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                      }
                    }
                    // correct_answer가 선택지와 직접 매칭되는 경우
                    return data.regenerated_problem.choices.findIndex(
                      (choice: string) => choice === data.regenerated_problem.correct_answer,
                    );
                  })()
                : undefined,
              correct_answer: data.regenerated_problem.correct_answer,
              explanation: data.regenerated_problem.explanation,
              question: data.regenerated_problem.question,
              choices: data.regenerated_problem.choices,
              problem_type: problemType,
            };
          }
          return q;
        });
        updateState({ previewQuestions: updatedQuestions });
      }

      updateState({
        showRegenerationInput: null,
        regenerationPrompt: '',
      });
    } catch (error) {
      console.error('문제 재생성 오류:', error);
      updateState({
        errorMessage: '문제 재생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      updateState({ regeneratingQuestionId: null });
    }
  };

  // 태스크 상태 폴링
  const pollTaskStatus = async (taskId: string, subject_type: string = 'math') => {
    let attempts = 0;
    const maxAttempts = 600; // 10분 최대 대기 (600초)
    const API_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';

    const poll = async () => {
      try {
        const apiUrl = `${API_URL}/api/tasks/${taskId}`;
        const token = localStorage.getItem('access_token');
        const response = await fetch(apiUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await response.json();

        if (data.status === 'PROGRESS') {
          updateState({
            generationProgress: Math.round((data.current / data.total) * 100),
          });
        } else if (data.status === 'SUCCESS') {
          if (data.result && data.result.worksheet_id) {
            await fetchWorksheetResult(data.result.worksheet_id, subject_type);
          } else {
            updateState({
              errorMessage: '문제 생성은 완료되었지만 결과를 불러올 수 없습니다.',
            });
          }
          return;
        } else if (data.status === 'FAILURE') {
          throw new Error(data.error || '문제 생성 실패');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          throw new Error('문제 생성 시간 초과');
        }
      } catch (error) {
        updateState({
          errorMessage: '문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
          isGenerating: false,
        });
      }
    };

    await poll();
  };

  // 워크시트 결과 조회
  const fetchWorksheetResult = async (worksheetId: number, subject_type: string = 'math') => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const API_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';
      const apiUrl = `${API_URL}/api/worksheets/${worksheetId}?user_id=${userId}`;
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      if (data.problems && Array.isArray(data.problems)) {

        const convertedQuestions: PreviewQuestion[] = data.problems.map(
          (problem: any, index: number) => {
            let problemType = problem.problem_type;
            if (problem.choices && problem.choices.length > 0) {
              problemType = 'multiple_choice';
            } else if (!problem.choices || problem.choices.length === 0) {
              problemType = 'short_answer';
            }

            return {
              id: index + 1,
              title: problem.question,
              options: problem.choices ? problem.choices : undefined,
              answerIndex: problem.choices
                ? (() => {
                    if (problem.correct_answer && problem.correct_answer.length === 1) {
                      const answerChar = problem.correct_answer.toUpperCase();
                      if (answerChar >= 'A' && answerChar <= 'D') {
                        return answerChar.charCodeAt(0) - 65;
                      }
                    }
                    return problem.choices.findIndex(
                      (choice: string) => choice === problem.correct_answer,
                    );
                  })()
                : undefined,
              correct_answer: problem.correct_answer,
              explanation: problem.explanation,
              question: problem.question,
              choices: problem.choices,
              backendId: problem.id,
              problem_type: problemType,
              tikz_code: problem.tikz_code,
            };
          },
        );

        const validQuestions = convertedQuestions.filter((q) => {
          const hasQuestion = q.question && q.question.trim().length > 0;
          const hasExplanation = q.explanation && q.explanation.trim().length > 0;
          return hasQuestion && hasExplanation;
        });

        if (validQuestions.length < convertedQuestions.length) {
          const invalidCount = convertedQuestions.length - validQuestions.length;
          updateState({
            errorMessage: `${invalidCount}개의 문제에 오류가 있어 제외되었습니다.`,
          });
        }

        updateState({
          previewQuestions: validQuestions,
          currentWorksheetId: worksheetId,
        });

      } else {
        updateState({
          errorMessage: '문제 데이터를 불러올 수 없습니다.',
        });
      }
    } catch (error) {
      updateState({
        errorMessage: '워크시트를 불러오는 중 오류가 발생했습니다.',
      });
    } finally {
      updateState({
        isGenerating: false,
        generationProgress: 100,
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
