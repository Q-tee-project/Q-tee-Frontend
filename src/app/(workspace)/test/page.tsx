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
      <div className="w-1/4 bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse h-full bg-gray-200 rounded"></div>
      </div>
    ),
  },
);

const TestInterface = dynamic(
  () => import('@/components/test/TestInterface').then((mod) => ({ default: mod.TestInterface })),
  {
    loading: () => (
      <div className="w-5/6 bg-white rounded-lg shadow-sm p-4">
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
      <div className="w-5/6 bg-white rounded-lg shadow-sm p-4">
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
      <div className="w-5/6 bg-white rounded-lg shadow-sm p-4">
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
      <div className="w-5/6 bg-white rounded-lg shadow-sm p-4">
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

  // 데이터 로드
  useEffect(() => {
    if (userProfile?.id) {
      loadWorksheets();
    }
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
        } catch (error) {}
      } else if (selectedSubject === '국어') {
        try {
          assignmentData = await koreanService.getStudentAssignments(userProfile.id);
        } catch (error) {}
      } else if (selectedSubject === '영어') {
        try {
          assignmentData = await EnglishService.getStudentAssignments(userProfile.id);
        } catch (error) {}
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
            } as KoreanWorksheet;
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
            } as Worksheet;
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
            } as Worksheet;
          }
        }),
      );

      setWorksheets(worksheetData);
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

  // 검색 필터링된 과제 목록
  const filteredWorksheets = worksheets.filter((worksheet) =>
    worksheet.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col p-5 gap-5">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<CheckCircle />}
        title="과제 풀이"
        variant="question"
        description="배포된 과제를 확인하고 풀이할 수 있습니다"
      />

      {/* 과목 선택 탭 */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['국어', '영어', '수학'].map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`border-b-2 font-medium text-sm ${
                selectedSubject === subject
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ padding: '10px 20px' }}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0">
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
            onWorksheetSelect={handleWorksheetSelect}
            onProblemSelect={setCurrentProblemIndex}
            onShowResult={() => setShowResultModal(true)}
            onRefresh={loadWorksheets}
            onSearchChange={setSearchTerm}
            getProblemTypeInKorean={getProblemTypeInKorean}
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
                <StudentResultView
                  assignmentId={selectedWorksheet.id}
                  studentId={userProfile.id}
                  assignmentTitle={selectedWorksheet.title}
                  onBack={handleBackFromResult}
                  problems={worksheetProblems}
                  subject={subject}
                />
              );
            }
            return null;
          })()}

          {selectedWorksheet && !isTestStarted && !showStudentResult && (
            <Card className="w-5/6 flex items-center justify-center shadow-sm">
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
            isTestStarted &&
            (selectedSubject === '국어' ? (
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
                  setIsTestStarted(false);
                  setTestSession(null);
                  setCurrentProblemIndex(0);
                  setAnswers({});
                }}
                onOpenScratchpad={() => setScratchpadOpen(true)}
                getProblemTypeInKorean={getProblemTypeInKorean}
                formatTime={formatTime}
                onOCRCapture={handleOCRCapture}
              />
            ))}

          {!selectedWorksheet && (
            <Card className="w-5/6 flex items-center justify-center shadow-sm">
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
