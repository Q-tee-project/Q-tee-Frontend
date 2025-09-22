'use client';

import React, { useState, useEffect } from 'react';
import { koreanService } from '@/services/koreanService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaArrowLeft } from 'react-icons/fa6';

export function AssignmentResultView({ assignment, onBack }: { assignment: any, onBack: () => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  useEffect(() => {
    loadResults();
  }, [assignment.id]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await koreanService.getAssignmentResults(assignment.id);
      setResults(data);
    } catch (error) {
      console.error("Failed to load assignment results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (sessionId: number) => {
    try {
      await koreanService.approveGrade(sessionId);
      loadResults(); // Refresh the results
    } catch (error) {
      console.error("Failed to approve grade:", error);
      alert("승인에 실패했습니다.");
    }
  };

  const handleSessionClick = async (session: any) => {
    try {
      setSelectedSession(session);
      const details = await koreanService.getGradingSessionDetails(session.id);
      setSessionDetails(details);
    } catch (error) {
      console.error("Failed to load session details:", error);
      alert("세션 상세 정보를 불러오는데 실패했습니다.");
    }
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setSessionDetails(null);
  };

  if (selectedSession) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button onClick={handleBackToList} className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Student {selectedSession.graded_by} - Detailed Results</h2>
        </div>

        {sessionDetails ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Score</p>
                  <p className="text-lg font-semibold">{sessionDetails.total_score}/{sessionDetails.max_possible_score}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-lg font-semibold">{sessionDetails.correct_count}/{sessionDetails.total_problems}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className="text-lg font-semibold">{Math.round((sessionDetails.correct_count / sessionDetails.total_problems) * 100)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={sessionDetails.status === 'final' ? 'default' : 'secondary'}>
                    {sessionDetails.status}
                  </Badge>
                </div>
              </div>
            </div>

            {sessionDetails.multiple_choice_answers && (
              <div>
                <h3 className="text-lg font-medium mb-2">Answers</h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="grid gap-2">
                    {Object.entries(sessionDetails.multiple_choice_answers).map(([problemId, answer]) => (
                      <div key={problemId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium">Problem {problemId}:</span>
                        <span className="text-gray-700">{answer as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sessionDetails.status === 'pending_approval' && (
              <div className="flex justify-end">
                <Button onClick={() => handleApprove(sessionDetails.id)}>
                  Approve Results
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p>Loading session details...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">Results for {assignment.title}</h2>
      </div>

      {isLoading ? (
        <p>Loading results...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Correct/Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSessionClick(result)}>
                <TableCell>{result.graded_by}</TableCell>
                <TableCell>{result.total_score}/{result.max_possible_score}</TableCell>
                <TableCell>{result.correct_count}/{result.total_problems}</TableCell>
                <TableCell>
                  <Badge variant={result.status === 'final' ? 'default' : 'secondary'}>
                    {result.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(result.graded_at).toLocaleString('ko-KR')}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {result.status === 'pending_approval' && (
                    <Button onClick={() => handleApprove(result.id)} size="sm">
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
