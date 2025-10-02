"use client";

import React from 'react';
import { Worksheet, MathProblem } from '@/types/math';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';
import { TikZRenderer } from '@/components/TikZRenderer';

interface ExamPrintLayoutProps {
  worksheet: Worksheet;
  problems: MathProblem[];
}

export const ExamPrintLayout = React.forwardRef<HTMLDivElement, ExamPrintLayoutProps>(
  ({ worksheet, problems }, ref) => {
    return (
      <div ref={ref} className="print-container">
        {/* Print 스타일 */}
        <style jsx>{`
          @media print {
            .print-container {
              padding: 20mm;
            }
            .page-break {
              page-break-after: always;
            }
            .no-print {
              display: none !important;
            }
          }

          .print-container {
            background: white;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Noto Sans KR', sans-serif;
          }

          .exam-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }

          .exam-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .exam-info {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }

          .student-info {
            display: flex;
            justify-content: space-around;
            border: 1px solid #000;
            padding: 10px;
            margin-top: 15px;
          }

          .student-info-item {
            display: flex;
            gap: 10px;
            align-items: center;
          }

          .problem-container {
            margin: 30px 0;
            padding: 15px 0;
            page-break-after: always;
          }

          .problem-number {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }

          .problem-question {
            margin: 15px 0;
            line-height: 1.8;
          }

          .choices-container {
            margin: 15px 0 15px 20px;
          }

          .choice-item {
            margin: 8px 0;
            display: flex;
            align-items: baseline;
            gap: 10px;
          }

          .choice-number {
            font-weight: bold;
            min-width: 30px;
          }

          .answer-space {
            margin: 20px 0;
            min-height: 80px;
            border: 1px dashed #ccc;
            padding: 10px;
          }

          .tikz-container {
            margin: 15px 0;
            display: flex;
            justify-content: center;
          }

          .tikz-container svg {
            max-width: 400px !important;
            max-height: 400px !important;
            width: auto !important;
            height: auto !important;
          }
        `}</style>

        {/* 시험지 헤더 */}
        <div className="exam-header">
          <div className="exam-title">{worksheet.title}</div>
          <div className="exam-info">
            {worksheet.school_level} {worksheet.grade}학년 {worksheet.semester} - {worksheet.unit_name} ({worksheet.chapter_name})
          </div>
          <div className="student-info">
            <div className="student-info-item">
              <strong>이름:</strong>
              <span>___________________</span>
            </div>
            <div className="student-info-item">
              <strong>학년/반:</strong>
              <span>___________________</span>
            </div>
            <div className="student-info-item">
              <strong>점수:</strong>
              <span>___________________</span>
            </div>
          </div>
        </div>

        {/* 문제 목록 */}
        {problems.map((problem, index) => (
          <div key={problem.id} className="problem-container">
            <div className="problem-number">{index + 1}.</div>

            {/* 문제 텍스트 */}
            <div className="problem-question">
              <LaTeXRenderer content={problem.question} />
            </div>

            {/* TikZ 다이어그램 */}
            {problem.tikz_code && (
              <div className="tikz-container">
                <TikZRenderer tikzCode={problem.tikz_code} />
              </div>
            )}

            {/* 객관식 선택지 */}
            {problem.problem_type === 'multiple_choice' && problem.choices && (
              <div className="choices-container">
                {problem.choices.map((choice, idx) => (
                  <div key={idx} className="choice-item">
                    <span className="choice-number">{['①', '②', '③', '④', '⑤'][idx]}</span>
                    <LaTeXRenderer content={choice} />
                  </div>
                ))}
              </div>
            )}

            {/* 주관식 답안 공간 */}
            {problem.problem_type === 'short_answer' && (
              <div className="answer-space">
                <div style={{ color: '#999', fontSize: '12px' }}>답안 작성란</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

ExamPrintLayout.displayName = 'ExamPrintLayout';
