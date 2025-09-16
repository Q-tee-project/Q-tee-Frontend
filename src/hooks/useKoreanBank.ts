import { useEffect } from 'react';
import { KoreanService } from '@/services/koreanService';
import { KoreanWorksheet, KoreanProblem } from '@/types/korean';
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
  } = useBankState<KoreanWorksheet, KoreanProblem>();

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
      const worksheetData = await KoreanService.getKoreanWorksheets();
      console.log('국어 워크시트 데이터:', worksheetData);

      updateState({ worksheets: worksheetData });

      if (worksheetData.length > 0) {
        updateState({ selectedWorksheet: worksheetData[0] });
        await loadWorksheetProblems(worksheetData[0].id);
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
      const worksheetDetail = await KoreanService.getKoreanWorksheetDetail(worksheetId);
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
      // Korean delete not implemented yet
      throw new Error('국어 워크시트 삭제 기능은 아직 구현되지 않았습니다.');

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

      // Korean batch delete not implemented yet
      throw new Error('국어 워크시트 일괄 삭제 기능은 아직 구현되지 않았습니다.');
    } catch (error: any) {
      console.error('국어 워크시트 일괄 삭제 실패:', error);
      alert(`일괄 삭제 실패: ${error.message}`);
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
