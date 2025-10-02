import { useEffect } from 'react';
import { mathService } from '@/services/mathService';
import { Worksheet, MathProblem } from '@/types/math';
import { useBankState } from './useBankState';

export const useMathBank = () => {
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
  } = useBankState<Worksheet, MathProblem>();

  // 컴포넌트 마운트 시 자동으로 데이터 로드
  useEffect(() => {
    if (worksheets.length === 0 && !isLoading) {
      loadWorksheets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorksheets = async () => {
    console.log('수학 워크시트 로드 시작...');
    updateState({ isLoading: true });
    try {
      const worksheetResponse = await mathService.getMathWorksheets();
      const worksheetData = worksheetResponse.worksheets;
      console.log('수학 워크시트 데이터:', worksheetData);

      updateState({ worksheets: worksheetData });

      if (worksheetData.length > 0) {
        updateState({ selectedWorksheet: worksheetData[0] });
        await loadWorksheetProblems(worksheetData[0].id);
      }
    } catch (error: any) {
      console.error('수학 워크시트 로드 실패:', error);
      updateState({
        error: `수학 워크시트 데이터를 불러올 수 없습니다: ${error.message}`,
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const loadWorksheetProblems = async (worksheetId: number) => {
    console.log('🔍 수학 워크시트 문제 로드 시작, ID:', worksheetId);
    try {
      const worksheetDetail = await mathService.getMathWorksheetProblems(worksheetId);
      console.log('✅ 수학 워크시트 상세 데이터:', worksheetDetail);
      console.log('📝 수학 문제 개수:', worksheetDetail.problems?.length || 0);
      updateState({ worksheetProblems: worksheetDetail.problems || [] });
    } catch (error: any) {
      console.error('❌ 수학 워크시트 문제 로드 실패:', error);
      updateState({ error: '수학 워크시트 문제를 불러올 수 없습니다.' });
    }
  };

  const handleWorksheetSelect = async (worksheet: Worksheet) => {
    console.log('🎯 수학 워크시트 선택됨:', worksheet.title, 'ID:', worksheet.id);
    updateState({ selectedWorksheet: worksheet });
    await loadWorksheetProblems(worksheet.id);
  };

  const handleDeleteWorksheet = async (worksheet: Worksheet, event: React.MouseEvent) => {
    event.stopPropagation();

    if (
      !confirm(`"${worksheet.title}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      updateState({ isLoading: true });
      await mathService.deleteMathWorksheet(worksheet.id);

      if (selectedWorksheet?.id === worksheet.id) {
        updateState({
          selectedWorksheet: null,
          worksheetProblems: [],
        });
      }

      await loadWorksheets();
      alert('수학 워크시트가 삭제되었습니다.');
    } catch (error: any) {
      console.error('수학 워크시트 삭제 실패:', error);
      console.error('오류 상세:', error);
      alert(`삭제 실패: ${error.message}\n\n자세한 정보는 개발자 도구 콘솔을 확인해주세요.`);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleBatchDeleteWorksheets = async (worksheets: Worksheet[]) => {
    try {
      updateState({ isLoading: true });

      // 각 워크시트를 순차적으로 삭제
      for (const worksheet of worksheets) {
        await mathService.deleteMathWorksheet(worksheet.id);
      }

      // 현재 선택된 워크시트가 삭제된 워크시트 중에 있다면 초기화
      const deletedIds = worksheets.map((w) => w.id);
      if (selectedWorksheet && deletedIds.includes(selectedWorksheet.id)) {
        updateState({
          selectedWorksheet: null,
          worksheetProblems: [],
        });
      }

      await loadWorksheets();
      alert(`${worksheets.length}개의 수학 워크시트가 삭제되었습니다.`);
    } catch (error: any) {
      console.error('수학 워크시트 일괄 삭제 실패:', error);
      console.error('오류 상세:', error);
      alert(`일괄 삭제 실패: ${error.message}\n\n자세한 정보는 개발자 도구 콘솔을 확인해주세요.`);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleRegenerateProblem = async (problem: MathProblem, feedback?: string) => {
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
          tikz_code: (problem as any).tikz_code, // TikZ 코드도 포함
        }
      };

      console.log('🚀 수학 문제 재생성 요청:', regenerationData);

      // 재생성 전 원본 문제 저장 (변경 감지용)
      const originalQuestion = problem.question;

      await mathService.regenerateProblemAsync(regenerationData);

      alert('문제 재생성 요청이 전송되었습니다.\n백그라운드에서 처리되며, 완료되면 알림이 표시됩니다.');

      // 재생성 완료 후 문제 목록 새로고침 (폴링 방식 - 백그라운드)
      let attempts = 0;
      const maxAttempts = 20; // 최대 1분 대기
      const pollInterval = 3000;

      const checkCompletion = setInterval(async () => {
        attempts++;

        try {
          const worksheetDetail = await mathService.getMathWorksheetProblems(selectedWorksheet.id);
          const updatedProblem = worksheetDetail.problems?.find((p: MathProblem) => p.id === problem.id);

          // 문제가 실제로 변경되었는지 확인
          if (updatedProblem && updatedProblem.question !== originalQuestion) {
            console.log('✅ 수학 문제 재생성 완료!');
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
      console.error('수학 문제 재생성 실패:', error);
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
