'use client';

import { useState } from 'react';
import { MathService } from '@/services/mathService';
import { KoreanService } from '@/services/koreanService';
import { MathProblem } from '@/types/math';
import { KoreanProblem } from '@/types/korean';
import { autoConvertToLatex } from '@/utils/mathLatexConverter';

type AnyProblem = MathProblem | KoreanProblem;

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
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleEditProblem = (problem: AnyProblem) => {
    setEditingProblem(problem);
    setEditFormData({
      question: problem.question,
      problem_type:
        (problem as any).problem_type ||
        (problem as any).korean_type ||
        'multiple_choice',
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

      // 과목에 따라 적절한 서비스 사용
      if (selectedSubject === '국어') {
        // 국어는 현재 워크시트 업데이트 사용
        await KoreanService.updateKoreanWorksheet(editingProblem.id, updateData);
      } else if (selectedSubject === '수학') {
        await MathService.updateProblem(editingProblem.id, updateData);
      } else {
        throw new Error('지원되지 않는 과목입니다.');
      }
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
      // 과목에 따라 적절한 서비스 사용
      if (selectedSubject === '국어') {
        await KoreanService.updateKoreanWorksheet(worksheetId, {
          title: editedTitle.trim(),
        });
      } else if (selectedSubject === '수학') {
        await MathService.updateMathWorksheet(worksheetId, {
          title: editedTitle.trim(),
        });
      } else {
        throw new Error('지원되지 않는 과목입니다.');
      }

      onSuccess();
      setIsEditingTitle(false);
      setEditedTitle('');
      alert('타이틀이 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('타이틀 업데이트 실패:', error);
      alert(`타이틀 업데이트 실패: ${error.message}`);
    }
  };

  const handleRegenerateProblem = async (requirements?: string, onSuccess?: () => void) => {
    if (!editingProblem) return;

    try {
      setIsRegenerating(true);

      const regenerateData = {
        problem_id: editingProblem.id,
        requirements: requirements || '',
        current_problem: {
          question: editFormData.question,
          problem_type: editFormData.problem_type,
          difficulty: editFormData.difficulty,
          choices: editFormData.choices,
          correct_answer: editFormData.correct_answer,
          explanation: editFormData.explanation,
        }
      };

      let taskResponse;

      // 국어와 수학만 처리 (Celery 통해 비동기 처리)
      if (selectedSubject === '국어') {
        taskResponse = await KoreanService.regenerateProblemAsync(regenerateData);
      } else if (selectedSubject === '수학') {
        taskResponse = await MathService.regenerateProblemAsync(regenerateData);
      } else {
        alert('현재 국어와 수학만 재생성을 지원합니다.');
        return;
      }

      if (taskResponse?.task_id) {
        // Celery 작업 상태 폴링
        const pollResult = await pollTaskStatus(taskResponse.task_id);

        if (pollResult.success && pollResult.result) {
          // 폼 데이터를 재생성된 문제로 업데이트
          setEditFormData({
            question: pollResult.result.question || '',
            problem_type: pollResult.result.problem_type || editFormData.problem_type,
            difficulty: pollResult.result.difficulty || editFormData.difficulty,
            choices: pollResult.result.choices || editFormData.choices,
            correct_answer: pollResult.result.correct_answer || '',
            explanation: pollResult.result.explanation || '',
          });

          alert('문제가 성공적으로 재생성되었습니다.');
          if (onSuccess) onSuccess();
        } else {
          alert(`재생성 실패: ${pollResult.error || '알 수 없는 오류가 발생했습니다.'}`);
        }
      }
    } catch (error: any) {
      console.error('문제 재생성 실패:', error);
      alert(`재생성 실패: ${error.message || '서버 오류가 발생했습니다.'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Celery 작업 상태를 폴링하는 함수 (기존 문제 생성과 동일한 타임아웃 설정)
  const pollTaskStatus = async (taskId: string, maxRetries = 300, interval = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        let statusResponse;

        if (selectedSubject === '국어') {
          statusResponse = await KoreanService.getTaskStatus(taskId);
        } else if (selectedSubject === '수학') {
          statusResponse = await MathService.getTaskStatus(taskId);
        }

        if (statusResponse?.status === 'SUCCESS') {
          return { success: true, result: statusResponse.result };
        } else if (statusResponse?.status === 'FAILURE') {
          return { success: false, error: statusResponse.error || '작업이 실패했습니다.' };
        }

        // 아직 진행 중이면 잠시 대기
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error('작업 상태 확인 중 오류:', error);
      }
    }

    return { success: false, error: '작업이 시간 초과되었습니다.' };
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingProblem,
    editFormData,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    isRegenerating,
    handleEditProblem,
    handleSaveProblem,
    handleEditFormChange,
    handleChoiceChange,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleSaveTitle,
    handleRegenerateProblem,
  };
};
