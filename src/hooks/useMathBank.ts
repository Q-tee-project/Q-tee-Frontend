import { useEffect } from 'react';
import { MathService } from '@/services/mathService';
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
  }, []);

  const loadWorksheets = async () => {
    console.log('수학 워크시트 로드 시작...');
    updateState({ isLoading: true });
    try {
      const worksheetData = await MathService.getMathWorksheets();
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
    try {
      const worksheetDetail = await MathService.getMathWorksheetDetail(worksheetId);
      updateState({ worksheetProblems: worksheetDetail.problems || [] });
    } catch (error: any) {
      console.error('수학 워크시트 문제 로드 실패:', error);
      updateState({ error: '수학 워크시트 문제를 불러올 수 없습니다.' });
    }
  };

  const handleWorksheetSelect = async (worksheet: Worksheet) => {
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
      await MathService.deleteMathWorksheet(worksheet.id);

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
        await MathService.deleteMathWorksheet(worksheet.id);
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
    clearError,
  };
};
