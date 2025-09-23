'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FaCheckCircle, FaTimesCircle, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';

interface TeacherGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradingSessionId: number;
  studentName: string;
  onGradingSaved: () => void;
  isKorean: boolean;
}

interface ProblemResult {
  problem_id: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  score: number;
  problem_type: string;
  difficulty: string;
  input_method: string;
  explanation: string;
  question?: string;
  choices?: string[];
}

interface GradingSessionDetails {
  id: number;
  total_score: number;
  max_possible_score: number;
  correct_count: number;
  total_problems: number;
  status: string;
  problem_results: ProblemResult[];
}

export function TeacherGradingModal({
  isOpen,
  onClose,
  gradingSessionId,
  studentName,
  onGradingSaved,
  isKorean
}: TeacherGradingModalProps) {
  const [sessionDetails, setSessionDetails] = useState<GradingSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProblems, setEditingProblems] = useState<Set<number>>(new Set());
  const [problemScores, setProblemScores] = useState<{[key: number]: number}>({});
  const [problemCorrectness, setProblemCorrectness] = useState<{[key: number]: boolean}>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && gradingSessionId) {
      loadSessionDetails();
    }
  }, [isOpen, gradingSessionId]);

  const loadSessionDetails = async () => {
    setIsLoading(true);
    try {
      let data;
      if (isKorean) {
        data = await koreanService.getGradingSessionDetails(gradingSessionId);
      } else {
        data = await mathService.getGradingSessionDetails(gradingSessionId);
      }

      setSessionDetails(data);

      // Initialize editing state
      const scores: {[key: number]: number} = {};
      const correctness: {[key: number]: boolean} = {};

      if (data.problem_results) {
        data.problem_results.forEach((pr: ProblemResult) => {
          scores[pr.problem_id] = pr.score;
          correctness[pr.problem_id] = pr.is_correct;
        });
      }

      setProblemScores(scores);
      setProblemCorrectness(correctness);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load session details:', error);
      alert('채점 세션 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEdit = (problemId: number) => {
    const newEditingProblems = new Set(editingProblems);
    if (newEditingProblems.has(problemId)) {
      newEditingProblems.delete(problemId);
    } else {
      newEditingProblems.add(problemId);
    }
    setEditingProblems(newEditingProblems);
  };

  const updateProblemScore = (problemId: number, newScore: number) => {
    const maxScore = sessionDetails?.max_possible_score ?
      sessionDetails.max_possible_score / sessionDetails.total_problems : 10;

    if (newScore < 0) newScore = 0;
    if (newScore > maxScore) newScore = maxScore;

    setProblemScores(prev => ({
      ...prev,
      [problemId]: newScore
    }));

    // 점수 변경 시 정답/오답 상태는 자동으로 변경하지 않음
    // 사용자가 명시적으로 정답/오답 버튼을 클릭해야 변경됨

    setHasChanges(true);
  };

  const toggleCorrectness = (problemId: number) => {
    const newCorrectness = !problemCorrectness[problemId];
    setProblemCorrectness(prev => ({
      ...prev,
      [problemId]: newCorrectness
    }));

    // 정답/오답 변경 시 점수는 자동으로 변경하지 않음
    // 점수와 정답/오답 상태를 독립적으로 관리

    setHasChanges(true);
  };

  const calculateTotalScore = () => {
    return Object.values(problemScores).reduce((sum, score) => sum + score, 0);
  };

  const calculateCorrectCount = () => {
    return Object.values(problemCorrectness).filter(correct => correct).length;
  };

  const saveGrading = async () => {
    if (!sessionDetails || !hasChanges) return;

    try {
      // 변경된 필드만 포함하여 업데이트 (OCR 데이터 보존)
      const updatedResults = sessionDetails.problem_results.map((pr: ProblemResult) => ({
        problem_id: pr.problem_id,
        score: problemScores[pr.problem_id],
        is_correct: problemCorrectness[pr.problem_id]
      }));

      const payload = {
        problem_results: updatedResults,
        total_score: calculateTotalScore(),
        correct_count: calculateCorrectCount(),
        status: 'final'
      };

      console.log('=== SENDING GRADING UPDATE ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      if (isKorean) {
        // Use Korean service if available
        // await koreanService.updateGradingSession(gradingSessionId, payload);
        throw new Error('Korean grading update not implemented yet');
      } else {
        await mathService.updateGradingSession(gradingSessionId, payload);
      }

      alert('채점 결과가 저장되었습니다.');
      setHasChanges(false);
      onGradingSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save grading:', error);
      alert(`저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {studentName} 학생 채점 결과 편집
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p>채점 정보를 불러오는 중...</p>
          </div>
        ) : sessionDetails ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>채점 결과 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">총 점수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {calculateTotalScore()} / {sessionDetails.max_possible_score}점
                    </p>
                  </div>
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">맞춘 개수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {calculateCorrectCount()} / {sessionDetails.total_problems}개
                    </p>
                  </div>
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">정답률</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((calculateCorrectCount() / sessionDetails.total_problems) * 100)}%
                    </p>
                  </div>
                  <div className="text-center bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">상태</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hasChanges ? '편집 중' : '저장됨'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problem Results */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">문제별 채점 결과</h3>

              {sessionDetails.problem_results.map((problem, index) => {
                const isEditing = editingProblems.has(problem.problem_id);
                const currentScore = problemScores[problem.problem_id];
                const currentCorrectness = problemCorrectness[problem.problem_id];
                const maxScore = sessionDetails.max_possible_score / sessionDetails.total_problems;

                return (
                  <Card key={problem.problem_id} className="border-l-4 border-l-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Problem Number with Status Icon */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold mb-2">
                            {index + 1}
                          </div>
                          <div className="flex items-center justify-center">
                            {currentCorrectness ? (
                              <FaCheckCircle className="text-green-500 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-500 text-xl" />
                            )}
                          </div>
                        </div>

                        {/* Problem Content */}
                        <div className="flex-1">
                          {/* Question */}
                          {problem.question && (
                            <div className="mb-4">
                              <div className="text-gray-900 font-medium">
                                {isKorean ? (
                                  <p>{problem.question}</p>
                                ) : (
                                  <LaTeXRenderer content={problem.question} />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Choices */}
                          {problem.choices && (
                            <div className="space-y-2 mb-4">
                              {problem.choices.map((choice: string, choiceIndex: number) => (
                                <div key={choiceIndex} className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">{choiceIndex + 1}.</span>
                                    <div className="flex-1">
                                      {isKorean ? (
                                        <span>{choice}</span>
                                      ) : (
                                        <LaTeXRenderer content={choice || ''} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Answer Information */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-gray-600">학생 답안:</span>
                                <p className="font-medium">{problem.user_answer}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">정답:</span>
                                <p className="font-medium">{problem.correct_answer}</p>
                              </div>
                            </div>
                          </div>

                          {/* Grading Controls */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-blue-900">채점 결과</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleEdit(problem.problem_id)}
                                className="flex items-center gap-2"
                              >
                                {isEditing ? <FaTimes /> : <FaEdit />}
                                {isEditing ? '취소' : '편집'}
                              </Button>
                            </div>

                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">점수:</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={maxScore}
                                      value={currentScore}
                                      onChange={(e) => updateProblemScore(problem.problem_id, parseFloat(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                    <span className="text-sm text-gray-600">/ {maxScore}점</span>
                                  </div>
                                  <Button
                                    variant={currentCorrectness ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleCorrectness(problem.problem_id)}
                                    className={currentCorrectness ? "bg-green-600 hover:bg-green-700" : ""}
                                  >
                                    {currentCorrectness ? "정답" : "오답"}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <span className="text-sm">점수: <strong>{currentScore}점</strong></span>
                                  <Badge variant={currentCorrectness ? "default" : "destructive"}>
                                    {currentCorrectness ? "정답" : "오답"}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Explanation */}
                          {problem.explanation && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                              <h4 className="font-medium text-yellow-900 mb-2">해설</h4>
                              <div className="text-yellow-800 text-sm">
                                {isKorean ? (
                                  <p>{problem.explanation}</p>
                                ) : (
                                  <LaTeXRenderer content={problem.explanation} />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p>채점 정보를 불러올 수 없습니다.</p>
          </div>
        )}

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={saveGrading}
            disabled={!hasChanges}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <FaSave />
            최종 저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}