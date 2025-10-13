'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileDown, FileText, BookOpen } from 'lucide-react';
import { mathService } from '@/services/mathService';
import { Worksheet, MathProblem } from '@/types/math';
import { ExamPrintLayout } from '@/components/pdf/ExamPrintLayout';
import { SolutionPrintLayout } from '@/components/pdf/SolutionPrintLayout';

export default function ExportPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>('');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'none' | 'exam' | 'solution'>('none');

  const examRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  // selectedWorksheet를 먼저 계산
  const selectedWorksheet = worksheets.find((w) => w.id.toString() === selectedWorksheetId);

  useEffect(() => {
    loadWorksheets();
  }, []);

  const loadWorksheets = async () => {
    try {
      const response = await mathService.getMathWorksheets();
      setWorksheets(response.worksheets);
    } catch (error) {
      console.error('워크시트 로드 실패:', error);
      alert('워크시트를 불러올 수 없습니다.');
    }
  };

  const loadProblems = async (worksheetId: number) => {
    setIsLoading(true);
    try {
      const response = await mathService.getMathWorksheetProblems(worksheetId);
      setProblems(response.problems || []);
    } catch (error) {
      console.error('문제 로드 실패:', error);
      alert('문제를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWorksheetId) {
      loadProblems(parseInt(selectedWorksheetId));
    }
  }, [selectedWorksheetId]);

  const handlePrintExam = useReactToPrint({
    contentRef: examRef,
    documentTitle: `${selectedWorksheet?.title || 'worksheet'}_시험지`,
    onAfterPrint: () => {
      setPreviewMode('none');
    },
  });

  const handlePrintSolution = useReactToPrint({
    contentRef: solutionRef,
    documentTitle: `${selectedWorksheet?.title || 'worksheet'}_해설지`,
    onAfterPrint: () => {
      setPreviewMode('none');
    },
  });

  const handleDownloadExam = () => {
    if (!selectedWorksheet || problems.length === 0) {
      alert('문제를 먼저 불러와주세요.');
      return;
    }
    setPreviewMode('exam');
    setTimeout(() => {
      if (handlePrintExam) {
        handlePrintExam();
      }
    }, 500); // DOM 렌더링 대기
  };

  const handleDownloadSolution = () => {
    if (!selectedWorksheet || problems.length === 0) {
      alert('문제를 먼저 불러와주세요.');
      return;
    }
    setPreviewMode('solution');
    setTimeout(() => {
      if (handlePrintSolution) {
        handlePrintSolution();
      }
    }, 500); // DOM 렌더링 대기
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">수학 문제지 PDF 내보내기</h1>
        <p className="text-muted-foreground">
          워크시트를 선택하여 시험지와 해설지를 PDF로 다운로드하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            워크시트 선택
          </CardTitle>
          <CardDescription>다운로드할 수학 워크시트를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 워크시트 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">워크시트</label>
            <Select value={selectedWorksheetId} onValueChange={setSelectedWorksheetId}>
              <SelectTrigger>
                <SelectValue placeholder="워크시트를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {worksheets.map((worksheet) => (
                  <SelectItem key={worksheet.id} value={worksheet.id.toString()}>
                    {worksheet.title} ({worksheet.school_level} {worksheet.grade}학년)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 선택된 워크시트 정보 */}
          {selectedWorksheet && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold">{selectedWorksheet.title}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {' '}
                  {selectedWorksheet.school_level} {selectedWorksheet.grade}학년
                </p>
                <p>
                  {' '}
                  {selectedWorksheet.semester} - {selectedWorksheet.unit_name}
                </p>
                <p> {selectedWorksheet.chapter_name}</p>
                <p>
                  {' '}
                  문제 개수:{' '}
                  {problems.length > 0 ? problems.length : selectedWorksheet.problem_count}개
                </p>
              </div>
            </div>
          )}

          {/* 다운로드 버튼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleDownloadExam}
              disabled={!selectedWorksheetId || isLoading || problems.length === 0}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <FileText className="w-6 h-6" />
              <span className="font-semibold">시험지 다운로드</span>
              <span className="text-xs text-muted-foreground">문제만 포함</span>
            </Button>

            <Button
              onClick={handleDownloadSolution}
              disabled={!selectedWorksheetId || isLoading || problems.length === 0}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <BookOpen className="w-6 h-6" />
              <span className="font-semibold">해설지 다운로드</span>
              <span className="text-xs text-muted-foreground">정답 + 해설 포함</span>
            </Button>
          </div>

          {isLoading && (
            <div className="text-center text-sm text-muted-foreground">문제 불러오는 중...</div>
          )}
        </CardContent>
      </Card>

      {/* 안내 사항 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg"> 사용 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>시험지:</strong> 문제만 포함되어 학생들에게 배포할 수 있습니다.
          </p>
          <p>
            • <strong>해설지:</strong> 정답과 해설이 포함되어 채점 및 복습에 활용할 수 있습니다.
          </p>
          <p>• 브라우저 인쇄 화면에서 "PDF로 저장"을 선택하세요.</p>
          <p>• LaTeX 수식과 TikZ 다이어그램이 완벽하게 렌더링됩니다.</p>
        </CardContent>
      </Card>

      {/* 숨겨진 프린트 레이아웃 */}
      <div style={{ display: 'none' }}>
        {previewMode === 'exam' && selectedWorksheet && (
          <ExamPrintLayout ref={examRef} worksheet={selectedWorksheet} problems={problems} />
        )}
        {previewMode === 'solution' && selectedWorksheet && (
          <SolutionPrintLayout
            ref={solutionRef}
            worksheet={selectedWorksheet}
            problems={problems}
          />
        )}
      </div>
    </div>
  );
}
