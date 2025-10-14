import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';
import type { AnswerStatus, SubjectType } from './types';

// 선택지 아이템 컴포넌트 (메모이제이션)
const ChoiceItem = React.memo(function ChoiceItem({
  choice,
  choiceNum,
  subject,
  isStudentChoice,
  isCorrectChoice,
}: {
  choice: string;
  choiceNum: string;
  subject: SubjectType;
  isStudentChoice: boolean;
  isCorrectChoice: boolean;
}) {
  return (
    <div
      className={`p-3 rounded border text-sm ${
        isCorrectChoice
          ? 'bg-blue-50 border-blue-200'
          : isStudentChoice
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[20px]">{choiceNum}.</span>
        <div className="flex-1">
          {subject === 'math' ? (
            <LaTeXRenderer content={choice || ''} />
          ) : (
            <span>{choice}</span>
          )}
        </div>
        {isStudentChoice && <span className="text-xs text-gray-500">(학생 선택)</span>}
        {isCorrectChoice && <span className="text-xs text-blue-600">(정답)</span>}
      </div>
    </div>
  );
});

interface ProblemCardProps {
  problemNumber: number;
  problem: any;
  answerStatus: AnswerStatus | null;
  subject: SubjectType;
  isEditMode: boolean;
  problemCorrectness: { [key: string]: boolean };
  onToggleCorrectness: (problemId: string) => void;
}

export const ProblemCard = React.memo(function ProblemCard({
  problemNumber,
  problem,
  answerStatus,
  subject,
  isEditMode,
  problemCorrectness,
  onToggleCorrectness,
}: ProblemCardProps) {
  const problemId = useMemo(() => {
    return subject === 'korean'
      ? problem.id
      : subject === 'english'
      ? problem.question_id
      : problem.id;
  }, [subject, problem.id, problem.question_id]);

  const isCorrect = useMemo(() => {
    return problemCorrectness[problemId.toString()] ?? answerStatus?.isCorrect;
  }, [problemCorrectness, problemId, answerStatus?.isCorrect]);

  const handleToggleCorrectness = useCallback(() => {
    onToggleCorrectness(problemId.toString());
  }, [onToggleCorrectness, problemId]);

  return (
    <Card className="border">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 문제 번호 및 정답 상태 */}
          <div className="flex items-start justify-between pb-3 border-b">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">{problemNumber}.</span>
              {answerStatus && (
                <span className={`text-sm ${isCorrect ? 'text-blue-600' : 'text-red-600'}`}>
                  {isCorrect ? '○' : '×'}
                </span>
              )}
            </div>
            {isEditMode && answerStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleCorrectness}
                className={`text-sm ${
                  isCorrect
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                    : 'border-red-600 text-red-600 hover:bg-red-50'
                }`}
              >
                {isCorrect ? '정답' : '오답'}으로 표시됨
              </Button>
            )}
          </div>

          {/* 지문 (국어) */}
          {subject === 'korean' && problem.source_text && (
            <div className="bg-gray-50 p-4 rounded text-sm">
              {problem.source_title && (
                <div className="font-medium mb-2">{problem.source_title}</div>
              )}
              <div className="whitespace-pre-wrap">{problem.source_text}</div>
            </div>
          )}

          {/* 문제 */}
          <div className="text-base">
            {subject === 'korean' && <p>{problem.question}</p>}
            {subject === 'english' && (
              <div>
                {problem.question_text && <p>{problem.question_text}</p>}
                {problem.passage && (
                  <div className="bg-gray-50 p-3 rounded mt-2 text-sm">
                    <p className="whitespace-pre-wrap">{problem.passage}</p>
                  </div>
                )}
              </div>
            )}
            {subject === 'math' && (
              <>
                <LaTeXRenderer
                  content={(problem.question || `문제 ${problemNumber}`)
                    .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '')
                    .trim()}
                />
                {problem.tikz_code && problem.tikz_code !== null && (
                  <div className="mt-3">
                    <TikZRenderer tikzCode={problem.tikz_code} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* 선택지 */}
          {problem.choices && (
            <div className="space-y-2">
              {problem.choices.map((choice: string, idx: number) => {
                const choiceNum = (idx + 1).toString();
                const isStudentChoice = subject === 'english'
                  ? answerStatus?.studentAnswer === choice
                  : answerStatus?.studentAnswer === choiceNum;
                const isCorrectChoice = subject === 'english'
                  ? answerStatus?.correctAnswer === choice
                  : answerStatus?.correctAnswer === choiceNum;

                return (
                  <ChoiceItem
                    key={idx}
                    choice={choice}
                    choiceNum={choiceNum}
                    subject={subject}
                    isStudentChoice={isStudentChoice}
                    isCorrectChoice={isCorrectChoice}
                  />
                );
              })}
            </div>
          )}

          {/* 단답형 답안 (영어) */}
          {subject === 'english' && !problem.choices && answerStatus && (
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-600 min-w-[70px]">학생 답안:</span>
                <span>{answerStatus.studentAnswer || '(답안 없음)'}</span>
              </div>
              {answerStatus.correctAnswer !== '(수동 채점 필요)' && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 min-w-[70px]">예시 답안:</span>
                  <span className="text-blue-600">{answerStatus.correctAnswer}</span>
                </div>
              )}
              {answerStatus.aiFeedback && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600 mb-1">AI 피드백</div>
                  <p className="whitespace-pre-wrap">{answerStatus.aiFeedback}</p>
                </div>
              )}
            </div>
          )}

          {/* 답안 정보 */}
          {answerStatus && problem.choices && (
            <div className="pt-3 border-t text-sm">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <span>
                    학생: <strong>{subject === 'korean' ? `${answerStatus.studentAnswer}번` : answerStatus.studentAnswer}</strong>
                  </span>
                  <span>
                    정답: <strong>{subject === 'korean' ? `${answerStatus.correctAnswer}번` : answerStatus.correctAnswer}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 해설 */}
          {((subject === 'korean' && problem.explanation) ||
            (subject !== 'korean' && answerStatus?.explanation)) && (
            <div className="p-3 bg-gray-50 rounded text-sm">
              <div className="font-medium text-gray-700 mb-1">해설</div>
              {subject === 'korean' ? (
                <p>{problem.explanation}</p>
              ) : (
                <LaTeXRenderer content={answerStatus?.explanation || ''} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});