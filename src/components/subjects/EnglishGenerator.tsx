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
import { EnglishFormData } from '@/types/english';

const SCHOOL_OPTIONS = ['중학교', '고등학교'];
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'];
const DIFFICULTY = ['전체', '상', '중', '하'];
const QUESTION_COUNTS = [10, 20];
const QUESTION_TYPES = ['전체', '객관식', '단답형', '서술형'];

// 영어 문제 유형 데이터 (이름과 ID 매핑)
const ENGLISH_TYPES = {
  독해: [
    { name: '주제/제목/요지 추론', id: 19 },
    { name: '세부 정보 파악', id: 20 },
    { name: '내용 일치/불일치', id: 21 },
    { name: '빈칸 추론', id: 22 },
    { name: '문장 삽입', id: 23 },
    { name: '글의 순서 배열', id: 24 },
    { name: '함축 의미 추론', id: 25 },
    { name: '요약문 완성', id: 26 },
    { name: '도표/실용문', id: 27 },
  ],
  어휘: [
    { name: '개인 및 주변 생활', id: 21 },
    { name: '사회 및 공공 주제', id: 22 },
    { name: '추상적 개념 및 감정', id: 23 },
    { name: '접두사', id: 24 },
    { name: '접미사', id: 25 },
    { name: '합성어', id: 26 },
    { name: '다의어', id: 27 },
    { name: '유의어와 반의어', id: 28 },
    { name: '기본 동사구', id: 29 },
    { name: '관용 표현', id: 30 },
  ],
  문법: [
    { name: '문장의 기초', id: 35 },
    { name: '명사', id: 36 },
    { name: '관사', id: 37 },
    { name: '대명사', id: 38 },
    { name: 'be동사와 일반동사', id: 39 },
    { name: '문장의 종류', id: 40 },
    { name: '시제', id: 41 },
    { name: '조동사', id: 42 },
    { name: '수동태', id: 43 },
    { name: '형용사', id: 44 },
    { name: '부사', id: 45 },
    { name: '비교급', id: 46 },
    { name: '접속사', id: 47 },
    { name: '전치사', id: 48 },
    { name: 'to부정사', id: 49 },
    { name: '동명사', id: 50 },
    { name: '분사', id: 51 },
  ],
};

interface EnglishGeneratorProps {
  onGenerate: (data: EnglishFormData) => void;
  isGenerating: boolean;
}

export default function EnglishGenerator({ onGenerate, isGenerating }: EnglishGeneratorProps) {
  const [school, setSchool] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  // 영어 문제 유형 선택 상태
  const [englishMainType, setEnglishMainType] = useState<string>('');
  const [englishSubType, setEnglishSubType] = useState<number | null>(null);

  // 영어 전체(비율) 설정 모달
  const [isEnglishRatioOpen, setIsEnglishRatioOpen] = useState(false);
  const [englishRatios, setEnglishRatios] = useState<Record<string, number>>({
    독해: 0,
    어휘: 0,
    문법: 0,
  });
  const [englishRatioError, setEnglishRatioError] = useState<string>('');

  // 전체 모달에서 각 과목별 세부 카테고리 선택 상태
  const [selectedCategories, setSelectedCategories] = useState<{
    독해: number[];
    어휘: number[];
    문법: number[];
  }>({
    독해: [],
    어휘: [],
    문법: [],
  });

  // 문제 유형 선택 상태
  const [questionType, setQuestionType] = useState<string>('');

  // 문제 유형 비율 설정
  const [isTypeRatioOpen, setIsTypeRatioOpen] = useState(false);
  const [typeRatios, setTypeRatios] = useState<Record<string, number>>({
    객관식: 0,
    단답형: 0,
    서술형: 0,
  });
  const [typeRatioError, setTypeRatioError] = useState<string>('');

  // 난이도 비율 설정
  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ 상: 0, 중: 0, 하: 0 });
  const [diffError, setDiffError] = useState<string>('');

  const chipBase = 'px-3 py-1 rounded-md border-2 text-sm';
  const chipSelected = 'border-blue-500 bg-blue-50 text-blue-600';
  const chipUnselected = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

  // 영어 세부 유형 옵션 가져오기
  const getEnglishSubTypeOptions = () => {
    if (englishMainType && ENGLISH_TYPES[englishMainType as keyof typeof ENGLISH_TYPES]) {
      return ENGLISH_TYPES[englishMainType as keyof typeof ENGLISH_TYPES];
    }
    return [];
  };

  // 카테고리 토글 함수
  const toggleCategory = (subject: '독해' | '어휘' | '문법', categoryId: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [subject]: prev[subject].includes(categoryId)
        ? prev[subject].filter(id => id !== categoryId)
        : [...prev[subject], categoryId]
    }));
  };

  const diffSum = ['상', '중', '하'].reduce((s, k) => s + (diffRatios[k] || 0), 0);
  const englishRatioSum = ['독해', '어휘', '문법'].reduce((s, k) => s + (englishRatios[k] || 0), 0);
  const typeRatioSum = ['객관식', '단답형', '서술형'].reduce((s, k) => s + (typeRatios[k] || 0), 0);

  const isReadyToGenerate =
    school &&
    grade &&
    englishMainType &&
    (englishMainType === '전체' ? englishRatioSum === 100 : englishSubType !== null) &&
    questionType &&
    (questionType === '전체' ? typeRatioSum === 100 : true) &&
    difficulty &&
    questionCount !== null &&
    (difficulty !== '전체' ? true : diffSum === 100);

  const handleGenerate = () => {
    if (!isReadyToGenerate) return;

    // EnglishFormData 형식으로 데이터 변환
    const formData: EnglishFormData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      total_questions: questionCount!,
      subjects: englishMainType === '전체' ? ['독해', '어휘', '문법'] : [englishMainType],
      subject_details: {
        reading_types: englishMainType === '전체'
          ? (selectedCategories.독해.length > 0 ? selectedCategories.독해 : undefined)
          : (englishMainType === '독해' && englishSubType ? [englishSubType] : undefined),
        grammar_categories: englishMainType === '전체'
          ? (selectedCategories.문법.length > 0 ? selectedCategories.문법 : undefined)
          : (englishMainType === '문법' && englishSubType ? [englishSubType] : undefined),
        vocabulary_categories: englishMainType === '전체'
          ? (selectedCategories.어휘.length > 0 ? selectedCategories.어휘 : undefined)
          : (englishMainType === '어휘' && englishSubType ? [englishSubType] : undefined),
      },
      subject_ratios: englishMainType === '전체'
        ? Object.entries(englishRatios)
            .filter(([_, ratio]) => ratio > 0)
            .map(([subject, ratio]) => ({ subject, ratio }))
        : [{ subject: englishMainType, ratio: 100 }],
      question_format: questionType === '전체' ? '혼합형' : questionType,
      format_ratios: questionType === '전체'
        ? Object.entries(typeRatios)
            .filter(([_, ratio]) => ratio > 0)
            .map(([format, ratio]) => ({
              format: format === '단답형' ? '주관식' : format === '서술형' ? '주관식' : format,
              ratio
            }))
        : [{ format: questionType === '단답형' || questionType === '서술형' ? '주관식' : questionType, ratio: 100 }],
      difficulty_distribution: difficulty === '전체'
        ? Object.entries(diffRatios)
            .filter(([_, ratio]) => ratio > 0)
            .map(([difficulty, ratio]) => ({ difficulty, ratio }))
        : [{ difficulty, ratio: 100 }],
      additional_requirements: requirements || undefined,
    };

    onGenerate(formData);
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

      {/* 문제 영역 */}
      <div className="mb-4">
        <div className="mb-2 font-semibold flex items-center gap-2">
          문제 영역
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium mb-1">문제 영역 설정 팁</p>
                <p className="text-xs">
                  • <strong>전체</strong>를 선택하면 독해, 어휘, 문법의 비율을 설정할 수 있습니다
                  <br />
                  • 각 영역별로 10% 단위로 비율을 조정할 수 있습니다
                  <br />• 총 비율은 100%가 되어야 합니다
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-3">
          {/* 영어 메인 유형 선택 */}
          <div className="flex gap-2">
            {['전체', '독해', '어휘', '문법'].map((mainType) => (
              <button
                key={mainType}
                onClick={() => {
                  if (mainType === '전체') {
                    setEnglishRatioError('');
                    setIsEnglishRatioOpen(true);
                  } else {
                    setEnglishMainType(mainType);
                    setEnglishSubType(null); // 세부 유형 초기화
                  }
                }}
                className={`${chipBase} ${
                  englishMainType === mainType ? chipSelected : chipUnselected
                }`}
              >
                {mainType}
              </button>
            ))}
          </div>

          {/* 영어 세부 유형 선택 */}
          {englishMainType && englishMainType !== '전체' && (
            <div>
              <div className="mb-2 text-sm text-gray-600">{englishMainType} 세부 유형</div>
              <Select value={englishSubType?.toString() || ''} onValueChange={(value) => setEnglishSubType(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`${englishMainType} 세부 유형을 선택하세요`} />
                </SelectTrigger>
                <SelectContent>
                  {getEnglishSubTypeOptions().map((subType) => (
                    <SelectItem key={subType.id} value={subType.id.toString()}>
                      {subType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
                  • <strong>전체</strong>를 선택하면 객관식, 단답형, 서술형의 비율을 설정할 수 있습니다
                  <br />
                  • 각 유형별로 10% 단위로 비율을 조정할 수 있습니다
                  <br />• 총 비율은 100%가 되어야 합니다
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                if (type === '전체') {
                  setTypeRatioError('');
                  setIsTypeRatioOpen(true);
                } else {
                  setQuestionType(type);
                }
              }}
              className={`${chipBase} ${questionType === type ? chipSelected : chipUnselected}`}
            >
              {type}
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

      {/* 영어 문제 유형 비율 설정 모달 */}
      {isEnglishRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsEnglishRatioOpen(false)}
          />
          <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-semibold">영어 문제 전체 설정</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsEnglishRatioOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              각 영역의 출제 비율과 세부 카테고리를 설정하세요.
              <br />
              비율 합계가 100%가 되어야 하고, 비율이 있는 영역에서는 최소 1개 이상의 카테고리를 선택해야 합니다.
            </p>

            <div className="space-y-6">
              {['독해', '어휘', '문법'].map((type) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  {/* 과목 제목과 비율 설정 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={englishRatios[type] ?? 0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setEnglishRatios((prev) => {
                            const others = ['독해', '어휘', '문법'].reduce(
                              (s, k) => (k === type ? s : s + (prev[k] || 0)),
                              0,
                            );
                            const allowed = Math.max(0, 100 - others);
                            const next = Math.min(Math.max(0, isNaN(v) ? 0 : v), allowed);
                            return { ...prev, [type]: next };
                          });
                        }}
                        className="w-20 p-1 border rounded-md text-right text-sm"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>

                  {/* 세부 카테고리 선택 (비율이 0보다 클 때만 표시) */}
                  {englishRatios[type] > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">
                        세부 카테고리 선택 (필수)
                        <span className={`ml-2 ${
                          selectedCategories[type as keyof typeof selectedCategories].length === 0
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}>
                          ({selectedCategories[type as keyof typeof selectedCategories].length}개 선택됨)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ENGLISH_TYPES[type as keyof typeof ENGLISH_TYPES].map((category) => (
                          <button
                            key={category.id}
                            onClick={() => toggleCategory(type as '독해' | '어휘' | '문법', category.id)}
                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                              selectedCategories[type as keyof typeof selectedCategories].includes(category.id)
                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm">
                <div className={`${englishRatioSum === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  합계: {englishRatioSum}%
                </div>
                <div className="mt-1">
                  {/* 비율이 있는 영역의 카테고리 선택 검증 */}
                  {['독해', '어휘', '문법'].map(type => {
                    const hasRatio = englishRatios[type] > 0;
                    const hasCategories = selectedCategories[type as keyof typeof selectedCategories].length > 0;

                    if (hasRatio && !hasCategories) {
                      return (
                        <div key={type} className="text-red-500 text-xs">
                          {type} 영역의 카테고리를 선택해주세요
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              {englishRatioError && <div className="text-sm text-red-600">{englishRatioError}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setIsEnglishRatioOpen(false)}
                className="px-5 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 비율 합계 검증
                  if (englishRatioSum !== 100) {
                    return setEnglishRatioError('합계가 100%가 되어야 합니다.');
                  }

                  // 비율이 있는 영역의 카테고리 선택 검증
                  const missingCategories = ['독해', '어휘', '문법'].filter(type => {
                    const hasRatio = englishRatios[type] > 0;
                    const hasCategories = selectedCategories[type as keyof typeof selectedCategories].length > 0;
                    return hasRatio && !hasCategories;
                  });

                  if (missingCategories.length > 0) {
                    return setEnglishRatioError(`${missingCategories.join(', ')} 영역의 카테고리를 선택해주세요.`);
                  }

                  setEnglishRatioError('');
                  setEnglishMainType('전체');
                  setIsEnglishRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${
                  englishRatioSum === 100 &&
                  ['독해', '어휘', '문법'].every(type => {
                    const hasRatio = englishRatios[type] > 0;
                    const hasCategories = selectedCategories[type as keyof typeof selectedCategories].length > 0;
                    return !hasRatio || hasCategories;
                  })
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
                disabled={!(
                  englishRatioSum === 100 &&
                  ['독해', '어휘', '문법'].every(type => {
                    const hasRatio = englishRatios[type] > 0;
                    const hasCategories = selectedCategories[type as keyof typeof selectedCategories].length > 0;
                    return !hasRatio || hasCategories;
                  })
                )}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 문제 유형 비율 설정 모달 */}
      {isTypeRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsTypeRatioOpen(false)}
          />
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

            <div className="space-y-3">
              {['객관식', '단답형', '서술형'].map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={10}
                      value={typeRatios[type] ?? 0}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setTypeRatios((prev) => {
                          const others = ['객관식', '단답형', '서술형'].reduce(
                            (s, k) => (k === type ? s : s + (prev[k] || 0)),
                            0,
                          );
                          const allowed = Math.max(0, 100 - others);
                          const next = Math.min(Math.max(0, isNaN(v) ? 0 : v), allowed);
                          return { ...prev, [type]: next };
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
              <div
                className={`text-sm ${typeRatioSum === 100 ? 'text-green-600' : 'text-red-600'}`}
              >
                합계: {typeRatioSum}%
              </div>
              {typeRatioError && <div className="text-sm text-red-600">{typeRatioError}</div>}
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
                  if (typeRatioSum !== 100)
                    return setTypeRatioError('합계가 100%가 되어야 합니다.');
                  setTypeRatioError('');
                  setQuestionType('전체');
                  setIsTypeRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${
                  typeRatioSum === 100
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
                disabled={typeRatioSum !== 100}
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
