"use client";

import React from 'react';
import { Worksheet, MathProblem } from '@/types/math';
import { LaTeXRenderer } from '@/components/LaTeXRenderer';

interface SolutionPrintLayoutProps {
  worksheet: Worksheet;
  problems: MathProblem[];
}

export const SolutionPrintLayout = React.forwardRef<HTMLDivElement, SolutionPrintLayoutProps>(
  ({ worksheet, problems }, ref) => {
    return (
      <div ref={ref} className="print-container">
        {/* Print 스타일 */}
        <style jsx>{`
          @media print {
            .print-container {
              padding: 20mm;
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

          .solution-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }

          .solution-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .solution-info {
            font-size: 14px;
            color: #666;
          }

          .problem-container {
            margin: 20px 0;
            padding: 15px 0;
            border-bottom: 1px solid #ddd;
          }

          .problem-number {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
          }

          .answer-section {
            margin: 10px 0;
          }

          .answer-label {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .answer-content {
            margin-left: 10px;
            font-weight: bold;
          }

          .explanation-section {
            margin: 10px 0;
          }

          .explanation-label {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .explanation-content {
            margin-left: 10px;
            line-height: 1.8;
          }
        `}</style>

        {/* 해설지 헤더 */}
        <div className="solution-header">
          <div className="solution-title">{worksheet.title} - 정답 및 해설</div>
          <div className="solution-info">
            {worksheet.school_level} {worksheet.grade}학년 {worksheet.semester} - {worksheet.unit_name} ({worksheet.chapter_name})
          </div>
        </div>

        {/* 정답 및 해설 목록 */}
        {problems.map((problem, index) => (
          <div key={problem.id} className="problem-container">
            <div className="problem-number">{index + 1}.</div>

            {/* 정답 */}
            <div className="answer-section">
              <div className="answer-label">정답:</div>
              <div className="answer-content">
                <LaTeXRenderer content={problem.correct_answer} />
              </div>
            </div>

            {/* 해설 */}
            {problem.explanation && (
              <div className="explanation-section">
                <div className="explanation-label">해설:</div>
                <div className="explanation-content">
                  <LaTeXRenderer content={problem.explanation} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

SolutionPrintLayout.displayName = 'SolutionPrintLayout';
