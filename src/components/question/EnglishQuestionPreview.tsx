import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { BaseQuestionPreviewProps } from './QuestionPreviewTypes';
import { QuestionPreviewLoading } from './QuestionPreviewLoading';
import { QuestionPreviewGuide } from './QuestionPreviewGuide';
import { EnglishUIData, ParsedPassage, ParsedQuestion, ParsedContentItem } from '@/types/englishUI';

// 콘텐츠 아이템 렌더링 컴포넌트
const ContentItem: React.FC<{ item: ParsedContentItem }> = ({ item }) => {
  switch (item.type) {
    case 'title':
      return <h3 className="font-bold text-lg mb-2">{item.value}</h3>;
    case 'paragraph':
      if (item.speaker && item.line) {
        return (
          <div className="mb-2">
            <strong>{item.speaker}:</strong> {item.line}
          </div>
        );
      }
      return <p className="mb-2 leading-relaxed">{item.value}</p>;
    case 'list':
      return (
        <ul className="list-disc list-inside mb-2 space-y-1">
          {item.items?.map((listItem, idx) => (
            <li key={idx}>{listItem}</li>
          ))}
        </ul>
      );
    case 'key_value':
      return (
        <div className="mb-2 space-y-1">
          {item.pairs?.map((pair, idx) => (
            <div key={idx} className="flex gap-2">
              <strong>{pair.key}:</strong>
              <span>{pair.value}</span>
            </div>
          ))}
        </div>
      );
    default:
      return <div className="mb-2">{item.value}</div>;
  }
};

// 지문 표시 컴포넌트
const PassageDisplay: React.FC<{ passage: ParsedPassage }> = ({ passage }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'original' | 'translation'>('content');

  return (
    <div className="passage-section mb-6 bg-gray-50 rounded-lg overflow-hidden">
      {/* 지문 헤더 */}
      <div className="passage-header bg-gray-100 p-3 border-b">
        <div className="flex items-center justify-between">
          <span className="passage-type font-semibold text-gray-700">
            📖 지문 {passage.id} [{passage.type}]
          </span>

          {/* 탭 버튼들 */}
          <div className="tab-buttons flex bg-white rounded-md p-1 shadow-sm">
            <button
              className={`px-2 py-1 text-sm rounded transition-colors ${
                activeTab === 'content'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('content')}
            >
              문제용
            </button>
            <button
              className={`px-2 py-1 text-sm rounded transition-colors ${
                activeTab === 'original'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('original')}
            >
              원문
            </button>
            <button
              className={`px-2 py-1 text-sm rounded transition-colors ${
                activeTab === 'translation'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('translation')}
            >
              번역
            </button>
          </div>
        </div>
      </div>

      {/* 지문 내용 */}
      <div className="passage-content p-4">
        {/* 메타데이터 */}
        {passage.originalContent.metadata && (
          <div className="metadata mb-3 p-2 bg-blue-50 rounded text-sm">
            {passage.originalContent.metadata.sender && (
              <div><strong>From:</strong> {passage.originalContent.metadata.sender}</div>
            )}
            {passage.originalContent.metadata.recipient && (
              <div><strong>To:</strong> {passage.originalContent.metadata.recipient}</div>
            )}
            {passage.originalContent.metadata.subject && (
              <div><strong>Subject:</strong> {passage.originalContent.metadata.subject}</div>
            )}
            {passage.originalContent.metadata.date && (
              <div><strong>Date:</strong> {passage.originalContent.metadata.date}</div>
            )}
          </div>
        )}

        {/* 탭에 따른 내용 표시 */}
        <div className="content-display">
          {activeTab === 'content' && (
            <div className="problem-content">
              {passage.content.content.map((item, idx) => (
                <ContentItem key={idx} item={item} />
              ))}
            </div>
          )}

          {activeTab === 'original' && (
            <div className="original-content">
              {passage.originalContent.content.map((item, idx) => (
                <ContentItem key={idx} item={item} />
              ))}
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="translation-content text-gray-700">
              {passage.koreanTranslation.content.map((item, idx) => (
                <ContentItem key={idx} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// 새로운 Props 인터페이스
interface EnglishUIQuestionPreviewProps {
  uiData?: EnglishUIData;
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

export const EnglishQuestionPreview: React.FC<EnglishUIQuestionPreviewProps> = ({
  uiData,
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

  if (!uiData || uiData.questions.length === 0) {
    return <QuestionPreviewGuide subject="english" />;
  }

  // 지문별로 문제를 그룹화
  const groupQuestionsByPassage = () => {
    const groups: Array<{
      passageId: number | null;
      passage?: ParsedPassage;
      questions: ParsedQuestion[];
    }> = [];

    // 지문이 있는 문제들 그룹화
    const passageIds = [...new Set(uiData.questions.map(q => q.passageId).filter(Boolean))];
    passageIds.forEach(passageId => {
      const passage = uiData.passages.find(p => p.id === passageId);
      const questions = uiData.questions.filter(q => q.passageId === passageId);
      if (questions.length > 0) {
        groups.push({ passageId: passageId || null, passage, questions });
      }
    });

    // 독립 문제들 (지문 없는 문제들)
    const independentQuestions = uiData.questions.filter(q => !q.passageId);
    if (independentQuestions.length > 0) {
      groups.push({ passageId: null, questions: independentQuestions });
    }

    return groups;
  };

  const questionGroups = groupQuestionsByPassage();

  return (
    <div className="flex-1 flex flex-col">
      {/* 워크시트 이름 입력 */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={worksheetName}
          onChange={(e) => setWorksheetName(e.target.value)}
          placeholder="문제지 이름을 입력해주세요"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-lg"
        />
      </div>

      {/* 스크롤 가능한 문제 영역 */}
      <ScrollArea
        style={{ height: 'calc(100vh - 440px)' }}
        className="w-full"
      >
        <div className="p-6 space-y-8">
          {questionGroups.map((group, groupIndex) => (
            <div key={group.passageId || 'independent'} className="question-group">

              {/* 각 그룹의 문제들 */}
              {group.questions.map((question, questionIndex) => {

                return (
                  <Card
                    key={question.id}
                    className="question-card animate-fade-in border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{
                      animationDelay: `${(groupIndex * 5 + questionIndex) * 0.2}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards',
                    }}
                  >
                    <CardContent className="p-6">
                      {/* 지문 표시 (첫 번째 문제에만) */}
                      {questionIndex === 0 && group.passage && (
                        <PassageDisplay passage={group.passage} />
                      )}

                      <div className="grid grid-cols-12 gap-6">
                        {/* 좌측: 문제 (8열) */}
                        <div className="col-span-8">
                          <div className="question-header flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="question-number text-sm text-gray-500">
                                문제 {question.id}
                              </span>

                              {/* 문제 정보 뱃지 */}
                              <div className="badges flex gap-1">
                                <span className="badge bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {question.difficulty}
                                </span>
                                <span className="badge bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {question.subject}
                                </span>
                                <span className="badge bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                  {question.detailType}
                                </span>
                              </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex gap-2">
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button
                                className="text-gray-400 hover:text-blue-600 disabled:opacity-50"
                                onClick={() => {
                                  if (showRegenerationInput === question.id) {
                                    setShowRegenerationInput(null);
                                    setRegenerationPrompt('');
                                  } else {
                                    setShowRegenerationInput(question.id);
                                    setRegenerationPrompt('');
                                  }
                                }}
                                disabled={regeneratingQuestionId === question.id}
                                title="문제 재생성"
                              >
                                {regeneratingQuestionId === question.id ? (
                                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* 문제 텍스트 */}
                          <div className="question-text text-base leading-relaxed text-gray-900 mb-4">
                            <LaTeXRenderer content={question.questionText} />
                          </div>

                          {/* 예문 (문제 텍스트 아래) */}
                          {(question.exampleContent || question.exampleOriginalContent || question.exampleKoreanTranslation) && (
                            <div className="example-section mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <h4 className="text-sm font-medium text-blue-800 mb-2">예문</h4>
                              {question.exampleContent && (
                                <div className="mb-2">
                                  <div className="text-sm text-gray-900">{question.exampleContent}</div>
                                </div>
                              )}
                              {question.exampleOriginalContent && (
                                <div className="mb-2">
                                  <div className="text-xs text-gray-600 font-mono">{question.exampleOriginalContent}</div>
                                </div>
                              )}
                              {question.exampleKoreanTranslation && (
                                <div className="text-xs text-gray-500">{question.exampleKoreanTranslation}</div>
                              )}
                            </div>
                          )}

                          {/* 선택지 (객관식인 경우) */}
                          {question.type === '객관식' && (
                            <div className="choices">
                              {question.choices.map((choice, idx) => (
                                <div key={idx} className={`choice mb-3 flex items-start gap-3 ${
                                  idx === question.correctAnswer ? 'correct-choice' : ''
                                }`}>
                                  <span className={`choice-number flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                    idx === question.correctAnswer
                                      ? 'border-green-500 bg-green-500 text-white'
                                      : 'border-gray-300 text-gray-600'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1 text-gray-900">
                                    <LaTeXRenderer content={choice} />
                                  </div>
                                  {idx === question.correctAnswer && (
                                    <span className="correct-mark text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                                      정답
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 우측: 해설 (4열) */}
                        <div className="col-span-4">
                          <div className="explanation-section bg-blue-50 rounded-lg p-4">
                            {/* 정답 표시 */}
                            <div className="answer-display mb-4 p-3 bg-white rounded border-l-4 border-green-500">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-600">정답</span>
                                <div className="answer-value font-medium">
                                  {question.type === '객관식'
                                    ? `${(question.correctAnswer as number) + 1}번`
                                    : question.correctAnswer
                                  }
                                </div>
                              </div>
                            </div>

                            {/* 해설 */}
                            <div className="explanation-content mb-4">
                              <div className="explanation-header text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                📖 해설
                              </div>
                              <div className="explanation-text text-sm text-blue-800 leading-relaxed bg-white p-3 rounded">
                                <LaTeXRenderer content={question.explanation} />
                              </div>
                            </div>

                            {/* 학습 포인트 */}
                            <div className="learning-point bg-yellow-50 border border-yellow-200 rounded p-3">
                              <div className="learning-header text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                                💡 학습 포인트
                              </div>
                              <div className="learning-content text-sm text-yellow-800">
                                {question.learningPoint}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 재생성 프롬프트 입력 영역 */}
                        {showRegenerationInput === question.id && (
                          <div className="col-span-12 mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                재생성 요청 사항 (선택사항)
                              </label>
                              <textarea
                                value={regenerationPrompt}
                                onChange={(e) => setRegenerationPrompt(e.target.value)}
                                placeholder="예: 더 쉽게 만들어줘, 문법 문제로 바꿔줘, 어휘 문제로 만들어줘 등..."
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
                                onClick={() => onRegenerateQuestion(question.id, regenerationPrompt)}
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
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 하단 고정 버튼 영역 */}
      <div className="p-4">
        <button
          onClick={onSaveWorksheet}
          disabled={isSaving || !worksheetName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium"
        >
          {isSaving ? '저장 중...' : '문제 저장하기'}
        </button>
      </div>
    </div>
  );
};
