import { useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { KoreanWorksheet, Problem } from '@/services/koreanService'; // Import Problem interface
import { useBankState } from './useBankState';

export const useKoreanBank = () => {
  const {
    worksheets,
    selectedWorksheet,
    worksheetProblems,
    isLoading,
    error,
    showAnswerSheet,
    updateState,
    resetBank,
    clearError,
  } = useBankState<KoreanWorksheet, Problem>();

  // 컴포넌트 마운트 시 자동으로 데이터 로드
  useEffect(() => {
    if (worksheets.length === 0 && !isLoading) {
      loadWorksheets();
    }
  }, []);

  const loadWorksheets = async () => {
    console.log('국어 워크시트 로드 시작...');
    updateState({ isLoading: true });
    try {
      const worksheetData = await koreanService.getKoreanWorksheets();
      console.log('국어 워크시트 데이터:', worksheetData);

      updateState({ worksheets: worksheetData.worksheets }); // Access .worksheets property

      if (worksheetData.worksheets.length > 0) {
        updateState({ selectedWorksheet: worksheetData.worksheets[0] });
        await loadWorksheetProblems(worksheetData.worksheets[0].id);
      }
    } catch (error: any) {
      console.error('국어 워크시트 로드 실패:', error);
      updateState({
        error: `국어 워크시트 데이터를 불러올 수 없습니다: ${error.message}`,
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const loadWorksheetProblems = async (worksheetId: number) => {
    try {
      const worksheetDetail = await koreanService.getKoreanWorksheetProblems(worksheetId); // Changed to getKoreanWorksheetProblems
      updateState({ worksheetProblems: worksheetDetail.problems || [] });
    } catch (error: any) {
      console.error('국어 워크시트 문제 로드 실패:', error);
      updateState({ error: '국어 워크시트 문제를 불러올 수 없습니다.' });
    }
  };

  const handleWorksheetSelect = async (worksheet: KoreanWorksheet) => {
    updateState({ selectedWorksheet: worksheet });
    await loadWorksheetProblems(worksheet.id);
  };

  const handleDeleteWorksheet = async (worksheet: KoreanWorksheet, event: React.MouseEvent) => {
    event.stopPropagation();

    if (
      !confirm(`"${worksheet.title}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      updateState({ isLoading: true });
      await koreanService.deleteKoreanWorksheet(worksheet.id);

      if (selectedWorksheet?.id === worksheet.id) {
        updateState({
          selectedWorksheet: null,
          worksheetProblems: [],
        });
      }

      await loadWorksheets();
      alert('국어 워크시트가 삭제되었습니다.');
    } catch (error: any) {
      console.error('국어 워크시트 삭제 실패:', error);
      alert(`삭제 실패: ${error.message}`);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleBatchDeleteWorksheets = async (worksheets: KoreanWorksheet[]) => {
    try {
      updateState({ isLoading: true });
      for (const worksheet of worksheets) {
        await koreanService.deleteKoreanWorksheet(worksheet.id);
      }
      const deletedIds = worksheets.map((w) => w.id);
      if (selectedWorksheet && deletedIds.includes(selectedWorksheet.id)) {
        updateState({ selectedWorksheet: null, worksheetProblems: [] });
      }
      await loadWorksheets();
      alert(`${worksheets.length}개의 국어 워크시트가 삭제되었습니다.`);
    } catch (error: any) {
      console.error('국어 워크시트 일괄 삭제 실패:', error);
      alert(`일괄 삭제 실패: ${error.message}`);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleRegenerateProblem = async (problem: Problem, feedback?: string) => {
    if (!selectedWorksheet) return;

    // feedback이 제공되지 않으면 함수 종료 (모달에서 호출될 것으로 예상)
    if (feedback === undefined) {
      return { problem, worksheetId: selectedWorksheet.id };
    }

    if (!feedback.trim()) {
      alert('수정 요청 사항을 입력해주세요.');
      return;
    }

    try {
      const regenerationData = {
        problem_id: problem.id,
        requirements: feedback,
        current_problem: {
          question: problem.question,
          difficulty: problem.difficulty,
          problem_type: problem.problem_type,
        }
      };

      console.log('🚀 국어 문제 재생성 요청:', regenerationData);

      // 재생성 전 원본 문제 저장 (변경 감지용)
      const originalQuestion = problem.question;

      await koreanService.regenerateProblemAsync(regenerationData);

      alert('문제 재생성 요청이 전송되었습니다.\n백그라운드에서 처리되며, 완료되면 알림이 표시됩니다.');

      // 재생성 완료 후 문제 목록 새로고침 (폴링 방식 - 백그라운드)
      let attempts = 0;
      const maxAttempts = 20; // 최대 1분 대기
      const pollInterval = 3000;

      const checkCompletion = setInterval(async () => {
        attempts++;

        try {
          const worksheetDetail = await koreanService.getKoreanWorksheetProblems(selectedWorksheet.id);
          const updatedProblem = worksheetDetail.problems?.find((p: Problem) => p.id === problem.id);

          // 문제가 실제로 변경되었는지 확인
          if (updatedProblem && updatedProblem.question !== originalQuestion) {
            console.log('✅ 국어 문제 재생성 완료!');
            updateState({ worksheetProblems: worksheetDetail.problems || [] });
            clearInterval(checkCompletion);
            alert('✅ 문제 재생성이 완료되었습니다!');
            return;
          }

          // 중간 업데이트
          updateState({ worksheetProblems: worksheetDetail.problems || [] });

          if (attempts >= maxAttempts) {
            clearInterval(checkCompletion);
            console.warn('⏰ 재생성 완료 대기 시간 초과');
          }
        } catch (error) {
          console.error('문제 목록 갱신 실패:', error);
        }
      }, pollInterval);

    } catch (error: any) {
      console.error('국어 문제 재생성 실패:', error);
      alert(`재생성 실패: ${error.message}`);
    }
  };

  return {
    worksheets,
    selectedWorksheet,
    worksheetProblems,
    isLoading,
    error,
    showAnswerSheet,
    setShowAnswerSheet: (show: boolean) => updateState({ showAnswerSheet: show }),
    setError: (error: string | null) => updateState({ error }),
    loadWorksheets,
    handleWorksheetSelect,
    handleDeleteWorksheet,
    handleBatchDeleteWorksheets,
    handleRegenerateProblem,
    clearError,
  };
};
