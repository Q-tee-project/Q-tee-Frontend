'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { MathFormData, Unit, Chapter } from '@/types/math';

const SCHOOL_OPTIONS = ['중학교', '고등학교'];
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'];
const SEMESTER_OPTIONS = ['1학기', '2학기'];
const DIFFICULTY = ['전체', 'A', 'B', 'C'];
const MATH_TYPES = ['전체', '객관식', '서술형', '단답형'];
const QUESTION_COUNTS = [10, 20];

interface MathGeneratorProps {
  onGenerate: (data: MathFormData) => void;
  isGenerating: boolean;
}

export default function MathGenerator({ onGenerate, isGenerating }: MathGeneratorProps) {
  const [school, setSchool] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  // 교육과정 데이터 - 백엔드 응답 구조에 맞게
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // 전체(비율) 설정 모달 상태
  const [isTypeRatioOpen, setIsTypeRatioOpen] = useState(false);
  const [typeRatios, setTypeRatios] = useState<Record<string, number>>({});
  const [ratioError, setRatioError] = useState<string>('');

  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ A: 0, B: 0, C: 0 });
  const [diffError, setDiffError] = useState<string>('');

  const chipBase = 'px-3 py-1 rounded-md border-2 text-sm';
  const chipSelected = 'border-blue-500 bg-blue-50 text-blue-600';
  const chipUnselected = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

  // 교육과정 구조 불러오기
  const loadCurriculumStructure = async () => {
    try {
      console.log('🔍 교육과정 로딩 시작:', { school, grade, semester });
      const response = await fetch(
        `http://localhost:8001/api/math-generation/curriculum/structure?school_level=${encodeURIComponent(
          school,
        )}`,
      );
      const data = await response.json();
      console.log('📥 API 응답:', data);

      if (data.structure) {
        // 학교급과 학년, 학기에 맞는 교육과정 찾기
        const gradeNum = parseInt(grade.replace('학년', ''));
        const semesterNum = parseInt(semester.replace('학기', ''));
        const curriculumKey =
          school === '중학교'
            ? `middle${gradeNum}_${semesterNum}semester`
            : `high${gradeNum}_${semesterNum}semester`;

        console.log('🔑 교육과정 키:', curriculumKey);
        console.log('📚 사용 가능한 키들:', Object.keys(data.structure));

        const curriculum = data.structure[curriculumKey];
        console.log('📖 선택된 교육과정:', curriculum);

        if (curriculum && curriculum.units) {
          const unitList = curriculum.units.map((unit: any) => ({
            unit_number: unit.unit_number,
            unit_name: unit.unit_name,
            chapters: unit.chapters, // 전체 chapter 객체 보존
          }));
          console.log('📋 로드된 단원 목록:', unitList);
          setUnits(unitList);
        } else {
          console.log('❌ 해당 교육과정을 찾을 수 없습니다:', curriculumKey);
          setUnits([]);
        }
      }
    } catch (error) {
      console.error('❌ 교육과정 구조 로딩 오류:', error);
      setUnits([]);
    }
  };

  // 소단원 목록 불러오기
  const loadChapters = (unitName: string) => {
    console.log('🔍 소단원 로딩 시작:', unitName);
    console.log('📚 현재 단원들:', units);
    const selectedUnit = units.find((unit) => unit.unit_name === unitName);
    console.log('🎯 선택된 단원:', selectedUnit);
    if (selectedUnit && selectedUnit.chapters) {
      console.log('📖 소단원들:', selectedUnit.chapters);
      setChapters(selectedUnit.chapters);
    } else {
      console.log('❌ 소단원 없음');
      setChapters([]);
    }
  };

  // 학교/학년/학기 변경 시 교육과정 구조 다시 로드
  useEffect(() => {
    if (school && grade && semester) {
      loadCurriculumStructure();
      setSelectedUnit('');
      setSelectedChapter('');
      setChapters([]);
    }
  }, [school, grade, semester]);

  // 단원 선택 시 소단원 로드
  useEffect(() => {
    if (selectedUnit) {
      loadChapters(selectedUnit);
      setSelectedChapter('');
    }
  }, [selectedUnit, units]);

  // 현재 수학 유형(전체 제외)
  const currentTypes = MATH_TYPES.filter((t) => t !== '전체');
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

    // 선택된 단원 정보 찾기
    const selectedUnitInfo = units.find((unit) => unit.unit_name === selectedUnit);
    const selectedChapterInfo = selectedUnitInfo?.chapters.find(
      (ch: any) => ch.chapter_name === selectedChapter,
    );

    // 백엔드 스키마에 맞게 데이터 구성
    const requestData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      semester: semester === '1학기' ? '1학기' : '2학기',
      unit_number: selectedUnitInfo?.unit_number || '',
      chapter: {
        chapter_number: selectedChapterInfo?.chapter_number || '',
        chapter_name: selectedChapter,
        unit_name: selectedUnit,
      },
      problem_count: questionCount === 10 ? '10문제' : '20문제',
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
              essay: typeRatios['서술형'] || 0,
              short_answer: typeRatios['단답형'] || 0,
            }
          : type === '객관식'
          ? { multiple_choice: 100, essay: 0, short_answer: 0 }
          : type === '서술형'
          ? { multiple_choice: 0, essay: 100, short_answer: 0 }
          : { multiple_choice: 0, essay: 0, short_answer: 100 },
    };

    onGenerate(requestData as any);
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

          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-full">
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
      </div>

      {/* 교육과정 선택 */}
      <div className="mb-4">
        <div className="mb-2 font-semibold">단원 선택</div>
        <div className="space-y-2">
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
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
                  • <strong>전체</strong>를 선택하면 객관식, 서술형, 단답형의 비율을 설정할 수
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
          {MATH_TYPES.map((t) => (
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
                  • <strong>전체</strong>를 선택하면 A, B, C 난이도의 비율을 설정할 수 있습니다
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

            {['A', 'B', 'C'].map((lv) => (
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
                        const others = ['A', 'B', 'C'].reduce(
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
