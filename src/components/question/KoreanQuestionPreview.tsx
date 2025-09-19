import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { BaseQuestionPreviewProps } from './QuestionPreviewTypes';
import { QuestionPreviewLoading } from './QuestionPreviewLoading';
import { QuestionPreviewGuide } from './QuestionPreviewGuide';

export const KoreanQuestionPreview: React.FC<BaseQuestionPreviewProps> = ({
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
    return <QuestionPreviewLoading generationProgress={generationProgress} />;
  }

  if (previewQuestions.length === 0) {
    return <QuestionPreviewGuide subject="korean" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 워크시트 이름 입력 */}
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
        {/* 지문과 문제 그룹핑 표시 */}
        {previewQuestions.length > 0 && (
          <div className="p-6 space-y-8">
            {(() => {
              // 작품별로 문제들을 그룹핑
              const workGroups = new Map();
              previewQuestions.forEach((q) => {
                if (q.source_text && q.source_title && q.source_author) {
                  const key = `${q.source_title}-${q.source_author}`;
                  if (!workGroups.has(key)) {
                    workGroups.set(key, {
                      title: q.source_title,
                      author: q.source_author,
                      text: q.source_text,
                      problems: [],
                    });
                  }
                  workGroups.get(key).problems.push(q);
                }
              });
              return Array.from(workGroups.values());
            })().map((work, workIndex) => (
              <div key={workIndex} className="space-y-6">
                {/* 지문 표시 */}
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

                {/* 해당 지문의 문제들 */}
                <div className="space-y-6">
                  {work.problems.map((q, problemIndex) => (
                    <Card
                      key={q.id}
                      className="animate-fade-in border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      style={{
                        animationDelay: `${
                          (workIndex * work.problems.length + problemIndex) * 0.2
                        }s`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="grid grid-cols-12 gap-4">
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
                                  placeholder="예: 더 쉽게 만들어줘, 다른 관점에서 문제를 만들어줘, 서술형으로 바꿔줘 등..."
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
