'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlusCircle } from 'lucide-react';
import KoreanGenerator from '@/components/subjects/KoreanGenerator';
import EnglishGenerator from '@/components/subjects/EnglishGenerator';
import MathGenerator from '@/components/subjects/MathGenerator';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';

const SUBJECTS = ['국어', '영어', '수학'];

export default function CreatePage() {
  const [subject, setSubject] = useState<string>('');

  // 미리보기용 목업 데이터 타입/상태
  type PreviewQuestion = {
    id: number;
    title: string;
    options?: string[];
    answerIndex?: number;
    explanation: string;
    correct_answer?: string;
    choices?: string[];
    question?: string;
  };
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
  // 문제 생성 페이지는 열람만 가능 (편집 기능 제거)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // 백엔드 API 상태

  const chipBase = 'px-3 py-1 rounded-md border-2 text-sm';
  const chipSelected = 'border-blue-500 bg-blue-50 text-blue-600';
  const chipUnselected = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

  // 수학 문제 생성 API 호출
  const generateMathProblems = async (requestData: any) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setPreviewQuestions([]);

      console.log('🚀 문제 생성 요청 데이터:', requestData);

      // 문제 생성 API 호출
      const response = await fetch('http://localhost:8001/api/math-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API 응답 오류:', response.status, errorData);
        throw new Error(`문제 생성 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      // 진행 상황 폴링
      await pollTaskStatus(data.task_id);
    } catch (error) {
      console.error('문제 생성 오류:', error);
      alert('문제 생성 중 오류가 발생했습니다.');
      setIsGenerating(false);
    }
  };

  // 태스크 상태 폴링
  const pollTaskStatus = async (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 2분 최대 대기

    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/math-generation/tasks/${taskId}`);
        const data = await response.json();

        if (data.status === 'PROGRESS') {
          setGenerationProgress(Math.round((data.current / data.total) * 100));
        } else if (data.status === 'SUCCESS') {
          // 성공 시 워크시트 상세 조회
          if (data.result && data.result.worksheet_id) {
            await fetchWorksheetResult(data.result.worksheet_id);
          }
          return;
        } else if (data.status === 'FAILURE') {
          throw new Error(data.error || '문제 생성 실패');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // 1초 후 재시도
        } else {
          throw new Error('문제 생성 시간 초과');
        }
      } catch (error) {
        console.error('태스크 상태 확인 오류:', error);
        alert('문제 생성 중 오류가 발생했습니다.');
        setIsGenerating(false);
      }
    };

    await poll();
  };

  // 워크시트 결과 조회
  const fetchWorksheetResult = async (worksheetId: number) => {
    try {
      const response = await fetch(`http://localhost:8001/api/math-generation/worksheets/${worksheetId}`);
      const data = await response.json();

      if (data.problems) {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedQuestions: PreviewQuestion[] = data.problems.map((problem: any) => ({
          id: problem.id,
          title: problem.question,
          options: problem.choices ? problem.choices : undefined,
          answerIndex: problem.choices ? problem.choices.findIndex((choice: string) => choice === problem.correct_answer) : undefined,
          correct_answer: problem.correct_answer,
          explanation: problem.explanation,
          question: problem.question,
          choices: problem.choices
        }));

        setPreviewQuestions(convertedQuestions);
        setPreviewTitle(`수학 문제 - ${data.worksheet.unit_name} ${data.worksheet.chapter_name}`);
      }
    } catch (error) {
      console.error('워크시트 조회 오류:', error);
      alert('워크시트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  // 과목별 문제 생성 핸들러
  const handleGenerate = (data: any) => {
    if (subject === '수학') {
      generateMathProblems(data);
    } else {
      // 국어, 영어는 임시 목업 생성
      generateMockProblems(data);
    }
  };

  // 목업 문제 생성 (국어, 영어용)
  const generateMockProblems = async (data: any) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setPreviewQuestions([]);

    const cnt = Math.min(data.questionCount ?? 2, 5);
    
    // 제목 설정
    setPreviewTitle(`${data.subject} 예시 문제`);

    // 문제들 생성
    const questions: PreviewQuestion[] = [];
    for (let i = 0; i < cnt; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // 문제 간 지연

      const newQuestion: PreviewQuestion = {
        id: i + 1,
        title: `문제 ${i + 1}. ${data.subject} 관련 예시 질문입니다.`,
        options: ['선택지 1', '선택지 2', '선택지 3', '선택지 4', '선택지 5'],
        answerIndex: 1,
        explanation:
          '해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트.',
      };

      questions.push(newQuestion);
      setPreviewQuestions([...questions]);
      setGenerationProgress(((i + 1) / cnt) * 100);
    }

    setIsGenerating(false);
  };


  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<PlusCircle />}
        title="문제 생성"
        variant="question"
        description="과목별 문제를 생성할 수 있습니다"
      />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-4 min-h-0">
        <div className="flex gap-4 h-full">
      <div className="w-[400px] bg-white p-6 rounded shadow overflow-y-auto">
        {/* 과목 선택 */}
        <div className="mb-4">
          <div className="mb-2 font-semibold">과목 선택</div>
          <div className="flex gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setPreviewQuestions([]); // 과목 변경 시 초기화
                  setPreviewTitle('');
                }}
                className={`${chipBase} ${subject === s ? chipSelected : chipUnselected}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 과목별 컴포넌트 렌더링 */}
        {subject === '국어' && (
          <KoreanGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
        )}
        {subject === '영어' && (
          <EnglishGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
        )}
        {subject === '수학' && (
          <MathGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
        )}
      </div>

      {/* 오른쪽 영역 - 결과 미리보기 자리 */}
      <div className="flex-1 bg-white rounded ml-4 flex flex-col h-full">
        {isGenerating ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg font-medium text-gray-700 mb-2">
                문제를 생성하고 있습니다...
              </div>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">{Math.round(generationProgress)}% 완료</div>
            </div>
          </div>
        ) : previewQuestions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Image src="/noQuestion.svg" alt="미리보기 없음" width={220} height={160} style={{ width: 'auto', height: 'auto' }} />
          </div>
        ) : (
          <>
            {/* 스크롤 가능한 문제 영역 */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="space-y-6">
                <div className="w-full p-3 border rounded-md bg-gray-50 font-semibold text-lg">
                  {previewTitle || "생성된 문제지"}
                </div>
                {previewQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="grid grid-cols-12 gap-4 animate-fade-in"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards',
                    }}
                  >
                    <div className="col-span-8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-500">문제 {q.id}</div>
                        <div className="flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600">
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
                          <button className="text-gray-400 hover:text-gray-600">
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-base leading-relaxed text-gray-900 mb-4">
                        <LaTeXRenderer content={q.title} />
                      </div>
                      {q.options && q.options.map((opt, idx) => (
                        <div key={idx} className="flex items-start gap-3 mb-3">
                          <span
                            className={`flex-shrink-0 w-6 h-6 border-2 ${
                              idx === q.answerIndex
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 text-gray-600'
                            } rounded-full flex items-center justify-center text-sm font-medium`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <div className="flex-1 text-gray-900">
                            <LaTeXRenderer content={opt} />
                          </div>
                          {idx === q.answerIndex && (
                            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                              정답
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="col-span-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          {q.options && q.options.length > 0 ? (
                            <span>정답: {String.fromCharCode(65 + (q.answerIndex || 0))}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>정답:</span>
                              <div className="bg-green-100 border border-green-300 rounded px-2 py-1 text-green-800 font-medium">
                                <LaTeXRenderer content={q.correct_answer || 'N/A'} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-blue-800 mb-2">해설:</div>
                        <div className="text-sm text-blue-800">
                          <LaTeXRenderer content={q.explanation || '해설 정보가 없습니다'} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="border-t bg-gray-50 p-4">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium">
                문제 저장하기
              </button>
            </div>
          </>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
