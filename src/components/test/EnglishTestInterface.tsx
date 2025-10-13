'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaArrowLeft } from "react-icons/fa6";
import { BookOpen } from 'lucide-react';

// 영어 타입 정의 (english.ts에서 가져온 구조)
interface EnglishQuestion {
  id: number;
  worksheet_id: number;
  question_id: number;
  question_text: string;
  question_type: '객관식' | '주관식';
  question_subject: string;
  question_difficulty: '상' | '중' | '하';
  question_detail_type: string;
  question_choices: string[];
  passage_id: number | null;
  correct_answer: string;
  example_content: string;
  explanation: string;
  learning_point: string;
  created_at: string;
}

interface EnglishPassage {
  id: number;
  worksheet_id: number;
  passage_id: number;
  passage_type: 'article' | 'correspondence' | 'dialogue' | 'informational' | 'review';
  passage_content: any;
  original_content: any;
  korean_translation: any;
  related_questions: number[];
  created_at: string;
}

interface EnglishWorksheet {
  id: number;
  title: string;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  status: string;
  deployed_at: string;
  created_at: string;
  school_level: string;
  grade: number;
  semester: number;
  subject: string;
}

interface EnglishTestInterfaceProps {
  selectedWorksheet: EnglishWorksheet;
  currentProblem: EnglishQuestion;
  worksheetProblems: EnglishQuestion[];
  passages: EnglishPassage[];
  currentProblemIndex: number;
  answers: Record<number, string>;
  timeRemaining: number;
  isSubmitting: boolean;
  onAnswerChange: (problemId: number, answer: string) => void;
  onPreviousProblem: () => void;
  onNextProblem: () => void;
  onSubmitTest: () => void;
  onBackToAssignmentList: () => void;
  formatTime: (seconds: number) => string;
}

export function EnglishTestInterface({
  selectedWorksheet,
  currentProblem,
  worksheetProblems,
  passages = [],
  currentProblemIndex,
  answers,
  timeRemaining,
  isSubmitting,
  onAnswerChange,
  onPreviousProblem,
  onNextProblem,
  onSubmitTest,
  onBackToAssignmentList,
  formatTime,
}: EnglishTestInterfaceProps) {
  // 현재 문제와 관련된 지문 찾기
  const currentPassage = passages.find(passage =>
    passage.passage_id === currentProblem.passage_id
  );

  // 지문 종류별 가독성 있는 렌더링
  const renderPassageContent = (content: any, passageType?: string) => {
    if (!content) return null;

    // metadata 렌더링 (correspondence, dialogue, review)
    const renderMetadata = (metadata: any, type: string) => {
      if (!metadata) return null;

      switch (type) {
        case 'correspondence':
          return (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
              <div className="text-sm space-y-1">
                {metadata.sender && <div><span className="font-semibold">From:</span> {metadata.sender}</div>}
                {metadata.recipient && <div><span className="font-semibold">To:</span> {metadata.recipient}</div>}
                {metadata.subject && <div><span className="font-semibold">Subject:</span> {metadata.subject}</div>}
                {metadata.date && <div><span className="font-semibold">Date:</span> {metadata.date}</div>}
              </div>
            </div>
          );
        case 'dialogue':
          return (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-200">
              <div className="text-sm">
                {metadata.participants && (
                  <div><span className="font-semibold">참여자:</span> {metadata.participants.join(', ')}</div>
                )}
              </div>
            </div>
          );
        case 'review':
          return (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-200">
              <div className="text-sm space-y-1">
                {metadata.product_name && <div><span className="font-semibold">상품:</span> {metadata.product_name}</div>}
                {metadata.reviewer && <div><span className="font-semibold">리뷰어:</span> {metadata.reviewer}</div>}
                {metadata.rating && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">평점:</span>
                    <div className="flex items-center">
                      <span className="text-yellow-600 font-bold">{metadata.rating}</span>
                      <span className="text-yellow-500 ml-1">★</span>
                    </div>
                  </div>
                )}
                {metadata.date && <div><span className="font-semibold">Date:</span> {metadata.date}</div>}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    let contentArray = null;
    let metadata = null;

    // content.content 배열이 있는 경우 (EnglishPassageContent 형태)
    if (content.content && Array.isArray(content.content)) {
      contentArray = content.content;
      metadata = content.metadata;
    }
    // 직접 배열인 경우
    else if (Array.isArray(content)) {
      contentArray = content;
    }
    // 단순 문자열인 경우
    else if (typeof content === 'string') {
      return <p className="mb-3 leading-relaxed text-gray-700">{content}</p>;
    }

    if (!contentArray) return null;

    return (
      <div>
        {/* metadata 렌더링 */}
        {metadata && renderMetadata(metadata, passageType || '')}

        {/* content 렌더링 */}
        {contentArray.map((item: any, index: number) => {
          return renderContentItem(item, index, passageType);
        })}
      </div>
    );
  };

  // EnglishContentItem 지문 종류별 렌더링
  const renderContentItem = (item: any, index: number, passageType?: string) => {
    if (!item) return null;

    // dialogue 타입의 경우 speaker와 line을 특별히 처리
    if (passageType === 'dialogue' && item.speaker && item.line) {
      return (
        <div key={index} className="mb-2 p-2 bg-gray-50 rounded border-l-4 border-gray-300">
          <span className="font-semibold text-blue-700">{item.speaker}:</span>
          <span className="ml-2 text-gray-800">{item.line}</span>
        </div>
      );
    }

    switch (item.type) {
      case 'title':
        return (
          <h3 key={index} className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">
            {item.value || item.line || ''}
          </h3>
        );
      case 'paragraph':
        return (
          <p key={index} className="mb-3 leading-relaxed text-gray-700 text-justify">
            {item.speaker && passageType !== 'dialogue' && (
              <span className="font-semibold text-blue-600">{item.speaker}: </span>
            )}
            {item.value || item.line || ''}
          </p>
        );
      case 'list':
        return (
          <div key={index} className="mb-4">
            <ul className="list-disc list-inside space-y-1 ml-4">
              {item.items?.map((listItem: string, listIndex: number) => (
                <li key={listIndex} className="text-gray-700">{listItem}</li>
              ))}
            </ul>
          </div>
        );
      case 'key_value':
        return (
          <div key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
            {item.pairs?.map((pair: any, pairIndex: number) => (
              <div key={pairIndex} className="flex justify-between py-1 border-b border-gray-200 last:border-b-0">
                <span className="font-semibold text-gray-800">{pair.key}</span>
                <span className="text-gray-700">{pair.value}</span>
              </div>
            ))}
          </div>
        );
      default:
        // type이 없는 경우 처리
        if (item.speaker && item.line && passageType === 'dialogue') {
          return (
            <div key={index} className="mb-2 p-2 bg-gray-50 rounded border-l-4 border-gray-300">
              <span className="font-semibold text-blue-700">{item.speaker}:</span>
              <span className="ml-2 text-gray-800">{item.line}</span>
            </div>
          );
        }
        if (item.value || item.line) {
          return (
            <p key={index} className="mb-3 leading-relaxed text-gray-700 text-justify">
              {item.value || item.line}
            </p>
          );
        }
        return null;
    }
  };

  return (
    <Card className="flex flex-col shadow-sm h-full">
      {/* 상단 네비게이션 */}
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-gray-100 flex-shrink-0">
        {/* 이전으로 돌아가기 버튼 */}
        <button
          onClick={onBackToAssignmentList}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200"
          style={{ backgroundColor: '#f5f5f5', borderRadius: '50%', cursor: 'pointer' }}
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>

        {/* 문제지명과 남은 시간 */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              {selectedWorksheet.title}
            </span>
          </div>
          <div className="px-3 py-2 rounded-md" style={{ backgroundColor: '#f5f5f5' }}>
            <span className="text-lg font-semibold text-gray-900">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* 제출하기 버튼 */}
        <Button
          onClick={onSubmitTest}
          disabled={isSubmitting || Object.keys(answers).length < worksheetProblems.length}
          className="bg-[#0072CE] hover:bg-[#0056A3] text-white disabled:bg-gray-400"
        >
          {isSubmitting ? '제출 중...' : Object.keys(answers).length < worksheetProblems.length ? `제출하기 (${Object.keys(answers).length}/${worksheetProblems.length})` : '제출하기'}
        </Button>
      </CardHeader>
      
      {/* 문제 내용 */}
      <CardContent className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-6">
            {/* 지문 영역 */}
            {currentPassage && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {currentPassage.passage_type}
                  </Badge>
                  <span className="text-sm text-gray-600">지문 {currentPassage.passage_id}</span>
                </div>

                {/* 원문만 표시 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Original Text</h4>
                  <div className="text-sm">
                    {renderPassageContent(currentPassage.passage_content, currentPassage.passage_type)}
                  </div>
                </div>
              </div>
            )}

            {/* 문제 영역 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  문제 {currentProblem.question_id}
                </Badge>
                <Badge
                  variant={currentProblem.question_difficulty === '상' ? 'destructive' :
                          currentProblem.question_difficulty === '중' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {currentProblem.question_difficulty}
                </Badge>
                <span className="text-sm text-gray-600">{currentProblem.question_detail_type}</span>
              </div>

              {/* 문제 */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                  {currentProblem.question_text}
                </h3>

                {/* 예문 */}
                {currentProblem.example_content && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-2">예문:</p>
                    <p className="text-sm text-gray-700">{currentProblem.example_content}</p>
                  </div>
                )}

                {/* 선택지 */}
                {currentProblem.question_type === '객관식' && currentProblem.question_choices && (
                  <div className="space-y-2">
                    {currentProblem.question_choices.map((choice, index) => {
                      const choiceLabel = String(index + 1);
                      const isSelected = answers[currentProblem.question_id] === choiceLabel;

                      return (
                        <label
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentProblem.question_id}`}
                            value={choiceLabel}
                            checked={isSelected}
                            onChange={() => {
                              console.log('🎯 영어 답안 선택:', { problemId: currentProblem.question_id, choiceLabel, index });
                              onAnswerChange(currentProblem.question_id, choiceLabel);
                            }}
                            className="mt-1"
                          />
                          <span className="flex-1 text-sm leading-relaxed">
                            <span className="font-medium mr-2">({choiceLabel})</span>
                            {choice}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 단답형 답안 입력 */}
                {currentProblem.question_type?.toLowerCase() === '단답형' && (
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="답안을 입력하세요..."
                    value={answers[currentProblem.question_id] || ''}
                    onChange={(e) => onAnswerChange(currentProblem.question_id, e.target.value)}
                  />
                )}

                {/* 서술형 답안 입력 */}
                {currentProblem.question_type?.toLowerCase() === '서술형' && (
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    rows={4}
                    placeholder="답안을 입력하세요..."
                    value={answers[currentProblem.question_id] || ''}
                    onChange={(e) => onAnswerChange(currentProblem.question_id, e.target.value)}
                  />
                )}
              </div>

              {/* 하단 버튼 영역 */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={onPreviousProblem}
                    disabled={currentProblemIndex === 0}
                    className="flex items-center gap-2"
                  >
                    이전 문제
                  </Button>

                  <div className="flex gap-2">
                    {currentProblemIndex === worksheetProblems.length - 1 ? (
                      <Button
                        onClick={onSubmitTest}
                        disabled={isSubmitting || Object.keys(answers).length < worksheetProblems.length}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
                      >
                        {isSubmitting ? '제출 중...' : Object.keys(answers).length < worksheetProblems.length ? `시험 제출 (${Object.keys(answers).length}/${worksheetProblems.length})` : '시험 제출'}
                      </Button>
                    ) : (
                      <Button
                        onClick={onNextProblem}
                        disabled={currentProblemIndex === worksheetProblems.length - 1}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        다음 문제
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
