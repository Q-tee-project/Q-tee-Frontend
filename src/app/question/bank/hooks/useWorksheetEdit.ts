'use client';

import { useState } from 'react';
import { QuestionService } from '@/services/questionService';
import { MathProblem } from '@/types/math';
import { autoConvertToLatex } from '@/utils/mathLatexConverter';

export const useWorksheetEdit = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<MathProblem | null>(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    problem_type: '',
    difficulty: '',
    choices: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
  });
  const [autoConvertMode, setAutoConvertMode] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const handleEditProblem = (problem: MathProblem) => {
    setEditingProblem(problem);
    setEditFormData({
      question: problem.question,
      problem_type: problem.problem_type,
      difficulty: problem.difficulty,
      choices: problem.choices && problem.choices.length > 0 ? problem.choices : ['', '', '', ''],
      correct_answer: problem.correct_answer || '',
      explanation: problem.explanation || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveProblem = async (onSuccess: () => void) => {
    if (!editingProblem) return;

    try {
      const updateData = {
        question: autoConvertMode ? autoConvertToLatex(editFormData.question) : editFormData.question,
        problem_type: editFormData.problem_type,
        difficulty: editFormData.difficulty,
        choices:
          editFormData.problem_type === 'multiple_choice'
            ? editFormData.choices
                .filter((choice) => choice.trim() !== '')
                .map((choice) => autoConvertMode ? autoConvertToLatex(choice) : choice)
            : null,
        correct_answer: autoConvertMode ? autoConvertToLatex(editFormData.correct_answer) : editFormData.correct_answer,
        explanation: autoConvertMode ? autoConvertToLatex(editFormData.explanation) : editFormData.explanation,
      };

      await QuestionService.updateProblem(editingProblem.id, updateData);
      onSuccess();
      setIsEditDialogOpen(false);
      setEditingProblem(null);
      alert('문제가 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('문제 업데이트 실패:', error);
      alert(`업데이트 실패: ${error.message}`);
    }
  };

  const handleEditFormChange = (field: string, value: string | string[]) => {
    // 실시간 변환을 제거하고 원본 값만 저장
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...editFormData.choices];
    // 실시간 변환을 제거하고 원본 값만 저장
    newChoices[index] = value;
    setEditFormData((prev) => ({
      ...prev,
      choices: newChoices,
    }));
  };

  const handleStartEditTitle = (currentTitle: string) => {
    setEditedTitle(currentTitle);
    setIsEditingTitle(true);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleSaveTitle = async (worksheetId: number, onSuccess: () => void) => {
    if (!editedTitle.trim()) return;

    try {
      await QuestionService.updateWorksheet(worksheetId, {
        title: editedTitle.trim(),
      });

      onSuccess();
      setIsEditingTitle(false);
      setEditedTitle('');
      alert('타이틀이 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('타이틀 업데이트 실패:', error);
      alert(`타이틀 업데이트 실패: ${error.message}`);
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingProblem,
    editFormData,
    autoConvertMode,
    setAutoConvertMode,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    handleEditProblem,
    handleSaveProblem,
    handleEditFormChange,
    handleChoiceChange,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleSaveTitle,
  };
};