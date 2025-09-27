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


      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      // 생성 데이터 저장 (재생성에 사용)
      updateState({ lastGenerationData: requestData });

      // 문제 생성 API 호출 (Bearer 토큰 포함)
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8001/api/worksheets/generate?user_id=${userId}`,
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
        const errorData = await response.text();
        console.error('❌ API 응답 오류:', response.status, errorData);
        throw new Error(`문제 생성 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      // 진행 상황 폴링
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

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      // 재생성 요청 데이터 구성
      const regenerationData = {
        ...lastGenerationData,
        regeneration_prompt: prompt || '',
        target_question_id: questionId,
      };


      // 재생성 API 호출 (Bearer 토큰 포함)
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8001/api/regenerate?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(regenerationData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ 재생성 API 응답 오류:', response.status, errorData);
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

    const poll = async () => {
      try {
        const apiUrl = `http://localhost:8001/api/tasks/${taskId}`;
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
          // 성공 시 워크시트 상세 조회
          if (data.result && data.result.worksheet_id) {
            await fetchWorksheetResult(data.result.worksheet_id, subject_type);
          } else {
            console.error('❌ 성공했지만 worksheet_id가 없음:', data);
            updateState({
              errorMessage:
                '문제 생성은 완료되었지만 결과를 불러올 수 없습니다. 다시 시도해주세요.',
            });
          }
          return;
        } else if (data.status === 'FAILURE') {
          console.error('❌ 문제 생성 실패:', data.error);
          throw new Error(data.error || '문제 생성 실패');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // 1초 후 재시도
        } else {
          throw new Error('문제 생성 시간 초과');
        }
      } catch (error) {
        console.error('태스크 상태 확인 오류:', error);
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

      const apiUrl = `http://localhost:8001/api/worksheets/${worksheetId}?user_id=${userId}`;
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();


      // 원본 문제 데이터 상세 출력
      if (data.problems && Array.isArray(data.problems)) {

        // 백엔드 데이터를 프론트엔드 형식으로 변환 (연속 번호 사용)
        const convertedQuestions: PreviewQuestion[] = data.problems.map(
          (problem: any, index: number) => {
            // 문제 유형 자동 수정
            let problemType = problem.problem_type;
            if (problem.choices && problem.choices.length > 0) {
              // choices가 있으면 객관식으로 수정
              problemType = 'multiple_choice';
            } else if (!problem.choices || problem.choices.length === 0) {
              // choices가 없으면 주관식으로 수정
              problemType = 'short_answer';
            }

            return {
              id: index + 1, // 연속 번호 사용 (1, 2, 3...)
              title: problem.question,
              options: problem.choices ? problem.choices : undefined,
              answerIndex: problem.choices
                ? (() => {
                    // correct_answer가 A, B, C, D 형태인 경우
                    if (problem.correct_answer && problem.correct_answer.length === 1) {
                      const answerChar = problem.correct_answer.toUpperCase();
                      if (answerChar >= 'A' && answerChar <= 'D') {
                        return answerChar.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                      }
                    }
                    // correct_answer가 선택지와 직접 매칭되는 경우
                    return problem.choices.findIndex(
                      (choice: string) => choice === problem.correct_answer,
                    );
                  })()
                : undefined,
              correct_answer: problem.correct_answer,
              explanation: problem.explanation,
              question: problem.question,
              choices: problem.choices,
              backendId: problem.id, // 백엔드 ID는 별도 저장
              problem_type: problemType, // 수정된 문제 유형 추가
            };
          },
        );


        // 문제 유효성 검증 (기준 완화 및 상세 분석)
        const validQuestions = convertedQuestions.filter((q, index) => {

          const hasQuestion =
            q.question && typeof q.question === 'string' && q.question.trim().length > 0;
          const hasTitle = q.title && typeof q.title === 'string' && q.title.trim().length > 0;
          const hasExplanation =
            q.explanation && typeof q.explanation === 'string' && q.explanation.trim().length > 0;

          // 빈 문제 또는 오류 문제 감지
          const isEmptyQuestion = !hasQuestion && !hasTitle;

          // 문제지 타이틀 패턴 감지 (정확한 패턴만)
          const isTitlePattern =
            (q.question && q.question.includes('[일차방정식의 풀이] 기본 문제')) ||
            (q.title && q.title.includes('[일차방정식의 풀이] 기본 문제'));

          const isErrorQuestion =
            (q.question &&
              (q.question.includes('오류') ||
                q.question.includes('error') ||
                q.question.includes('Error'))) ||
            (q.title &&
              (q.title.includes('오류') || q.title.includes('error') || q.title.includes('Error')));

          // 기본 유효성 (더 관대하게)
          const isValid =
            (hasQuestion || hasTitle) &&
            hasExplanation &&
            !isEmptyQuestion &&
            !isErrorQuestion &&
            !isTitlePattern;


          if (!isValid) {
            if (typeof console !== 'undefined' && console.error) {
              console.error(`❌ 문제 ${index + 1} 제외 사유:`, {
                question:
                  q.question?.substring(0, 100) + ((q.question?.length || 0) > 100 ? '...' : ''),
                title: q.title?.substring(0, 100) + ((q.title?.length || 0) > 100 ? '...' : ''),
                explanation:
                  q.explanation?.substring(0, 100) +
                  ((q.explanation?.length || 0) > 100 ? '...' : ''),
                reasons: [
                  !hasQuestion && !hasTitle ? '제목/질문 없음' : null,
                  !hasExplanation ? '해설 없음' : null,
                  isEmptyQuestion ? '빈 문제' : null,
                  isErrorQuestion ? '오류 키워드 포함' : null,
                  isTitlePattern ? '타이틀 패턴 감지' : null,
                ].filter(Boolean),
              });
            }
          }

          return isValid;
        });


        if (validQuestions.length === 0) {
          console.error('❌ 모든 문제가 무효함');
          console.error('🔧 원본 데이터 강제 표시 (디버깅용):');

          // 디버깅을 위해 원본 데이터를 강제로 표시하는 옵션
          const forceShowInvalidQuestions = convertedQuestions.map((q, index) => ({
            ...q,
            id: index + 1,
            title: q.title || q.question || `[디버깅] 빈 문제 ${index + 1}`,
            question: q.question || q.title || `[디버깅] 빈 문제 ${index + 1}`,
            explanation: q.explanation || '[디버깅] 해설이 없는 문제입니다.',
          }));


          updateState({
            errorMessage:
              '⚠️ 백엔드에서 유효하지 않은 문제가 생성되었습니다.\n\n임시로 모든 문제를 표시합니다. (디버깅 모드)\n\n✅ 실제 서비스에서는 이 문제들이 자동으로 필터링됩니다.',
            previewQuestions: forceShowInvalidQuestions,
          });
          return;
        }

        if (validQuestions.length < convertedQuestions.length) {
          const invalidCount = convertedQuestions.length - validQuestions.length;
          updateState({
            errorMessage: `${invalidCount}개의 문제에 오류가 있어 제외되었습니다.\n유효한 ${validQuestions.length}개 문제만 표시됩니다.\n\n더 많은 유효 문제가 필요하면 다시 생성해주세요.`,
          });
        }

        updateState({
          previewQuestions: validQuestions,
          currentWorksheetId: worksheetId, // 워크시트 ID 저장
        });

      } else {
        console.error('❌ API 응답에 problems 배열이 없음:', data);
        updateState({
          errorMessage: '문제 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    } catch (error) {
      console.error('워크시트 조회 오류:', error);
      updateState({
        errorMessage: '워크시트를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.',
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
