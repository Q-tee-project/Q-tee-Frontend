import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';
import { PreviewQuestion } from '@/hooks/useProblemGeneration';

interface QuestionPreviewProps {
  previewQuestions: PreviewQuestion[];
  isGenerating: boolean;
  generationProgress: number;
  worksheetName: string;
  setWorksheetName: (name: string) => void;
  regeneratingQuestionId: number | null;
  regenerationPrompt: string;
  setRegenerationPrompt: (prompt: string) => void;
  showRegenerationInput: number | null;
  setShowRegenerationInput: (id: number | null) => void;
  onRegenerateQuestion: (questionId: number, prompt?: string) => void;
  onSaveWorksheet: () => void;
  isSaving: boolean;
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  previewQuestions,
  isGenerating,
  generationProgress,
  worksheetName,
  setWorksheetName,
  regeneratingQuestionId,
  regenerationPrompt,
  setRegenerationPrompt,
  showRegenerationInput,
  setShowRegenerationInput,
  onRegenerateQuestion,
  onSaveWorksheet,
  isSaving,
}) => {
  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700 mb-2">문제를 생성하고 있습니다...</div>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 mt-2">{Math.round(generationProgress)}% 완료</div>
        </div>
      </div>
    );
  }

  if (previewQuestions.length === 0) {
    return (
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
              <ol className="text-sm space-y-1 text-blue-800">
                <li>1. 좌측에서 과목을 선택하세요</li>
                <li>2. 생성 옵션을 설정하세요</li>
                <li>3. '문제 생성' 버튼을 클릭하세요</li>
                <li>4. 생성된 문제를 확인하고 수정하세요</li>
                <li>5. 문제지 이름을 입력하고 저장하세요</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
          height: previewQuestions.length > 0 ? 'calc(100vh - 440px)' : 'calc(100vh - 380px)',
        }}
        className="w-full"
      >
        <div className="p-6 space-y-6">
          {(() => {
            // 국어 문제의 경우 지문별로 그룹핑
            const hasSourceText = previewQuestions.some((q: any) => q.source_text || q.source_title);

            if (hasSourceText) {
              // 지문이 있는 문제와 없는 문제를 분리
              const workGroups = new Map();
              const grammarProblems: any[] = [];

              previewQuestions.forEach((q: any) => {
                if (q.source_text && q.source_title && q.source_author) {
                  const key = `${q.source_title}-${q.source_author}`;
                  if (!workGroups.has(key)) {
                    workGroups.set(key, {
                      title: q.source_title,
                      author: q.source_author,
                      text: q.source_text,
                      problems: [],
                      firstProblemId: q.id,
                    });
                  }
                  workGroups.get(key).problems.push(q);
                } else {
                  grammarProblems.push(q);
                }
              });

              // 문법 문제들도 각각 개별 그룹으로 추가
              grammarProblems.forEach((q) => {
                const key = `grammar-${q.id}`;
                workGroups.set(key, {
                  title: null,
                  author: null,
                  text: null,
                  problems: [q],
                  firstProblemId: q.id,
                });
              });

              // firstProblemId 순서로 정렬
              const allGroups = Array.from(workGroups.values()).sort((a, b) => a.firstProblemId - b.firstProblemId);

              return allGroups.map((work: any, workIndex: number) => (
                <div key={workIndex} className="space-y-6">
                  {/* 지문 표시 (지문이 있는 경우에만) */}
                  {work.text && work.title && work.author && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          📖 지문 {workIndex + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          - {work.title} ({work.author})
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                        {work.text}
                      </div>
                    </div>
                  )}

                  {/* 해당 지문의 문제들 */}
                  {work.problems.map((q: any, problemIndex: number) => (
                    <div
                      key={q.id}
                      className="grid grid-cols-12 gap-4 animate-fade-in"
                      style={{
                        animationDelay: `${problemIndex * 0.2}s`,
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
                          <LaTeXRenderer content={(q.question || q.title).replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '').trim()} />
                        </div>
                        {(q as any).tikz_code && (
                          <div className="mb-4">
                            <TikZRenderer tikzCode={(q as any).tikz_code} />
                          </div>
                        )}
                        {(q.choices || q.options) &&
                          (q.choices || q.options)!.map((opt: string, idx: number) => {
                            const displayChoice = opt.replace(/^[A-E][\.\):\s]+/, '');
                            return (
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
                                  <LaTeXRenderer content={displayChoice} />
                                </div>
                                {idx === q.answerIndex && (
                                  <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                                    정답
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                      <div className="col-span-4">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            {(q.choices || q.options) && (q.choices || q.options)!.length > 0 ? (
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
                              onClick={() => onRegenerateQuestion(q.id, regenerationPrompt)}
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
              ));
            }

            // 수학 문제의 경우 기존 렌더링 방식 유지
            return previewQuestions.map((q, index) => (
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
                    <LaTeXRenderer content={(q.question || q.title).replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '').trim()} />
                  </div>
                  {(q as any).tikz_code && (
                    <div className="mb-4">
                      <TikZRenderer tikzCode={(q as any).tikz_code} />
                    </div>
                  )}
                  {(q.choices || q.options) &&
                    (q.choices || q.options)!.map((opt, idx) => {
                      const displayChoice = opt.replace(/^[A-E][\.\):\s]+/, '');
                      return (
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
                            <LaTeXRenderer content={displayChoice} />
                          </div>
                          {idx === q.answerIndex && (
                            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                              정답
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
                <div className="col-span-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      {(q.choices || q.options) && (q.choices || q.options)!.length > 0 ? (
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
                        onClick={() => onRegenerateQuestion(q.id, regenerationPrompt)}
                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        재생성
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </ScrollArea>

      {/* 하단 고정 버튼 영역 - 문제가 생성된 경우에만 표시 */}
      {previewQuestions.length > 0 && (
        <div className="p-4">
          <button
            onClick={onSaveWorksheet}
            disabled={isSaving || !worksheetName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium"
          >
            {isSaving ? '저장 중...' : '문제 저장하기'}
          </button>
        </div>
      )}
    </div>
  );
};
