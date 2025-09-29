import { useState, useCallback, useRef } from 'react';
import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';
import { EnglishService } from '@/services/englishService';
import { EnglishWorksheetGeneratorFormData, EnglishAsyncResponse, EnglishTaskStatus, EnglishWorksheetData, EnglishPassage, EnglishQuestion } from '@/types/english';

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

  // 비동기 작업 상태 관리
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 데이터 리셋 함수
  const resetWorksheetData = () => {
    setWorksheetData(null);
    setTaskId(null);
    setTaskStatus('');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 데이터 직접 업데이트 함수
  const updateWorksheetData = (newData: EnglishWorksheetData | null) => {
    setWorksheetData(newData);
  };

  // 작업 상태 폴링 함수
  const pollTaskStatus = useCallback(async (taskId: string) => {
    try {
      const status: EnglishTaskStatus = await EnglishService.getTaskStatus(taskId);

      setTaskStatus(status.status);

      // 진행률 업데이트
      if (status.total > 0) {
        const progress = Math.round((status.current / status.total) * 100);
        updateState({ generationProgress: progress });
      }

      if (status.state === 'SUCCESS' && status.result) {
        // 성공 시 폴링 중단
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // 결과 데이터 저장
        updateState({
          lastGenerationData: status.result,
          generationProgress: 100,
          isGenerating: false
        });

        if (status.result.llm_response) {
          setWorksheetData(status.result.llm_response);
          console.log('비동기 생성 완료 - 서버 데이터:', status.result.llm_response);

          // 지문 데이터 확인
          console.log('📚 생성된 지문 데이터:', {
            passagesCount: status.result.llm_response.passages?.length || 0,
            passages: status.result.llm_response.passages,
            questionsCount: status.result.llm_response.questions?.length || 0,
            questionsWithPassageId: status.result.llm_response.questions?.filter(q => q.question_passage_id).length || 0,
          });
        }

        setTaskId(null);

      } else if (status.state === 'FAILURE') {
        // 실패 시 폴링 중단
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        const errorMessage = status.error || '문제 생성 중 오류가 발생했습니다.';
        updateState({
          isGenerating: false,
          errorMessage,
          generationProgress: 0
        });

        setTaskId(null);
        setWorksheetData(null);
      }
    } catch (error) {
      console.error('작업 상태 확인 중 오류:', error);
    }
  }, [updateState]);

  // 실제 영어 문제 생성 (비동기 처리)
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
      setTaskId(null);
      setTaskStatus('');

      // 실제 API 호출 (비동기)
      const response: EnglishAsyncResponse = await EnglishService.generateEnglishProblems(formData);

      console.log('비동기 작업 시작:', response);

      // 작업 ID 저장 및 폴링 시작
      setTaskId(response.task_id);
      setTaskStatus('문제 생성 중...');

      // 폴링 인터벌 설정 (2초마다)
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(response.task_id);
      }, 2000);

      // 첫 번째 상태 확인
      await pollTaskStatus(response.task_id);

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
      setTaskId(null);
      setTaskStatus('');
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
    taskId,
    taskStatus,
    generateEnglishProblems,
    updateState,
    resetGeneration,
    resetWorksheetData,
    clearError,
    updateWorksheetData,
  };
};
