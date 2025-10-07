import { useState, useCallback } from 'react';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import type { SubjectType } from './types';

export function useGradingLogic(
  subject: SubjectType,
  assignment: any,
  problems: any[],
  sessionDetails: any,
  selectedSession: any
) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [problemCorrectness, setProblemCorrectness] = useState<{ [key: string]: boolean }>({});
  const [updatedAnswers, setUpdatedAnswers] = useState<{ [key: string]: string }>({});
  const [originalAnswers, setOriginalAnswers] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);

  const initializeEditState = useCallback(() => {
    if (!sessionDetails) return;

    const correctness: { [key: string]: boolean } = {};
    const originalCorrectAnswers: { [key: string]: string } = {};

    if (subject === 'korean') {
      problems.forEach((problem) => {
        const problemId = problem.id.toString();
        let isCorrect = false;

        if (sessionDetails.problem_results) {
          const problemResult = sessionDetails.problem_results.find(
            (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
          );
          if (problemResult) {
            isCorrect = problemResult.is_correct || false;
          }
        }

        correctness[problemId] = isCorrect;
        originalCorrectAnswers[problemId] = problem.correct_answer || '';
      });
    } else if (subject === 'english') {
      problems.forEach((problem) => {
        const problemId = problem.question_id?.toString() || problem.id?.toString();
        if (problemId) {
          let isCorrect = false;
          let correctAnswer = problem.correct_answer || '';

          const questionResult = sessionDetails.question_results?.find(
            (qr: any) => qr.question_id?.toString() === problemId
          );

          if (questionResult) {
            isCorrect = questionResult.is_correct || false;
            correctAnswer = questionResult.correct_answer || correctAnswer;
          }

          correctness[problemId] = isCorrect;
          originalCorrectAnswers[problemId] = correctAnswer;
        }
      });
    } else {
      // Math
      problems.forEach((problem) => {
        const problemId = problem.id.toString();
        correctness[problemId] = false;

        if (sessionDetails.problem_results) {
          const problemResult = sessionDetails.problem_results.find(
            (pr: any) => pr.problem_id.toString() === problemId,
          );
          if (problemResult) {
            correctness[problemId] = problemResult.is_correct || false;
          }
        }

        originalCorrectAnswers[problemId] = problem.correct_answer || '';
      });
    }

    setProblemCorrectness(correctness);
    setOriginalAnswers(originalCorrectAnswers);
    setUpdatedAnswers({});
    setHasChanges(false);
  }, [sessionDetails, problems, subject]);

  const toggleProblemCorrectness = useCallback(
    (problemId: string) => {
      const newCorrectness = !problemCorrectness[problemId];

      setProblemCorrectness((prev) => ({
        ...prev,
        [problemId]: newCorrectness,
      }));
      setHasChanges(true);
    },
    [problemCorrectness]
  );

  const calculateScoreFromCorrectness = useCallback(() => {
    const totalProblems =
      assignment.problem_count || problems.length || assignment.total_problems || Object.keys(problemCorrectness).length;

    const correctCount = Object.values(problemCorrectness).filter((correct) => correct).length;

    if (totalProblems === 0 || correctCount === 0) return 0;

    const scorePerProblem =
      sessionDetails?.points_per_problem != null
        ? sessionDetails.points_per_problem
        : totalProblems <= 10
        ? 10
        : 5;
    return correctCount * scorePerProblem;
  }, [assignment, problems, problemCorrectness, sessionDetails]);

  const saveGradingChanges = useCallback(
    async (onSuccess: () => void) => {
      if (!sessionDetails || !hasChanges) return;

      try {
        const totalScore = calculateScoreFromCorrectness();
        const correctCount = Object.values(problemCorrectness).filter((correct) => correct).length;

        if (subject === 'korean') {
          const problemCorrections: { [key: string]: boolean } = {};
          Object.keys(problemCorrectness).forEach((problemId) => {
            problemCorrections[problemId] = problemCorrectness[problemId];
          });

          const payload = {
            problem_corrections: problemCorrections,
            total_score: totalScore,
            correct_count: correctCount,
            status: 'final',
            updated_correct_answers: updatedAnswers,
          };

          const koreanSessionId =
            sessionDetails.id || selectedSession?.id || selectedSession?.grading_session_id;
          if (!koreanSessionId) {
            throw new Error('국어 채점 세션 ID를 찾을 수 없습니다.');
          }

          await koreanService.updateGradingSession(koreanSessionId, payload);
        } else if (subject === 'english') {
          const resultId = sessionDetails.id || sessionDetails.result_id;
          if (!resultId) {
            throw new Error('영어 채점 결과 ID를 찾을 수 없습니다.');
          }

          const totalProblems =
            assignment.problem_count || problems.length || assignment.total_problems || Object.keys(problemCorrectness).length;

          const updatedAnswersData = Object.keys(problemCorrectness).map((problemId) => ({
            question_id: parseInt(problemId),
            is_correct: problemCorrectness[problemId],
            score: problemCorrectness[problemId] ? (totalProblems <= 10 ? 10 : 5) : 0,
            ...(updatedAnswers[problemId] && { correct_answer: updatedAnswers[problemId] }),
          }));

          const payload = {
            answers: updatedAnswersData,
            total_score: totalScore,
            correct_count: correctCount,
            is_reviewed: true,
            updated_correct_answers: updatedAnswers,
          };

          await EnglishService.updateEnglishGradingSession(resultId.toString(), payload);
        } else {
          // Math
          const mathSessionId =
            sessionDetails.id || selectedSession?.id || selectedSession?.grading_session_id;
          if (!mathSessionId) {
            throw new Error('수학 채점 세션 ID를 찾을 수 없습니다.');
          }

          const totalProblems =
            assignment.problem_count || problems.length || assignment.total_problems || Object.keys(problemCorrectness).length;

          const pointsPerProblem =
            sessionDetails.points_per_problem || (totalProblems <= 10 ? 10 : 5);

          const updatedResults = Object.keys(problemCorrectness).map((problemId) => ({
            problem_id: parseInt(problemId),
            is_correct: problemCorrectness[problemId],
            score: problemCorrectness[problemId] ? pointsPerProblem : 0,
            ...(updatedAnswers[problemId] && { correct_answer: updatedAnswers[problemId] }),
          }));

          const payload = {
            problem_results: updatedResults,
            total_score: totalScore,
            correct_count: correctCount,
            status: 'final',
            updated_correct_answers: updatedAnswers,
          };

          await mathService.updateGradingSession(mathSessionId, payload);
        }

        alert('채점 결과가 저장되었습니다.');
        setHasChanges(false);
        setIsEditMode(false);
        onSuccess();
      } catch (error) {
        console.error('Failed to save grading changes:', error);
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
        alert(`저장에 실패했습니다:\n${errorMessage}`);
      }
    },
    [
      sessionDetails,
      hasChanges,
      calculateScoreFromCorrectness,
      problemCorrectness,
      subject,
      updatedAnswers,
      selectedSession,
      assignment,
      problems,
    ]
  );

  return {
    isEditMode,
    setIsEditMode,
    problemCorrectness,
    hasChanges,
    initializeEditState,
    toggleProblemCorrectness,
    saveGradingChanges,
    calculateScoreFromCorrectness,
  };
}
