'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { useAuth } from '@/contexts/AuthContext';
import { Worksheet, MathProblem, ProblemType, Subject } from '@/types/math';
import { KoreanWorksheet, KoreanProblem } from '@/types/korean';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EnglishService } from '@/services/englishService';
import { useSearchParams } from 'next/navigation';
import { studentClassService } from '@/services/authService';

// Dynamic imports for heavy components
const ScratchpadModal = dynamic(
  () => import('@/components/ScratchpadModal').then((mod) => ({ default: mod.ScratchpadModal })),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  },
);

const AssignmentList = dynamic(
  () => import('@/components/test/AssignmentList').then((mod) => ({ default: mod.AssignmentList })),
  {
    loading: () => (
      <div className="w-1/3 bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse h-full bg-gray-200 rounded"></div>
      </div>
    ),
  },
);

const TestInterface = dynamic(
  () => import('@/components/test/TestInterface').then((mod) => ({ default: mod.TestInterface })),
  {
    loading: () => (
      <div className="w-2/3 bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse h-full bg-gray-200 rounded"></div>
      </div>
    ),
  },
);

const KoreanTestInterface = dynamic(
  () =>
    import('@/components/test/KoreanTestInterface').then((mod) => ({
      default: mod.KoreanTestInterface,
    })),
  {
    loading: () => (
      <div className="w-2/3 bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse h-full bg-gray-200 rounded"></div>
      </div>
    ),
  },
);

const EnglishTestInterface = dynamic(
  () =>
    import('@/components/test/EnglishTestInterface').then((mod) => ({
      default: mod.EnglishTestInterface,
    })),
  {
    loading: () => (
      <div className="w-2/3 bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse h-full bg-gray-200 rounded"></div>
      </div>
    ),
  },
);

const StudentResultView = dynamic(
  () =>
    import('@/components/test/StudentResultView').then((mod) => ({
      default: mod.StudentResultView,
    })),
  {
    loading: () => (
      <div className="w-2/3 bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse h-full bg-gray-200 rounded"></div>
      </div>
    ),
  },
);

function TestPageContent() {
  const { userProfile } = useAuth();
  const searchParams = useSearchParams();
  const [worksheets, setWorksheets] = useState<(Worksheet | KoreanWorksheet)[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | KoreanWorksheet | null>(
    null,
  );
  const [worksheetProblems, setWorksheetProblems] = useState<(MathProblem | KoreanProblem)[]>([]);
  const [englishPassages, setEnglishPassages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('국어');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60분 (초 단위)
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [testSession, setTestSession] = useState<any>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentResult, setShowStudentResult] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  // 클래스 관련 state
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // 과제 자동 선택을 위한 state
  const [pendingAssignment, setPendingAssignment] = useState<{
    assignmentId: string;
    assignmentTitle: string;
    subject: string;
    viewResult: string;
  } | null>(null);

  // 문제 유형을 한국어로 변환
  const getProblemTypeInKorean = (type: string): string => {
    if (!type) return '객관식'; // 기본값

    switch (type.toLowerCase()) {
      case ProblemType.MULTIPLE_CHOICE:
      case '객관식':
        return '객관식';

      case ProblemType.SHORT_ANSWER:
      case '단답형':
        return '단답형';
      default:
        return type;
    }
  };

  // 클래스 목록 로드
  const loadClasses = async () => {
    if (!userProfile?.id) return;

    try {
      const classrooms = await studentClassService.getMyClasses();
      console.log('📚 로드된 클래스 목록:', classrooms);
      const classData = classrooms.map((classroom: any) => ({
        id: classroom.id.toString(),
        name: classroom.name || `클래스 ${classroom.id}`,
      }));
      setClasses(classData);
      console.log('✅ 클래스 데이터 설정 완료:', classData);
    } catch (error) {
      console.error('❌ 클래스 목록 로드 실패:', error);
    }
  };

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (userProfile?.id) {
        // 과목 변경 시 상태 초기화
        setSelectedWorksheet(null);
        setWorksheetProblems([]);
        setShowStudentResult(false);
        setIsTestStarted(false);
        setTestSession(null);
        setAnswers({});
        setCurrentProblemIndex(0);
        setSessionDetails(null);

        // pendingAssignment 초기화 (탭 변경 시 자동 선택 방지)
        // URL 파라미터가 있는 경우에만 유지
        if (!searchParams.get('assignmentId')) {
          setPendingAssignment(null);
        }

        // 클래스 목록을 먼저 로드
        await loadClasses();

        // 그 다음 과제 목록 로드 (클래스 정보를 사용)
        await loadWorksheets();
      }
    };

    loadData();
  }, [selectedSubject, userProfile]);

  // localStorage 확인 - 주기적으로 체크 (뒤로가기 대응)
  useEffect(() => {
    const checkStorage = () => {
      // URL 파라미터가 있으면 스킵
      const urlAssignmentId = searchParams.get('assignmentId');
      if (urlAssignmentId) {
        return;
      }

      try {
        const storedData = localStorage.getItem('selectedAssignment');
        if (storedData) {
          const data = JSON.parse(storedData);

          // 기존과 다른 ID면 업데이트
          if (!pendingAssignment || pendingAssignment.assignmentId !== data.assignmentId) {
            setPendingAssignment({
              assignmentId: data.assignmentId,
              assignmentTitle: data.assignmentTitle,
              subject: data.subject,
              viewResult: data.viewResult,
            });
          }

          // localStorage 삭제
          localStorage.removeItem('selectedAssignment');
        }
      } catch (e) {
        console.error('localStorage 읽기 실패:', e);
      }
    };

    // 주기적으로 확인 (300ms마다)
    const interval = setInterval(checkStorage, 300);

    return () => clearInterval(interval);
  }, [searchParams, pendingAssignment]);

  // URL 파라미터 또는 pendingAssignment에서 과제 자동 선택
  useEffect(() => {
    // 1. URL 파라미터 확인
    let assignmentId = searchParams.get('assignmentId');
    let assignmentTitle = searchParams.get('assignmentTitle');
    let subject = searchParams.get('subject');
    let viewResult = searchParams.get('viewResult');

    // 2. URL 파라미터가 없으면 pendingAssignment 사용
    if (!assignmentId && pendingAssignment) {
      assignmentId = pendingAssignment.assignmentId;
      assignmentTitle = pendingAssignment.assignmentTitle;
      subject = pendingAssignment.subject;
      viewResult = pendingAssignment.viewResult;
    }

    if (assignmentId && assignmentTitle && worksheets.length > 0) {
      // 과목이 지정된 경우 해당 과목으로 변경
      if (subject && subject !== selectedSubject) {
        setSelectedSubject(subject);
        return; // 과목이 변경되면 loadWorksheets가 다시 호출됨
      }

      const targetWorksheet = worksheets.find((w) => {
        const idMatch = w.id.toString() === assignmentId?.toString();

        // worksheet 객체에서 과목 확인
        let worksheetSubject = '';
        if ('korean_type' in w) worksheetSubject = '국어';
        else if ('unit_name' in w && 'semester' in w) worksheetSubject = '수학';
        else if ('worksheet_subject' in w || 'total_questions' in w) worksheetSubject = '영어';

        const subjectMatch = !subject || worksheetSubject === subject;

        const match = idMatch && subjectMatch;

        return match;
      });

      // 찾은 과제를 선택하고 바로 처리
      if (targetWorksheet) {
        console.log('🎯 과제 자동 선택:', targetWorksheet);

        // setSelectedWorksheet 대신 handleWorksheetSelect를 바로 호출
        handleWorksheetSelect(targetWorksheet);

        // 자동 선택 후 pendingAssignment 초기화 (한 번만 실행되도록)
        setPendingAssignment(null);
      }
    }
  }, [worksheets, searchParams, selectedSubject, pendingAssignment]);

  // 타이머 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          alert('과제 시간이 종료되었습니다.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadWorksheets = async () => {
    setIsLoading(true);
    try {
      // 학생용 과제 목록 가져오기
      if (!userProfile?.id) {
        return;
      }

      let assignmentData: any[] = [];

      if (selectedSubject === '수학') {
        try {
          assignmentData = await mathService.getStudentAssignments(userProfile.id);
          console.log('📊 수학 과제 데이터:', assignmentData);
        } catch (error) {
          console.error('수학 과제 로드 실패:', error);
        }
      } else if (selectedSubject === '국어') {
        try {
          assignmentData = await koreanService.getStudentAssignments(userProfile.id);
          console.log('📖 국어 과제 데이터:', assignmentData);
        } catch (error) {
          console.error('국어 과제 로드 실패:', error);
        }
      } else if (selectedSubject === '영어') {
        try {
          assignmentData = await EnglishService.getStudentAssignments(userProfile.id);
          console.log('🔤 영어 과제 데이터:', assignmentData);
        } catch (error) {
          console.error('영어 과제 로드 실패:', error);
        }
      }

      // 과제 데이터를 워크시트 형식으로 변환
      const worksheetData = await Promise.all(
        assignmentData.map(async (assignment: any) => {
          let score: number | undefined = undefined;

          // 응시 완료된 과제인 경우 점수 정보 가져오기
          if (assignment.status === 'completed' || assignment.status === 'submitted') {
            try {
              const assignmentId = assignment.assignment?.id || assignment.assignment_id;
              let results;

              if (selectedSubject === Subject.MATH) {
                results = await mathService.getAssignmentResults(assignmentId);
              } else if (selectedSubject === '국어') {
                results = await koreanService.getAssignmentResults(assignmentId);
              } else if (selectedSubject === '영어') {
                results = await EnglishService.getEnglishAssignmentResults(assignmentId);
              }

              // results에서 현재 학생의 점수 찾기
              let resultsArray = results;

              // results가 객체이고 results 필드를 가진 경우 추출
              if (results && typeof results === 'object' && 'results' in results) {
                resultsArray = (results as any).results;
              }

              if (resultsArray && Array.isArray(resultsArray)) {
                // student_id가 다양한 형식으로 올 수 있으므로 유연하게 비교
                const myResult = resultsArray.find((r: any) => {
                  const resultStudentId = r.student_id || r.graded_by;
                  return (
                    resultStudentId === userProfile.id ||
                    resultStudentId === userProfile.id.toString() ||
                    parseInt(String(resultStudentId)) === userProfile.id
                  );
                });

                if (myResult) {
                  // total_score 또는 score 필드에서 점수 가져오기
                  score = myResult.total_score ?? myResult.score;
                }
              }
            } catch (error) {
              console.error('점수 정보 로드 실패:', error);
            }
          }

          // 과제 원본 데이터 전체 로깅 (디버깅용)
          console.log(`📝 과제 원본 데이터 (${selectedSubject}):`, {
            전체_객체: assignment,
            모든_키: Object.keys(assignment),
            각_필드값: Object.entries(assignment).reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {} as any),
          });

          // classroom_id 추출 - 가능한 모든 필드 확인
          const classroomId =
            assignment.classroom_id ||
            assignment.deployment?.classroom_id ||
            assignment.assignment?.classroom_id ||
            assignment.class_id ||
            assignment.classroomId ||
            assignment.room_id;

          console.log(`🔍 classroom_id 추출 시도:`, {
            title: assignment.title || assignment.assignment?.title,
            찾은_값: classroomId,
            시도한_필드들: {
              'assignment.classroom_id': assignment.classroom_id,
              'assignment.class_id': assignment.class_id,
              'assignment.classroomId': assignment.classroomId,
              'assignment.room_id': assignment.room_id,
            },
          });

          if (selectedSubject === '국어') {
            return {
              id: assignment.assignment_id,
              title: assignment.title,
              unit_name: assignment.unit_name || assignment.korean_type || '',
              chapter_name: assignment.chapter_name || assignment.korean_type || '',
              korean_type: assignment.korean_type || '소설',
              problem_count: assignment.problem_count,
              status: assignment.status,
              deployed_at: assignment.deployed_at,
              created_at: assignment.deployed_at,
              school_level: '중학교', // 기본값
              grade: 1, // 기본값
              subject: selectedSubject, // 과목 정보 추가
              score, // 점수 추가
              classroom_id: classroomId?.toString(), // 클래스 ID 추가
            } as KoreanWorksheet & { classroom_id?: string };
          } else if (selectedSubject === '영어') {
            return {
              id: assignment.assignment?.id || assignment.assignment_id,
              title: assignment.assignment?.title || assignment.title,
              unit_name: assignment.assignment?.problem_type || '',
              chapter_name: assignment.assignment?.problem_type || '',
              problem_count: assignment.assignment?.total_questions || assignment.total_questions,
              status: assignment.deployment?.status || assignment.status,
              deployed_at: assignment.deployment?.deployed_at || assignment.deployed_at,
              created_at: assignment.assignment?.created_at || assignment.created_at,
              school_level: '중학교', // 기본값
              grade: 1, // 기본값
              semester: 1, // 기본값
              subject: selectedSubject, // 과목 정보 추가
              score, // 점수 추가
              classroom_id: classroomId?.toString(), // 클래스 ID 추가
            } as Worksheet & { classroom_id?: string };
          } else {
            return {
              id: assignment.assignment_id,
              title: assignment.title,
              unit_name: assignment.unit_name || assignment.korean_type || '',
              chapter_name: assignment.chapter_name || assignment.korean_type || '',
              problem_count: assignment.problem_count,
              status: assignment.status,
              deployed_at: assignment.deployed_at,
              created_at: assignment.deployed_at,
              school_level: '중학교', // 기본값
              grade: 1, // 기본값
              semester: 1, // 기본값
              subject: selectedSubject, // 과목 정보 추가
              score, // 점수 추가
              classroom_id: classroomId?.toString(), // 클래스 ID 추가
            } as Worksheet & { classroom_id?: string };
          }
        }),
      );

      // 각 클래스별 배포를 개별 과제로 유지 (중복 제거 안함)
      setWorksheets(worksheetData);

      // 클래스별 과제 분포 요약
      const classDistribution: Record<string, number> = {};
      const classDetails: Record<string, string[]> = {};

      worksheetData.forEach((ws) => {
        const classId = (ws as any).classroom_id;
        if (classId) {
          const classIdStr = classId.toString();
          classDistribution[classIdStr] = (classDistribution[classIdStr] || 0) + 1;

          if (!classDetails[classIdStr]) {
            classDetails[classIdStr] = [];
          }
          classDetails[classIdStr].push(ws.title);
        }
      });

      console.log('📊 과제 로드 완료 요약:', {
        총_과제수: worksheetData.length,
        과목: selectedSubject,
        클래스별_분포: classDistribution,
        클래스별_과제_목록: classDetails,
        현재_클래스_목록: classes.map((c) => `${c.name}(ID: ${c.id})`),
      });

      // 처음에는 아무것도 선택하지 않음
      setSelectedWorksheet(null);
    } catch (error: any) {
      let errorMessage = '과제 데이터를 불러올 수 없습니다.';
      if (error.status === 404) {
        errorMessage = '과제가 배포되지 않았거나 접근 권한이 없습니다.';
      } else if (error.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      } else if (error.message) {
        errorMessage = `과제 데이터를 불러올 수 없습니다: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 워크시트의 문제들 로드
  const loadWorksheetProblems = async (worksheetId: number) => {
    try {
      // 학생용 과제 상세 정보 가져오기

      if (!userProfile?.id) {
        return;
      }

      let assignmentDetail;
      if (selectedSubject === '수학') {
        assignmentDetail = await mathService.getAssignmentDetail(worksheetId, userProfile.id);
      } else if (selectedSubject === '국어') {
        assignmentDetail = await koreanService.getAssignmentDetail(worksheetId, userProfile.id);
      } else if (selectedSubject === '영어') {
        try {
          assignmentDetail = await EnglishService.getAssignmentDetail(worksheetId, userProfile.id);
        } catch (error) {
          setError('영어 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          return;
        }
      } else {
        setError('해당 과목은 아직 지원되지 않습니다.');
        return;
      }

      // 과목별로 다른 필드명 사용
      let problems = [];
      if (selectedSubject === '영어') {
        problems = assignmentDetail?.questions || [];

        // 영어 지문 데이터 저장
        const passages = assignmentDetail?.passages || [];
        setEnglishPassages(passages);
      } else {
        problems = assignmentDetail?.problems || [];

        // 영어가 아닌 경우 지문 데이터 초기화
        setEnglishPassages([]);
      }

      // 응답 구조 확인
      if (assignmentDetail) {
        if (problems.length > 0) {
        }
      }

      if (!problems || problems.length === 0) {
        setError('과제에 문제가 없습니다. 선생님에게 문의하세요.');
      }

      setWorksheetProblems(problems);
    } catch (error: any) {}
  };

  // 문제지 선택 핸들러
  const handleWorksheetSelect = async (worksheet: Worksheet | KoreanWorksheet) => {
    // pendingAssignment 초기화 (수동 선택 시 자동 선택 방지)
    setPendingAssignment(null);

    setSelectedWorksheet(worksheet);

    // Check if this is a completed assignment (completed 또는 submitted 상태)
    const isCompleted =
      (worksheet as any).status === 'completed' || (worksheet as any).status === 'submitted';

    if (isCompleted && userProfile) {
      // Show result view for completed assignments - still need to load problems for display
      await loadWorksheetProblems(worksheet.id);
      setShowStudentResult(true);
    } else {
      // Load problems for new assignments
      await loadWorksheetProblems(worksheet.id);
      setShowStudentResult(false);
    }

    setCurrentProblemIndex(0);
    setAnswers({});
    setIsTestStarted(false);
    setTestSession(null);
    setTestResult(null);
  };

  // 결과 보기에서 돌아가기
  const handleBackFromResult = () => {
    // pendingAssignment 초기화 (돌아가기 후 자동 선택 방지)
    setPendingAssignment(null);

    setShowStudentResult(false);
    setSelectedWorksheet(null);
    setWorksheetProblems([]);
  };

  // 과제 시작
  const startTest = async () => {
    if (!selectedWorksheet || !userProfile?.id) return;

    try {
      setIsLoading(true);

      if (selectedSubject === '국어') {
        // 국어는 세션 없이 바로 시작
        setIsTestStarted(true);
      } else if (selectedSubject === '영어') {
        // 영어는 세션 없이 바로 시작 (국어와 동일)
        setIsTestStarted(true);
      } else {
        // 수학은 세션 기반으로 시작
        const session = await mathService.startTest(selectedWorksheet.id, userProfile.id);

        // 세션 데이터를 로컬 스토리지에 저장
        localStorage.setItem(
          `${session.session_id}_data`,
          JSON.stringify({
            worksheet_id: selectedWorksheet.id,
            worksheet_title: selectedWorksheet.title,
            problems: worksheetProblems,
          }),
        );

        setTestSession(session);
        setIsTestStarted(true);
      }
    } catch (error: any) {
      setError('과제를 시작할 수 없습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 답안 입력 핸들러
  const handleAnswerChange = async (problemId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [problemId]: answer,
    }));

    // 백엔드에 답안 임시 저장 (수학 과제이고 세션이 있는 경우에만)
    if (selectedSubject === Subject.MATH && testSession && isTestStarted) {
      try {
        // 모든 답안을 일반 저장으로 처리 (손글씨 이미지 포함)
        await mathService.saveAnswer(testSession.session_id, problemId, answer);
        console.log('수학 답안 임시 저장 완료:', {
          problemId,
          answerType: answer.startsWith('data:image/') ? '손글씨 이미지' : '텍스트',
          preview: answer.substring(0, 50),
        });
      } catch (error) {
        console.error('답안 저장 실패:', error);
        // 실패해도 UI는 정상 작동하도록 함
      }
    } else if (selectedSubject === '국어') {
      console.log('국어 답안 로컬 저장:', { problemId, answer });
      // 국어는 로컬에만 저장 (임시)
    }
  };

  // OCR 처리 핸들러
  const handleOCRCapture = async (problemId: number, imageBlob: Blob) => {
    if (!testSession || selectedSubject !== Subject.MATH) {
      return;
    }

    try {
      // Convert blob to File
      const file = new File([imageBlob], `handwriting_${problemId}.png`, { type: 'image/png' });

      // Submit with OCR processing
      const result = await mathService.submitAnswerWithOCR(
        testSession.session_id,
        problemId,
        answers[problemId] || '',
        file,
      );

      // If OCR returns text, update the answer
      if (result.extracted_text) {
        handleAnswerChange(problemId, result.extracted_text);
      }
    } catch (error) {
      alert('손글씨 인식에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 다음 문제로 이동
  const goToNextProblem = () => {
    if (currentProblemIndex < worksheetProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  // 이전 문제로 이동
  const goToPreviousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  // 과제 제출
  const submitTest = async () => {
    if (!isTestStarted) {
      alert('과제를 먼저 시작해주세요.');
      return;
    }

    const answeredCount = Object.keys(answers).length;
    const totalProblems = worksheetProblems.length;

    // 모든 문제를 풀어야만 제출 가능하도록 변경
    if (answeredCount < totalProblems) {
      alert(
        `모든 문제를 풀어야 제출할 수 있습니다.\n현재 ${answeredCount}/${totalProblems}개 문제를 풀었습니다.\n남은 문제: ${
          totalProblems - answeredCount
        }개`,
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (selectedSubject === Subject.MATH && testSession) {
        // 수학 과제 제출
        const result = await mathService.submitTest(testSession.session_id, answers);
        setTestResult(result);
        setShowResultModal(true);

        // 과제 목록 새로 불러오기 (상태 업데이트 반영)
        await loadWorksheets();
      } else if (selectedSubject === '국어') {
        // 국어 과제 제출
        if (!selectedWorksheet || !userProfile) return;
        const result = await koreanService.submitTest(
          selectedWorksheet.id,
          userProfile.id,
          answers,
        );
        setTestResult(result);
        setShowResultModal(true);

        // 과제 목록 새로 불러오기 (상태 업데이트 반영)
        await loadWorksheets();
      } else if (selectedSubject === '영어') {
        // 영어 과제 제출
        if (!selectedWorksheet || !userProfile) return;
        try {
          const result = await EnglishService.submitTest(
            selectedWorksheet.id,
            userProfile.id,
            answers,
          );
          setTestResult(result);
          setShowResultModal(true);

          // 과제 목록 새로 불러오기 (상태 업데이트 반영)
          await loadWorksheets();
        } catch (error) {
          alert('영어 과제 제출에 실패했습니다. 다시 시도해주세요.');
          return;
        }
      }

      setIsTestStarted(false);
      // 제출 후 pendingAssignment 초기화
      setPendingAssignment(null);
    } catch (error: any) {
      setError('과제 제출에 실패했습니다: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const currentProblem = worksheetProblems[currentProblemIndex];

  // 결과 데이터를 기반으로 답안 상태를 가져오는 함수
  const getAnswerStatus = (problemId: string) => {
    if (!showStudentResult || !selectedWorksheet || !sessionDetails) return null;

    // 문제 ID로 답안 상태 찾기
    const problem = worksheetProblems.find(
      (p) =>
        (p as any).id?.toString() === problemId || (p as any).question_id?.toString() === problemId,
    );

    if (!problem) return null;

    // 실제 결과 데이터에서 답안 상태 가져오기
    // 과목별로 다른 로직 적용
    if (selectedSubject === '국어') {
      // 국어의 경우 - sessionDetails에서 문제 결과 찾기
      const problemResult = sessionDetails.problem_results?.find(
        (pr: any) => pr.problem_id?.toString() === problemId || pr.id?.toString() === problemId,
      );

      const correctAnswer = (problem as any).correct_answer || (problem as any).answer; // 문제지의 실제 정답
      const studentAnswer =
        problemResult?.user_answer || problemResult?.student_answer || problemResult?.answer || '-'; // 학생이 선택한 답안
      const isCorrect =
        problemResult?.is_correct !== undefined
          ? problemResult.is_correct
          : studentAnswer === correctAnswer;

      return {
        studentAnswer: studentAnswer, // 학생이 선택한 답안
        correctAnswer: correctAnswer, // 문제지의 실제 정답
        isCorrect: isCorrect,
        aiFeedback: problemResult?.ai_feedback || '',
        explanation: problemResult?.explanation || '',
      };
    } else if (selectedSubject === '영어') {
      // 영어의 경우 - sessionDetails에서 문제 결과 찾기
      const questionResult = sessionDetails.question_results?.find(
        (qr: any) => qr.question_id?.toString() === problemId,
      );

      const correctAnswer = (problem as any).correct_answer || (problem as any).answer; // 문제지의 실제 정답
      const studentAnswer =
        questionResult?.user_answer ||
        questionResult?.student_answer ||
        questionResult?.answer ||
        '-'; // 학생이 선택한 답안
      const isCorrect =
        questionResult?.is_correct !== undefined
          ? questionResult.is_correct
          : studentAnswer === correctAnswer;

      return {
        studentAnswer: studentAnswer, // 학생이 선택한 답안
        correctAnswer: correctAnswer, // 문제지의 실제 정답
        isCorrect: isCorrect,
        aiFeedback: questionResult?.ai_feedback || '',
        explanation: questionResult?.explanation || '',
      };
    } else if (selectedSubject === '수학') {
      // 수학의 경우 - sessionDetails에서 문제 결과 찾기
      const problemResult = sessionDetails.problem_results?.find(
        (pr: any) => pr.problem_id?.toString() === problemId,
      );

      const correctAnswer = (problem as any).correct_answer || (problem as any).answer; // 문제지의 실제 정답
      const studentAnswer =
        problemResult?.user_answer || problemResult?.student_answer || problemResult?.answer || '-'; // 학생이 선택한 답안
      const isCorrect =
        problemResult?.is_correct !== undefined
          ? problemResult.is_correct
          : studentAnswer === correctAnswer;

      return {
        studentAnswer: studentAnswer, // 학생이 선택한 답안
        correctAnswer: correctAnswer, // 문제지의 실제 정답
        isCorrect: isCorrect,
        aiFeedback: problemResult?.ai_feedback || '',
        explanation: problemResult?.explanation || '',
      };
    }

    return null;
  };

  // 검색 및 클래스 필터링된 과제 목록
  const filteredWorksheets = worksheets.filter((worksheet) => {
    // 검색어 필터링
    const matchesSearch = worksheet.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 클래스 필터링
    const selectedClassStr = selectedClass?.toString();

    if (selectedClassStr === 'all') {
      return matchesSearch;
    }

    // classroom_id가 선택한 클래스와 일치하는지 확인
    const worksheetClassId = (worksheet as any).classroom_id;
    const matchesClass = worksheetClassId?.toString() === selectedClassStr;

    return matchesSearch && matchesClass;
  });

  // 필터링 결과 요약 (클래스 선택 변경 시)
  React.useEffect(() => {
    if (worksheets.length > 0) {
      const selectedClassName =
        selectedClass === 'all'
          ? '전체'
          : classes.find((c) => c.id === selectedClass)?.name || selectedClass;

      console.log(`🔍 필터링 적용:`, {
        선택된_클래스: selectedClassName,
        클래스_ID: selectedClass,
        클래스_ID_타입: typeof selectedClass,
        전체_과제: worksheets.length,
        필터링된_과제: filteredWorksheets.length,
        검색어: searchTerm || '없음',
      });

      // 전체 과제의 클래스 정보 출력
      console.log(
        '📋 전체 과제의 클래스 정보:',
        worksheets.map((w) => ({
          제목: w.title,
          클래스ID: (w as any).classroom_id,
          클래스ID_문자열: (w as any).classroom_id?.toString(),
        })),
      );

      // 필터링된 과제의 클래스 분포
      if (selectedClass !== 'all') {
        console.log(
          `📋 필터링 결과:`,
          filteredWorksheets.map((w) => ({
            제목: w.title,
            클래스ID: (w as any).classroom_id,
            매칭여부: (w as any).classroom_id?.toString() === selectedClass?.toString(),
          })),
        );
      }
    }
  }, [selectedClass, filteredWorksheets.length, worksheets.length, searchTerm]);

  return (
    <div className="flex flex-col h-screen p-5 gap-5">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<CheckCircle />}
        title="과제 풀이"
        variant="question"
        description="배포된 과제를 확인하고 풀이할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* 배포된 문제지 목록 */}
          <AssignmentList
            worksheets={filteredWorksheets as Worksheet[]}
            selectedWorksheet={selectedWorksheet as Worksheet}
            worksheetProblems={worksheetProblems as MathProblem[]}
            worksheetEnglishProblems={
              selectedSubject === '영어' ? (worksheetProblems as any[]) : []
            }
            isTestStarted={isTestStarted}
            answers={answers}
            currentProblemIndex={currentProblemIndex}
            testResult={testResult}
            searchTerm={searchTerm}
            selectedSubject={selectedSubject}
            selectedClass={selectedClass}
            classes={classes}
            onWorksheetSelect={handleWorksheetSelect}
            onProblemSelect={setCurrentProblemIndex}
            onShowResult={() => setShowResultModal(true)}
            onRefresh={loadWorksheets}
            onSearchChange={setSearchTerm}
            onSubjectChange={setSelectedSubject}
            onClassChange={setSelectedClass}
            getProblemTypeInKorean={getProblemTypeInKorean}
            showStudentResult={showStudentResult}
            resultProblems={worksheetProblems}
            getAnswerStatus={getAnswerStatus}
          />

          {/* 문제 풀이 화면 */}
          {(() => {
            if (showStudentResult && selectedWorksheet && userProfile) {
              // Determine subject based on selectedSubject
              let subject: 'korean' | 'math' | 'english' = 'korean';
              if (selectedSubject === '수학') {
                subject = 'math';
              } else if (selectedSubject === '영어') {
                subject = 'english';
              }

              return (
                <div className="w-2/3 h-full">
                <StudentResultView
                  assignmentId={selectedWorksheet.id}
                  studentId={userProfile.id}
                  assignmentTitle={selectedWorksheet.title}
                  onBack={handleBackFromResult}
                  problems={worksheetProblems}
                  subject={subject}
                    selectedWorksheet={selectedWorksheet}
                    onGetAnswerStatus={getAnswerStatus}
                    onSessionDetailsChange={setSessionDetails}
                    currentProblemIndex={currentProblemIndex}
                    onProblemIndexChange={setCurrentProblemIndex}
                  />
                </div>
              );
            }
            return null;
          })()}

          {selectedWorksheet && !isTestStarted && !showStudentResult && (
            <Card className="w-2/3 h-full flex items-center justify-center shadow-sm overflow-y-auto">
              <div className="text-center py-20">
                <div className="text-gray-700 text-lg font-medium mb-2">
                  {selectedWorksheet.title}
                </div>
                <div className="text-gray-500 text-sm mb-4">
                  문제 수: {worksheetProblems.length}개 | 제한 시간: 60분
                </div>
                {(selectedWorksheet as any).status === 'completed' ||
                (selectedWorksheet as any).status === 'submitted' ? (
                  <div className="text-orange-600 text-sm mb-6">
                    이미 완료된 과제입니다. 결과를 확인하려면 과제를 다시 클릭하세요.
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm mb-6">
                    "과제 시작하기" 버튼을 눌러 과제를 시작하세요
                  </div>
                )}
                {worksheetProblems.length > 0 &&
                  (selectedWorksheet as any).status !== 'completed' &&
                  (selectedWorksheet as any).status !== 'submitted' && (
                    <Button
                      onClick={startTest}
                      disabled={isLoading}
                      className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
                    >
                      {isLoading ? '시작 중...' : '문제 풀기'}
                    </Button>
                  )}
                {((selectedWorksheet as any).status === 'completed' ||
                  (selectedWorksheet as any).status === 'submitted') && (
                  <Button
                    onClick={() => handleWorksheetSelect(selectedWorksheet)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    결과 보기
                  </Button>
                )}
              </div>
            </Card>
          )}

          {selectedWorksheet &&
            currentProblem &&
            isTestStarted && (
            <div className="w-2/3 h-full">
              {selectedSubject === '국어' ? (
              <KoreanTestInterface
                selectedWorksheet={selectedWorksheet as KoreanWorksheet}
                currentProblem={currentProblem as KoreanProblem}
                worksheetProblems={worksheetProblems as KoreanProblem[]}
                currentProblemIndex={currentProblemIndex}
                answers={answers}
                timeRemaining={timeRemaining}
                isSubmitting={isSubmitting}
                onAnswerChange={handleAnswerChange}
                onPreviousProblem={goToPreviousProblem}
                onNextProblem={goToNextProblem}
                onSubmitTest={submitTest}
                onBackToAssignmentList={() => {
                  setPendingAssignment(null);
                  setIsTestStarted(false);
                  setTestSession(null);
                  setCurrentProblemIndex(0);
                  setAnswers({});
                }}
                formatTime={formatTime}
              />
            ) : selectedSubject === '영어' ? (
              <EnglishTestInterface
                selectedWorksheet={selectedWorksheet as any}
                currentProblem={currentProblem as any}
                worksheetProblems={worksheetProblems as any[]}
                passages={englishPassages}
                currentProblemIndex={currentProblemIndex}
                answers={answers}
                timeRemaining={timeRemaining}
                isSubmitting={isSubmitting}
                onAnswerChange={handleAnswerChange}
                onPreviousProblem={goToPreviousProblem}
                onNextProblem={goToNextProblem}
                onSubmitTest={submitTest}
                onBackToAssignmentList={() => {
                  setPendingAssignment(null);
                  setIsTestStarted(false);
                  setTestSession(null);
                  setCurrentProblemIndex(0);
                  setAnswers({});
                }}
                formatTime={formatTime}
              />
            ) : (
              <TestInterface
                selectedWorksheet={selectedWorksheet as Worksheet}
                currentProblem={currentProblem as MathProblem}
                worksheetProblems={worksheetProblems as MathProblem[]}
                currentProblemIndex={currentProblemIndex}
                answers={answers}
                timeRemaining={timeRemaining}
                isSubmitting={isSubmitting}
                onAnswerChange={handleAnswerChange}
                onPreviousProblem={goToPreviousProblem}
                onNextProblem={goToNextProblem}
                onSubmitTest={submitTest}
                onBackToAssignmentList={() => {
                  setPendingAssignment(null);
                  setIsTestStarted(false);
                  setTestSession(null);
                  setCurrentProblemIndex(0);
                  setAnswers({});
                }}
                getProblemTypeInKorean={getProblemTypeInKorean}
                formatTime={formatTime}
                onOCRCapture={handleOCRCapture}
              />
              )}
            </div>
          )}

          {!selectedWorksheet && (
            <Card className="w-2/3 h-full flex items-center justify-center shadow-sm">
              <div className="text-center py-20">
                {testResult ? (
                  <>
                    <div className="text-green-400 text-lg mb-2">✅</div>
                    <div className="text-gray-700 text-lg font-medium mb-2">과제 완료!</div>
                    <div className="text-gray-500 text-sm">결과가 왼쪽에 표시됩니다</div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-500 text-sm">응시할 과제를 선택하세요.</div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-red-200 p-4 max-w-md z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">⚠️ 문제가 발생했습니다</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div>• 학생이 클래스에 가입되어 있는지 확인하세요</div>
                <div>• 선생님이 과제를 배포했는지 확인하세요</div>
                <div>• 브라우저 개발자 도구의 콘솔을 확인하세요</div>
              </div>
            </div>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* 연습장 모달 */}
      {currentProblem && (
        <ScratchpadModal
          isOpen={scratchpadOpen}
          onClose={() => setScratchpadOpen(false)}
          problemNumber={currentProblem.sequence_order}
        />
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">과제 처리 중입니다...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <TestPageContent />
    </Suspense>
  );
}
