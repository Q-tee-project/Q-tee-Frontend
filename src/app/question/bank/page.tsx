'use client';

import React, { useState, useEffect } from 'react';
import { QuestionService } from '@/services/questionService';
import { Question } from '@/types/api';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { Worksheet, MathProblem, MathFormData, ProblemType, Subject } from '@/types/math';

export default function BankPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<MathProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<MathProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('수학');
  const [showAnswerSheet, setShowAnswerSheet] = useState<boolean>(false);

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

  // 수학 문제 생성 폼 상태
  const [formData, setFormData] = useState<MathFormData>({
    school_level: '중학교',
    grade: 1,
    semester: 1,
    unit_name: '자연수의 성질',
    chapter_name: '소인수분해',
    problem_count: 5,
    difficulty_ratio: { A: 30, B: 50, C: 20 },
    problem_type_ratio: { 객관식: 40, 단답형: 40, 서술형: 20 },
    user_text: '',
  });

  const [generatedTaskId, setGeneratedTaskId] = useState<string>('');
  const [generationStatus, setGenerationStatus] = useState<string>('');

  // 데이터 로드
  useEffect(() => {
    loadWorksheets();
  }, [selectedSubject]);

  const loadWorksheets = async () => {
    if (selectedSubject !== Subject.MATH) {
      setWorksheets([]);
      setSelectedWorksheet(null);
      setWorksheetProblems([]);
      setSelectedProblem(null);
      return;
    }

    setIsLoading(true);
    try {
      const worksheetData = await QuestionService.getWorksheets();
      setWorksheets(worksheetData);
      if (worksheetData.length > 0) {
        setSelectedWorksheet(worksheetData[0]);
        await loadWorksheetProblems(worksheetData[0].id);
      }
    } catch (error: any) {
      console.error('워크시트 로드 실패:', error);
      setError('워크시트 데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 워크시트의 문제들 로드
  const loadWorksheetProblems = async (worksheetId: number) => {
    try {
      const worksheetDetail = await QuestionService.getWorksheetDetail(worksheetId);
      setWorksheetProblems(worksheetDetail.problems || []);
      if (worksheetDetail.problems && worksheetDetail.problems.length > 0) {
        setSelectedProblem(worksheetDetail.problems[0]);
      }
    } catch (error: any) {
      console.error('워크시트 문제 로드 실패:', error);
      setError('워크시트 문제를 불러올 수 없습니다.');
    }
  };

  // 워크시트 선택 핸들러
  const handleWorksheetSelect = async (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet);
    setSelectedProblem(null);
    await loadWorksheetProblems(worksheet.id);
  };

  // 워크시트 삭제 핸들러
  const handleDeleteWorksheet = async (worksheet: Worksheet, event: React.MouseEvent) => {
    event.stopPropagation();

    if (
      !confirm(`"${worksheet.title}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await QuestionService.deleteWorksheet(worksheet.id);

      if (selectedWorksheet?.id === worksheet.id) {
        setSelectedWorksheet(null);
        setSelectedProblem(null);
        setWorksheetProblems([]);
      }

      await loadWorksheets();
      alert('워크시트가 삭제되었습니다.');
    } catch (error: any) {
      console.error('워크시트 삭제 실패:', error);
      alert(`삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 수학 문제 생성
  const generateMathProblems = async () => {
    setIsLoading(true);
    setError(null);
    setGenerationStatus('문제 생성을 시작합니다...');

    try {
      const result = await QuestionService.generateMathProblems(formData);

      if (result.task_id) {
        setGeneratedTaskId(result.task_id);
        setGenerationStatus(result.message);

        const checkTaskStatus = async () => {
          try {
            const status = await QuestionService.getTaskStatus(result.task_id);
            setGenerationStatus(status.message || `상태: ${status.status}`);

            if (status.status === 'SUCCESS') {
              setGenerationStatus('문제 생성이 완료되었습니다!');
              alert('문제 생성이 완료되었습니다!');
              await loadWorksheets();
            } else if (status.status === 'FAILURE') {
              setGenerationStatus(`오류: ${status.error}`);
              alert(`문제 생성 실패: ${status.error}`);
            } else if (status.status === 'PROGRESS') {
              setTimeout(checkTaskStatus, 2000);
            } else {
              setTimeout(checkTaskStatus, 1000);
            }
          } catch (error: any) {
            console.error('태스크 상태 확인 실패:', error);
            setGenerationStatus('상태 확인 중 오류가 발생했습니다.');
          }
        };

        setTimeout(checkTaskStatus, 1000);
      }
    } catch (error: any) {
      console.error('문제 생성 오류:', error);
      setError(error.message || '문제 생성 중 오류가 발생했습니다.');
      setGenerationStatus('문제 생성에 실패했습니다.');
      alert(`오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bank-page min-h-screen">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-xl font-semibold text-gray-900">문제 관리</h1>
            <p className="mt-1 text-sm text-gray-500">생성된 워크시트와 문제를 관리합니다</p>
          </div>

          {/* 과목 탭 */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[Subject.KOREAN, Subject.MATH, Subject.ENGLISH].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      selectedSubject === subject
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {subject}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* 왼쪽: 워크시트 목록 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">워크시트 목록</h2>
                <span className="text-xs text-gray-500 mt-1">{worksheets.length}개</span>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {selectedSubject !== Subject.MATH ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    {selectedSubject} 과목은 준비 중입니다
                  </div>
                ) : worksheets.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    저장된 워크시트가 없습니다
                  </div>
                ) : (
                  worksheets.map((worksheet) => (
                    <div
                      key={worksheet.id}
                      className={`
                        px-4 py-3 cursor-pointer border-l-4 transition-all
                        ${
                          selectedWorksheet?.id === worksheet.id
                            ? 'bg-blue-50 border-blue-500'
                            : 'border-transparent hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleWorksheetSelect(worksheet)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1">
                            {worksheet.school_level} {worksheet.grade}-{worksheet.semester} ·{' '}
                            {worksheet.problem_count}문제
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {worksheet.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {worksheet.unit_name} → {worksheet.chapter_name}
                          </p>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(worksheet.created_at).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteWorksheet(worksheet, e)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100"
                          title="삭제"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 중앙: 시험지 형태 */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedWorksheet ? selectedWorksheet.title : '시험지'}
                    </h1>
                    {showAnswerSheet && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        정답지
                      </span>
                    )}
                  </div>
                  {selectedWorksheet && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{selectedWorksheet.school_level} {selectedWorksheet.grade}학년 {selectedWorksheet.semester}학기</p>
                      <p>{selectedWorksheet.unit_name} → {selectedWorksheet.chapter_name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 max-h-[700px] overflow-y-auto">
                {selectedSubject !== Subject.MATH ? (
                  <div className="text-center py-20 text-gray-400">
                    {selectedSubject} 과목은 준비 중입니다
                  </div>
                ) : worksheetProblems.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    워크시트를 선택하면 시험지가 표시됩니다
                  </div>
                ) : (
                  <div className="space-y-8">
                    {worksheetProblems.map((problem, index) => (
                      <div key={problem.id} className="page-break-inside-avoid">
                        {/* 문제 헤더 */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full text-sm font-bold">
                              {problem.sequence_order}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {getProblemTypeInKorean(problem.problem_type)}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                난이도 {problem.difficulty}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({problem.problem_type === 'multiple_choice' ? '5점' : 
                                  problem.problem_type === 'short_answer' ? '10점' : '15점'})
                              </span>
                            </div>
                            
                            {/* 문제 내용 */}
                            <div className="text-base leading-relaxed text-gray-900 mb-4">
                              <LaTeXRenderer content={problem.question} />
                            </div>

                            {/* 객관식 선택지 */}
                            {problem.choices && problem.choices.length > 0 && (
                              <div className="ml-4 space-y-3">
                                {problem.choices.map((choice, choiceIndex) => {
                                  const optionLabel = String.fromCharCode(65 + choiceIndex);
                                  const isCorrect = problem.correct_answer === optionLabel;
                                  return (
                                    <div key={choiceIndex} className={`flex items-start gap-3 ${
                                      showAnswerSheet && isCorrect 
                                        ? 'bg-green-100 border border-green-300 rounded-lg p-2' 
                                        : ''
                                    }`}>
                                      <span className={`flex-shrink-0 w-6 h-6 border-2 ${
                                        showAnswerSheet && isCorrect 
                                          ? 'border-green-500 bg-green-500 text-white' 
                                          : 'border-gray-300 text-gray-600'
                                      } rounded-full flex items-center justify-center text-sm font-medium`}>
                                        {showAnswerSheet && isCorrect ? '✓' : optionLabel}
                                      </span>
                                      <div className="flex-1 text-gray-900">
                                        <LaTeXRenderer content={choice} />
                                      </div>
                                      {showAnswerSheet && isCorrect && (
                                        <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                                          정답
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* 주관식 답안 공간 */}
                            {(!problem.choices || problem.choices.length === 0) && (
                              <div className="mt-4 ml-4">
                                {problem.problem_type === 'short_answer' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-700">답:</span>
                                    {showAnswerSheet ? (
                                      <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-green-800 font-medium">
                                        <LaTeXRenderer content={problem.correct_answer} />
                                      </div>
                                    ) : (
                                      <div className="border-b-2 border-gray-300 flex-1 h-8"></div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-gray-50">
                                      <div className="text-sm text-gray-500 mb-2">풀이 과정을 자세히 써주세요.</div>
                                      <div className="space-y-3">
                                        {[...Array(6)].map((_, lineIndex) => (
                                          <div key={lineIndex} className="border-b border-gray-200 h-6"></div>
                                        ))}
                                      </div>
                                    </div>
                                    {/* 서술형 정답 표시 */}
                                    {showAnswerSheet && (
                                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-sm font-semibold text-blue-800">모범답안:</span>
                                        </div>
                                        <div className="text-sm text-blue-900">
                                          <LaTeXRenderer content={problem.correct_answer} />
                                        </div>
                                        {problem.explanation && (
                                          <div className="mt-3 pt-3 border-t border-blue-200">
                                            <span className="text-sm font-semibold text-blue-800">해설:</span>
                                            <div className="text-sm text-blue-800 mt-1">
                                              <LaTeXRenderer content={problem.explanation} />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 문제 구분선 */}
                        {index < worksheetProblems.length - 1 && (
                          <hr className="border-gray-200 my-8" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => loadWorksheets()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            새로고침
          </button>

          <div className="flex gap-3">
            {selectedWorksheet && worksheetProblems.length > 0 && (
              <button
                onClick={() => setShowAnswerSheet(!showAnswerSheet)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  showAnswerSheet 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showAnswerSheet ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
                {showAnswerSheet ? '시험지 보기' : '정답지 보기'}
              </button>
            )}

            {selectedWorksheet && (
              <button
                onClick={() => {
                  alert(`"${selectedWorksheet.title}" 워크시트를 내보냈습니다.`);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                워크시트 내보내기
              </button>
            )}
          </div>
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
            <button
              onClick={() => setError(null)}
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
            </button>
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

      {/* 생성 상태 알림 */}
      {generationStatus && (
        <div className="fixed bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-blue-700">{generationStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
}
