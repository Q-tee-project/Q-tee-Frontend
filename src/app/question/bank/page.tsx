'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { QuestionService } from '@/services/questionService';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { Worksheet, MathProblem, ProblemType, Subject } from '@/types/math';
import { autoConvertToLatex, supportedPatterns } from '@/utils/mathLatexConverter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Trash2, FileText, RefreshCw, Edit3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BankPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<MathProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('수학');
  const [showAnswerSheet, setShowAnswerSheet] = useState<boolean>(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<MathProblem | null>(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    problem_type: '',
    difficulty: '',
    choices: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
  });
  const [autoConvertMode, setAutoConvertMode] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Mock 데이터
  const mockClasses = [
    { id: '1', name: '1반', studentCount: 5 },
    { id: '2', name: '2반', studentCount: 0 },
    { id: '3', name: '3반', studentCount: 0 },
    { id: '4', name: '4반', studentCount: 0 },
    { id: '5', name: '5반', studentCount: 0 },
    { id: '6', name: '6반', studentCount: 0 },
  ];

  const mockRecipients = [
    {
      id: '1',
      name: '이윤진',
      school: '진건고등학교',
      level: '중등',
      grade: '1학년',
      classId: '1',
    },
    { id: '2', name: '김병천', school: '병천중학교', level: '중등', grade: '2학년', classId: '1' },
    {
      id: '3',
      name: '김보연',
      school: '보연고등학교',
      level: '고등',
      grade: '3학년',
      classId: '1',
    },
    { id: '4', name: '한광구', school: '광구중학교', level: '중등', grade: '1학년', classId: '1' },
    {
      id: '5',
      name: '최현범',
      school: '현범고등학교',
      level: '고등',
      grade: '2학년',
      classId: '1',
    },
  ];

  // 선택된 클래스에 따라 필터링된 수신자 목록
  const filteredRecipients =
    selectedClasses.length > 0
      ? mockRecipients.filter((recipient) => selectedClasses.includes(recipient.classId))
      : mockRecipients;

  // 문제 유형을 한국어로 변환
  const getProblemTypeInKorean = (type: string): string => {
    switch (type.toLowerCase()) {
      case ProblemType.MULTIPLE_CHOICE:
        return '객관식';
      case ProblemType.ESSAY:
        return '서술형';
      case ProblemType.SHORT_ANSWER:
        return '단답형';
      default:
        return type;
    }
  };

  // 데이터 로드
  useEffect(() => {
    loadWorksheets();
  }, [selectedSubject]);

  const loadWorksheets = async () => {
    if (selectedSubject !== Subject.MATH) {
      setWorksheets([]);
      setSelectedWorksheet(null);
      setWorksheetProblems([]);
      return;
    }

    console.log('워크시트 로드 시작...');
    setIsLoading(true);
    try {
      const worksheetData = await QuestionService.getWorksheets();
      console.log('워크시트 데이터:', worksheetData);
      setWorksheets(worksheetData);
      if (worksheetData.length > 0) {
        setSelectedWorksheet(worksheetData[0]);
        await loadWorksheetProblems(worksheetData[0].id);
      }
    } catch (error: any) {
      console.error('워크시트 로드 실패:', error);
      setError(`워크시트 데이터를 불러올 수 없습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 워크시트의 문제들 로드
  const loadWorksheetProblems = async (worksheetId: number) => {
    try {
      const worksheetDetail = await QuestionService.getWorksheetDetail(worksheetId);
      setWorksheetProblems(worksheetDetail.problems || []);
    } catch (error: any) {
      console.error('워크시트 문제 로드 실패:', error);
      setError('워크시트 문제를 불러올 수 없습니다.');
    }
  };

  // 워크시트 선택 핸들러
  const handleWorksheetSelect = async (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet);
    await loadWorksheetProblems(worksheet.id);
  };

  // 클래스 선택 핸들러
  const handleClassSelect = (classId: string) => {
    const isCurrentlySelected = selectedClasses.includes(classId);

    if (isCurrentlySelected) {
      // 클래스 선택 해제 시
      setSelectedClasses((prev) => prev.filter((id) => id !== classId));
      // 해당 클래스 학생들도 선택 해제
      const classStudents = mockRecipients.filter((recipient) => recipient.classId === classId);
      setSelectedRecipients((prev) =>
        prev.filter((recipientId) => !classStudents.some((student) => student.id === recipientId)),
      );
    } else {
      // 클래스 선택 시
      setSelectedClasses((prev) => [...prev, classId]);
      // 해당 클래스 학생들도 자동 선택
      const classStudents = mockRecipients.filter((recipient) => recipient.classId === classId);
      setSelectedRecipients((prev) => [
        ...prev,
        ...classStudents.map((student) => student.id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleRecipientSelect = (recipientId: string) => {
    const recipient = mockRecipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    const isCurrentlySelected = selectedRecipients.includes(recipientId);

    if (isCurrentlySelected) {
      // 수신자 선택 해제
      setSelectedRecipients((prev) => prev.filter((id) => id !== recipientId));

      // 해당 클래스의 다른 학생들이 모두 선택 해제되면 클래스도 선택 해제
      const classStudents = mockRecipients.filter((r) => r.classId === recipient.classId);
      const remainingSelectedInClass = selectedRecipients.filter(
        (id) => id !== recipientId && classStudents.some((s) => s.id === id),
      );

      if (remainingSelectedInClass.length === 0) {
        setSelectedClasses((prev) => prev.filter((id) => id !== recipient.classId));
      }
    } else {
      // 수신자 선택
      setSelectedRecipients((prev) => [...prev, recipientId]);

      // 해당 클래스가 선택되지 않았다면 클래스도 선택
      if (!selectedClasses.includes(recipient.classId)) {
        setSelectedClasses((prev) => [...prev, recipient.classId]);
      }
    }
  };

  const handleDistribute = () => {
    alert(
      `워크시트가 배포되었습니다.\n선택된 클래스: ${selectedClasses.length}개\n선택된 수신자: ${selectedRecipients.length}명`,
    );
    setIsDistributeDialogOpen(false);
    setSelectedClasses([]);
    setSelectedRecipients([]);
  };

  // 워크시트 삭제 핸들러
  const handleDeleteWorksheet = async (worksheet: Worksheet, event: React.MouseEvent) => {
    event.stopPropagation();

    if (
      !confirm(`"${worksheet.title}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await QuestionService.deleteWorksheet(worksheet.id);

      if (selectedWorksheet?.id === worksheet.id) {
        setSelectedWorksheet(null);
        setWorksheetProblems([]);
      }

      await loadWorksheets();
      alert('워크시트가 삭제되었습니다.');
    } catch (error: any) {
      console.error('워크시트 삭제 실패:', error);
      alert(`삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 문제 편집 핸들러
  const handleEditProblem = (problem: MathProblem) => {
    setEditingProblem(problem);
    setEditFormData({
      question: problem.question,
      problem_type: problem.problem_type,
      difficulty: problem.difficulty,
      choices: problem.choices && problem.choices.length > 0 ? problem.choices : ['', '', '', ''],
      correct_answer: problem.correct_answer || '',
      explanation: problem.explanation || '',
    });
    setIsEditDialogOpen(true);
  };

  // 문제 업데이트 저장
  const handleSaveProblem = async () => {
    if (!editingProblem) return;

    try {
      setIsLoading(true);

      const updateData = {
        question: editFormData.question,
        problem_type: editFormData.problem_type,
        difficulty: editFormData.difficulty,
        choices:
          editFormData.problem_type === 'multiple_choice'
            ? editFormData.choices.filter((choice) => choice.trim() !== '')
            : null,
        correct_answer: editFormData.correct_answer,
        explanation: editFormData.explanation,
      };

      await QuestionService.updateProblem(editingProblem.id, updateData);

      // 워크시트 문제 목록 다시 로드
      if (selectedWorksheet) {
        await loadWorksheetProblems(selectedWorksheet.id);
      }

      setIsEditDialogOpen(false);
      setEditingProblem(null);
      alert('문제가 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('문제 업데이트 실패:', error);
      alert(`업데이트 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 편집 폼 입력 핸들러 (자동 변환 적용)
  const handleEditFormChange = (field: string, value: string | string[]) => {
    let processedValue = value;

    // 텍스트 필드에 자동 변환 적용
    if (
      autoConvertMode &&
      typeof value === 'string' &&
      (field === 'question' || field === 'explanation' || field === 'correct_answer')
    ) {
      processedValue = autoConvertToLatex(value);
    }

    setEditFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  // 선택지 변경 핸들러 (자동 변환 적용)
  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...editFormData.choices];
    newChoices[index] = autoConvertMode ? autoConvertToLatex(value) : value;
    setEditFormData((prev) => ({
      ...prev,
      choices: newChoices,
    }));
  };

  // 타이틀 편집 시작
  const handleStartEditTitle = () => {
    if (selectedWorksheet) {
      setEditedTitle(selectedWorksheet.title);
      setIsEditingTitle(true);
    }
  };

  // 타이틀 편집 취소
  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  // 타이틀 저장
  const handleSaveTitle = async () => {
    if (!selectedWorksheet || !editedTitle.trim()) return;

    try {
      setIsLoading(true);

      await QuestionService.updateWorksheet(selectedWorksheet.id, {
        title: editedTitle.trim(),
      });

      // 워크시트 목록 다시 로드
      await loadWorksheets();

      setIsEditingTitle(false);
      setEditedTitle('');
      alert('타이틀이 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('타이틀 업데이트 실패:', error);
      alert(`타이틀 업데이트 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<FileText />}
        title="문제 관리"
        variant="question"
        description="문제지 편집 및 배포할 수 있습니다"
      />

      {/* 과목 탭 */}
      <div className="px-6 pb-2 flex-shrink-0">
        <nav className="flex space-x-8">
          {[Subject.KOREAN, Subject.MATH, Subject.ENGLISH].map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedSubject === subject
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subject}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-4 min-h-0">
        <div className="flex gap-4 h-full">
          {/* 문제지 목록 */}
          <Card className="w-1/3 flex flex-col shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between py-6 px-6 border-b border-gray-100">
              <CardTitle className="text-lg font-medium">문제 목록</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => loadWorksheets()}
                  variant="ghost"
                  size="icon"
                  className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF]"
                  title="새로고침"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={(e) => selectedWorksheet && handleDeleteWorksheet(selectedWorksheet, e)}
                  disabled={!selectedWorksheet}
                  variant="ghost"
                  size="icon"
                  className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF]"
                  title="선택된 워크시트 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea style={{height: 'calc(100vh - 350px)'}} className="w-full">
                <div className="p-4">
                {selectedSubject !== Subject.MATH ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    {selectedSubject} 과목은 준비 중입니다
                  </div>
                ) : worksheets.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    저장된 워크시트가 없습니다 (로딩 상태: {isLoading ? '로딩 중' : '로딩 완료'},
                    과목: {selectedSubject})
                    {error && <div className="text-red-500 mt-2">오류: {error}</div>}
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={worksheets}
                    onRowClick={handleWorksheetSelect}
                    selectedRowId={selectedWorksheet?.id}
                  />
                )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 시험지 상세 보기 (선택된 경우에만 표시) */}
          {selectedWorksheet ? (
            <Card className="w-2/3 flex flex-col shadow-sm h-full">
              <CardHeader className="flex flex-row items-center py-6 px-6 border-b border-gray-100">
                <div className="flex-1"></div>
                <div className="flex items-center justify-center gap-3">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-2xl font-bold text-gray-900 text-center border-2 border-[#0072CE]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle();
                          } else if (e.key === 'Escape') {
                            handleCancelEditTitle();
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        onClick={handleSaveTitle}
                        size="sm"
                        className="bg-[#0072CE] hover:bg-[#0056A3] text-white"
                      >
                        저장
                      </Button>
                      <Button onClick={handleCancelEditTitle} variant="outline" size="sm">
                        취소
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle
                        className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-[#0072CE] transition-colors"
                        onClick={handleStartEditTitle}
                        title="클릭하여 타이틀 편집"
                      >
                        {selectedWorksheet.title}
                      </CardTitle>
                      <Button
                        onClick={handleStartEditTitle}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-[#0072CE] opacity-60 hover:opacity-100"
                        title="타이틀 편집"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {showAnswerSheet && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      정답지
                    </span>
                  )}
                </div>
                <div className="flex-1 flex justify-end gap-3">
                  {worksheetProblems.length > 0 && (
                    <Button
                      onClick={() => setShowAnswerSheet(!showAnswerSheet)}
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                    >
                      {showAnswerSheet ? '시험지 보기' : '정답 및 해설'}
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsDistributeDialogOpen(true)}
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                  >
                    문제지 배포
                  </Button>
                  <Button
                    onClick={() => setIsEditDialogOpen(true)}
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-[#0072CE]/30 text-[#0072CE] hover:bg-[#0072CE]/10 hover:border-[#0072CE]/50"
                  >
                    문제지 편집
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea style={{height: 'calc(100vh - 350px)'}} className="w-full">
                  <div className="p-6 space-y-8">
                    {worksheetProblems.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        문제 데이터를 불러오는 중입니다...
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {worksheetProblems.map((problem, index) => (
                          <div key={problem.id} className="page-break-inside-avoid">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-white/80 backdrop-blur-sm border border-[#0072CE]/30 text-[#0072CE] rounded-full text-sm font-bold">
                                  {problem.sequence_order}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                      {getProblemTypeInKorean(problem.problem_type)}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        problem.difficulty === 'A'
                                          ? 'bg-red-100 text-red-800'
                                          : problem.difficulty === 'B'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-purple-100 text-purple-800'
                                      }`}
                                    >
                                      {problem.difficulty}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => handleEditProblem(problem)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#0072CE] hover:text-[#0056A3] hover:bg-[#EBF6FF] p-1"
                                    title="문제 편집"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="text-base leading-relaxed text-gray-900 mb-4">
                                  <LaTeXRenderer content={problem.question} />
                                </div>

                                {problem.choices && problem.choices.length > 0 && (
                                  <div className="ml-4 space-y-3">
                                    {problem.choices.map((choice, choiceIndex) => {
                                      const optionLabel = String.fromCharCode(65 + choiceIndex);
                                      const isCorrect = problem.correct_answer === optionLabel;
                                      return (
                                        <div
                                          key={choiceIndex}
                                          className={`flex items-start gap-3 ${
                                            showAnswerSheet && isCorrect
                                              ? 'bg-green-100 border border-green-300 rounded-lg p-2'
                                              : ''
                                          }`}
                                        >
                                          <span
                                            className={`flex-shrink-0 w-6 h-6 border-2 ${
                                              showAnswerSheet && isCorrect
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-gray-300 text-gray-600'
                                            } rounded-full flex items-center justify-center text-sm font-medium`}
                                          >
                                            {showAnswerSheet && isCorrect ? '✓' : optionLabel}
                                          </span>
                                          <div className="flex-1 text-gray-900">
                                            <LaTeXRenderer content={choice} />
                                          </div>
                                          {showAnswerSheet && isCorrect && (
                                            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">
                                              정답
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* 객관식 문제 해설 */}
                                {problem.choices &&
                                  problem.choices.length > 0 &&
                                  showAnswerSheet && (
                                    <div className="mt-4 ml-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-semibold text-blue-800">
                                          해설:
                                        </span>
                                      </div>
                                      <div className="text-sm text-blue-800">
                                        <LaTeXRenderer
                                          content={problem.explanation || '해설 정보가 없습니다'}
                                        />
                                      </div>
                                    </div>
                                  )}

                                {(!problem.choices || problem.choices.length === 0) && (
                                  <div className="mt-4 ml-4">
                                    {problem.problem_type === 'short_answer' ? (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-700">답:</span>
                                          {showAnswerSheet ? (
                                            <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-green-800 font-medium">
                                              <LaTeXRenderer
                                                content={
                                                  problem.correct_answer ||
                                                  '백엔드 API에서 답안 정보가 전달되지 않았습니다. 개발팀에 문의하세요.'
                                                }
                                              />
                                            </div>
                                          ) : (
                                            <div className="border-b-2 border-gray-300 flex-1 h-8"></div>
                                          )}
                                        </div>
                                        {showAnswerSheet && (
                                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm font-semibold text-blue-800">
                                                해설:
                                              </span>
                                            </div>
                                            <div className="text-sm text-blue-800">
                                              <LaTeXRenderer
                                                content={
                                                  problem.explanation || '해설 정보가 없습니다'
                                                }
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {!showAnswerSheet && (
                                          <div className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-gray-50">
                                            <div className="text-sm text-gray-500 mb-2">
                                              풀이 과정을 자세히 써주세요.
                                            </div>
                                            <div className="space-y-3">
                                              {[...Array(6)].map((_, lineIndex) => (
                                                <div
                                                  key={lineIndex}
                                                  className="border-b border-gray-200 h-6"
                                                ></div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {showAnswerSheet && (
                                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm font-semibold text-blue-800">
                                                모범답안:
                                              </span>
                                            </div>
                                            <div className="text-sm text-blue-900">
                                              <LaTeXRenderer
                                                content={
                                                  problem.correct_answer ||
                                                  '백엔드 API에서 답안 정보가 전달되지 않았습니다. 개발팀에 문의하세요.'
                                                }
                                              />
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                              <span className="text-sm font-semibold text-blue-800">
                                                해설:
                                              </span>
                                              <div className="text-sm text-blue-800 mt-1">
                                                <LaTeXRenderer
                                                  content={
                                                    problem.explanation || '해설 정보가 없습니다'
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {index < worksheetProblems.length - 1 && (
                              <hr className="border-gray-200 my-8" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-2/3 flex items-center justify-center shadow-sm h-full">
              <div className="text-center py-20">
                <div className="text-gray-400 text-lg mb-2">📋</div>
                <div className="text-gray-500 text-sm">문제지를 선택하세요</div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-red-200 p-4 max-w-md z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">오류가 발생했습니다</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">처리 중입니다...</span>
            </div>
          </div>
        </div>
      )}

      {/* 문제 배포 다이얼로그 */}
      <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>문제 배포</DialogTitle>
          </DialogHeader>

          <div className="flex gap-6 h-96">
            {/* 클래스 목록 */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-3">클래스 목록</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {mockClasses.map((cls) => {
                    const isSelected = selectedClasses.includes(cls.id);
                    const hasStudents = cls.studentCount > 0;

                    return (
                      <div
                        key={cls.id}
                        className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-l-[#0072CE]'
                            : hasStudents
                            ? 'hover:bg-gray-50'
                            : 'hover:bg-red-50'
                        } ${!hasStudents ? 'opacity-60' : ''}`}
                        onClick={() => handleClassSelect(cls.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // 클릭 이벤트로 처리
                          className="w-4 h-4 text-[#0072CE] border-gray-300 rounded focus:ring-[#0072CE]"
                        />
                        <Image src="/logo.svg" alt="클래스 아이콘" width={16} height={16} />
                        <div className="flex-1 flex justify-between items-center">
                          <span
                            className={`text-sm ${
                              isSelected ? 'text-[#0072CE] font-medium' : 'text-gray-900'
                            }`}
                          >
                            {cls.name}
                          </span>
                          <span
                            className={`text-xs ${hasStudents ? 'text-gray-500' : 'text-red-400'}`}
                          >
                            ({cls.studentCount}명)
                            {!hasStudents && <span className="ml-1">비어있음</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 수신자 목록 */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-3">수신자 목록</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {filteredRecipients.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-sm">선택된 클래스에 학생이 없습니다.</p>
                      <p className="text-xs mt-1">클래스를 선택해주세요.</p>
                    </div>
                  ) : (
                    filteredRecipients.map((recipient) => {
                      const isSelected = selectedRecipients.includes(recipient.id);

                      return (
                        <div
                          key={recipient.id}
                          className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-green-50 border-l-4 border-l-green-500'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleRecipientSelect(recipient.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // 클릭 이벤트로 처리
                            className="w-4 h-4 text-[#0072CE] border-gray-300 rounded focus:ring-[#0072CE]"
                          />
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-[#0072CE] text-white text-xs rounded">
                              {recipient.level}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                              {recipient.grade}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {recipient.name}
                            </div>
                            <div className="text-xs text-gray-500">{recipient.school}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsDistributeDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleDistribute} className="bg-[#0072CE] hover:bg-[#0056A3]">
              배포
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 문제 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>문제 편집</DialogTitle>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoConvertMode}
                    onChange={(e) => setAutoConvertMode(e.target.checked)}
                    className="rounded"
                  />
                  자동 LaTeX 변환
                </label>
              </div>
            </div>
          </DialogHeader>

          {/* 자동 변환 도움말 */}
          {autoConvertMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">✨ 자동 변환 사용법</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
                {supportedPatterns.slice(0, 4).map((pattern, index) => (
                  <div key={index}>
                    <span className="font-medium">{pattern.name}:</span> {pattern.example}
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                예시: "2^2 + sqrt(9) = x" → "2^{2} + \sqrt{9} = x"
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* 문제 유형 및 난이도 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">문제 유형</label>
                <Select
                  value={editFormData.problem_type}
                  onValueChange={(value) => handleEditFormChange('problem_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="문제 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">객관식</SelectItem>
                    <SelectItem value="short_answer">단답형</SelectItem>
                    <SelectItem value="essay">서술형</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">난이도</label>
                <Select
                  value={editFormData.difficulty}
                  onValueChange={(value) => handleEditFormChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 문제 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">문제 내용</label>
              <Textarea
                value={editFormData.question}
                onChange={(e) => handleEditFormChange('question', e.target.value)}
                placeholder="문제 내용을 입력하세요 (LaTeX 지원)"
                rows={5}
                className="w-full"
              />
              <div className="mt-2 p-3 bg-gray-50 border rounded">
                <p className="text-sm text-gray-600 mb-2">미리보기:</p>
                <LaTeXRenderer
                  content={editFormData.question || '문제 내용이 여기에 표시됩니다.'}
                />
              </div>
            </div>

            {/* 객관식 선택지 */}
            {editFormData.problem_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">선택지</label>
                <div className="space-y-3">
                  {editFormData.choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Input
                        value={choice}
                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                        placeholder={`${String.fromCharCode(65 + index)}번 선택지 (LaTeX 지원)`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 정답 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">정답</label>
              {editFormData.problem_type === 'multiple_choice' ? (
                <Select
                  value={editFormData.correct_answer}
                  onValueChange={(value) => handleEditFormChange('correct_answer', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="정답 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  value={editFormData.correct_answer}
                  onChange={(e) => handleEditFormChange('correct_answer', e.target.value)}
                  placeholder="정답을 입력하세요 (LaTeX 지원)"
                  rows={2}
                  className="w-full"
                />
              )}
            </div>

            {/* 해설 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">해설</label>
              <Textarea
                value={editFormData.explanation}
                onChange={(e) => handleEditFormChange('explanation', e.target.value)}
                placeholder="해설을 입력하세요 (LaTeX 지원)"
                rows={4}
                className="w-full"
              />
              <div className="mt-2 p-3 bg-gray-50 border rounded">
                <p className="text-sm text-gray-600 mb-2">해설 미리보기:</p>
                <LaTeXRenderer content={editFormData.explanation || '해설이 여기에 표시됩니다.'} />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveProblem} className="bg-[#0072CE] hover:bg-[#0056A3]">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
