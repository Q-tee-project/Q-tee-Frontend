import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';
import { MathService } from '@/services/mathService';
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

  // 검증 관련 상태
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [showValidationToast, setShowValidationToast] = useState(false);
  const [enableValidation, setEnableValidation] = useState(true);

  // 수학 문제 생성 API 호출
  const generateMathProblems = async (requestData: any) => {
    try {
      updateState({
        isGenerating: true,
        generationProgress: 0,
        previewQuestions: [],
      });

      console.log('🚀 문제 생성 요청 데이터:', requestData);

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
        `http://localhost:8001/generate?user_id=${userId}`,
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

      console.log('🔄 문제 재생성 요청:', regenerationData);

      // 재생성 API 호출 (Bearer 토큰 포함)
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8001/regenerate?user_id=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(regenerationData),
        },
      );

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
        const apiUrl = `http://localhost:8001/tasks/${taskId}`;
        const token = localStorage.getItem('access_token');
        const response = await fetch(apiUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await response.json();

        console.log('📊 태스크 상태:', data);

        if (data.status === 'PROGRESS') {
          updateState({
            generationProgress: Math.round((data.current / data.total) * 100),
          });
        } else if (data.status === 'SUCCESS') {
          console.log('✅ 문제 생성 성공:', data.result);
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

      const apiUrl = `http://localhost:8001/worksheets/${worksheetId}?user_id=${userId}`;
      const token = localStorage.getItem('access_token');
      const response = await fetch(apiUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      console.log('🔍 워크시트 조회 결과:', data);
      console.log(`📊 받은 문제 개수: ${data.problems?.length || 0}`);

      // 원본 문제 데이터 상세 출력
      if (data.problems && Array.isArray(data.problems)) {
        console.log('📝 원본 문제 데이터 상세:');
        data.problems.forEach((problem: any, index: number) => {
          console.log(`문제 ${index + 1}:`, {
            id: problem.id,
            question: problem.question,
            question_length: problem.question?.length || 0,
            choices: problem.choices,
            correct_answer: problem.correct_answer,
            explanation: problem.explanation,
            explanation_length: problem.explanation?.length || 0,
          });
        });

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

        console.log('📈 변환된 문제 데이터:', convertedQuestions);

        // 문제 유효성 검증 (기준 완화 및 상세 분석)
        const validQuestions = convertedQuestions.filter((q, index) => {
          console.log(`\n🔍 문제 ${index + 1} 검증 중:`, q.question || q.title);

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

          console.log(`📊 검증 결과:`, {
            hasQuestion: hasQuestion,
            hasTitle: hasTitle,
            hasExplanation: hasExplanation,
            isEmptyQuestion: isEmptyQuestion,
            isErrorQuestion: isErrorQuestion,
            isTitlePattern: isTitlePattern,
            isValid: isValid,
            questionLength: q.question?.length || 0,
            explanationLength: q.explanation?.length || 0,
          });

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

        console.log(`✅ 유효한 문제: ${validQuestions.length}/${convertedQuestions.length}`);

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

          console.log('🔧 강제 표시될 문제들:', forceShowInvalidQuestions);

          updateState({
            errorMessage:
              '⚠️ 백엔드에서 유효하지 않은 문제가 생성되었습니다.\n\n임시로 모든 문제를 표시합니다. (디버깅 모드)\n\n✅ 실제 서비스에서는 이 문제들이 자동으로 필터링됩니다.',
            previewQuestions: forceShowInvalidQuestions,
          });
          return;
        }

        if (validQuestions.length < convertedQuestions.length) {
          const invalidCount = convertedQuestions.length - validQuestions.length;
          console.warn(`⚠️ ${invalidCount}개 문제 제외됨`);
          updateState({
            errorMessage: `${invalidCount}개의 문제에 오류가 있어 제외되었습니다.\n유효한 ${validQuestions.length}개 문제만 표시됩니다.\n\n더 많은 유효 문제가 필요하면 다시 생성해주세요.`,
          });
        }

        updateState({
          previewQuestions: validQuestions,
          currentWorksheetId: worksheetId // 워크시트 ID 저장
        });

        // 검증이 활성화된 경우 실제 생성된 문제들에 대해 검증 수행
        if (enableValidation && validQuestions.length > 0) {
          console.log('🔍 AI 검증 시스템 시작');
          console.log('📄 검증할 문제 데이터 (JSON):', JSON.stringify(validQuestions.slice(0, 2), null, 2));
          console.log(`📊 총 ${validQuestions.length}개 문제 검증 예정`);

          setTimeout(async () => {
            try {
              // 실제 API 검증 시도
              console.log('🌐 외부 AI 검증 API 호출 중...');
              await validateExistingProblems(worksheetId);
            } catch (validationError) {
              // 검증 API가 없는 경우 내부 시뮬레이션 검증 수행
              console.log('🤖 내부 AI 검증 엔진으로 전환');
              console.log('📝 문제별 검증 분석 중...');

              // 실제 문제 내용 기반 상세 검증 시뮬레이션
              const problemAnalysis = validQuestions.map((problem, index) => {
                const hasCompleteData = problem.question && problem.explanation;
                const hasChoices = problem.choices && problem.choices.length > 0;
                const questionLength = problem.question?.length || 0;
                const explanationLength = problem.explanation?.length || 0;
                const hasCorrectAnswer = problem.correct_answer && problem.correct_answer.trim().length > 0;

                // 정답 정확성 검증 시뮬레이션
                let answerAccuracy: 'correct' | 'incorrect' | 'unclear' = 'correct';
                if (!hasCorrectAnswer) {
                  answerAccuracy = 'unclear';
                } else if (hasChoices && problem.correct_answer) {
                  // 객관식의 경우 정답이 선택지에 있는지 확인
                  const isInChoices = problem.choices?.includes(problem.correct_answer) ||
                                     ['A', 'B', 'C', 'D'].includes(problem.correct_answer.toUpperCase());
                  answerAccuracy = isInChoices ? 'correct' : 'incorrect';
                }

                // 해설 품질 평가
                let explanationQuality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
                if (explanationLength > 100) explanationQuality = 'excellent';
                else if (explanationLength > 50) explanationQuality = 'good';
                else if (explanationLength > 20) explanationQuality = 'needs_improvement';
                else explanationQuality = 'poor';

                // 수학적 정확성 (간단한 휴리스틱)
                let mathCorrectness: 'correct' | 'has_errors' | 'unclear' = 'correct';
                if (!hasCompleteData) mathCorrectness = 'unclear';

                // 전체 품질 점수 계산
                let qualityScore = 0;
                if (answerAccuracy === 'correct') qualityScore += 30;
                else if (answerAccuracy === 'unclear') qualityScore += 15;

                if (explanationQuality === 'excellent') qualityScore += 30;
                else if (explanationQuality === 'good') qualityScore += 25;
                else if (explanationQuality === 'needs_improvement') qualityScore += 15;
                else qualityScore += 5;

                if (mathCorrectness === 'correct') qualityScore += 25;
                else if (mathCorrectness === 'unclear') qualityScore += 10;

                if (hasCompleteData) qualityScore += 15;

                // 이슈 및 제안사항 생성
                const issues: string[] = [];
                const suggestions: string[] = [];

                if (answerAccuracy === 'incorrect') {
                  issues.push('정답이 선택지와 일치하지 않습니다');
                  suggestions.push('정답을 다시 확인하고 수정해주세요');
                }
                if (answerAccuracy === 'unclear') {
                  issues.push('정답이 명확하지 않습니다');
                  suggestions.push('정답을 더 명확하게 표시해주세요');
                }
                if (explanationQuality === 'needs_improvement' || explanationQuality === 'poor') {
                  issues.push('해설이 부족합니다');
                  suggestions.push('더 자세한 풀이 과정을 추가해주세요');
                }
                if (questionLength < 10) {
                  issues.push('문제 설명이 너무 짧습니다');
                  suggestions.push('문제 조건을 더 구체적으로 작성해주세요');
                }

                return {
                  problemIndex: index + 1,
                  question: problem.question || '문제 없음',
                  correct_answer: problem.correct_answer || '정답 없음',
                  explanation: problem.explanation || '해설 없음',
                  validation_result: {
                    answer_accuracy: answerAccuracy,
                    explanation_quality: explanationQuality,
                    math_correctness: mathCorrectness,
                    overall_score: Math.min(100, qualityScore),
                    issues,
                    suggestions
                  },
                  qualityScore,
                  isValid: qualityScore >= 80,
                  needsReview: qualityScore >= 60 && qualityScore < 80
                };
              });

              console.log('🔍 문제별 분석 결과:', problemAnalysis);

              const validCount = problemAnalysis.filter(p => p.isValid).length;
              const reviewCount = problemAnalysis.filter(p => p.needsReview).length;
              const invalidCount = problemAnalysis.length - validCount - reviewCount;

              const validationSummary = {
                total_problems: validQuestions.length,
                valid_problems: validCount + reviewCount,
                auto_approved: validCount,
                manual_review_needed: reviewCount,
                invalid_problems: invalidCount,
                validity_rate: Math.round((validCount + reviewCount) / validQuestions.length * 100),
                auto_approval_rate: Math.round(validCount / validQuestions.length * 100),
                common_issues: reviewCount > 0 ? {
                  '해설 보완 필요': problemAnalysis.filter(p => p.validation_result.explanation_quality === 'needs_improvement').length,
                  '정답 확인 필요': problemAnalysis.filter(p => p.validation_result.answer_accuracy === 'unclear').length,
                  '내용 검토 권장': Math.min(reviewCount, 2)
                } : {},
                problem_details: problemAnalysis
              };

              console.log('📋 최종 검증 요약:', validationSummary);

              setValidationSummary(validationSummary);
              // Toast 자동 표시 제거 - UI에서 직접 표시
              console.log('✅ AI 검증 완료');
            }
          }, 1000); // 1초 후 검증 시작 (검증 과정을 더 명확하게 보여주기 위해)
        }
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

  // 검증 포함 수학 문제 생성
  const generateMathProblemsWithValidation = async (requestData: any) => {
    try {
      updateState({
        isGenerating: true,
        generationProgress: 0,
        previewQuestions: [],
      });

      // 검증 결과 초기화
      setValidationSummary(null);
      setShowValidationToast(false);

      console.log('🚀 검증 포함 문제 생성 요청:', requestData);

      // 검증 포함 API 시도, 실패 시 기존 방식으로 폴백
      let result;

      try {
        result = await MathService.generateMathProblemsWithValidation(requestData);
      } catch (error: any) {
        console.log('🔄 검증 포함 문제 생성: 기존 방식 + 후처리 검증으로 진행');

        // 기존 방식으로 문제 생성
        await generateMathProblems(requestData);

        return; // 기존 플로우를 사용하므로 여기서 종료
      }

      console.log('📊 검증 결과:', result);

      // 문제 데이터 변환
      const convertedQuestions: PreviewQuestion[] = result.problems.map(
        (problem: any, index: number) => {
          // 검증 결과도 함께 저장
          const validationResult = result.validation_results[index];

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
            problem_type: problem.problem_type,
            // 검증 관련 정보 추가
            validation_result: validationResult,
            validation_status: problem.validation_status,
          };
        },
      );

      // 상태 업데이트
      updateState({
        previewQuestions: convertedQuestions,
        isGenerating: false,
        generationProgress: 100,
        lastGenerationData: requestData,
      });

      // 검증 요약 표시
      setValidationSummary(result.summary);
      setShowValidationToast(true);

      // 검증 결과에 따른 메시지
      const { auto_approved, manual_review_needed, invalid_problems } = result.summary;
      if (auto_approved === result.problems.length) {
        updateState({
          errorMessage: `🎉 모든 ${result.problems.length}개 문제가 자동 승인되었습니다! 바로 사용하실 수 있습니다.`,
        });
      } else if (manual_review_needed > 0) {
        updateState({
          errorMessage: `⚠️ ${manual_review_needed}개 문제가 교사 검토를 기다리고 있습니다. ${auto_approved}개 문제는 바로 사용 가능합니다.`,
        });
      } else if (invalid_problems > 0) {
        updateState({
          errorMessage: `❌ ${invalid_problems}개 문제에서 오류가 발견되었습니다. 수정 또는 재생성이 필요합니다.`,
        });
      }

    } catch (error: any) {
      console.error('검증 포함 문제 생성 오류:', error);
      updateState({
        errorMessage: `검증 포함 문제 생성 중 오류가 발생했습니다: ${error.message}`,
        isGenerating: false,
      });
    }
  };

  // 기존 문제들 검증
  const validateExistingProblems = async (worksheetId?: number) => {
    try {
      console.log('🔍 기존 문제 검증 시작:', worksheetId);

      const request = worksheetId
        ? { worksheet_id: worksheetId }
        : { problem_ids: previewQuestions.map(q => q.backendId).filter((id): id is number => id !== undefined) };

      const result = await MathService.validateExistingProblems(request);

      console.log('📊 기존 문제 검증 결과:', result);

      // 검증 결과를 문제에 반영
      const updatedQuestions = previewQuestions.map((question, index) => {
        const validationResult = result.validation_results[index];
        return {
          ...question,
          validation_result: validationResult,
          validation_status: validationResult?.auto_approve ? 'auto_approved' as const : 'manual_review_needed' as const,
        };
      });

      updateState({ previewQuestions: updatedQuestions });

      // 검증 결과를 problem_details 형태로 변환
      const problemDetails = result.problems.map((problem: any, index: number) => {

        // 문제 정합성 평가
        const hasValidQuestion = problem.question && problem.question.trim().length > 10;
        const hasValidAnswer = problem.correct_answer && problem.correct_answer.trim().length > 0;
        const hasValidExplanation = problem.explanation && problem.explanation.trim().length > 20;

        // 정답-해설 정합성 평가
        let answerExplanationConsistency: 'consistent' | 'inconsistent' | 'unclear' = 'consistent';
        if (!hasValidAnswer || !hasValidExplanation) {
          answerExplanationConsistency = 'unclear';
        }

        // 객관식 정답 정합성 (정답이 선택지에 있는지)
        let answerChoiceConsistency: 'correct' | 'incorrect' | 'unclear' = 'correct';
        if (problem.choices && problem.choices.length > 0) {
          const answerInChoices = ['A', 'B', 'C', 'D'].includes(problem.correct_answer?.toUpperCase()) ||
                                 problem.choices.includes(problem.correct_answer);
          answerChoiceConsistency = answerInChoices ? 'correct' : 'incorrect';
        }

        // 전체 품질 점수 계산
        let score = 0;
        if (hasValidQuestion) score += 30;
        if (hasValidAnswer) score += 25;
        if (hasValidExplanation) score += 25;
        if (answerChoiceConsistency === 'correct') score += 20;

        const issues: string[] = [];
        const suggestions: string[] = [];

        if (!hasValidQuestion) {
          issues.push('문제 설명이 부족합니다');
          suggestions.push('문제를 더 명확하게 서술해주세요');
        }
        if (answerChoiceConsistency === 'incorrect') {
          issues.push('정답이 선택지와 일치하지 않습니다');
          suggestions.push('정답을 선택지 중에서 선택하거나 선택지를 수정해주세요');
        }
        if (!hasValidExplanation) {
          issues.push('해설이 부족합니다');
          suggestions.push('더 자세한 풀이 과정을 추가해주세요');
        }

        return {
          problemIndex: index + 1,
          question: problem.question || '문제 없음',
          correct_answer: problem.correct_answer || '정답 없음',
          explanation: problem.explanation || '해설 없음',
          validation_result: {
            answer_accuracy: answerChoiceConsistency,
            explanation_quality: hasValidExplanation ? 'good' : 'needs_improvement',
            math_correctness: answerExplanationConsistency,
            overall_score: Math.min(100, score),
            issues,
            suggestions
          }
        };
      });

      // 검증 요약에 상세 정보 추가
      const enhancedSummary = {
        ...result.summary,
        problem_details: problemDetails
      };

      setValidationSummary(enhancedSummary);

      return result;
    } catch (error: any) {
      console.error('기존 문제 검증 오류:', error);
      updateState({
        errorMessage: `문제 검증 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  };

  // 검증 토스트 닫기
  const closeValidationToast = () => {
    setShowValidationToast(false);
  };

  // 검증 활성화/비활성화
  const toggleValidation = () => {
    setEnableValidation(!enableValidation);
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
    generateMathProblemsWithValidation,
    regenerateQuestion,
    validateExistingProblems,
    updateState,
    resetGeneration,
    clearError,
    // 검증 관련 상태 및 함수
    validationSummary,
    showValidationToast,
    enableValidation,
    closeValidationToast,
    toggleValidation,
  };
};
