'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

const SCHOOL_OPTIONS = ['중학교', '고등학교'];
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'];
const DIFFICULTY = ['전체', '상', '중', '하'];
const KOREAN_TYPES = ['시', '소설', '수필/비문학', '문법'];  // 전체 옵션 제거
const QUESTION_COUNTS = [10, 20];

interface KoreanGeneratorProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
}

export default function KoreanGenerator({ onGenerate, isGenerating }: KoreanGeneratorProps) {
  const [school, setSchool] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number | null>(null);


  const chipBase = 'px-3 py-1 rounded-md border-2 text-sm';
  const chipSelected = 'border-blue-500 bg-blue-50 text-blue-600';
  const chipUnselected = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

  const isReadyToGenerate =
    school &&
    grade &&
    type &&
    difficulty &&
    questionCount !== null;

  const handleGenerate = () => {
    if (!isReadyToGenerate) return;

    // 백엔드 스키마에 맞게 데이터 구성 (단일 도메인만 지원)
    const requestData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      korean_type: type, // 단일 도메인 선택
      question_type: '객관식', // 모든 문제는 객관식
      difficulty: difficulty,
      problem_count: questionCount || 10,
      user_text: requirements || '',
    };

    onGenerate(requestData);
  };

  return (
    <>
      {/* 지문 불러오기 */}
      <div className="mb-4">
        <div className="space-y-2">
          <Select value={school} onValueChange={setSchool}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="학교 선택" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOL_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="학년 선택" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 문제 유형 */}
      <div className="mb-4">
        <div className="mb-2 font-semibold flex items-center gap-2">
          문제 유형
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium mb-1">문제 유형 설정 팁</p>
                <p className="text-xs">
                  • 각 문제지는 하나의 영역만 선택할 수 있습니다
                  <br />
                  • 시, 소설, 수필/비문학, 문법 중 하나를 선택하세요
                  <br />• 모든 문제는 객관식으로 출제됩니다
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-wrap gap-2">
          {KOREAN_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`${chipBase} ${type === t ? chipSelected : chipUnselected}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 난이도 */}
      <div className="mb-4">
        <div className="mb-2 font-semibold flex items-center gap-2">
          난이도
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium mb-1">난이도 설정 팁</p>
                <p className="text-xs">
                  • <strong>상</strong>: 높은 난이도의 문제들로 구성
                  <br />
                  • <strong>중</strong>: 보통 난이도의 문제들로 구성
                  <br />
                  • <strong>하</strong>: 기본 난이도의 문제들로 구성
                  <br />• <strong>전체</strong>: 상, 중, 하 난이도가 골고루 섞인 문제들로 구성
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          {DIFFICULTY.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`${chipBase} ${difficulty === d ? chipSelected : chipUnselected}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 요구사항 */}
      <div className="mb-4">
        <div className="mb-2 font-semibold">요구사항</div>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full p-2 border rounded h-24 resize-none"
          placeholder="문제 출제 요구사항을 입력해주세요."
          maxLength={50}
        />
        <div className="text-right text-sm text-gray-500 min-h-[1.5rem]">
          {requirements.length}/50
        </div>
      </div>

      {/* 총 문항 수 */}
      <div className="mb-4">
        <div className="mb-2 font-semibold">총 문항 수</div>
        <div className="flex gap-2">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`${chipBase} ${questionCount === count ? chipSelected : chipUnselected}`}
            >
              {count}문항
            </button>
          ))}
        </div>
      </div>

      {/* 문제 생성하기 버튼 */}
      <button
        disabled={!isReadyToGenerate || isGenerating}
        className={`w-full p-2 rounded text-white ${
          isReadyToGenerate && !isGenerating
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleGenerate}
      >
        {isGenerating ? '문제 생성 중...' : '문제 생성하기'}
      </button>


    </>
  );
}
