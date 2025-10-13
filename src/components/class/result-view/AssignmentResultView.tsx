'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { koreanService } from '@/services/koreanService';
import { mathService } from '@/services/mathService';
import { EnglishService } from '@/services/englishService';
import { classroomService } from '@/services/authService';
import { ArrowLeft } from 'lucide-react';
import type { StudentProfile } from '@/services/authService';
import type { AssignmentResult, SubjectType } from './types';
import { StudentResultList } from './StudentResultList';
import { ProblemCard } from './ProblemCard';
import { useAnswerStatus } from './useAnswerStatus';
import { useGradingLogic } from './useGradingLogic';

interface AssignmentResultViewProps {
  assignment: any;
  onBack: () => void;
}

export function AssignmentResultView({ assignment, onBack }: AssignmentResultViewProps) {
  const subject: SubjectType =
    assignment.question_type !== undefined || assignment.korean_type !== undefined
      ? 'korean'
      : assignment.problem_type !== undefined
      ? 'english'
      : 'math';

  const [results, setResults] = useState<AssignmentResult[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AssignmentResult | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [taskProgress, setTaskProgress] = useState<any>(null);

  const {
    isEditMode,
    setIsEditMode,
    problemCorrectness,
    hasChanges,
    initializeEditState,
    toggleProblemCorrectness,
    saveGradingChanges,
  } = useGradingLogic(subject, assignment, problems, sessionDetails, selectedSession);

  const { getAnswerStatus } = useAnswerStatus(
    subject,
    sessionDetails,
    problems,
    isEditMode,
    problemCorrectness
  );

  useEffect(() => {
    loadResults();
    loadProblems();
    loadStudents();
  }, [assignment.id]);

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

  useEffect(() => {
    if (sessionDetails) {
      initializeEditState();
      if (assignment.selectedStudentId && !isEditMode) {
        setIsEditMode(true);
      }
    }
  }, [sessionDetails, initializeEditState]);

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
      if (subject === 'korean') {
        data = await koreanService.getKoreanWorksheetProblems(assignment.worksheet_id);
        setProblems(data.problems);
      } else if (subject === 'english') {
        data = await EnglishService.getEnglishWorksheetDetail(assignment.worksheet_id);
        setProblems(data.worksheet_data.questions || []);
      } else {
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
      if (subject === 'korean') {
        data = await koreanService.getAssignmentResults(assignment.id);
      } else if (subject === 'english') {
        data = await EnglishService.getEnglishAssignmentResults(assignment.id);
      } else {
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

  const handleSessionClick = async (session: any) => {
    try {
      setSelectedSession(session);

      if (subject === 'korean') {
        try {
          const sessionId = session.id || session.grading_session_id;
          if (!sessionId) throw new Error('No valid session ID found');
          const details = await koreanService.getGradingSessionDetails(sessionId);
          setSessionDetails(details);
        } catch (error) {
          console.warn('Korean grading session details not available:', error);
          setSessionDetails({
            ...session,
            problem_results: session.problem_results || [],
          });
        }
      } else if (subject === 'english') {
        try {
          const resultId = session.result_id || session.grading_session_id || session.id;
          if (resultId) {
            const details = await EnglishService.getEnglishAssignmentResultDetail(
              resultId.toString(),
            );
            setSessionDetails(details);
            if (details.worksheet_data?.questions) {
              setProblems(details.worksheet_data.questions);
            }
          } else {
            setSessionDetails({
              ...session,
              answers: session.answers || [],
              questions: session.questions || [],
            });
          }
        } catch (error) {
          console.warn('English assignment result details not available:', error);
          setSessionDetails({
            ...session,
            answers: session.answers || [],
          });
        }
      } else {
        setSessionDetails(session);
      }
    } catch (error) {
      console.error('Failed to load session details:', error);
      alert('세션 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleBackToList = () => {
    if (assignment.selectedStudentId) {
      onBack();
    } else {
      setSelectedSession(null);
      setSessionDetails(null);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const poll = async () => {
      try {
        const status = await mathService.getTaskStatus(taskId);
        setTaskProgress(status);

        if (status.status === 'SUCCESS') {
          alert('OCR + AI 채점이 완료되었습니다.');
          setIsProcessingAI(false);
          setTaskProgress(null);
          loadResults();
        } else if (status.status === 'FAILURE') {
          alert(`채점 처리 실패: ${status.info?.error || '알 수 없는 오류'}`);
          setIsProcessingAI(false);
          setTaskProgress(null);
        } else if (status.status === 'PROGRESS') {
          setTimeout(poll, 2000);
        } else {
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

      if (subject === 'english') {
        await EnglishService.startEnglishAIGrading(assignment.worksheet_id);
        alert('영어 AI 채점이 시작되었습니다.');
        setIsProcessingAI(false);
        loadResults();
      } else {
        const result = await mathService.startAIGrading(assignment.id);
        if (result.task_id) {
          pollTaskStatus(result.task_id);
        } else {
          alert('OCR + AI 채점이 완료되었습니다.');
          setIsProcessingAI(false);
          loadResults();
        }
      }
    } catch (error) {
      console.error('AI grading error:', error);
      alert('채점 처리 중 오류가 발생했습니다.');
      setIsProcessingAI(false);
    }
  };

  const handleSaveChanges = () => {
    saveGradingChanges(() => {
      loadResults();
      if (selectedSession) {
        handleSessionClick(selectedSession);
      }
    });
  };

  if (selectedSession && sessionDetails) {
    const sortedProblems = (
      subject === 'english'
        ? sessionDetails.worksheet_data?.questions || []
        : subject === 'korean' || problems.length > 0
        ? problems
        : sessionDetails.problem_results || []
    ).sort((a: any, b: any) => {
      if (subject === 'korean') return a.sequence_order - b.sequence_order;
      if (subject === 'english') return (a.question_id || 0) - (b.question_id || 0);
      if (problems.length > 0) return (a.sequence_order || 0) - (b.sequence_order || 0);
      return a.problem_id - b.problem_id;
    });

    return (
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">
                {assignment.selectedStudentName || selectedSession.graded_by}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{assignment.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleSaveChanges} disabled={!hasChanges}>
                  저장
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditMode(true)}>
                채점 편집
              </Button>
            )}
          </div>
        </div>

        {/* 점수 요약 */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-600">점수</span>
                <p className="text-2xl font-bold">{sessionDetails.total_score || 0}점</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">맞은 문제</span>
                <p className="text-2xl font-bold">
                  {sessionDetails.correct_count || 0}/{problems.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 문제 목록 */}
        <div className="space-y-4">
          {sortedProblems.map((item: any, index: number) => {
            const problemId =
              subject === 'korean'
                ? item.id
                : subject === 'english'
                ? item.question_id
                : problems.length > 0
                ? item.id
                : item.problem_id;

            const problemNumber =
              subject === 'korean'
                ? item.sequence_order
                : subject === 'english'
                ? item.question_id
                : problems.length > 0
                ? item.sequence_order || index + 1
                : index + 1;

            const answerStatus = getAnswerStatus(problemId.toString());

            return (
              <ProblemCard
                key={problemId}
                problemNumber={problemNumber}
                problem={item}
                answerStatus={answerStatus}
                subject={subject}
                isEditMode={isEditMode}
                problemCorrectness={problemCorrectness}
                onToggleCorrectness={toggleProblemCorrectness}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded transition-colors mr-3">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{assignment.title}</h1>
      </div>

      <StudentResultList
        results={results}
        students={students}
        isLoading={isLoading}
        onSelectResult={handleSessionClick}
        onStartAIGrading={subject !== 'korean' ? handleStartAIGrading : undefined}
        isProcessingAI={isProcessingAI}
        taskProgress={taskProgress}
        subject={subject}
      />
    </div>
  );
}
