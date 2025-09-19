'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MathService } from '@/services/mathService';
import { useAuth } from '@/contexts/AuthContext';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { Worksheet, MathProblem, ProblemType, Subject } from '@/types/math';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScratchpadModal } from '@/components/ScratchpadModal';
import { Input } from '@/components/ui/input';
import { IoSearch } from "react-icons/io5";
import { TestResultModal } from './components/TestResultModal';
import { AssignmentList } from '@/components/test/AssignmentList';
import { TestInterface } from '@/components/test/TestInterface';

export default function TestPage() {
  const { userProfile } = useAuth();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<MathProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('수학');
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

  // 문제 유형을 한국어로 변환
  const getProblemTypeInKorean = (type: string): string => {
    switch (type.toLowerCase()) {
      case ProblemType.MULTIPLE_CHOICE:
        return '객관식';
      case ProblemType.ESSAY:
        return '서술형';
      case ProblemType.SHORT_ANSWER:
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
    if (selectedSubject !== Subject.MATH) {
      setWorksheets([]);
      setSelectedWorksheet(null);
      setWorksheetProblems([]);
      return;
    }

    console.log('배포된 과제 로드 시작...');
    setIsLoading(true);
    try {
      // 학생용 과제 목록 가져오기
      if (!userProfile?.id) {
        console.error('사용자 정보가 없습니다');
        return;
      }
      const assignmentData = await MathService.getStudentAssignments(userProfile.id);
      console.log('과제 데이터:', assignmentData);

      // 과제 데이터를 워크시트 형식으로 변환
      const worksheetData = assignmentData.map((assignment: any) => ({
        id: assignment.assignment_id,
        title: assignment.title,
        unit_name: assignment.unit_name,
        chapter_name: assignment.chapter_name,
        problem_count: assignment.problem_count,
        status: assignment.status,
        deployed_at: assignment.deployed_at,
        created_at: assignment.deployed_at,
        school_level: '중학교', // 기본값
        grade: 1, // 기본값
        semester: 1, // 기본값
      }));

      console.log('📋 변환된 워크시트 데이터:', worksheetData);

      setWorksheets(worksheetData);
      // 처음에는 아무것도 선택하지 않음
      setSelectedWorksheet(null);
    } catch (error: any) {
      console.error('❌ 과제 로드 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
      });

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
      console.log('📚 과제 문제 로드 시작 - worksheetId:', worksheetId);

      // 학생용 과제 상세 정보 가져오기
      console.log('📚 API 호출 시작...');
      if (!userProfile?.id) {
        console.error('사용자 정보가 없습니다');
        return;
      }
      const assignmentDetail = await MathService.getAssignmentDetail(worksheetId, userProfile.id);
      console.log('📚 과제 상세 정보 전체:', assignmentDetail);
      console.log('📚 과제 정보:', assignmentDetail?.assignment);
      console.log('📚 배포 정보:', assignmentDetail?.deployment);
      console.log('📚 문제 목록:', assignmentDetail?.problems);
      console.log('📚 문제 개수:', assignmentDetail?.problems?.length || 0);

      // 응답 구조 확인
      if (assignmentDetail) {
        console.log('📚 응답 키들:', Object.keys(assignmentDetail));
        if (assignmentDetail.problems) {
          console.log('📚 첫 번째 문제:', assignmentDetail.problems[0]);
        }
      }

      if (!assignmentDetail.problems || assignmentDetail.problems.length === 0) {
        console.warn('⚠️ 문제가 없습니다. 과제가 제대로 생성되었는지 확인하세요.');
        setError('과제에 문제가 없습니다. 선생님에게 문의하세요.');
      }

      setWorksheetProblems(assignmentDetail.problems || []);
    } catch (error: any) {
      console.error('❌ 과제 문제 로드 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
      });

      let errorMessage = '과제 문제를 불러올 수 없습니다.';
      if (error.status === 404) {
        errorMessage = '과제가 배포되지 않았거나 접근 권한이 없습니다.';
      } else if (error.message) {
        errorMessage = `과제 문제를 불러올 수 없습니다: ${error.message}`;
      }

      setError(errorMessage);
    }
  };

  // 문제지 선택 핸들러
  const handleWorksheetSelect = async (worksheet: Worksheet) => {
    console.log('📝 과제 선택:', worksheet);
    setSelectedWorksheet(worksheet);
    await loadWorksheetProblems(worksheet.id);
    setCurrentProblemIndex(0);
    setAnswers({});
    setIsTestStarted(false);
    setTestSession(null);
    setTestResult(null);
  };

  // 과제 시작
  const startTest = async () => {
    if (!selectedWorksheet) return;

    try {
      setIsLoading(true);
      const session = await MathService.startTest(selectedWorksheet.id);

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
      console.log('과제 세션 시작:', session);
    } catch (error: any) {
      console.error('과제 시작 실패:', error);
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

    // 백엔드에 답안 임시 저장 (과제가 시작된 경우에만)
    if (testSession && isTestStarted) {
      try {
        await MathService.saveAnswer(testSession.session_id, problemId, answer);
        console.log('답안 임시 저장 완료:', { problemId, answer });
      } catch (error) {
        console.error('답안 저장 실패:', error);
        // 실패해도 UI는 정상 작동하도록 함
      }
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
    if (!testSession || !isTestStarted) {
      alert('과제를 먼저 시작해주세요.');
      return;
    }

    const answeredCount = Object.keys(answers).length;
    const totalProblems = worksheetProblems.length;

    if (answeredCount < totalProblems) {
      if (
        !confirm(
          `${totalProblems - answeredCount}개 문제에 답하지 않았습니다. 그래도 제출하시겠습니까?`,
        )
      ) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const result = await MathService.submitTest(testSession.session_id, answers);
      setTestResult(result);
      setIsTestStarted(false);

      // 과제 상태를 "응시"로 업데이트
      if (selectedWorksheet) {
        setWorksheets(prev => 
          prev.map(worksheet => 
            worksheet.id === selectedWorksheet.id 
              ? { ...worksheet, status: 'completed' }
              : worksheet
          )
        );
      }

      // 결과 모달 표시
      setShowResultModal(true);
    } catch (error: any) {
      console.error('과제 제출 실패:', error);
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
  const filteredWorksheets = worksheets.filter(worksheet =>
    worksheet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 영역 */}
      <PageHeader
        icon={<CheckCircle />}
        title="과제 풀이"
        variant="question"
        description="배포된 과제를 확인하고 풀이할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0">
        <div className="flex gap-6 h-full">
          {/* 배포된 문제지 목록 */}
          <AssignmentList
            worksheets={filteredWorksheets}
            selectedWorksheet={selectedWorksheet}
            worksheetProblems={worksheetProblems}
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
          {selectedWorksheet && !isTestStarted ? (
            <Card className="w-5/6 flex items-center justify-center shadow-sm">
              <div className="text-center py-20">
                <div className="text-gray-700 text-lg font-medium mb-2">
                  {selectedWorksheet.title}
                </div>
                <div className="text-gray-500 text-sm mb-4">
                  문제 수: {worksheetProblems.length}개 | 제한 시간: 60분
                </div>
                <div className="text-gray-500 text-sm mb-6">
                  "과제 시작하기" 버튼을 눌러 과제를 시작하세요
                </div>
                {worksheetProblems.length > 0 && (
                  <Button
                    onClick={startTest}
                    disabled={isLoading}
                    className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
                  >
                    {isLoading ? '시작 중...' : '문제 풀기'}
                  </Button>
                )}
              </div>
            </Card>
          ) : selectedWorksheet && currentProblem && isTestStarted ? (
            <TestInterface
              selectedWorksheet={selectedWorksheet}
              currentProblem={currentProblem}
              worksheetProblems={worksheetProblems}
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
            />
          ) : (
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

      {/* 채점 결과 모달 */}
      {testResult && (
        <TestResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          testResult={testResult}
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
