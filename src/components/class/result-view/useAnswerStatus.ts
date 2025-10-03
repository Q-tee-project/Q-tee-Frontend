import { useMemo } from 'react';
import type { AnswerStatus, SubjectType } from './types';

export function useAnswerStatus(
  subject: SubjectType,
  sessionDetails: any,
  problems: any[],
  isEditMode: boolean,
  problemCorrectness: { [key: string]: boolean }
) {
  return useMemo(() => {
    const getAnswerStatus = (problemId: string): AnswerStatus | null => {
      if (!sessionDetails) return null;

      if (subject === 'korean') {
        const problemResult = sessionDetails.problem_results?.find(
          (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
        );

        const problem = problems.find((p) => p.id.toString() === problemId);
        if (!problem) return null;

        const studentAnswer = problemResult?.user_answer || problemResult?.student_answer;
        if (!studentAnswer) {
          return {
            isCorrect: false,
            studentAnswer: '(답안 없음)',
            correctAnswer: problem.correct_answer,
            studentAnswerText: '(답안 없음)',
            correctAnswerText: problem.correct_answer,
            aiFeedback: null,
          };
        }

        const actualCorrectAnswer = problemResult?.correct_answer || problem.correct_answer;
        const isCorrect =
          isEditMode && problemCorrectness.hasOwnProperty(problemId)
            ? problemCorrectness[problemId]
            : problemResult?.is_correct !== undefined
            ? problemResult.is_correct
            : studentAnswer === actualCorrectAnswer;

        const extractChoiceNumber = (answerText: string) => {
          const numberMatch = answerText.match(/^(\d+)번?\./);
          if (numberMatch) return numberMatch[1];

          if (problem.choices) {
            const choiceIndex = problem.choices.findIndex((choice: string) => choice === answerText);
            if (choiceIndex !== -1) return (choiceIndex + 1).toString();
          }

          return answerText;
        };

        return {
          isCorrect,
          studentAnswer: extractChoiceNumber(studentAnswer),
          correctAnswer: extractChoiceNumber(actualCorrectAnswer),
          studentAnswerText: studentAnswer,
          correctAnswerText: actualCorrectAnswer,
          aiFeedback: null,
        };
      } else if (subject === 'english') {
        let questionResult = sessionDetails.question_results?.find(
          (qr: any) => qr.question_id?.toString() === problemId || qr.id?.toString() === problemId,
        );

        if (!questionResult && sessionDetails.answers) {
          questionResult = sessionDetails.answers.find(
            (answer: any) =>
              answer.question_id?.toString() === problemId || answer.id?.toString() === problemId,
          );
        }

        if (!questionResult) return null;

        const question = problems.find(
          (q) => q.question_id?.toString() === problemId || q.id?.toString() === problemId,
        );

        return {
          isCorrect: questionResult.is_correct || false,
          studentAnswer: questionResult.student_answer || questionResult.user_answer || '(답안 없음)',
          correctAnswer:
            questionResult.correct_answer ||
            (question ? question.correct_answer : '(수동 채점 필요)'),
          studentAnswerText:
            questionResult.student_answer || questionResult.user_answer || '(답안 없음)',
          correctAnswerText:
            questionResult.correct_answer ||
            (question ? question.correct_answer : '(수동 채점 필요)'),
          aiFeedback: questionResult.ai_feedback || null,
        };
      } else {
        // Math
        const problemResult = sessionDetails.problem_results?.find(
          (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
        );

        if (problemResult) {
          return {
            isCorrect: problemResult.is_correct || false,
            studentAnswer: problemResult.user_answer || '(답안 없음)',
            correctAnswer: problemResult.correct_answer || '정답 정보 없음',
            studentAnswerText: problemResult.user_answer || '(답안 없음)',
            correctAnswerText: problemResult.correct_answer || '정답 정보 없음',
            explanation: problemResult.explanation,
            aiFeedback: problemResult.ai_feedback || null,
          };
        } else {
          const problem = problems.find((p) => p.id.toString() === problemId);
          if (!problem) return null;

          return {
            isCorrect: false,
            studentAnswer: '(답안 없음)',
            correctAnswer: problem.correct_answer || '정답 정보 없음',
            studentAnswerText: '(답안 없음)',
            correctAnswerText: problem.correct_answer || '정답 정보 없음',
            explanation: problem.explanation || '',
            aiFeedback: null,
          };
        }
      }
    };

    return { getAnswerStatus };
  }, [subject, sessionDetails, problems, isEditMode, problemCorrectness]);
}
