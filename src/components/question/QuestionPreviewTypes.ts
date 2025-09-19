import { PreviewQuestion } from '@/hooks/useProblemGeneration';

export interface BaseQuestionPreviewProps {
  previewQuestions: PreviewQuestion[];
  isGenerating: boolean;
  generationProgress: number;
  worksheetName: string;
  setWorksheetName: (name: string) => void;
  regeneratingQuestionId: number | null;
  regenerationPrompt: string;
  setRegenerationPrompt: (prompt: string) => void;
  showRegenerationInput: number | null;
  setShowRegenerationInput: (id: number | null) => void;
  onRegenerateQuestion: (questionId: number, prompt?: string) => void;
  onSaveWorksheet: () => void;
  isSaving: boolean;
}

export interface QuestionPreviewComponentProps extends BaseQuestionPreviewProps {
  subject: 'korean' | 'math' | 'english';
}

