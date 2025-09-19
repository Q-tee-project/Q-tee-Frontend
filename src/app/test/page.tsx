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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Clock, CheckCircle, BookOpen, Calendar, Users, BookOpen as BookIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { HandwritingCanvas } from '@/components/HandwritingCanvas';
import { ScratchpadModal } from '@/components/ScratchpadModal';
import { TestResultModal } from './components/TestResultModal';

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

  return (
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<CheckCircle />}
        title="과제 풀이"
        variant="question"
        description="배포된 과제를 확인하고 풀이할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-6 min-h-0">
        <div className="flex gap-6 h-full">
          {/* 배포된 문제지 목록 */}
          <Card className="w-1/3 flex flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-6 border-b border-gray-100">
              <CardTitle className="text-lg font-medium">과제 목록</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => loadWorksheets()}
                  variant="ghost"
                  size="icon"
                  className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF]"
                  title="새로고침"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 min-h-0">
              <div className="space-y-3">
                {worksheets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">배포된 과제가 없습니다</div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {worksheets.map((worksheet) => {
                      const isCompleted = worksheet.status === 'completed' || worksheet.status === 'submitted';
                      const isSelected = selectedWorksheet?.id === worksheet.id;
                      
                      return (
                        <div
                          key={worksheet.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'border-[#0072CE]' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleWorksheetSelect(worksheet)}
                        >

                          {/* 범위 정보 */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                            <BookIcon className="w-3 h-3" />
                            <span>{worksheet.unit_name} {'>'} {worksheet.chapter_name}</span>
                          </div>

                          {/* 과제 제목 */}
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {worksheet.title} - {worksheet.problem_count}문제
                            </h4>
                          </div>

                          {/* 문제 수 및 응시 상태 뱃지 */}
                          <div className="flex justify-start">
                            <Badge className="bg-gray-100 text-gray-700 text-xs">
                              {worksheet.problem_count}문제
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                isCompleted
                                  ? 'bg-[#E6F3FF] text-[#0085FF]'
                                  : 'bg-[#ffebeb] text-[#f00]'
                              }`}
                            >
                              {isCompleted ? '응시' : '미응시'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 과제 진행 상태 표시 */}
                {isTestStarted && selectedWorksheet && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">과제 진행 중</span>
                    </div>
                  </div>
                )}

                {/* 과제 완료 결과 표시 */}
                {testResult && selectedWorksheet && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                    <h4 className="text-sm font-medium text-blue-700">과제 완료</h4>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>
                        정답: {testResult.correct_count || 0}개 / {testResult.total_problems || 0}개
                      </div>
                      <div>점수: {testResult.score || 0}점</div>
                    </div>
                    <Button
                      onClick={() => setShowResultModal(true)}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      📊 자세한 결과 보기
                    </Button>
                  </div>
                )}

                {/* 문제 번호 테이블 */}
                {selectedWorksheet && worksheetProblems.length > 0 && isTestStarted && (
                  <div className="border rounded-lg">
                    <div className="p-3 border-b bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700">문제 목록</h4>
                    </div>
                    <div className="max-h-108 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">번호</TableHead>
                            <TableHead className="text-center">유형</TableHead>
                            <TableHead className="text-center">난이도</TableHead>
                            <TableHead className="text-center">답안</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {worksheetProblems.map((problem, index) => {
                            const isAnswered = answers[problem.id];
                            const isCurrentProblem = index === currentProblemIndex;
                            return (
                              <TableRow
                                key={problem.id}
                                className={`cursor-pointer hover:bg-gray-50 ${
                                  isCurrentProblem ? 'bg-[#EBF6FF]' : ''
                                }`}
                                onClick={() => setCurrentProblemIndex(index)}
                              >
                                <TableCell className="text-center font-medium">
                                  {problem.sequence_order}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                    {getProblemTypeInKorean(problem.problem_type)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={`text-xs ${
                                      problem.difficulty === 'A'
                                        ? 'border-red-300 text-red-600 bg-red-50'
                                        : problem.difficulty === 'B'
                                        ? 'border-green-300 text-green-600 bg-green-50'
                                        : 'border-purple-300 text-purple-600 bg-purple-50'
                                    }`}
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {isAnswered ? (
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                                  ) : (
                                    <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto"></div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                    {isLoading ? '시작 중...' : '문제 풀기 시작'}
                  </Button>
                )}
              </div>
            </Card>
          ) : selectedWorksheet && currentProblem && isTestStarted ? (
            <Card className="w-5/6 flex flex-col shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-6 px-6 border-b border-gray-100">
                <div className="flex items-center justify-center gap-3 flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {selectedWorksheet.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#0072CE]" />
                  <span className="text-lg font-bold text-[#0072CE]">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-6 min-h-0">
                <div className="h-full custom-scrollbar overflow-y-auto">
                  <div className="space-y-6">
                    {/* 문제 정보 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm border border-[#0072CE]/30 text-[#0072CE] rounded-full text-sm font-bold">
                          {currentProblem.sequence_order}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {getProblemTypeInKorean(currentProblem.problem_type)}
                          </Badge>
                          <Badge
                            className={`${
                              currentProblem.difficulty === 'A'
                                ? 'border-red-300 text-red-600 bg-red-50'
                                : currentProblem.difficulty === 'B'
                                ? 'border-green-300 text-green-600 bg-green-50'
                                : 'border-purple-300 text-purple-600 bg-purple-50'
                            }`}
                          >
                            {currentProblem.difficulty}
                          </Badge>
                        </div>

                        {/* 문제 내용 */}
                        <div className="text-base leading-relaxed text-gray-900 mb-6">
                          <LaTeXRenderer content={currentProblem.question} />
                        </div>

                        {/* 답안 입력 영역 */}
                        <div className="space-y-4">
                          {currentProblem.problem_type === 'multiple_choice' &&
                          currentProblem.choices &&
                          Array.isArray(currentProblem.choices) ? (
                            <div className="space-y-3">
                              {currentProblem.choices.map((choice, index) => {
                                const optionLabel = String.fromCharCode(65 + index);
                                const isSelected = answers[currentProblem.id] === optionLabel;
                                return (
                                  <label
                                    key={index}
                                    className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                  >
                                    <input
                                      type="radio"
                                      name={`problem-${currentProblem.id}`}
                                      value={optionLabel}
                                      checked={isSelected}
                                      onChange={(e) =>
                                        handleAnswerChange(currentProblem.id, e.target.value)
                                      }
                                      className="mt-1"
                                    />
                                    <span className="font-medium text-gray-700 mr-2">
                                      {optionLabel}.
                                    </span>
                                    <div className="flex-1 text-gray-900">
                                      <LaTeXRenderer content={choice} />
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          ) : currentProblem.problem_type === 'short_answer' ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                  답 (핸드라이팅):
                                </label>
                                <Button
                                  onClick={() => setScratchpadOpen(true)}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 text-[#0072CE] border-[#0072CE]"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  연습장
                                </Button>
                              </div>
                              <HandwritingCanvas
                                width={580}
                                height={120}
                                value={answers[currentProblem.id] || ''}
                                onChange={(value) => handleAnswerChange(currentProblem.id, value)}
                                className="w-full"
                              />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                  풀이 과정 (핸드라이팅):
                                </label>
                                <Button
                                  onClick={() => setScratchpadOpen(true)}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 text-[#0072CE] border-[#0072CE]"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  연습장
                                </Button>
                              </div>
                              <HandwritingCanvas
                                width={580}
                                height={300}
                                value={answers[currentProblem.id] || ''}
                                onChange={(value) => handleAnswerChange(currentProblem.id, value)}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* 하단 네비게이션 */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={goToPreviousProblem}
                    disabled={currentProblemIndex === 0}
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                  >
                    이전 문제
                  </Button>

                  {currentProblemIndex === worksheetProblems.length - 1 && (
                    <div className="flex gap-3">
                      <Button
                        onClick={submitTest}
                        disabled={isSubmitting}
                        className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
                      >
                        {isSubmitting ? '제출 중...' : '📝 과제 제출'}
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={goToNextProblem}
                    disabled={currentProblemIndex === worksheetProblems.length - 1}
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                  >
                    다음 문제
                  </Button>
                </div>
              </div>
            </Card>
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
                    <div className="text-gray-400 text-lg mb-2">📝</div>
                    <div className="text-gray-500 text-sm">과제를 선택하세요</div>
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
