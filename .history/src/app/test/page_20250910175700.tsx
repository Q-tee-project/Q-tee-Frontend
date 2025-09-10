'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { QuestionService } from '@/services/questionService';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { Worksheet, MathProblem, ProblemType, Subject } from '@/types/math';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export default function TestPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<MathProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('수학');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60분 (초 단위)

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
    loadWorksheets();
  }, [selectedSubject]);

  // 타이머 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          alert('시험 시간이 종료되었습니다.');
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

    console.log('배포된 문제지 로드 시작...');
    setIsLoading(true);
    try {
      const worksheetData = await QuestionService.getWorksheets();
      console.log('문제지 데이터:', worksheetData);
      setWorksheets(worksheetData);
      if (worksheetData.length > 0) {
        setSelectedWorksheet(worksheetData[0]);
        await loadWorksheetProblems(worksheetData[0].id);
      }
    } catch (error: any) {
      console.error('문제지 로드 실패:', error);
      setError(`문제지 데이터를 불러올 수 없습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 워크시트의 문제들 로드
  const loadWorksheetProblems = async (worksheetId: number) => {
    try {
      const worksheetDetail = await QuestionService.getWorksheetDetail(worksheetId);
      setWorksheetProblems(worksheetDetail.problems || []);
    } catch (error: any) {
      console.error('워크시트 문제 로드 실패:', error);
      setError('워크시트 문제를 불러올 수 없습니다.');
    }
  };

  // 문제지 선택 핸들러
  const handleWorksheetSelect = async (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet);
    await loadWorksheetProblems(worksheet.id);
    setCurrentProblemIndex(0);
    setAnswers({});
  };

  // 답안 입력 핸들러
  const handleAnswerChange = (problemId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [problemId]: answer,
    }));
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

  // 시험 제출
  const submitTest = () => {
    const answeredCount = Object.keys(answers).length;
    const totalProblems = worksheetProblems.length;

    if (answeredCount < totalProblems) {
      if (
        !confirm(
          `${totalProblems - answeredCount}개 문제가 답하지 않았습니다. 그래도 제출하시겠습니까?`,
        )
      ) {
        return;
      }
    }

    alert(`시험이 제출되었습니다.\n답한 문제: ${answeredCount}/${totalProblems}개`);
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
    <div className="h-full flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<CheckCircle />}
        title="시험 응시"
        variant="question"
        description="배포된 문제지를 확인하고 시험을 응시할 수 있습니다"
      />

      {/* 과목 탭 */}
      <div className="px-6 pb-4 flex-shrink-0">
        <nav className="flex space-x-8">
          {[Subject.KOREAN, Subject.MATH, Subject.ENGLISH].map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedSubject === subject
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subject}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-6 min-h-0">
        <div className="flex gap-6 h-full">
          {/* 배포된 문제지 목록 */}
          <Card className="w-1/3 flex flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-6 border-b border-gray-100">
              <CardTitle className="text-lg font-medium">배포된 문제지</CardTitle>
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
              <div className="h-full custom-scrollbar overflow-y-auto">
                {worksheets.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    배포된 문제지가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {worksheets.map((worksheet) => (
                      <div
                        key={worksheet.id}
                        onClick={() => handleWorksheetSelect(worksheet)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedWorksheet?.id === worksheet.id
                            ? 'border-[#0072CE] bg-[#EBF6FF]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={`${
                              worksheet.school_level === '고등학교'
                                ? 'border-orange-300 text-orange-600 bg-orange-50'
                                : 'border-blue-300 text-blue-600 bg-blue-50'
                            }`}
                          >
                            {worksheet.school_level}
                          </Badge>
                          <Badge className="border-gray-300 text-gray-600 bg-gray-50">
                            {worksheet.grade}학년
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{worksheet.title}</h3>
                        <p className="text-sm text-gray-500">{worksheet.unit_name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {worksheet.problems?.length || 0}개 문제
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 문제 풀이 화면 */}
          {selectedWorksheet && currentProblem ? (
            <Card className="w-2/3 flex flex-col shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-6 px-6 border-b border-gray-100">
                <div className="flex items-center justify-center gap-3 flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {selectedWorksheet.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentProblemIndex + 1} / {worksheetProblems.length}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 min-h-0">
                <div className="h-full flex flex-col">
                  {/* 문제 영역 */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm border border-[#0072CE]/30 text-[#0072CE] rounded-full text-sm font-bold">
                          {currentProblem.sequence_order}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {getProblemTypeInKorean(currentProblem.problem_type)}
                          </Badge>
                          <Badge
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              currentProblem.difficulty === 'A'
                                ? 'bg-red-100 text-red-800'
                                : currentProblem.difficulty === 'B'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {currentProblem.difficulty}
                          </Badge>
                        </div>

                        <div className="text-base leading-relaxed text-gray-900 mb-6">
                          <LaTeXRenderer content={currentProblem.question} />
                        </div>

                        {/* 답안 입력 영역 */}
                        <div className="space-y-4">
                          {currentProblem.problem_type === 'multiple_choice' &&
                          currentProblem.choices ? (
                            <div className="space-y-3">
                              {currentProblem.choices.map((choice, index) => {
                                const optionLabel = String.fromCharCode(65 + index);
                                const isSelected = answers[currentProblem.id] === optionLabel;
                                return (
                                  <label
                                    key={index}
                                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'border-[#0072CE] bg-[#EBF6FF]'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
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
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">답:</label>
                              <input
                                type="text"
                                value={answers[currentProblem.id] || ''}
                                onChange={(e) =>
                                  handleAnswerChange(currentProblem.id, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                                placeholder="답을 입력하세요"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                풀이 과정:
                              </label>
                              <textarea
                                value={answers[currentProblem.id] || ''}
                                onChange={(e) =>
                                  handleAnswerChange(currentProblem.id, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent min-h-[200px]"
                                placeholder="풀이 과정을 자세히 써주세요"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

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

                      <div className="flex gap-3">
                        <Button
                          onClick={submitTest}
                          className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
                        >
                          시험 제출
                        </Button>
                      </div>

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
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-2/3 flex items-center justify-center shadow-sm">
              <div className="text-center py-20">
                <div className="text-gray-400 text-lg mb-2">📝</div>
                <div className="text-gray-500 text-sm">문제지를 선택하세요</div>
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
              <p className="text-sm font-medium text-gray-900">오류가 발생했습니다</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
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

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">처리 중입니다...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
