import { useState } from 'react';

export interface PreviewQuestion {
  id: number;
  title: string;
  options?: string[];
  answerIndex?: number;
  explanation: string;
  correct_answer?: string;
  choices?: string[];
  question?: string;
  backendId?: number;
  problem_type?: string;
  source_text?: string;
  source_title?: string;
  source_author?: string;
  // Validation related properties
  validation_result?: any;
  validation_status?: 'auto_approved' | 'manual_review_needed' | 'rejected';
}

export interface GenerationState {
  isGenerating: boolean;
  generationProgress: number;
  previewQuestions: PreviewQuestion[];
  regeneratingQuestionId: number | null;
  regenerationPrompt: string;
  showRegenerationInput: number | null;
  lastGenerationData: any;
  errorMessage: string | null;
  currentWorksheetId: number | null;
}

export const useProblemGeneration = () => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    generationProgress: 0,
    previewQuestions: [],
    regeneratingQuestionId: null,
    regenerationPrompt: '',
    showRegenerationInput: null,
    lastGenerationData: null,
    errorMessage: null,
    currentWorksheetId: null,
  });

  const updateState = (updates: Partial<GenerationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetGeneration = () => {
    setState((prev) => ({
      ...prev,
      previewQuestions: [],
      generationProgress: 0,
      errorMessage: null,
    }));
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, errorMessage: null }));
  };

  return {
    ...state,
    updateState,
    resetGeneration,
    clearError,
  };
};
