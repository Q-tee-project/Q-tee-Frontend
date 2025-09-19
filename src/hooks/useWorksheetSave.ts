import { useState } from 'react';
import { PreviewQuestion } from './useProblemGeneration';

export const useWorksheetSave = () => {
  const [worksheetName, setWorksheetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentWorksheetId, setCurrentWorksheetId] = useState<number | null>(null);

  const resetWorksheet = () => {
    setWorksheetName('');
    setCurrentWorksheetId(null);
  };

  // 문제지 저장 함수
  const saveWorksheet = async (
    subject: string,
    previewQuestions: PreviewQuestion[],
    onSuccess?: (worksheetId: number) => void,
    onError?: (error: string) => void,
  ) => {
    if (!worksheetName.trim()) {
      alert('문제지 이름을 입력해주세요.');
      return;
    }

    if (previewQuestions.length === 0) {
      alert('저장할 문제가 없습니다.');
      return;
    }

    try {
      setIsSaving(true);

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      let saveData;
      if (currentWorksheetId) {
        // 기존 워크시트 업데이트
        saveData = {
          worksheet_id: currentWorksheetId,
          name: worksheetName,
          problems: previewQuestions.map((q) => ({
            question: q.question || q.title,
            choices: q.choices || q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
        };
      } else {
        // 새 워크시트 생성
        saveData = {
          name: worksheetName,
          subject: subject,
          problems: previewQuestions.map((q) => ({
            question: q.question || q.title,
            choices: q.choices || q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
        };
      }

      console.log('💾 문제지 저장 요청:', saveData);

      const endpoint = currentWorksheetId
        ? `http://localhost:8001/worksheets/${currentWorksheetId}?user_id=${userId}`
        : `http://localhost:8001/save-worksheet?user_id=${userId}`;

      const method = currentWorksheetId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ 저장 API 응답 오류:', response.status, errorData);
        throw new Error(`문제지 저장 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!currentWorksheetId && result.worksheet_id) {
        setCurrentWorksheetId(result.worksheet_id);
        onSuccess?.(result.worksheet_id);
      }

      onSuccess?.(result.worksheet_id || currentWorksheetId);
    } catch (error) {
      console.error('문제지 저장 오류:', error);
      onError?.('문제지 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    worksheetName,
    setWorksheetName,
    isSaving,
    currentWorksheetId,
    setCurrentWorksheetId,
    saveWorksheet,
    resetWorksheet,
  };
};
