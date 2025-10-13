'use client';

import React, { useState, useEffect } from 'react';
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
import { MathFormData } from '@/types/math';
import { RatioModal } from './RatioModal';

const SCHOOL_OPTIONS = ['중학교', '고등학교'] as const;
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'] as const;
const SEMESTER_OPTIONS = ['1학기', '2학기'] as const;
const DIFFICULTY_OPTIONS = ['전체', 'A', 'B', 'C'] as const;
const MATH_TYPE_OPTIONS = ['전체', '객관식', '단답형'] as const;
const QUESTION_COUNT_OPTIONS = [10, 20] as const;

type School = (typeof SCHOOL_OPTIONS)[number];
type Grade = (typeof GRADE_OPTIONS)[number];
type Semester = (typeof SEMESTER_OPTIONS)[number];
type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];
type MathType = (typeof MATH_TYPE_OPTIONS)[number];
type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];

interface MathGeneratorProps {
  onGenerate: (data: MathFormData) => void;
  isGenerating: boolean;
}

export default function MathGenerator({ onGenerate, isGenerating }: MathGeneratorProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [type, setType] = useState<MathType | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [requirements, setRequirements] = useState('');
  const [questionCount, setQuestionCount] = useState<QuestionCount | null>(null);

  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');

  const [isTypeRatioOpen, setIsTypeRatioOpen] = useState(false);
  const [typeRatios, setTypeRatios] = useState<Record<string, number>>({});
  const [ratioError, setRatioError] = useState('');

  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ A: 0, B: 0, C: 0 });
  const [diffError, setDiffError] = useState('');

  const loadCurriculumStructure = async () => {
    if (!school || !grade || !semester) return;
    try {
      const response = await fetch(
        `http://localhost:8001/api/curriculum/structure?school_level=${encodeURIComponent(school)}`,
      );
      const data = await response.json();

      if (data.structure) {
        const gradeNum = parseInt(grade.replace('학년', ''));
        const semesterNum = parseInt(semester.replace('학기', ''));
        const curriculumKey =
          school === '중학교'
            ? `middle${gradeNum}_${semesterNum}semester`
            : `high${gradeNum}_${semesterNum}semester`;

        const curriculum = data.structure[curriculumKey];

        if (curriculum && curriculum.units) {
          const unitList = curriculum.units.map((unit: any) => ({
            unit_number: unit.unit_number,
            unit_name: unit.unit_name,
            chapters: unit.chapters,
          }));
          setUnits(unitList);
        } else {
          setUnits([]);
        }
      }
    } catch (error) {
      console.error('Error loading curriculum structure:', error);
      setUnits([]);
    }
  };

  const loadChapters = (unitName: string) => {
    const selectedUnitData = units.find((unit) => unit.unit_name === unitName);
    if (selectedUnitData && selectedUnitData.chapters) {
      setChapters(selectedUnitData.chapters);
    } else {
      setChapters([]);
    }
  };

  useEffect(() => {
    loadCurriculumStructure();
    setSelectedUnit('');
    setSelectedChapter('');
    setChapters([]);
  }, [school, grade, semester]);

  useEffect(() => {
    if (selectedUnit) {
      loadChapters(selectedUnit);
      setSelectedChapter('');
    }
  }, [selectedUnit, units]);

  const currentTypes = MATH_TYPE_OPTIONS.filter((t) => t !== '전체');
  const ratioSum = currentTypes.reduce((sum, t) => sum + (typeRatios[t] || 0), 0);
  const diffSum = ['A', 'B', 'C'].reduce((s, k) => s + (diffRatios[k] || 0), 0);

  const isReadyToGenerate =
    school &&
    grade &&
    semester &&
    selectedUnit &&
    selectedChapter &&
    type &&
    difficulty &&
    questionCount !== null &&
    (type !== '전체' ? true : ratioSum === 100) &&
    (difficulty !== '전체' ? true : diffSum === 100);

  const handleGenerate = () => {
    if (!isReadyToGenerate) return;

    const selectedUnitInfo = units.find((unit) => unit.unit_name === selectedUnit);
    const selectedChapterInfo = selectedUnitInfo?.chapters.find(
      (ch: any) => ch.chapter_name === selectedChapter,
    );

    const requestData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      semester: semester,
      unit_number: selectedUnitInfo?.unit_number || '',
      chapter: {
        chapter_number: selectedChapterInfo?.chapter_number || '',
        chapter_name: selectedChapter,
        unit_name: selectedUnit,
      },
      problem_count: `${questionCount}문제`,
      user_text: requirements || '',
      difficulty_ratio:
        difficulty === '전체'
          ? { A: diffRatios['A'], B: diffRatios['B'], C: diffRatios['C'] }
          : difficulty === 'A'
          ? { A: 100, B: 0, C: 0 }
          : difficulty === 'B'
          ? { A: 0, B: 100, C: 0 }
          : { A: 0, B: 0, C: 100 },
      problem_type_ratio:
        type === '전체'
          ? {
              multiple_choice: typeRatios['객관식'] || 0,
              short_answer: typeRatios['단답형'] || 0,
            }
          : type === '객관식'
          ? { multiple_choice: 100, short_answer: 0 }
          : { multiple_choice: 0, short_answer: 100 },
    };

    onGenerate(requestData as any);
  };

  const handleTypeSelect = (t: MathType) => {
    if (t === '전체') {
      const init: Record<string, number> = {};
      currentTypes.forEach((ct) => (init[ct] = typeRatios[ct] ?? 0));
      setTypeRatios(init);
      setRatioError('');
      setIsTypeRatioOpen(true);
    } else {
      setType(t);
    }
  };

  const handleDifficultySelect = (d: Difficulty) => {
    if (d === '전체') {
      setDiffError('');
      setIsDiffRatioOpen(true);
    } else {
      setDifficulty(d);
    }
  };

  return (
    <div>
      <div className="divide-y divide-gray-200">
        <GeneratorSection title="기본 정보">
          <div className="flex justify-start gap-4">
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
            <Select value={semester || ''} onValueChange={(v) => setSemester(v as Semester)}>
              <SelectTrigger>
                <SelectValue placeholder="학기 선택" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GeneratorSection>

        <GeneratorSection title="단원 선택">
          <div className="flex justify-start gap-4">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue placeholder="대단원 선택" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit, index) => (
                  <SelectItem
                    key={`${unit.unit_number}-${unit.unit_name}-${index}`}
                    value={unit.unit_name}
                  >
                    {unit.unit_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedChapter}
              onValueChange={setSelectedChapter}
              disabled={!chapters.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="소단원 선택" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter: any, index: number) => (
                  <SelectItem
                    key={`${chapter.chapter_number}-${chapter.chapter_name}-${index}`}
                    value={chapter.chapter_name}
                  >
                    {chapter.chapter_name}
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
                • <strong>전체</strong>를 선택하면 객관식, 단답형의 비율을 설정할 수 있습니다.
                <br />• 각 유형별로 10% 단위로 비율을 조정할 수 있습니다.
                <br />• 총 비율은 100%가 되어야 합니다.
              </p>
            </>
          }
        >
          <OptionSelector
            options={MATH_TYPE_OPTIONS}
            selectedValue={type}
            onSelect={handleTypeSelect}
          />
        </GeneratorSection>

        <GeneratorSection
          title="난이도"
          tooltipContent={
            <>
              <p className="font-medium mb-1">난이도 설정 팁</p>
              <p className="text-xs">
                • <strong>전체</strong>를 선택하면 A, B, C 난이도의 비율을 설정할 수 있습니다.
                <br />• 각 난이도별로 10% 단위로 비율을 조정할 수 있습니다.
                <br />• 총 비율은 100%가 되어야 합니다.
              </p>
            </>
          }
        >
          <OptionSelector
            options={DIFFICULTY_OPTIONS}
            selectedValue={difficulty}
            onSelect={handleDifficultySelect}
          />
        </GeneratorSection>

        <GeneratorSection title="추가 요구사항">
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="문제 출제 요구사항을 입력해주세요."
            maxLength={100}
            className="h-15 resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-2">{requirements.length}/100</div>
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

      {/* 문제 생성 버튼 */}
      <div className="mt-6">
        <Button
          onClick={handleGenerate}
          disabled={!isReadyToGenerate || isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium"
        >
          {isGenerating ? '문제 생성 중...' : '문제 생성하기'}
        </Button>
      </div>

      <RatioModal
        isOpen={isTypeRatioOpen}
        onClose={() => setIsTypeRatioOpen(false)}
        title="문제 유형 비율 설정"
        description="합계가 100%가 되어야 저장할 수 있어요."
        items={currentTypes}
        ratios={typeRatios}
        setRatios={setTypeRatios}
        error={ratioError}
        onSave={() => {
          if (ratioSum !== 100) return setRatioError('합계가 100%가 되어야 합니다.');
          setRatioError('');
          setType('전체');
          setIsTypeRatioOpen(false);
        }}
      />

      <RatioModal
        isOpen={isDiffRatioOpen}
        onClose={() => setIsDiffRatioOpen(false)}
        title="난이도 비율 설정"
        description="합계가 100%가 되어야 저장할 수 있어요."
        items={['A', 'B', 'C']}
        ratios={diffRatios}
        setRatios={setDiffRatios}
        error={diffError}
        onSave={() => {
          if (diffSum !== 100) return setDiffError('합계가 100%가 되어야 합니다.');
          setDiffError('');
          setDifficulty('전체');
          setIsDiffRatioOpen(false);
        }}
      />
    </div>
  );
}
