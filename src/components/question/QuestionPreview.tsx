import React from 'react';
import { QuestionPreviewComponentProps } from './QuestionPreviewTypes';
import { KoreanQuestionPreview } from './KoreanQuestionPreview';
import { MathQuestionPreview } from './MathQuestionPreview';
import { EnglishQuestionPreview } from './EnglishQuestionPreview';

export const QuestionPreview: React.FC<QuestionPreviewComponentProps> = ({
  subject,
  previewQuestions,
  isGenerating,
  generationProgress,
  worksheetName,
  setWorksheetName,
  regeneratingQuestionId,
  regenerationPrompt,
  setRegenerationPrompt,
  showRegenerationInput,
  setShowRegenerationInput,
  onRegenerateQuestion,
  onSaveWorksheet,
  isSaving,
}) => {
  const commonProps = {
    previewQuestions,
    isGenerating,
    generationProgress,
    worksheetName,
    setWorksheetName,
    regeneratingQuestionId,
    regenerationPrompt,
    setRegenerationPrompt,
    showRegenerationInput,
    setShowRegenerationInput,
    onRegenerateQuestion,
    onSaveWorksheet,
    isSaving,
  };

  switch (subject) {
    case 'korean':
      return <KoreanQuestionPreview {...commonProps} />;
    case 'math':
      return <MathQuestionPreview {...commonProps} />;
    case 'english':
      return <EnglishQuestionPreview {...commonProps} />;
    default:
      return <MathQuestionPreview {...commonProps} />; // 기본값
  }
};
