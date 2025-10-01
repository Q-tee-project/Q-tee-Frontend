'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GeneratorSection } from './GeneratorSection';
import { OptionSelector } from './OptionSelector';
import { RatioModal } from './RatioModal';

const SCHOOL_OPTIONS = ['중학교', '고등학교'] as const;
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'] as const;
const DIFFICULTY_OPTIONS = ['전체', '상', '중', '하'] as const;
const KOREAN_TYPE_OPTIONS = ['시', '소설', '수필/비문학', '문법'] as const;
const QUESTION_COUNT_OPTIONS = [10, 20] as const;

type School = (typeof SCHOOL_OPTIONS)[number];
type Grade = (typeof GRADE_OPTIONS)[number];
type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];
type KoreanType = (typeof KOREAN_TYPE_OPTIONS)[number];
type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];

interface KoreanGeneratorProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
}

export default function KoreanGenerator({ onGenerate, isGenerating }: KoreanGeneratorProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [type, setType] = useState<KoreanType | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [requirements, setRequirements] = useState('');
  const [questionCount, setQuestionCount] = useState<QuestionCount | null>(null);

  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ 상: 0, 중: 0, 하: 0 });
  const [diffError, setDiffError] = useState('');

  const isReadyToGenerate = school && grade && type && difficulty && questionCount !== null;

  const handleGenerate = () => {
    if (!isReadyToGenerate) return;

    const requestData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      korean_type: type,
      question_type: '객관식',
      difficulty: difficulty,
      problem_count: questionCount,
      user_text: requirements || '',
    };

    onGenerate(requestData);
  };

  return (
    <div>
      <div className="divide-y divide-gray-200">
        <GeneratorSection title="기본 정보">
          <div className="flex justify-center gap-4">
            <Select value={school || ''} onValueChange={(v) => setSchool(v as School)}>
              <SelectTrigger>
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
            <Select value={grade || ''} onValueChange={(v) => setGrade(v as Grade)}>
              <SelectTrigger>
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
        </GeneratorSection>

        <GeneratorSection
          title="문제 유형"
          tooltipContent={
            <>
              <p className="font-medium mb-1">문제 유형 설정 팁</p>
              <p className="text-xs">
                • 각 문제지는 하나의 영역만 선택할 수 있습니다.
                <br />• 시, 소설, 수필/비문학, 문법 중 하나를 선택하세요.
                <br />• 모든 문제는 객관식으로 출제됩니다.
              </p>
            </>
          }
        >
          <OptionSelector options={KOREAN_TYPE_OPTIONS} selectedValue={type} onSelect={setType} />
        </GeneratorSection>

        <GeneratorSection
          title="난이도"
          tooltipContent={
            <>
              <p className="font-medium mb-1">난이도 설정 팁</p>
              <p className="text-xs">
                • <strong>상</strong>: 높은 난이도의 문제들로 구성
                <br />• <strong>중</strong>: 보통 난이도의 문제들로 구성
                <br />• <strong>하</strong>: 기본 난이도의 문제들로 구성
                <br />• <strong>전체</strong>: 상, 중, 하 난이도가 골고루 섞인 문제들로 구성
              </p>
            </>
          }
        >
          <OptionSelector
            options={DIFFICULTY_OPTIONS}
            selectedValue={difficulty}
            onSelect={(d) => {
              if (d === '전체') {
                setDiffError('');
                setIsDiffRatioOpen(true);
              } else {
                setDifficulty(d);
              }
            }}
          />
        </GeneratorSection>

        <GeneratorSection title="추가 요구사항">
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="문제 출제 요구사항을 입력해주세요."
            maxLength={100}
            className="h-20 resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-2">
            {requirements.length}/100
          </div>
        </GeneratorSection>

        <GeneratorSection title="총 문항 수">
          <OptionSelector
            options={QUESTION_COUNT_OPTIONS}
            selectedValue={questionCount}
            onSelect={setQuestionCount}
            renderLabel={(count) => `${count}문항`}
          />
        </GeneratorSection>
      </div>

      <div className="pt-3">
        <Button
          disabled={!isReadyToGenerate || isGenerating}
          className="w-full text-base py-3"
          onClick={handleGenerate}
        >
          {isGenerating ? '문제 생성 중...' : '문제 생성하기'}
        </Button>
      </div>

      <RatioModal
        isOpen={isDiffRatioOpen}
        onClose={() => setIsDiffRatioOpen(false)}
        title="난이도 비율 설정"
        description="합계가 100%가 되어야 저장할 수 있어요."
        items={['상', '중', '하']}
        ratios={diffRatios}
        setRatios={setDiffRatios}
        error={diffError}
        onSave={() => {
          const diffSum = Object.values(diffRatios).reduce((s, r) => s + r, 0);
          if (diffSum !== 100) return setDiffError('합계가 100%가 되어야 합니다.');
          setDiffError('');
          setDifficulty('전체');
          setIsDiffRatioOpen(false);
        }}
      />
    </div>
  );
}
