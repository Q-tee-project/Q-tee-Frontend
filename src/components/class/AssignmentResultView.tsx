'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import { classroomService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaDotCircle,
  FaEdit,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';
import type { StudentProfile } from '@/services/authService';

// 과제 결과 데이터 인터페이스
interface AssignmentResult {
  id?: number;
  grading_session_id?: number;
  student_id: number;
  student_name: string;
  school: string;
  grade: string;
  status: string;
  total_score: number;
  max_possible_score: number;
  correct_count: number;
  total_problems: number;
  graded_at?: string;
  submitted_at?: string;
  graded_by?: string;
  problem_results?: any[];
}

export function AssignmentResultView({
  assignment,
  onBack,
}: {
  assignment: any;
  onBack: () => void;
}) {
  // 과제 유형 구분: Korean 과제는 question_type 필드가 있고, Math 과제는 unit_name 필드가 있고, English 과제는 problem_type 필드가 있음
  const isKorean = assignment.question_type !== undefined || assignment.korean_type !== undefined;
  const isEnglish = assignment.problem_type !== undefined && !isKorean;

  const [results, setResults] = useState<AssignmentResult[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AssignmentResult | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [taskProgress, setTaskProgress] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProblems, setEditingProblems] = useState<Set<string>>(new Set());
  const [problemCorrectness, setProblemCorrectness] = useState<{ [key: string]: boolean }>({});
  const [updatedAnswers, setUpdatedAnswers] = useState<{ [key: string]: string }>({});
  const [originalAnswers, setOriginalAnswers] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadResults();
    loadProblems();
    loadStudents();
  }, [assignment.id]);

  // selectedStudentId가 있으면 해당 학생의 결과를 바로 로드
  useEffect(() => {
    if (assignment.selectedStudentId && results.length > 0) {
      const studentSession = results.find((result) => {
        const studentId = result.student_id || result.graded_by;
        return (
          studentId === assignment.selectedStudentId ||
          studentId === assignment.selectedStudentId.toString()
        );
      });
      if (studentSession) {
        handleSessionClick(studentSession);
      }
    }
  }, [assignment.selectedStudentId, results]);

  // sessionDetails가 변경될 때마다 편집 상태 초기화
  useEffect(() => {
    if (sessionDetails) {
      initializeEditState();
      // 학생별 상세 페이지에서는 자동으로 편집 모드 활성화
      if (assignment.selectedStudentId && !isEditMode) {
        setIsEditMode(true);
      }
    }
  }, [sessionDetails]);

  const loadStudents = async () => {
    try {
      const classId = assignment.class_id || assignment.classroom_id || assignment.classId;

      if (classId) {
        const studentList = await classroomService.getClassroomStudents(classId);
        setStudents(studentList);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadProblems = async () => {
    try {
      let data;
      if (isKorean) {
        data = await koreanService.getKoreanWorksheetProblems(assignment.worksheet_id);
        setProblems(data.problems);
      } else if (isEnglish) {
        // 영어 과제의 경우 워크시트 상세 정보를 가져와서 문제들 추출
        data = await EnglishService.getEnglishWorksheetDetail(assignment.worksheet_id);
        setProblems(data.questions || []);
      } else {
        // 수학 과제의 경우 문제는 채점 결과에서 가져옴
        console.log('Math assignment - problems will be loaded from grading results');

        // 수학 워크시트 문제 정보도 시도해보기
        try {
          data = await mathService.getMathWorksheetProblems(assignment.worksheet_id);
          if (data && data.problems) {
            setProblems(data.problems);
          }
        } catch (error) {
          console.log('Math worksheet problems not available:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
    }
  };

  const loadResults = async () => {
    try {
      setIsLoading(true);
      let data;
      if (isKorean) {
        data = await koreanService.getAssignmentResults(assignment.id);
      } else if (isEnglish) {
        // 영어 과제 결과 가져오기 - 새로운 API 사용
        data = await EnglishService.getEnglishAssignmentResults(assignment.id);
        // 영어 결과는 이미 표준 형식으로 반환됨
      } else {
        // 수학 과제 결과 가져오기
        data = await mathService.getAssignmentResults(assignment.id);
      }
      if (Array.isArray(data)) {
        setResults(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setResults((data as any).results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Failed to load assignment results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode && sessionDetails) {
      // 편집 모드 진입 시 초기 상태 설정
      initializeEditState();
    }
  };

  const initializeEditState = () => {
    if (!sessionDetails) return;

    const correctness: { [key: string]: boolean } = {};
    const originalCorrectAnswers: { [key: string]: string } = {};

    if (isKorean) {
      // 국어의 경우 problems 기반으로 정답/오답 상태 계산
      problems.forEach((problem) => {
        const problemId = problem.id.toString();
        const answerStatus = getAnswerStatus(problemId);

        console.log(`Korean problem ${problemId}:`, answerStatus);

        // problem_results에서도 확인 (국어도 problem_results가 있을 수 있음)
        let isCorrect = answerStatus?.isCorrect || false;
        if (sessionDetails.problem_results) {
          const problemResult = sessionDetails.problem_results.find(
            (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
          );
          if (problemResult) {
            isCorrect = problemResult.is_correct || false;
          }
        }

        correctness[problemId] = isCorrect;
        // 원래 정답 저장
        originalCorrectAnswers[problemId] = problem.correct_answer || '';
      });
    } else if (isEnglish) {
      // 영어의 경우 problems 기반으로 정답/오답 상태 계산 (영어 백엔드 구조에 맞춤)
      problems.forEach((problem) => {
        const problemId = problem.question_id?.toString() || problem.id?.toString();
        if (problemId) {
          const answerStatus = getAnswerStatus(problemId);
          correctness[problemId] = answerStatus?.isCorrect || false;
          // 원래 정답 저장
          originalCorrectAnswers[problemId] =
            problem.correct_answer || answerStatus?.correctAnswer || '';
        }
      });
    } else {
      // 수학의 경우: 모든 problems 기반으로 초기화하고, problem_results에서 실제 결과 덮어쓰기
      problems.forEach((problem) => {
        const problemId = problem.id.toString();
        // 기본적으로 오답으로 초기화
        correctness[problemId] = false;

        // problem_results에서 실제 결과 찾기
        if (sessionDetails.problem_results) {
          const problemResult = sessionDetails.problem_results.find(
            (pr: any) => pr.problem_id.toString() === problemId,
          );
          if (problemResult) {
            correctness[problemId] = problemResult.is_correct || false;
          }
        }

        // 원래 정답 저장
        originalCorrectAnswers[problemId] = problem.correct_answer || '';
      });
    }

    setProblemCorrectness(correctness);
    setOriginalAnswers(originalCorrectAnswers);
    setUpdatedAnswers({});
    setHasChanges(false);
  };

  const toggleProblemCorrectness = (problemId: string) => {
    const newCorrectness = !problemCorrectness[problemId];

    // 문제 정보 가져오기
    const problem = problems.find((p) =>
      (isKorean && p.id.toString() === problemId) ||
      (isEnglish && (p.question_id?.toString() === problemId || p.id?.toString() === problemId)) ||
      (!isKorean && !isEnglish && p.id.toString() === problemId)
    );

    // 문제 유형 판단: 선택지가 있으면 객관식, 없으면 단답형
    const isMultipleChoice = problem && (problem.choices || problem.question_choices);

    if (newCorrectness) {
      // 정답 처리
      if (isMultipleChoice) {
        // 객관식: 학생 답안을 correct_answer로 업데이트
        const answerStatus = getAnswerStatus(problemId);
        if (answerStatus && answerStatus.studentAnswer) {
          setUpdatedAnswers((prev) => ({
            ...prev,
            [problemId]: answerStatus.studentAnswer,
          }));
        }
      } else {
        // 단답형: 원래 정답을 유지 (correct_answer는 변경하지 않음)
        // 정답/오답 여부만 변경하고 정답 자체는 수정하지 않음
        console.log(`단답형 문제 ${problemId}: 정답 처리 (원래 정답 유지)`);
      }
    } else {
      // 오답 처리: 원래 정답으로 되돌리기
      const originalAnswer = originalAnswers[problemId];
      if (originalAnswer) {
        setUpdatedAnswers((prev) => ({
          ...prev,
          [problemId]: originalAnswer,
        }));
      }
    }

    setProblemCorrectness((prev) => ({
      ...prev,
      [problemId]: newCorrectness,
    }));
    setHasChanges(true);
  };

  const calculateScoreFromCorrectness = () => {
    // 전체 문제 수는 assignment 정보나 problems 배열에서 가져오기
    let totalProblems = 0;

    if (assignment.problem_count) {
      totalProblems = assignment.problem_count;
    } else if (problems && problems.length > 0) {
      totalProblems = problems.length;
    } else if (assignment.total_problems) {
      totalProblems = assignment.total_problems;
    } else {
      // 마지막 수단으로 problemCorrectness 길이 사용
      totalProblems = Object.keys(problemCorrectness).length;
    }

    const correctCount = Object.values(problemCorrectness).filter((correct) => correct).length;

    if (totalProblems === 0 || correctCount === 0) return 0;

    // 기존 세션의 points_per_problem 값 사용, 없으면 계산
    const scorePerProblem =
      sessionDetails?.points_per_problem != null
        ? sessionDetails.points_per_problem
        : totalProblems <= 10
        ? 10
        : 5;
    return correctCount * scorePerProblem;
  };

  const saveGradingChanges = async () => {
    if (!sessionDetails || !hasChanges) return;

    try {
      const totalScore = calculateScoreFromCorrectness();
      const correctCount = Object.values(problemCorrectness).filter((correct) => correct).length;

      if (isKorean) {
        // 국어 채점 저장
        const problemCorrections: { [key: string]: boolean } = {};
        Object.keys(problemCorrectness).forEach((problemId) => {
          problemCorrections[problemId] = problemCorrectness[problemId];
        });

        const payload = {
          problem_corrections: problemCorrections,
          total_score: totalScore,
          correct_count: correctCount,
          status: 'final',
          // 업데이트된 정답들을 별도로도 전송
          updated_correct_answers: updatedAnswers,
        };

        // 국어 세션 ID 찾기
        const koreanSessionId =
          sessionDetails.id || selectedSession?.id || selectedSession?.grading_session_id;
        if (!koreanSessionId) {
          throw new Error('국어 채점 세션 ID를 찾을 수 없습니다.');
        }

        await koreanService.updateGradingSession(koreanSessionId, payload);
        alert('채점 결과가 저장되었습니다.');
      } else if (isEnglish) {
        // 영어 채점 저장
        const resultId = sessionDetails.id || sessionDetails.result_id;
        if (!resultId) {
          throw new Error('영어 채점 결과 ID를 찾을 수 없습니다.');
        }

        // 전체 문제 수 계산 (같은 로직 사용)
        let totalProblems = 0;
        if (assignment.problem_count) {
          totalProblems = assignment.problem_count;
        } else if (problems && problems.length > 0) {
          totalProblems = problems.length;
        } else if (assignment.total_problems) {
          totalProblems = assignment.total_problems;
        } else {
          totalProblems = Object.keys(problemCorrectness).length;
        }

        const updatedAnswersData = Object.keys(problemCorrectness).map((problemId) => ({
          question_id: parseInt(problemId),
          is_correct: problemCorrectness[problemId],
          score: problemCorrectness[problemId] ? (totalProblems <= 10 ? 10 : 5) : 0,
          // 업데이트된 정답이 있으면 포함
          ...(updatedAnswers[problemId] && { correct_answer: updatedAnswers[problemId] }),
        }));

        const payload = {
          answers: updatedAnswersData,
          total_score: totalScore,
          correct_count: correctCount,
          is_reviewed: true,
          // 업데이트된 정답들을 별도로도 전송
          updated_correct_answers: updatedAnswers,
        };

        await EnglishService.updateEnglishGradingSession(resultId.toString(), payload);
        alert('채점 결과가 저장되었습니다.');
      } else {
        // 수학 채점 저장
        const mathSessionId =
          sessionDetails.id || selectedSession?.id || selectedSession?.grading_session_id;
        if (!mathSessionId) {
          throw new Error('수학 채점 세션 ID를 찾을 수 없습니다.');
        }

        // 전체 문제 수 계산 (같은 로직 사용)
        let totalProblems = 0;
        if (assignment.problem_count) {
          totalProblems = assignment.problem_count;
        } else if (problems && problems.length > 0) {
          totalProblems = problems.length;
        } else if (assignment.total_problems) {
          totalProblems = assignment.total_problems;
        } else {
          totalProblems = Object.keys(problemCorrectness).length;
        }

        // 기존 세션의 points_per_problem 값 사용, 없으면 계산
        const pointsPerProblem =
          sessionDetails.points_per_problem || (totalProblems <= 10 ? 10 : 5);

        const updatedResults = Object.keys(problemCorrectness).map((problemId) => ({
          problem_id: parseInt(problemId),
          is_correct: problemCorrectness[problemId],
          score: problemCorrectness[problemId] ? pointsPerProblem : 0,
          // 업데이트된 정답이 있으면 포함
          ...(updatedAnswers[problemId] && { correct_answer: updatedAnswers[problemId] }),
        }));

        const payload = {
          problem_results: updatedResults,
          total_score: totalScore,
          correct_count: correctCount,
          status: 'final',
          // 업데이트된 정답들을 별도로도 전송
          updated_correct_answers: updatedAnswers,
        };

        await mathService.updateGradingSession(mathSessionId, payload);
        alert('채점 결과가 저장되었습니다.');
      }

      setHasChanges(false);
      setIsEditMode(false);
      loadResults(); // 결과 새로고침

      // 세션 상세 정보도 새로고침
      if (selectedSession) {
        await handleSessionClick(selectedSession);
      }
    } catch (error) {
      console.error('Failed to save grading changes:', error);
      let errorMessage = '알 수 없는 오류가 발생했습니다';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // 객체인 경우 JSON으로 변환하여 표시
        try {
          errorMessage = JSON.stringify(error, null, 2);
        } catch (jsonError) {
          errorMessage = String(error);
        }
      } else {
        errorMessage = String(error);
      }

      alert(`저장에 실패했습니다:\n${errorMessage}`);
    }
  };

  const handleSessionClick = async (session: any) => {
    try {
      setSelectedSession(session);

      if (isKorean) {
        // 한국어 과제의 경우 기존 방식 사용
        try {
          // session.id 또는 session.grading_session_id 사용
          const sessionId = session.id || session.grading_session_id;
          if (!sessionId) {
            throw new Error('No valid session ID found');
          }
          const details = await koreanService.getGradingSessionDetails(sessionId);
          setSessionDetails(details);
        } catch (error) {
          console.warn('Korean grading session details not available, using session data:', error);
          // API가 실패하면 session 데이터를 직접 사용
          setSessionDetails({
            ...session,
            problem_results: session.problem_results || [],
          });
        }
      } else if (isEnglish) {
        // 영어 과제의 경우 API를 호출하여 상세 정보 가져오기 (문제 정보 포함)
        try {
          const resultId = session.result_id || session.grading_session_id || session.id;
          if (resultId) {
            console.log('English resultId:', resultId, 'Type:', typeof resultId);
            const details = await EnglishService.getEnglishAssignmentResultDetail(
              resultId.toString(),
            );
            console.log('English session details:', details);

            setSessionDetails(details);

            // 영어 문제 정보를 problems 배열에 설정
            if (details.worksheet_data?.questions) {
              setProblems(details.worksheet_data.questions);
            }
          } else {
            console.log('Using English session data directly:', session);
            setSessionDetails({
              ...session,
              answers: session.answers || [],
              questions: session.questions || [],
              total_score: session.total_score || 0,
              correct_count: session.correct_count || 0,
              total_problems: session.total_problems || session.max_possible_score || 10,
            });
          }
        } catch (error) {
          console.warn(
            'English assignment result details not available, using session data:',
            error,
          );
          setSessionDetails({
            ...session,
            answers: session.answers || [],
            questions: session.questions || [],
            total_score: session.total_score || 0,
            correct_count: session.correct_count || 0,
            total_problems: session.total_problems || session.max_possible_score || 10,
          });
        }
      } else {
        // 수학 과제의 경우 session 자체에 이미 problem_results가 포함되어 있음
        setSessionDetails(session);
      }
    } catch (error) {
      console.error('Failed to load session details:', error);
      alert('세션 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleBackToList = () => {
    // selectedStudentId가 있으면 (학생별 결과에서 온 경우) 과제 목록으로 돌아가기
    if (assignment.selectedStudentId) {
      onBack();
    } else {
      // 일반적인 경우 학생 목록으로 돌아가기
      setSelectedSession(null);
      setSessionDetails(null);
    }
  };

  const getAnswerStatus = (problemId: string) => {
    if (!sessionDetails) return null;

    if (isKorean) {
      // Korean 과제의 경우 - problem_results에서만 찾기 (multiple_choice_answers 제거)
      const problemResult = sessionDetails.problem_results?.find(
        (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
      );

      let studentAnswer = problemResult?.user_answer || problemResult?.student_answer;

      const problem = problems.find((p) => p.id.toString() === problemId);

      if (!problem) {
        return null;
      }

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

      // 편집 모드일 때 problemCorrectness 상태 우선 사용
      // 선생님이 수정한 정답이 있다면 그것을 사용, 없다면 원본 정답 사용
      const actualCorrectAnswer = problemResult?.correct_answer || problem.correct_answer;
      const isCorrect =
        isEditMode && problemCorrectness.hasOwnProperty(problemId)
          ? problemCorrectness[problemId]
          : problemResult?.is_correct !== undefined
          ? problemResult.is_correct
          : studentAnswer === actualCorrectAnswer;

      // Extract choice number from answer text
      const extractChoiceNumber = (answerText: string) => {
        // Check if answer already contains number (e.g., "1번. 텍스트" or "1. 텍스트")
        const numberMatch = answerText.match(/^(\d+)번?\./);
        if (numberMatch) {
          return numberMatch[1];
        }

        // If no number found, try to find matching choice text
        if (problem.choices) {
          const choiceIndex = problem.choices.findIndex((choice: string) => choice === answerText);
          if (choiceIndex !== -1) {
            return (choiceIndex + 1).toString();
          }
        }

        // Fallback: return original text
        return answerText;
      };

      const studentAnswerNumber = extractChoiceNumber(studentAnswer);
      const correctAnswerNumber = extractChoiceNumber(actualCorrectAnswer);

      return {
        isCorrect,
        studentAnswer: studentAnswerNumber,
        correctAnswer: correctAnswerNumber,
        studentAnswerText: studentAnswer,
        correctAnswerText: actualCorrectAnswer,
        aiFeedback: null,
      };
    } else if (isEnglish) {
      // 영어 과제의 경우 sessionDetails의 question_results에서 찾기
      let questionResult = sessionDetails.question_results?.find(
        (qr: any) => qr.question_id?.toString() === problemId || qr.id?.toString() === problemId,
      );

      // question_results에서 찾지 못했다면 answers 배열에서 찾기
      if (!questionResult && sessionDetails.answers) {
        questionResult = sessionDetails.answers.find(
          (answer: any) =>
            answer.question_id?.toString() === problemId || answer.id?.toString() === problemId,
        );
      }

      const question = problems.find(
        (q) => q.question_id?.toString() === problemId || q.id?.toString() === problemId,
      );

      if (!questionResult) {
        console.log(`영어 문제 ${problemId} 결과를 찾을 수 없음:`, {
          question_results: sessionDetails.question_results,
          answers: sessionDetails.answers,
          sessionDetails: sessionDetails,
        });
        return null;
      }

      const isCorrect = questionResult.is_correct || false;

      return {
        isCorrect,
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
      // Math 과제의 경우: problem_results에서 찾고, 없으면 problems에서 기본 정보 가져오기
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
        // problem_results에 없는 문제: problems 배열에서 기본 정보 가져오기
        const problem = problems.find((p) => p.id.toString() === problemId);
        if (!problem) {
          console.log(`수학 문제 ${problemId} 정보를 찾을 수 없음:`, {
            problem_results: sessionDetails.problem_results,
            problems: problems,
            sessionDetails: sessionDetails,
          });
          return null;
        }

        return {
          isCorrect: false, // 기본값: 오답
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

  const pollTaskStatus = async (taskId: string) => {
    const poll = async () => {
      try {
        const status = await mathService.getTaskStatus(taskId);
        setTaskProgress(status);

        if (status.status === 'SUCCESS') {
          const result = status.result;
          alert(
            `OCR + AI 채점 완료!\n처리된 손글씨 답안: ${result.processed_count}개\n업데이트된 세션: ${result.updated_sessions}개\n새로 생성된 세션: ${result.newly_graded_sessions}개`,
          );
          setIsProcessingAI(false);
          setTaskProgress(null);
          loadResults();
        } else if (status.status === 'FAILURE') {
          alert(`채점 처리 실패: ${status.info?.error || '알 수 없는 오류'}`);
          setIsProcessingAI(false);
          setTaskProgress(null);
        } else if (status.status === 'PROGRESS') {
          // 진행중인 경우 2초 후 다시 폴링
          setTimeout(poll, 2000);
        } else {
          // PENDING 상태인 경우 1초 후 다시 폴링
          setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error('Task status polling error:', error);
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const handleStartAIGrading = async () => {
    try {
      setIsProcessingAI(true);

      if (isEnglish) {
        // 영어 AI 채점
        try {
          await EnglishService.startEnglishAIGrading(assignment.worksheet_id);
          alert('영어 AI 채점이 시작되었습니다.');
          setIsProcessingAI(false);
          loadResults();
        } catch (englishError) {
          console.error('English AI grading failed:', englishError);
          alert(
            `영어 AI 채점 실패: ${
              englishError instanceof Error ? englishError.message : '알 수 없는 오류'
            }`,
          );
          setIsProcessingAI(false);
        }
      } else {
        // 수학 OCR + AI 채점
        try {
          const result = await mathService.startAIGrading(assignment.id);
          if (result.task_id) {
            // 태스크 상태 폴링 시작
            pollTaskStatus(result.task_id);
          } else {
            alert(result.message || 'OCR + AI 채점이 완료되었습니다.');
            setIsProcessingAI(false);
            loadResults(); // 결과 새로고침
          }
        } catch (mathError) {
          console.error('Math AI grading failed:', mathError);
          alert(
            `수학 OCR 채점 실패: ${
              mathError instanceof Error ? mathError.message : '알 수 없는 오류'
            }`,
          );
          setIsProcessingAI(false);
        }
      }
    } catch (error) {
      console.error('AI grading error:', error);
      alert('채점 처리 중 오류가 발생했습니다.');
      setIsProcessingAI(false);
    }
  };

  if (selectedSession) {
    return (
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToList}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              학생 {assignment.selectedStudentName || selectedSession.graded_by} - 채점 결과 편집
            </h1>
          </div>

          {/* 편집 모드 토글 버튼 */}
          <div className="flex items-center gap-2">
            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setHasChanges(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <FaTimes className="text-sm" />
                  취소
                </Button>
                <Button
                  onClick={saveGradingChanges}
                  disabled={!hasChanges}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <FaSave className="text-sm" />
                  저장
                </Button>
              </>
            )}
            <Button
              variant={isEditMode ? 'secondary' : 'outline'}
              onClick={handleEditModeToggle}
              className={`flex items-center gap-2 ${
                isEditMode
                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                  : 'text-green-600 border-green-600 hover:bg-green-50'
              }`}
            >
              <FaEdit className="text-sm" />
              {isEditMode ? '편집 중' : '편집'}
            </Button>
          </div>
        </div>

        {sessionDetails ? (
          <>
            {/* Problems Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">문제별 결과</h2>

              {(isEnglish
                ? sessionDetails.worksheet_data?.questions || []
                : isKorean || problems.length > 0
                ? problems
                : sessionDetails.problem_results || []
              )
                .sort((a: any, b: any) => {
                  if (isKorean) return a.sequence_order - b.sequence_order;
                  if (isEnglish) return (a.question_id || 0) - (b.question_id || 0);
                  // 수학: problems 배열이 있으면 sequence_order, 없으면 problem_id
                  if (problems.length > 0) return (a.sequence_order || 0) - (b.sequence_order || 0);
                  return a.problem_id - b.problem_id;
                })
                .map((item: any, index: number) => {
                  // 수학에서 problems 배열이 있으면 문제 정보 사용
                  let problemItem = item;

                  const problemId = isKorean
                    ? item.id
                    : isEnglish
                    ? item.question_id
                    : problems.length > 0
                    ? item.id
                    : item.problem_id;
                  const problemNumber = isKorean
                    ? item.sequence_order
                    : isEnglish
                    ? item.question_id
                    : problems.length > 0
                    ? item.sequence_order || index + 1
                    : index + 1;
                  const answerStatus = getAnswerStatus(problemId.toString());

                  return (
                    <Card key={problemId} className="border-l-4 border-l-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Problem Number with Status Icon */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold mb-2">
                              {problemNumber}
                            </div>
                            {answerStatus && (
                              <div className="flex items-center justify-center">
                                {answerStatus.isCorrect ? (
                                  <FaCheckCircle className="text-green-500 text-xl" />
                                ) : (
                                  <FaTimesCircle className="text-red-500 text-xl" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Problem Content */}
                          <div className="flex-1">
                            {/* Source Text if exists (Korean only) */}
                            {isKorean && item.source_text && (
                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="text-sm text-gray-600 mb-2">
                                  {item.source_title && (
                                    <span className="font-medium">{item.source_title}</span>
                                  )}
                                  {item.source_author && <span> - {item.source_author}</span>}
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {item.source_text}
                                </div>
                              </div>
                            )}

                            {/* Question */}
                            <div className="mb-4">
                              <div className="text-gray-900 font-medium">
                                {isKorean ? (
                                  <p>{item.question}</p>
                                ) : isEnglish ? (
                                  <div>
                                    {item.question_text && <p>{item.question_text}</p>}
                                    {item.passage && (
                                      <div className="bg-gray-50 p-3 rounded mt-2 mb-2">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                          {item.passage}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <LaTeXRenderer
                                    content={
                                      (problemItem.question || item.question || `문제 ${problemNumber}`)
                                        .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '')
                                        .trim()
                                    }
                                  />
                                )}
                              </div>

                              {/* TikZ 그래프 */}
                              {((problemItem as any)?.tikz_code || (item as any)?.tikz_code) && (
                                <div className="mb-4">
                                  <TikZRenderer
                                    tikzCode={(problemItem as any)?.tikz_code || (item as any)?.tikz_code}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Choices */}
                            {item.choices && (
                              <div className="space-y-2 mb-4">
                                {item.choices.map((choice: string, choiceIndex: number) => {
                                  const choiceNumber = (choiceIndex + 1).toString();
                                  const isStudentAnswer = isEnglish
                                    ? answerStatus?.studentAnswer === choice
                                    : answerStatus?.studentAnswer === choiceNumber;
                                  const isCorrectAnswer = isEnglish
                                    ? answerStatus?.correctAnswer === choice
                                    : answerStatus?.correctAnswer === choiceNumber;

                                  let choiceStyle = 'p-3 rounded-lg border ';
                                  if (isCorrectAnswer) {
                                    choiceStyle += 'bg-green-100 border-green-300 text-green-800';
                                  } else if (isStudentAnswer && !isCorrectAnswer) {
                                    choiceStyle += 'bg-red-100 border-red-300 text-red-800';
                                  } else {
                                    choiceStyle += 'bg-gray-50 border-gray-200';
                                  }

                                  return (
                                    <div key={choiceIndex} className={choiceStyle}>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{choiceNumber}.</span>
                                          {isStudentAnswer && (
                                            <FaDotCircle
                                              className="text-blue-600 text-sm"
                                              title="학생이 선택한 답"
                                            />
                                          )}
                                          {isCorrectAnswer && (
                                            <FaCheckCircle
                                              className="text-green-600 text-sm"
                                              title="정답"
                                            />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          {isKorean ? (
                                            <span>{choice}</span>
                                          ) : isEnglish ? (
                                            <span>{choice}</span>
                                          ) : (
                                            <LaTeXRenderer content={choice || ''} />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* 영어 단답형/서술형 답안 표시 */}
                            {isEnglish && !item.choices && answerStatus && (
                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-sm text-gray-600 font-medium">
                                      학생 답안:
                                    </span>
                                    <div className="mt-1 p-2 bg-white rounded border">
                                      <p className="text-sm">
                                        {answerStatus.studentAnswer || '(답안 없음)'}
                                      </p>
                                    </div>
                                  </div>
                                  {answerStatus.correctAnswer !== '(수동 채점 필요)' && (
                                    <div>
                                      <span className="text-sm text-gray-600 font-medium">
                                        예시 답안:
                                      </span>
                                      <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                                        <p className="text-sm text-green-800">
                                          {answerStatus.correctAnswer}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {/* AI 피드백 표시 */}
                                  {answerStatus.aiFeedback && (
                                    <div>
                                      <span className="text-sm text-gray-600 font-medium">
                                        AI 채점 피드백:
                                      </span>
                                      <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                          {answerStatus.aiFeedback}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Answer Summary and Edit Controls */}
                            {answerStatus && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <FaDotCircle className="text-blue-600" />
                                      <span className="text-sm">
                                        학생 답안:{' '}
                                        <strong>
                                          {isKorean
                                            ? `${answerStatus.studentAnswer}번`
                                            : isEnglish
                                            ? answerStatus.studentAnswer || '(답안 없음)'
                                            : answerStatus.studentAnswer}
                                        </strong>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FaCheckCircle className="text-green-600" />
                                      <span className="text-sm">
                                        {isEnglish &&
                                        answerStatus.correctAnswer === '(수동 채점 필요)'
                                          ? '수동 채점:'
                                          : '정답:'}{' '}
                                        <strong>
                                          {isKorean
                                            ? `${answerStatus.correctAnswer}번`
                                            : answerStatus.correctAnswer}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>

                                  {/* 편집 모드에서 정답/오답 토글 버튼 */}
                                  {isEditMode ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleProblemCorrectness(problemId.toString())}
                                      className={`px-4 py-2 ${
                                        problemCorrectness[problemId.toString()] ??
                                        answerStatus.isCorrect
                                          ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                                          : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                                      }`}
                                    >
                                      {problemCorrectness[problemId.toString()] ??
                                      answerStatus.isCorrect
                                        ? '✓ 정답'
                                        : '✗ 오답'}
                                    </Button>
                                  ) : (
                                    <Badge
                                      variant={answerStatus.isCorrect ? 'default' : 'destructive'}
                                    >
                                      {answerStatus.isCorrect ? '정답' : '오답'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            {((isKorean && item.explanation) ||
                              (!isKorean && answerStatus?.explanation)) && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">해설</h4>
                                <div className="text-blue-800 text-sm">
                                  {isKorean ? (
                                    <p>{item.explanation}</p>
                                  ) : (
                                    <LaTeXRenderer content={answerStatus?.explanation || ''} />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p>세션 상세 정보를 불러오는 중...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* AI 채점 버튼 (수학 과제용만) */}
        {!isKorean && !isEnglish && (
          <Button
            onClick={handleStartAIGrading}
            disabled={isProcessingAI}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessingAI
              ? (taskProgress?.info?.status || (isEnglish ? 'AI 채점 중...' : 'OCR 처리중...')) +
                (taskProgress?.info?.current && taskProgress?.info?.total
                  ? ` (${taskProgress.info.current}%)`
                  : '')
              : isEnglish
              ? 'AI 채점 시작 (단답형/서술형)'
              : 'OCR + AI 채점 시작'}
          </Button>
        )}
      </div>

      {isLoading ? (
        <p>Loading results...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>학교/학년</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>점수</TableHead>
              <TableHead>완료일시</TableHead>
              <TableHead>채점 관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => {
              const finalScore =
                result.total_score !== undefined && result.total_score !== null
                  ? result.total_score
                  : 0;

              // 학생 ID로 실제 학생 정보 찾기 - 다양한 타입 변환 시도
              const studentId = result.student_id || result.graded_by;
              const student = studentId
                ? students.find(
                    (s) =>
                      s.id === studentId || // 직접 비교
                      s.id === parseInt(String(studentId)) || // 숫자로 변환
                      s.id.toString() === String(studentId) || // 문자열로 변환
                      s.username === String(studentId), // username으로도 시도
                  )
                : undefined;

              // 실제 학생 데이터의 name을 우선 사용
              const studentName =
                student?.name || result.student_name || result.graded_by || '알 수 없음';

              // 학교/학년 정보는 실제 학생 데이터에서 가져오기
              const schoolInfo = student
                ? `${student.school_level === 'middle' ? '중학교' : '고등학교'} ${
                    student.grade
                  }학년`
                : result.school !== '정보없음' && result.grade !== '정보없음'
                ? `${result.school} ${result.grade}`
                : '-';

              return (
                <TableRow
                  key={result.id || result.grading_session_id || index}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSessionClick(result)}
                >
                  <TableCell>{studentName}</TableCell>
                  <TableCell>{schoolInfo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        result.status === '완료' ||
                        result.status === 'final' ||
                        result.status === 'approved'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {result.status === '완료' ||
                      result.status === 'final' ||
                      result.status === 'approved'
                        ? '완료'
                        : '미완료'}
                    </Badge>
                  </TableCell>
                  <TableCell>{finalScore}/100</TableCell>
                  <TableCell>
                    {result.submitted_at
                      ? new Date(result.submitted_at).toLocaleString('ko-KR')
                      : result.graded_at
                      ? new Date(result.graded_at).toLocaleString('ko-KR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {result.status === '완료' ||
                    result.status === 'final' ||
                    result.status === 'approved' ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleSessionClick(result)}
                        >
                          편집
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => handleSessionClick(result)}
                        >
                          상세보기
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
