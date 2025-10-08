import { useEffect } from 'react';
import { EnglishService } from '@/services/englishService';
import { EnglishWorksheetData, EnglishQuestion } from '@/types/english';

import { useBankState } from '../common/useBankState';

// 타입 별칭 (기존 코드 호환성)
type EnglishWorksheet = EnglishWorksheetData;
type EnglishProblem = EnglishQuestion;

export const useEnglishBank = () => {
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
  } = useBankState<EnglishWorksheet, EnglishProblem>();

  // 컴포넌트 마운트 시 자동으로 데이터 로드
  useEffect(() => { 
    if (worksheets.length === 0 && !isLoading) {
      loadWorksheets();
    }
  }, []);

  const loadWorksheets = async () => {
    updateState({ isLoading: true });
    try {
      const worksheetData = await EnglishService.getEnglishWorksheets();

      updateState({ worksheets: worksheetData });

      if (worksheetData.length > 0) {
        updateState({ selectedWorksheet: worksheetData[0] });
        const worksheetId = worksheetData[0].worksheet_id;
        if (worksheetId) {
          await loadWorksheetProblems(worksheetId);
        }
      }
    } catch (error: any) {
      updateState({
        error: `영어 워크시트 데이터를 불러올 수 없습니다: ${error.message}`,
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const loadWorksheetProblems = async (worksheetId: number) => {
    try {
      const worksheetDetail = await EnglishService.getEnglishWorksheetDetail(worksheetId);
      console.log(worksheetDetail);
      console.log(",,,,");
      // API 응답 구조가 worksheet_data 안에 중첩되어 있음
      const worksheetData = worksheetDetail.worksheet_data;
      const questions = worksheetData?.questions || [];
      const passages = worksheetData?.passages || [];


      if (questions.length > 0) {
      }
      if (passages.length > 0) {
      }

      // worksheetProblems를 전체 worksheet_data로 교체
      updateState({ worksheetProblems: worksheetData as any });
    } catch (error: any) {
      updateState({ error: '영어 워크시트 문제를 불러올 수 없습니다.' });
    }
  };

  const handleWorksheetSelect = async (worksheet: EnglishWorksheet) => {
    updateState({ selectedWorksheet: worksheet });
    const worksheetId = worksheet.worksheet_id;
    if (worksheetId) {
      await loadWorksheetProblems(worksheetId);
    }
  };

  const handleDeleteWorksheet = async (worksheet: EnglishWorksheet, event: React.MouseEvent) => {
    event.stopPropagation();

    if (
      !confirm(`"${worksheet.worksheet_name}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      updateState({ isLoading: true });
      // English delete not implemented yet
      throw new Error('영어 워크시트 삭제 기능은 아직 구현되지 않았습니다.');

      if (selectedWorksheet?.worksheet_id === worksheet.worksheet_id) {
        updateState({
          selectedWorksheet: null,
          worksheetProblems: [],
        });
      }

      await loadWorksheets();
      alert('영어 워크시트가 삭제되었습니다.');
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleBatchDeleteWorksheets = async (worksheetsToDelete: EnglishWorksheet[]) => {
    try {
      updateState({ isLoading: true });

      // 삭제할 워크시트의 ID 목록 생성
      const worksheetIdsToDelete = worksheetsToDelete
        .map(w => w.worksheet_id)
        .filter(id => id !== undefined) as number[];

      // 백엔드 API 호출
      const deleteResult = await EnglishService.batchDeleteEnglishWorksheets(worksheetIdsToDelete);

      // 백엔드 삭제 성공 후 메모리에서도 삭제 처리
      const updatedWorksheets = worksheets.filter(
        worksheet => !worksheetIdsToDelete.includes(worksheet.worksheet_id!)
      );

      // 선택된 워크시트가 삭제된 경우 새로운 워크시트 선택
      let newSelectedWorksheet = selectedWorksheet;
      if (selectedWorksheet && worksheetIdsToDelete.includes(selectedWorksheet.worksheet_id!)) {
        newSelectedWorksheet = updatedWorksheets.length > 0 ? updatedWorksheets[0] : null;
      }

      // 상태 업데이트
      updateState({
        worksheets: updatedWorksheets,
        selectedWorksheet: newSelectedWorksheet,
        worksheetProblems: newSelectedWorksheet ? worksheetProblems : undefined
      });

      // 새로운 워크시트가 선택된 경우 문제 로드
      if (newSelectedWorksheet && newSelectedWorksheet.worksheet_id !== selectedWorksheet?.worksheet_id) {
        await loadWorksheetProblems(newSelectedWorksheet.worksheet_id!);
      }

      alert(`✅ ${worksheetsToDelete.length}개의 워크시트가 삭제되었습니다.`);
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
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
