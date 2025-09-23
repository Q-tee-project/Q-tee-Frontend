'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

  const toggleCorrectness = (problemId: number) => {
    const newCorrectness = !problemCorrectness[problemId];
    setProblemCorrectness(prev => ({
      ...prev,
      [problemId]: newCorrectness
    }));

    // 정답/오답 변경 시 점수 자동 설정 (정답=10점, 오답=0점)
    setProblemScores(prev => ({
      ...prev,
      [problemId]: newCorrectness ? 10 : 0
    }));

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {studentName} 학생 채점 편집
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p>채점 정보를 불러오는 중...</p>
          </div>
        ) : sessionDetails ? (
          <div className="space-y-4">
            {/* Problem Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">문제별 채점 결과</h3>

              {sessionDetails.problem_results.map((problem, index) => {
                const isEditing = editingProblems.has(problem.problem_id);
                const currentCorrectness = problemCorrectness[problem.problem_id];

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
                              <div className="flex items-center gap-4">
                                <Button
                                  variant={currentCorrectness ? "default" : "outline"}
                                  size="lg"
                                  onClick={() => toggleCorrectness(problem.problem_id)}
                                  className={`px-6 py-3 ${
                                    currentCorrectness
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {currentCorrectness ? (
                                      <FaCheckCircle className="text-lg" />
                                    ) : (
                                      <FaTimesCircle className="text-lg" />
                                    )}
                                    {currentCorrectness ? "정답 (10점)" : "오답 (0점)"}
                                  </div>
                                </Button>
                                <span className="text-sm text-gray-500">
                                  클릭하여 정답/오답을 변경하세요
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <Badge
                                  variant={currentCorrectness ? "default" : "destructive"}
                                  className={`px-4 py-2 text-sm ${
                                    currentCorrectness
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-red-100 text-red-800 border-red-200"
                                  }`}
                                >
                                  {currentCorrectness ? "✓ 정답 (10점)" : "✗ 오답 (0점)"}
                                </Badge>
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