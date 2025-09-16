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
const KOREAN_TYPES = ['전체', '시', '소설', '수필/비문학', '문법'];
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

  // 전체(비율) 설정 모달 상태
  const [isTypeRatioOpen, setIsTypeRatioOpen] = useState(false);
  const [typeRatios, setTypeRatios] = useState<Record<string, number>>({});
  const [ratioError, setRatioError] = useState<string>('');

  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ 상: 0, 중: 0, 하: 0 });
  const [diffError, setDiffError] = useState<string>('');

  const chipBase = 'px-3 py-1 rounded-md border-2 text-sm';
  const chipSelected = 'border-blue-500 bg-blue-50 text-blue-600';
  const chipUnselected = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

  // 현재 국어 유형(전체 제외)
  const currentTypes = KOREAN_TYPES.filter((t) => t !== '전체');
  const ratioSum = currentTypes.reduce((sum, t) => sum + (typeRatios[t] || 0), 0);
  const diffSum = ['상', '중', '하'].reduce((s, k) => s + (diffRatios[k] || 0), 0);

  const isReadyToGenerate =
    school &&
    grade &&
    type &&
    difficulty &&
    questionCount !== null &&
    (type !== '전체' ? true : ratioSum === 100) &&
    (difficulty !== '전체' ? true : diffSum === 100);

  const handleGenerate = () => {
    if (!isReadyToGenerate) return;

    // 백엔드 스키마에 맞게 데이터 구성
    const requestData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      korean_type: type === '전체' ? '시' : type, // 전체인 경우 기본값 설정
      question_type: '객관식', // 기본값 (추후 문제 형식 선택 기능 추가 시 수정)
      difficulty: difficulty === '전체' ? '중' : difficulty, // 전체인 경우 기본값 설정
      problem_count: questionCount || 10,
      user_text: requirements || '',
      korean_type_ratio: type === '전체' ? typeRatios : null,
      question_type_ratio: null, // 현재는 단일 문제 형식만 지원
      difficulty_ratio: difficulty === '전체' ? diffRatios : null,
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
                  • <strong>전체</strong>를 선택하면 시, 소설, 수필/비문학, 문법의 비율을 설정할 수
                  있습니다
                  <br />
                  • 각 유형별로 10% 단위로 비율을 조정할 수 있습니다
                  <br />• 총 비율은 100%가 되어야 합니다
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-wrap gap-2">
          {KOREAN_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === '전체') {
                  const init: Record<string, number> = {};
                  currentTypes.forEach((ct) => (init[ct] = typeRatios[ct] ?? 0));
                  setTypeRatios(init);
                  setRatioError('');
                  setIsTypeRatioOpen(true);
                } else {
                  setType(t);
                }
              }}
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
                  • <strong>전체</strong>를 선택하면 상, 중, 하 난이도의 비율을 설정할 수 있습니다
                  <br />
                  • 각 난이도별로 10% 단위로 비율을 조정할 수 있습니다
                  <br />• 총 비율은 100%가 되어야 합니다
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          {DIFFICULTY.map((d) => (
            <button
              key={d}
              onClick={() => {
                if (d === '전체') {
                  setDiffError('');
                  setIsDiffRatioOpen(true);
                } else {
                  setDifficulty(d);
                }
              }}
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

      {/* 문제 유형 비율 설정 모달 */}
      {isTypeRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsTypeRatioOpen(false)} />
          <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-semibold">문제 유형 비율 설정</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsTypeRatioOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              전체 선택 시 각 유형의 출제 비율을 지정합니다.
              <br />
              합계가 100%가 되어야 저장할 수 있어요.
            </p>

            <div className="space-y-3 max-h-[300px] overflow-auto">
              {currentTypes.map((ct) => (
                <div key={ct} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{ct}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={typeRatios[ct] ?? 0}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setTypeRatios((prev) => {
                          const others = currentTypes.reduce(
                            (s, k) => (k === ct ? s : s + (prev[k] || 0)),
                            0,
                          );
                          const allowed = Math.max(0, 100 - others);
                          const next = Math.min(Math.max(0, isNaN(v) ? 0 : v), allowed);
                          return { ...prev, [ct]: next };
                        });
                      }}
                      className="w-24 p-2 border rounded-md text-right"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className={`text-sm ${ratioSum === 100 ? 'text-green-600' : 'text-red-600'}`}>
                합계: {ratioSum}%
              </div>
              {ratioError && <div className="text-sm text-red-600">{ratioError}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setIsTypeRatioOpen(false)}
                className="px-5 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (ratioSum !== 100) return setRatioError('합계가 100%가 되어야 합니다.');
                  setRatioError('');
                  setType('전체');
                  setIsTypeRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${
                  ratioSum === 100
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
                disabled={ratioSum !== 100}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 난이도 비율 설정 모달 */}
      {isDiffRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDiffRatioOpen(false)} />
          <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-semibold">난이도 비율 설정</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsDiffRatioOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">합계가 100%가 되어야 저장할 수 있어요.</p>

            {['상', '중', '하'].map((lv) => (
              <div key={lv} className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">{lv}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={diffRatios[lv] ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDiffRatios((prev) => {
                        const others = ['상', '중', '하'].reduce(
                          (s, k) => (k === lv ? s : s + (prev[k] || 0)),
                          0,
                        );
                        const allowed = Math.max(0, 100 - others);
                        const next = Math.min(Math.max(0, isNaN(v) ? 0 : v), allowed);
                        return { ...prev, [lv]: next };
                      });
                    }}
                    className="w-24 p-2 border rounded-md text-right"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-1">
              <div className={`text-sm ${diffSum === 100 ? 'text-green-600' : 'text-red-600'}`}>
                합계: {diffSum}%
              </div>
              {diffError && <div className="text-sm text-red-600">{diffError}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setIsDiffRatioOpen(false)}
                className="px-5 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (diffSum !== 100) return setDiffError('합계가 100%가 되어야 합니다.');
                  setDiffError('');
                  setDifficulty('전체');
                  setIsDiffRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${
                  diffSum === 100
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
                disabled={diffSum !== 100}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
