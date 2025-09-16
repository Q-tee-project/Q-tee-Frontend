'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle } from 'lucide-react';
import KoreanGenerator from '@/components/subjects/KoreanGenerator';
import EnglishGenerator from '@/components/subjects/EnglishGenerator';
import MathGenerator from '@/components/subjects/MathGenerator';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { ErrorToast } from '@/app/question/bank/components/ErrorToast';

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
    backendId?: number; // 백엔드 원본 ID
  };
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
  // 문제 생성 페이지는 열람만 가능 (편집 기능 제거)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<number | null>(null);
  const [regenerationPrompt, setRegenerationPrompt] = useState('');
  const [showRegenerationInput, setShowRegenerationInput] = useState<number | null>(null);
  const [lastGenerationData, setLastGenerationData] = useState<any>(null);
  const [worksheetName, setWorksheetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentWorksheetId, setCurrentWorksheetId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toast 자동 닫기
  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000); // 5초 후 자동 닫기

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // 개별 문제 재생성 함수
  const regenerateQuestion = async (questionId: number, prompt?: string) => {
    if (!lastGenerationData) {
      alert('원본 생성 데이터가 없습니다.');
      return;
    }

    try {
      setRegeneratingQuestionId(questionId);

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      // 재생성 요청 데이터 구성
      const regenerationData = {
        ...lastGenerationData,
        regeneration_prompt: prompt || '',
        target_question_id: questionId,
      };

      console.log('🔄 문제 재생성 요청:', regenerationData);

      // 재생성 API 호출
      const response = await fetch(
        `http://localhost:8001/api/math-generation/regenerate?user_id=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(regenerationData),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ 재생성 API 응답 오류:', response.status, errorData);
        throw new Error(`문제 재생성 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      // 재생성된 문제로 기존 문제 교체
      if (data.regenerated_problem) {
        const updatedQuestions = previewQuestions.map((q) => {
          if (q.id === questionId) {
            return {
              id: q.id,
              title: data.regenerated_problem.question,
              options: data.regenerated_problem.choices || undefined,
              answerIndex: data.regenerated_problem.choices
                ? data.regenerated_problem.choices.findIndex(
                    (choice: string) => choice === data.regenerated_problem.correct_answer,
                  )
                : undefined,
              correct_answer: data.regenerated_problem.correct_answer,
              explanation: data.regenerated_problem.explanation,
              question: data.regenerated_problem.question,
              choices: data.regenerated_problem.choices,
            };
          }
          return q;
        });
        setPreviewQuestions(updatedQuestions);
      }

      setShowRegenerationInput(null);
      setRegenerationPrompt('');
    } catch (error) {
      console.error('문제 재생성 오류:', error);
      setErrorMessage('문제 재생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setRegeneratingQuestionId(null);
    }
  };

  // 국어 문제 생성 API 호출
  const generateKoreanProblems = async (requestData: any) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setPreviewQuestions([]);

      console.log('🚀 국어 문제 생성 요청 데이터:', requestData);

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      // 생성 데이터 저장 (재생성에 사용)
      setLastGenerationData(requestData);

      // 국어 문제 생성 API 호출
      const response = await fetch(
        `http://localhost:8004/api/korean-generation/generate?user_id=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API 응답 오류:', response.status, errorData);
        throw new Error(`국어 문제 생성 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      // 진행 상황 폴링
      await pollTaskStatus(data.task_id, 'korean');
    } catch (error) {
      console.error('국어 문제 생성 오류:', error);
      setErrorMessage('국어 문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsGenerating(false);
    }
  };

  // 수학 문제 생성 API 호출
  const generateMathProblems = async (requestData: any) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setPreviewQuestions([]);

      console.log('🚀 문제 생성 요청 데이터:', requestData);

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      // 생성 데이터 저장 (재생성에 사용)
      setLastGenerationData(requestData);

      // 문제 생성 API 호출
      const response = await fetch(
        `http://localhost:8001/api/math-generation/generate?user_id=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

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
      setErrorMessage('문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsGenerating(false);
    }
  };

  // 태스크 상태 폴링
  const pollTaskStatus = async (taskId: string, subject_type: string = 'math') => {
    let attempts = 0;
    const maxAttempts = 600; // 10분 최대 대기 (600초)

    const poll = async () => {
      try {
        const apiUrl = subject_type === 'korean'
          ? `http://localhost:8004/api/korean-generation/tasks/${taskId}`
          : `http://localhost:8001/api/math-generation/tasks/${taskId}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log('📊 태스크 상태:', data);

        if (data.status === 'PROGRESS') {
          setGenerationProgress(Math.round((data.current / data.total) * 100));
        } else if (data.status === 'SUCCESS') {
          console.log('✅ 문제 생성 성공:', data.result);
          // 성공 시 워크시트 상세 조회
          if (data.result && data.result.worksheet_id) {
            await fetchWorksheetResult(data.result.worksheet_id, subject_type);
          } else {
            console.error('❌ 성공했지만 worksheet_id가 없음:', data);
            setErrorMessage(
              '문제 생성은 완료되었지만 결과를 불러올 수 없습니다. 다시 시도해주세요.',
            );
          }
          return;
        } else if (data.status === 'FAILURE') {
          console.error('❌ 문제 생성 실패:', data.error);
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
        setErrorMessage('문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsGenerating(false);
      }
    };

    await poll();
  };

  // 워크시트 결과 조회
  const fetchWorksheetResult = async (worksheetId: number, subject_type: string = 'math') => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const apiUrl = subject_type === 'korean'
        ? `http://localhost:8004/api/korean-generation/worksheets/${worksheetId}?user_id=${userId}`
        : `http://localhost:8001/api/math-generation/worksheets/${worksheetId}?user_id=${userId}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log('🔍 워크시트 조회 결과:', data);
      console.log(`📊 받은 문제 개수: ${data.problems?.length || 0}`);

      // 원본 문제 데이터 상세 출력
      if (data.problems && Array.isArray(data.problems)) {
        console.log('📝 원본 문제 데이터 상세:');
        data.problems.forEach((problem: any, index: number) => {
          console.log(`문제 ${index + 1}:`, {
            id: problem.id,
            question: problem.question,
            question_length: problem.question?.length || 0,
            choices: problem.choices,
            correct_answer: problem.correct_answer,
            explanation: problem.explanation,
            explanation_length: problem.explanation?.length || 0,
          });
        });
        // 백엔드 데이터를 프론트엔드 형식으로 변환 (연속 번호 사용)
        const convertedQuestions: PreviewQuestion[] = data.problems.map(
          (problem: any, index: number) => ({
            id: index + 1, // 연속 번호 사용 (1, 2, 3...)
            title: problem.question,
            options: problem.choices ? problem.choices : undefined,
            answerIndex: problem.choices
              ? problem.choices.findIndex((choice: string) => choice === problem.correct_answer)
              : undefined,
            correct_answer: problem.correct_answer,
            explanation: problem.explanation,
            question: problem.question,
            choices: problem.choices,
            backendId: problem.id, // 백엔드 ID는 별도 저장
          }),
        );

        console.log('📈 변환된 문제 데이터:', convertedQuestions);

        // 문제 유효성 검증 (기준 완화 및 상세 분석)
        const validQuestions = convertedQuestions.filter((q, index) => {
          console.log(`\n🔍 문제 ${index + 1} 검증 중:`, q.question || q.title);

          const hasQuestion =
            q.question && typeof q.question === 'string' && q.question.trim().length > 0;
          const hasTitle = q.title && typeof q.title === 'string' && q.title.trim().length > 0;
          const hasExplanation =
            q.explanation && typeof q.explanation === 'string' && q.explanation.trim().length > 0;

          // 빈 문제 또는 오류 문제 감지
          const isEmptyQuestion = !hasQuestion && !hasTitle;

          // 문제지 타이틀 패턴 감지 (정확한 패턴만)
          const isTitlePattern =
            (q.question && q.question.includes('[일차방정식의 풀이] 기본 문제')) ||
            (q.title && q.title.includes('[일차방정식의 풀이] 기본 문제'));

          const isErrorQuestion =
            (q.question &&
              (q.question.includes('오류') ||
                q.question.includes('error') ||
                q.question.includes('Error'))) ||
            (q.title &&
              (q.title.includes('오류') || q.title.includes('error') || q.title.includes('Error')));

          // 기본 유효성 (더 관대하게)
          const isValid =
            (hasQuestion || hasTitle) &&
            hasExplanation &&
            !isEmptyQuestion &&
            !isErrorQuestion &&
            !isTitlePattern;

          console.log(`📊 검증 결과:`, {
            hasQuestion: hasQuestion,
            hasTitle: hasTitle,
            hasExplanation: hasExplanation,
            isEmptyQuestion: isEmptyQuestion,
            isErrorQuestion: isErrorQuestion,
            isTitlePattern: isTitlePattern,
            isValid: isValid,
            questionLength: q.question?.length || 0,
            explanationLength: q.explanation?.length || 0,
          });

          if (!isValid) {
            if (typeof console !== 'undefined' && console.error) {
              console.error(`❌ 문제 ${index + 1} 제외 사유:`, {
                question:
                  q.question?.substring(0, 100) + ((q.question?.length || 0) > 100 ? '...' : ''),
                title: q.title?.substring(0, 100) + ((q.title?.length || 0) > 100 ? '...' : ''),
                explanation:
                  q.explanation?.substring(0, 100) +
                  ((q.explanation?.length || 0) > 100 ? '...' : ''),
                  reasons: [
                    !hasQuestion && !hasTitle ? '제목/질문 없음' : null,
                    !hasExplanation ? '해설 없음' : null,
                    isEmptyQuestion ? '빈 문제' : null,
                    isErrorQuestion ? '오류 키워드 포함' : null,
                    isTitlePattern ? '타이틀 패턴 감지' : null,
                  ].filter(Boolean),
                });
              }
            }

          return isValid;
        });

        console.log(`✅ 유효한 문제: ${validQuestions.length}/${convertedQuestions.length}`);

        if (validQuestions.length === 0) {
          console.error('❌ 모든 문제가 무효함');
          console.error('🔧 원본 데이터 강제 표시 (디버깅용):');

          // 디버깅을 위해 원본 데이터를 강제로 표시하는 옵션
          const forceShowInvalidQuestions = convertedQuestions.map((q, index) => ({
            ...q,
            id: index + 1,
            title: q.title || q.question || `[디버깅] 빈 문제 ${index + 1}`,
            question: q.question || q.title || `[디버깅] 빈 문제 ${index + 1}`,
            explanation: q.explanation || '[디버깅] 해설이 없는 문제입니다.',
          }));

          console.log('🔧 강제 표시될 문제들:', forceShowInvalidQuestions);

          setErrorMessage(
            '⚠️ 백엔드에서 유효하지 않은 문제가 생성되었습니다.\\n\\n임시로 모든 문제를 표시합니다. (디버깅 모드)\\n\\n✅ 실제 서비스에서는 이 문제들이 자동으로 필터링됩니다.',
          );
          setPreviewQuestions(forceShowInvalidQuestions);
          return;
        }

        if (validQuestions.length < convertedQuestions.length) {
          const invalidCount = convertedQuestions.length - validQuestions.length;
          console.warn(`⚠️ ${invalidCount}개 문제 제외됨`);
          setErrorMessage(
            `${invalidCount}개의 문제에 오류가 있어 제외되었습니다.\n유효한 ${validQuestions.length}개 문제만 표시됩니다.\n\n더 많은 유효 문제가 필요하면 다시 생성해주세요.`,
          );
        }

        setPreviewQuestions(validQuestions);
        // 자동 저장 방지: currentWorksheetId 설정을 제거하고 사용자가 직접 저장할 때만 설정

        // 문제지 이름 자동 설정 (사용자가 비워둔 경우에만)
        if (!worksheetName.trim() && data.worksheet) {
          const autoName = `${data.worksheet.unit_name || '수학'} - ${
            data.worksheet.chapter_name || '문제'
          }`;
          setWorksheetName(autoName);
        }
      } else {
        console.error('❌ API 응답에 problems 배열이 없음:', data);
        setErrorMessage('문제 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('워크시트 조회 오류:', error);
      setErrorMessage('워크시트를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  // 문제지 저장 함수
  const saveWorksheet = async () => {
    if (!worksheetName.trim()) {
      alert('문제지 이름을 입력해주세요.');
      return;
    }

    if (previewQuestions.length === 0) {
      alert('저장할 문제가 없습니다.');
      return;
    }

    try {
      setIsSaving(true);

      // 현재 로그인한 사용자 정보 가져오기
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      let saveData;
      if (currentWorksheetId) {
        // 기존 워크시트 업데이트
        saveData = {
          worksheet_id: currentWorksheetId,
          name: worksheetName,
          problems: previewQuestions.map((q) => ({
            question: q.question || q.title,
            choices: q.choices || q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
        };
      } else {
        // 새 워크시트 생성
        saveData = {
          name: worksheetName,
          subject: subject,
          problems: previewQuestions.map((q) => ({
            question: q.question || q.title,
            choices: q.choices || q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
        };
      }

      console.log('💾 문제지 저장 요청:', saveData);

      const endpoint = currentWorksheetId
        ? `http://localhost:8001/api/math-generation/worksheets/${currentWorksheetId}?user_id=${userId}`
        : `http://localhost:8001/api/math-generation/save-worksheet?user_id=${userId}`;

      const method = currentWorksheetId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ 저장 API 응답 오류:', response.status, errorData);
        throw new Error(`문제지 저장 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!currentWorksheetId && result.worksheet_id) {
        setCurrentWorksheetId(result.worksheet_id);
      }

      setErrorMessage('문제지가 성공적으로 저장되었습니다! ✅');
    } catch (error) {
      console.error('문제지 저장 오류:', error);
      setErrorMessage('문제지 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // 과목별 문제 생성 핸들러
  const handleGenerate = (data: any) => {
    if (subject === '수학') {
      generateMathProblems(data);
    } else if (subject === '국어') {
      generateKoreanProblems(data);
    } else {
      // 영어는 임시 목업 생성
      generateMockProblems(data);
    }
  };

  // 목업 문제 생성 (국어, 영어용)
  const generateMockProblems = async (data: any) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setPreviewQuestions([]);

    const cnt = Math.min(data.questionCount ?? 2, 5);

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
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<PlusCircle />}
        title="문제 생성"
        variant="question"
        description="과목별 문제를 생성할 수 있습니다"
      />

      {/* 과목 탭 */}
      <div className="px-6 pb-2 flex-shrink-0">
        <nav className="flex space-x-8">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSubject(s);
                setPreviewQuestions([]); // 과목 변경 시 초기화
                setWorksheetName(''); // 문제지 이름도 초기화
                setCurrentWorksheetId(null); // 워크시트 ID 초기화
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                subject === s
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-4 min-h-0">
        <div className="flex gap-4 h-full">
          <Card className="w-[400px] flex flex-col shadow-sm h-[calc(100vh-200px)]">
            <CardHeader className="flex flex-row items-center justify-center py-1 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-medium">문제 생성</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
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
              {!subject && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">과목을 선택해주세요</div>
                    <div className="text-sm">
                      위의 탭에서 과목을 선택하면 문제 생성 폼이 나타납니다.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 오른쪽 영역 - 결과 미리보기 자리 */}
          <Card className="flex-1 flex flex-col shadow-sm h-[calc(100vh-200px)]">
            <CardHeader className="flex flex-row items-center justify-center py-1 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-medium">문제지</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
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
                    <div className="text-sm text-gray-500 mt-2">
                      {Math.round(generationProgress)}% 완료
                    </div>
                  </div>
                </div>
              ) : previewQuestions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center max-w-lg">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">문제 생성 가이드</h3>
                    </div>

                    <div className="text-left space-y-4 text-gray-700">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">📝 문제 생성 순서</h4>
                        <ol className="text-sm space-y-1 text-blue-800">
                          <li>1. 좌측에서 과목을 선택하세요</li>
                          <li>2. 생성 옵션을 설정하세요</li>
                          <li>3. '문제 생성' 버튼을 클릭하세요</li>
                          <li>4. 생성된 문제를 확인하고 수정하세요</li>
                          <li>5. 문제지 이름을 입력하고 저장하세요</li>
                        </ol>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-2">✨ 팁</h4>
                        <ul className="text-sm space-y-1 text-green-800">
                          <li>• 각 문제 옆의 새로고침 버튼으로 개별 재생성 가능</li>
                          <li>• 재생성 시 요청사항을 입력하면 더 원하는 문제 생성</li>
                          <li>• 마음에 드는 문제만 선택해서 저장 가능</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-2">⚠️ 주의사항</h4>
                        <ul className="text-sm space-y-1 text-yellow-800">
                          <li>• 문제 생성 후 '문제 저장하기'를 누르지 않으면 저장되지 않습니다</li>
                          <li>• 빈 문제나 오류 문제가 생성되면 자동으로 알림이 표시됩니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* 문제지 이름 입력 - 문제가 생성된 경우에만 표시 */}
                  {previewQuestions.length > 0 && (
                    <div className="p-4 border-b border-gray-200">
                      <input
                        type="text"
                        value={worksheetName}
                        onChange={(e) => setWorksheetName(e.target.value)}
                        placeholder="문제지 이름을 입력해주세요"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-lg"
                      />
                    </div>
                  )}

                  {/* 스크롤 가능한 문제 영역 */}
                  <ScrollArea
                    style={{
                      height:
                        previewQuestions.length > 0 ? 'calc(100vh - 440px)' : 'calc(100vh - 380px)',
                    }}
                    className="w-full"
                  >
                    <div className="p-6 space-y-6">
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
                                <button
                                  className="text-gray-400 hover:text-blue-600 disabled:opacity-50"
                                  onClick={() => {
                                    if (showRegenerationInput === q.id) {
                                      setShowRegenerationInput(null);
                                      setRegenerationPrompt('');
                                    } else {
                                      setShowRegenerationInput(q.id);
                                      setRegenerationPrompt('');
                                    }
                                  }}
                                  disabled={regeneratingQuestionId === q.id}
                                  title="문제 재생성"
                                >
                                  {regeneratingQuestionId === q.id ? (
                                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                  ) : (
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
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="text-base leading-relaxed text-gray-900 mb-4">
                              <LaTeXRenderer content={q.title} />
                            </div>
                            {q.options &&
                              q.options.map((opt, idx) => (
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
                                  <span>
                                    정답: {String.fromCharCode(65 + (q.answerIndex || 0))}
                                  </span>
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

                          {/* 재생성 프롬프트 입력 영역 */}
                          {showRegenerationInput === q.id && (
                            <div className="col-span-12 mt-4 p-4 bg-gray-50 rounded-lg border">
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  재생성 요청 사항 (선택사항)
                                </label>
                                <textarea
                                  value={regenerationPrompt}
                                  onChange={(e) => setRegenerationPrompt(e.target.value)}
                                  placeholder="예: 더 쉽게 만들어줘, 계산 문제로 바꿔줘, 단위를 미터로 바꿔줘 등..."
                                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setShowRegenerationInput(null);
                                    setRegenerationPrompt('');
                                  }}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  취소
                                </button>
                                <button
                                  onClick={() => regenerateQuestion(q.id, regenerationPrompt)}
                                  className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  재생성
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* 하단 고정 버튼 영역 - 문제가 생성된 경우에만 표시 */}
                  {previewQuestions.length > 0 && (
                    <div className="p-4">
                      <button
                        onClick={saveWorksheet}
                        disabled={isSaving || !worksheetName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium"
                      >
                        {isSaving ? '저장 중...' : '문제 저장하기'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Toast */}
      <ErrorToast error={errorMessage} onClose={() => setErrorMessage(null)} />
    </div>
  );
}
