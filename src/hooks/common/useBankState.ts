import { useState } from 'react';

// Generic types without constraints - each service will provide its own types
export interface BankState<TWorksheet = any, TProblem = any> {
  worksheets: TWorksheet[];
  selectedWorksheet: TWorksheet | null;
  worksheetProblems: TProblem[];
  isLoading: boolean;
  error: string | null;
  showAnswerSheet: boolean;
}

export const useBankState = <TWorksheet = any, TProblem = any>() => {
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
