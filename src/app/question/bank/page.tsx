'use client';

import React, { useState, useEffect } from 'react'
import { QuestionService } from '@/services/questionService'
import { Question } from '@/types/api'
import { LaTeXRenderer } from '@/components/LaTeXRenderer'
import { 
  Worksheet, 
  MathProblem, 
  MathFormData, 
  ProblemType, 
  Subject 
} from '@/types/math'

export default function BankPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<MathProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<MathProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('수학');

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
    user_text: ''
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
    event.stopPropagation(); // 워크시트 선택 이벤트 방지
    
    if (!confirm(`"${worksheet.title}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await QuestionService.deleteWorksheet(worksheet.id);
      
      // 삭제된 워크시트가 현재 선택된 것이라면 선택 해제
      if (selectedWorksheet?.id === worksheet.id) {
        setSelectedWorksheet(null);
        setSelectedProblem(null);
        setWorksheetProblems([]);
      }
      
      // 워크시트 목록 새로고침
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
        
        // 태스크 상태를 주기적으로 확인
        const checkTaskStatus = async () => {
          try {
            const status = await QuestionService.getTaskStatus(result.task_id);
            setGenerationStatus(status.message || `상태: ${status.status}`);
            
            if (status.status === 'SUCCESS') {
              setGenerationStatus('문제 생성이 완료되었습니다!');
              alert('문제 생성이 완료되었습니다!');
              await loadWorksheets(); // 워크시트 목록 새로고침
            } else if (status.status === 'FAILURE') {
              setGenerationStatus(`오류: ${status.error}`);
              alert(`문제 생성 실패: ${status.error}`);
            } else if (status.status === 'PROGRESS') {
              setTimeout(checkTaskStatus, 2000); // 2초마다 상태 확인
            } else {
              setTimeout(checkTaskStatus, 1000); // 1초마다 상태 확인
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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">문제 관리</h1>
          <p className="text-sm text-gray-600 mt-1">생성된 워크시트와 문제를 관리합니다</p>
          
          {/* 과목 선택 버튼 */}
          <div className="flex space-x-2 mt-4">
            {[Subject.KOREAN, Subject.MATH, Subject.ENGLISH].map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedSubject === subject
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 워크시트 목록 */}
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">워크시트 목록</h2>
                <span className="text-sm text-gray-500">{worksheets.length}개</span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {selectedSubject !== Subject.MATH ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  {selectedSubject} 과목은 준비 중입니다
                </div>
              ) : worksheets.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  저장된 워크시트가 없습니다
                </div>
              ) : (
                worksheets.map((worksheet) => (
                  <div 
                    key={worksheet.id} 
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      selectedWorksheet?.id === worksheet.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleWorksheetSelect(worksheet)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                          <span>{worksheet.school_level} {worksheet.grade}학년 {worksheet.semester}학기</span>
                          <span>•</span>
                          <span>{worksheet.problem_count}문제</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {worksheet.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {worksheet.unit_name} {'>'}  {worksheet.chapter_name}
                        </p>
                      </div>
                      <div className="ml-2 flex items-center space-x-1">
                        <button
                          onClick={(e) => handleDeleteWorksheet(worksheet, e)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                          title="워크시트 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(worksheet.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 문제 목록 */}
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">문제 목록</h2>
                {worksheetProblems.length > 0 && (
                  <span className="text-sm text-gray-500">{worksheetProblems.length}문제</span>
                )}
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {selectedSubject !== Subject.MATH ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  {selectedSubject} 과목은 준비 중입니다
                </div>
              ) : worksheetProblems.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  워크시트를 선택하면 문제 목록이 표시됩니다
                </div>
              ) : (
                worksheetProblems.map((problem) => (
                  <div 
                    key={problem.id} 
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      selectedProblem?.id === problem.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {problem.sequence_order}번
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {getProblemTypeInKorean(problem.problem_type)}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {problem.difficulty}단계
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span>정답: </span>
                        <LaTeXRenderer 
                          content={problem.correct_answer}
                          className="ml-1"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <LaTeXRenderer 
                        content={problem.question.substring(0, 100) + (problem.question.length > 100 ? '...' : '')} 
                      />
                    </div>
                  </div>
                ))
              )}
              
              {generationStatus && (
                <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
                  <div className="text-sm text-yellow-800">{generationStatus}</div>
                </div>
              )}
            </div>
          </div>

          {/* 문제 상세 */}
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedProblem ? `문제 ${selectedProblem.sequence_order} 상세` : '문제를 선택하세요'}
                </h2>
                {selectedProblem && (
                  <div className="text-sm flex items-center">
                    <span className="text-gray-600">정답: </span>
                    <LaTeXRenderer 
                      content={selectedProblem.correct_answer}
                      className="font-semibold text-red-600 ml-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {selectedSubject !== Subject.MATH ? (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  {selectedSubject} 과목은 준비 중입니다
                </div>
              ) : selectedProblem ? (
                // 문제 상세 표시
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getProblemTypeInKorean(selectedProblem.problem_type)}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {selectedProblem.difficulty}단계
                      </span>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">문제</h4>
                      <LaTeXRenderer 
                        content={selectedProblem.question}
                        className="text-sm text-gray-800 leading-relaxed"
                      />
                    </div>
                  </div>

                  {selectedProblem.choices && selectedProblem.choices.length > 0 && (
                    <div className="border border-gray-200 rounded p-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">선택지</h4>
                      <div className="space-y-2">
                        {selectedProblem.choices.map((choice, index) => (
                          <div 
                            key={index} 
                            className={`flex items-start space-x-3 p-2 rounded ${
                              selectedProblem.correct_answer === String.fromCharCode(65 + index)
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-gray-50'
                            }`}
                          >
                            <span className="text-sm font-medium text-gray-600 mt-0.5">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <div className="flex-1 text-sm">
                              <LaTeXRenderer content={choice} />
                            </div>
                            {selectedProblem.correct_answer === String.fromCharCode(65 + index) && (
                              <span className="text-green-600 text-sm font-semibold">정답</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded p-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">해설</h4>
                    <LaTeXRenderer 
                      content={selectedProblem.explanation || '해설이 제공되지 않았습니다.'}
                      className="text-sm text-gray-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  문제를 선택하면 상세 내용이 표시됩니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-center space-x-3 mt-6">
          <button 
            onClick={() => loadWorksheets()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            새로고침
          </button>
          
          {selectedWorksheet && (
            <button 
              onClick={() => {
                alert(`"${selectedWorksheet.title}" 워크시트를 내보냈습니다.`);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              워크시트 내보내기
            </button>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
          <button 
            onClick={() => setError(null)}
            className="float-right ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
          {error}
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>처리 중...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}