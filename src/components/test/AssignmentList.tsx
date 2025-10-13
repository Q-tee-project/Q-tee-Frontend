'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, BookOpen as BookIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { IoSearch } from "react-icons/io5";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Worksheet, MathProblem } from '@/types/math';
import { EnglishWorksheetData, EnglishQuestion } from '@/types/english';

interface AssignmentListProps {
  worksheets: Worksheet[];
  selectedWorksheet: Worksheet | null;
  worksheetEnglishProblems: EnglishWorksheetData[];
  worksheetProblems: (MathProblem | EnglishQuestion)[];
  isTestStarted: boolean;
  answers: Record<number, string>;
  currentProblemIndex: number;
  testResult: any;
  searchTerm: string;
  selectedSubject: string;
  selectedClass?: string;
  classes?: Array<{ id: string; name: string }>;
  onWorksheetSelect: (worksheet: Worksheet) => void;
  onProblemSelect: (index: number) => void;
  onShowResult: () => void;
  onRefresh: () => void;
  onSearchChange: (term: string) => void;
  onSubjectChange: (subject: string) => void;
  onClassChange?: (classId: string) => void;
  getProblemTypeInKorean: (type: string) => string;
  showStudentResult?: boolean;
  resultProblems?: any[];
  getAnswerStatus?: (problemId: string) => { 
    studentAnswer?: string; 
    correctAnswer?: string; 
    isCorrect?: boolean;
    aiFeedback?: string;
    explanation?: string;
  } | null;
}

export function AssignmentList({
  worksheets,
  selectedWorksheet,
  worksheetProblems,
  worksheetEnglishProblems,
  isTestStarted,
  answers,
  currentProblemIndex,
  testResult,
  searchTerm,
  selectedSubject,
  selectedClass,
  classes = [],
  onWorksheetSelect,
  onProblemSelect,
  onShowResult,
  onRefresh,
  onSearchChange,
  onSubjectChange,
  onClassChange,
  getProblemTypeInKorean,
  showStudentResult = false,
  resultProblems = [],
  getAnswerStatus,
}: AssignmentListProps) {
  return (
    <Card className="w-1/3 flex flex-col shadow-sm h-full gap-0 p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 flex-shrink-0 p-5">
        <CardTitle className="text-lg font-semibold text-gray-900">과제 목록</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="icon"
            className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF]"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden p-5">
        {/* 과목 선택 탭 - 고정 */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex gap-2">
            {['국어', '영어', '수학'].map((subject) => (
              <button
                key={subject}
                onClick={() => onSubjectChange(subject)}
                className={`badge ${
                  selectedSubject === subject
                    ? 'badge-blue'
                    : 'badge-gray'
                } cursor-pointer transition-colors duration-150`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* 클래스 선택 및 검색창 - 고정 */}
        <div className="mb-4 flex gap-2 flex-shrink-0">
          {/* 클래스 선택 드롭다운 - 항상 표시 */}
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="클래스" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>
                  로딩 중...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {/* 검색창 */}
          <div className="relative flex-1">
            <Input
              placeholder="과제명 검색"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-10"
            />
            <IoSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* 과제 목록 - 스크롤 영역 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-3">
            {worksheets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm space-y-2">
                  {searchTerm ? (
                    <p>'{searchTerm}' 검색 결과가 없습니다</p>
                  ) : selectedClass && selectedClass !== 'all' ? (
                    <>
                      <p>선택한 클래스에 배포된 과제가 없습니다</p>
                      <p className="text-xs text-gray-400">다른 클래스를 선택하거나 '전체'를 선택해보세요</p>
                    </>
                  ) : (
                    <>
                      <p>배포된 과제가 없습니다</p>
                      <p className="text-xs text-gray-400">선생님이 과제를 배포하면 여기에 표시됩니다</p>
                    </>
                  )}
                </div>
              </div>
            ) : (isTestStarted || showStudentResult) && selectedWorksheet ? (
            // 시험 시작 시 선택한 과제만 표시
            <div className="space-y-3">
              <div className="border rounded-lg p-4 border-[#0072CE]">
                {/* 범위 정보 */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  <BookIcon className="w-3 h-3" />
                  <span>{selectedWorksheet.unit_name} {'>'} {selectedWorksheet.chapter_name}</span>
                </div>

                {/* 과제 제목 */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {selectedWorksheet.title}
                  </h4>
                </div>

                {/* 문제 수 및 응시 상태 뱃지 */}
                <div className="flex justify-start gap-2 flex-wrap">
                  {/* 응시여부 */}
                  {(() => {
                    const isCompleted = selectedWorksheet.status === 'completed' || selectedWorksheet.status === 'submitted';
                    return (
                      <Badge className={`badge ${isCompleted ? 'badge-blue' : 'badge-red'}`}>
                        {isCompleted ? '응시' : '미응시'}
                      </Badge>
                    );
                  })()}
                  {/* 점수 */}
                  {(() => {
                    const isCompleted = selectedWorksheet.status === 'completed' || selectedWorksheet.status === 'submitted';
                    return isCompleted && (selectedWorksheet as any).score !== undefined && (
                      <Badge className="badge badge-green font-semibold">
                        {(selectedWorksheet as any).score}점
                      </Badge>
                    );
                  })()}
                  {/* 클래스 정보 */}
                  {(selectedWorksheet as any).classroom_id && classes.length > 0 && (
                    <Badge className="badge badge-purple">
                      {classes.find(c => c.id?.toString() === (selectedWorksheet as any).classroom_id?.toString())?.name || '클래스'}
                    </Badge>
                  )}
                  {/* 문항 수 */}
                  <Badge className="badge badge-gray">
                    {selectedWorksheet.problem_count}문제
                  </Badge>
                </div>
              </div>

              {/* 과제 진행 상태 표시 - 결과 보기가 아닐 때만 */}
              {!showStudentResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">과제 진행 중</span>
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      {Object.keys(answers).length}/{worksheetProblems.length}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(Object.keys(answers).length / worksheetProblems.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {Object.keys(answers).length < worksheetProblems.length && (
                    <div className="mt-2 text-xs text-green-600">
                      모든 문제를 풀어야 제출할 수 있습니다
                    </div>
                  )}
                </div>
              )}

              {/* 문제 목록 테이블 */}
              {(worksheetProblems.length > 0 || resultProblems.length > 0) && (
                <div className="border rounded-lg">
                  <div className="p-3 border-b bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700">문제 목록</h4>
                  </div>
                  <div>
                    <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="text-center">번호</TableHead>
                   <TableHead className="text-center">{showStudentResult ? '답안' : '유형'}</TableHead>
                   <TableHead className="text-center">{showStudentResult ? '내 답안' : '난이도'}</TableHead>
                   <TableHead className="text-center">{showStudentResult ? '결과' : '답안'}</TableHead>
                 </TableRow>
               </TableHeader>
                      <TableBody>
                        {(showStudentResult ? resultProblems : worksheetProblems).map((problem, index) => {
                          const problemId = (problem as any).id || (problem as any).question_id;
                          const isAnswered = answers[problemId];
                          const isCurrentProblem = index === currentProblemIndex;
                          
                          if (showStudentResult && getAnswerStatus) {
                            // 응시 완료한 과제의 결과 표시
                            const answerStatus = getAnswerStatus(problemId?.toString());
                            return (
                              <TableRow
                                key={problemId}
                                className={`cursor-pointer hover:bg-gray-50 ${
                                  isCurrentProblem ? 'bg-[#EBF6FF]' : ''
                                }`}
                                onClick={() => onProblemSelect(index)}
                              >
                                <TableCell className="text-center font-medium">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-center text-xs text-gray-600">
                                  {answerStatus?.correctAnswer || '-'}
                                </TableCell>
                                <TableCell className="text-center text-xs text-gray-600">
                                  {answerStatus?.studentAnswer || '-'}
                                </TableCell>
                         <TableCell className="text-center">
                           {answerStatus?.isCorrect ? (
                             <div className="flex items-center justify-center">
                               <span className="text-green-500 text-lg font-bold">✓</span>
                             </div>
                           ) : (
                             <div className="flex items-center justify-center">
                               <span className="text-red-500 text-lg font-bold">✘</span>
                             </div>
                           )}
                         </TableCell>
                              </TableRow>
                            );
                          } else {
                            // 미응시 과제의 문제 목록 표시
                            return (
                              <TableRow
                                key={problemId}
                                className={`cursor-pointer hover:bg-gray-50 ${
                                  isCurrentProblem ? 'bg-[#EBF6FF]' : ''
                                }`}
                                onClick={() => onProblemSelect(index)}
                              >
                                <TableCell className="text-center font-medium">
                                  {(problem as any).sequence_order || (problem as any).question_id || index + 1}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className="badge badge-blue">
                                    {getProblemTypeInKorean((problem as any).problem_type || (problem as any).question_detail_type || 'unknown')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={`badge ${
                                      ((problem as any).difficulty === 'A' || (problem as any).question_difficulty === '상')
                                        ? 'badge-red'
                                        : ((problem as any).difficulty === 'B' || (problem as any).question_difficulty === '중')
                                        ? 'badge-green'
                                        : 'badge-yellow'
                                    }`}
                                  >
                                    {(problem as any).difficulty || (problem as any).question_difficulty || '중'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {isAnswered ? (
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                                  ) : (
                                    <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto"></div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 시험 시작 전 또는 결과 보기 중에는 과제 목록 표시
            <div className="space-y-3">
              {worksheets.map((worksheet) => {
                const isCompleted = worksheet.status === 'completed' || worksheet.status === 'submitted';
                const isSelected = selectedWorksheet?.id === worksheet.id;
                
                return (
                  <div key={worksheet.id}>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-[#0072CE]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onWorksheetSelect(worksheet)}
                    >
                      {/* 범위 정보 */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                        <BookIcon className="w-3 h-3" />
                        <span>{worksheet.unit_name} {'>'} {worksheet.chapter_name}</span>
                      </div>

                      {/* 과제 제목 */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {worksheet.title}
                        </h4>
                      </div>

                      {/* 문제 수 및 응시 상태 뱃지 */}
                      <div className="flex justify-start gap-2 flex-wrap">
                        {/* 응시여부 */}
                        <Badge className={`badge ${isCompleted ? 'badge-blue' : 'badge-red'}`}>
                          {isCompleted ? '응시' : '미응시'}
                        </Badge>
                        {/* 점수 */}
                        {isCompleted && (worksheet as any).score !== undefined && (
                          <Badge className="badge badge-green font-semibold">
                            {(worksheet as any).score}점
                          </Badge>
                        )}
                        {/* 클래스 정보 */}
                        {(worksheet as any).classroom_id && classes.length > 0 && (
                          <Badge className="badge badge-purple">
                            {classes.find(c => c.id?.toString() === (worksheet as any).classroom_id?.toString())?.name || '클래스'}
                          </Badge>
                        )}
                        {/* 문항 수 */}
                        <Badge className="badge badge-gray">
                          {worksheet.problem_count}문제
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

            {/* 과제 완료 결과 표시 */}
            {testResult && selectedWorksheet && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                <h4 className="text-sm font-medium text-blue-700">과제 완료</h4>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>
                    정답: {testResult.correct_count || 0}개 / {testResult.total_problems || 0}개
                  </div>
                  <div>점수: {testResult.score || 0}점</div>
                </div>
                <Button
                  onClick={onShowResult}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  📊 자세한 결과 보기
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
