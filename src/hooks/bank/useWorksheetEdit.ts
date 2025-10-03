'use client';

import { useState } from 'react';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';
import { MathProblem } from '@/types/math';
import { KoreanProblem } from '@/types/korean';
import { EnglishQuestion } from '@/types/english';
import { autoConvertToLatex } from '@/utils/mathLatexConverter';

type AnyProblem = MathProblem | KoreanProblem | EnglishQuestion;

export const useWorksheetEdit = (selectedSubject?: string) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<AnyProblem | null>(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    problem_type: '',
    difficulty: '',
    choices: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleEditProblem = (problem: AnyProblem) => {
    setEditingProblem(problem);

    if (selectedSubject === '영어') {
      const englishProblem = problem as EnglishQuestion;
      setEditFormData({
        question: englishProblem.question_text || '',
        problem_type: englishProblem.question_type || '객관식',
        difficulty: englishProblem.question_difficulty || '중',
        choices: englishProblem.question_choices?.length > 0
          ? englishProblem.question_choices
          : ['', '', '', ''],
        correct_answer: String(englishProblem.correct_answer) || '',
        explanation: englishProblem.explanation || '',
      });
    } else {
      setEditFormData({
        question: (problem as any).question,
        problem_type:
          (problem as any).problem_type ||
          (problem as any).korean_type ||
          'multiple_choice',
        difficulty: (problem as any).difficulty,
        choices: (problem as any).choices?.length > 0 ? (problem as any).choices : ['', '', '', ''],
        correct_answer: (problem as any).correct_answer || '',
        explanation: (problem as any).explanation || '',
      });
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveProblem = async (onSuccess: () => void) => {
    if (!editingProblem) return;

    try {
      const updateData = {
        question: selectedSubject === '수학'
          ? autoConvertToLatex(editFormData.question)
          : editFormData.question,
        problem_type: editFormData.problem_type,
        difficulty: editFormData.difficulty,
        choices:
          editFormData.problem_type === 'multiple_choice'
            ? editFormData.choices
                .filter((choice) => choice.trim() !== '')
                .map((choice) => selectedSubject === '수학' ? autoConvertToLatex(choice) : choice)
            : undefined,
        correct_answer: selectedSubject === '수학'
          ? autoConvertToLatex(editFormData.correct_answer)
          : editFormData.correct_answer,
        explanation: selectedSubject === '수학'
          ? autoConvertToLatex(editFormData.explanation)
          : editFormData.explanation,
      };

      if (selectedSubject === '국어') {
        await koreanService.updateProblem((editingProblem as any).id, updateData);
      } else if (selectedSubject === '수학') {
        await mathService.updateProblem((editingProblem as any).id, updateData);
      } else if (selectedSubject === '영어') {
        throw new Error('영어 문제 편집은 현재 지원되지 않습니다.');
      } else {
        throw new Error('지원되지 않는 과목입니다.');
      }

      onSuccess();
      setIsEditDialogOpen(false);
      setEditingProblem(null);
      alert('문제가 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      alert(`업데이트 실패: ${error.message}`);
    }
  };

  const handleEditFormChange = (field: string, value: string | string[]) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...editFormData.choices];
    newChoices[index] = value;
    setEditFormData((prev) => ({
      ...prev,
      choices: newChoices,
    }));
  };

  const handleStartEditTitle = (currentTitle: string) => {
    setOriginalTitle(currentTitle);
    setEditedTitle(currentTitle);
    setIsEditingTitle(true);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle(originalTitle);
  };

  const handleSaveTitle = async (worksheetId: number, onSuccess: () => void) => {
    if (!editedTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      if (selectedSubject === '국어') {
        await koreanService.updateKoreanWorksheet(worksheetId, {
          title: editedTitle.trim(),
        });
      } else if (selectedSubject === '수학') {
        await mathService.updateMathWorksheet(worksheetId, {
          title: editedTitle.trim(),
        });
      } else if (selectedSubject === '영어') {
        await EnglishService.updateEnglishWorksheetTitle(worksheetId, editedTitle.trim());
      } else {
        throw new Error('지원되지 않는 과목입니다.');
      }

      onSuccess();
      setIsEditingTitle(false);
      setEditedTitle('');
      alert('타이틀이 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      alert(`타이틀 업데이트 실패: ${error.message}`);
    }
  };

  const handleRegenerateProblem = async (requirements?: string, onSuccess?: () => void) => {
    if (!editingProblem) return;

    try {
      setIsRegenerating(true);

      const problemId = selectedSubject === '영어'
        ? (editingProblem as EnglishQuestion).question_id
        : (editingProblem as any).id;

      const regenerateData = {
        problem_id: problemId,
        requirements: requirements || '',
        current_problem: {
          question: editFormData.question,
          problem_type: editFormData.problem_type,
          difficulty: editFormData.difficulty,
          choices: editFormData.choices,
          correct_answer: editFormData.correct_answer,
          explanation: editFormData.explanation,
          has_diagram: (editingProblem as any)?.has_diagram,
          tikz_code: (editingProblem as any)?.tikz_code,
        }
      };

      let taskResponse;

      if (selectedSubject === '국어') {
        taskResponse = await koreanService.regenerateProblemAsync(regenerateData);
      } else if (selectedSubject === '수학') {
        taskResponse = await mathService.regenerateProblemAsync(regenerateData);
      } else {
        alert('현재 국어와 수학만 재생성을 지원합니다.');
        return;
      }

      if (taskResponse?.task_id) {
        const pollResult = await pollTaskStatus(taskResponse.task_id);

        if (pollResult.success && pollResult.result) {
          let processedResult = pollResult.result;

          if (selectedSubject === '수학') {
            processedResult = {
              ...pollResult.result,
              question: pollResult.result.question
                ? autoConvertToLatex(pollResult.result.question)
                : pollResult.result.question,
              choices: pollResult.result.choices
                ? pollResult.result.choices.map((choice: string) => autoConvertToLatex(choice))
                : pollResult.result.choices,
              correct_answer: pollResult.result.correct_answer
                ? autoConvertToLatex(pollResult.result.correct_answer)
                : pollResult.result.correct_answer,
              explanation: pollResult.result.explanation
                ? autoConvertToLatex(pollResult.result.explanation)
                : pollResult.result.explanation,
            };
          }

          setEditFormData({
            question: processedResult.question || '',
            problem_type: processedResult.problem_type || editFormData.problem_type,
            difficulty: processedResult.difficulty || editFormData.difficulty,
            choices: processedResult.choices || editFormData.choices,
            correct_answer: processedResult.correct_answer || '',
            explanation: processedResult.explanation || '',
          });

          alert('문제가 성공적으로 재생성되었습니다.');
          if (onSuccess) onSuccess();
        } else {
          alert(`재생성 실패: ${pollResult.error || '알 수 없는 오류가 발생했습니다.'}`);
        }
      }
    } catch (error: any) {
      alert(`재생성 실패: ${error.message || '서버 오류가 발생했습니다.'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const pollTaskStatus = async (taskId: string, maxRetries = 300, interval = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        let statusResponse;

        if (selectedSubject === '국어') {
          statusResponse = await koreanService.getTaskStatus(taskId);
        } else if (selectedSubject === '수학') {
          statusResponse = await mathService.getTaskStatus(taskId);
        }

        if (statusResponse?.status === 'SUCCESS') {
          return { success: true, result: statusResponse.result };
        } else if (statusResponse?.status === 'FAILURE') {
          return { success: false, error: statusResponse.error || '작업이 실패했습니다.' };
        }

        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        // Continue polling
      }
    }

    return { success: false, error: '작업이 시간 초과되었습니다.' };
  };

  const handleEditedTitleChange = (value: string) => {
    setEditedTitle(value);
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingProblem,
    editFormData,
    isEditingTitle,
    editedTitle,
    isRegenerating,
    handleEditProblem,
    handleSaveProblem,
    handleEditFormChange,
    handleChoiceChange,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleSaveTitle,
    handleEditedTitleChange,
    handleRegenerateProblem,
  };
};
