import { useState } from 'react';
import { BaseWorksheet, BaseProblem } from '@/types/common';

export interface BankState<
  TWorksheet extends BaseWorksheet = BaseWorksheet,
  TProblem extends BaseProblem = BaseProblem,
> {
  worksheets: TWorksheet[];
  selectedWorksheet: TWorksheet | null;
  worksheetProblems: TProblem[];
  isLoading: boolean;
  error: string | null;
  showAnswerSheet: boolean;
}

export const useBankState = <
  TWorksheet extends BaseWorksheet = BaseWorksheet,
  TProblem extends BaseProblem = BaseProblem,
>() => {
  const [state, setState] = useState<BankState<TWorksheet, TProblem>>({
    worksheets: [],
    selectedWorksheet: null,
    worksheetProblems: [],
    isLoading: false,
    error: null,
    showAnswerSheet: false,
  });

  const updateState = (updates: Partial<BankState<TWorksheet, TProblem>>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetBank = () => {
    setState({
      worksheets: [],
      selectedWorksheet: null,
      worksheetProblems: [],
      isLoading: false,
      error: null,
      showAnswerSheet: false,
    });
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    updateState,
    resetBank,
    clearError,
  };
};
