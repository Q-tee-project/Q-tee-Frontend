import { useState } from 'react';
import { Worksheet, Problem } from '@/services/koreanService'; // Import Worksheet and Problem from koreanService

export interface BankState<
  TWorksheet extends Worksheet = Worksheet,
  TProblem extends Problem = Problem,
> {
  worksheets: TWorksheet[];
  selectedWorksheet: TWorksheet | null;
  worksheetProblems: TProblem[];
  isLoading: boolean;
  error: string | null;
  showAnswerSheet: boolean;
}

export const useBankState = <
  TWorksheet extends Worksheet = Worksheet,
  TProblem extends Problem = Problem,
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
