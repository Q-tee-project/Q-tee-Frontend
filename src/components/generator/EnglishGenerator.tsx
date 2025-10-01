import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EnglishWorksheetGeneratorFormData } from '@/types/english';
import { GeneratorSection } from './GeneratorSection';
import { OptionSelector } from './OptionSelector';
import { RatioModal } from './RatioModal';

const SCHOOL_OPTIONS = ['중학교', '고등학교'] as const;
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'] as const;
const DIFFICULTY_OPTIONS = ['전체', '상', '중', '하'] as const;
const QUESTION_COUNT_OPTIONS = [10, 20] as const;
const QUESTION_TYPE_OPTIONS = ['전체', '객관식', '단답형', '서술형'] as const;
const ENGLISH_MAIN_TYPE_OPTIONS = ['전체', '독해', '어휘', '문법'] as const;

type School = (typeof SCHOOL_OPTIONS)[number];
type Grade = (typeof GRADE_OPTIONS)[number];
type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];
type QuestionCount = (typeof QUESTION_COUNT_OPTIONS)[number];
type QuestionType = (typeof QUESTION_TYPE_OPTIONS)[number];
type EnglishMainType = (typeof ENGLISH_MAIN_TYPE_OPTIONS)[number];

interface EnglishSubType {
  id: number;
  name: string;
}

// 영어 문제 유형 데이터 (이름과 ID 매핑)
const ENGLISH_TYPES: Record<EnglishMainType | Exclude<EnglishMainType, '전체'>, EnglishSubType[]> =
  {
    전체: [], // '전체' is a main type, but it doesn't have subtypes itself, it encompasses others.
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
  onGenerate: (data: EnglishWorksheetGeneratorFormData) => void;
  isGenerating: boolean;
}

export default function EnglishGenerator({ onGenerate, isGenerating }: EnglishGeneratorProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [requirements, setRequirements] = useState('');
  const [questionCount, setQuestionCount] = useState<QuestionCount | null>(null);
  const [englishMainType, setEnglishMainType] = useState<EnglishMainType | null>(null);
  const [englishSubType, setEnglishSubType] = useState<number | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);

  const [isEnglishRatioOpen, setIsEnglishRatioOpen] = useState(false);
  const [englishRatios, setEnglishRatios] = useState<Record<string, number>>({
    독해: 0,
    어휘: 0,
    문법: 0,
  });
  const [englishRatioError, setEnglishRatioError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<{
    독해: number[];
    어휘: number[];
    문법: number[];
  }>({ 독해: [], 어휘: [], 문법: [] });

  const [isTypeRatioOpen, setIsTypeRatioOpen] = useState(false);
  const [typeRatios, setTypeRatios] = useState<Record<string, number>>({
    객관식: 0,
    단답형: 0,
    서술형: 0,
  });
  const [typeRatioError, setTypeRatioError] = useState('');

  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ 상: 0, 중: 0, 하: 0 });
  const [diffError, setDiffError] = useState('');

  const getEnglishSubTypeOptions = () => {
    if (englishMainType && ENGLISH_TYPES[englishMainType as Exclude<EnglishMainType, '전체'>]) {
      return ENGLISH_TYPES[englishMainType as Exclude<EnglishMainType, '전체'>];
    }
    return [];
  };

  const diffSum = ['상', '중', '하'].reduce((s, k) => s + (diffRatios[k] || 0), 0);
  const englishRatioSum = ['독해', '어휘', '문법'].reduce((s, k) => s + (englishRatios[k] || 0), 0);
  const typeRatioSum = ['객관식', '단답형', '서술형'].reduce((s, k) => s + (typeRatios[k] || 0), 0);

  const isReadyToGenerate =
    school &&
    grade &&
    questionCount &&
    englishMainType &&
    (englishMainType !== '전체'
      ? englishSubType !== null
      : englishRatioSum === 100 &&
        Object.values(englishRatios).every(
          (ratio, index) =>
            ratio === 0 ||
            selectedCategories[['독해', '어휘', '문법'][index] as '독해' | '어휘' | '문법'].length >
              0,
        )) &&
    questionType &&
    (questionType !== '전체' ? true : typeRatioSum === 100) &&
    difficulty &&
    (difficulty !== '전체' ? true : diffSum === 100);

  const handleGenerate = () => {
    // Redundant checks can be removed if isReadyToGenerate is robust enough, but keeping them as per diff.
    if (
      !isReadyToGenerate ||
      !englishMainType ||
      !questionType ||
      !difficulty ||
      !questionCount ||
      !grade ||
      !school
    )
      return;

    const formData: EnglishWorksheetGeneratorFormData = {
      school_level: school,
      grade: parseInt(grade.replace('학년', '')),
      total_questions: questionCount,
      subjects: englishMainType === '전체' ? ['독해', '어휘', '문법'] : [englishMainType],
      subject_details: {
        reading_types:
          englishMainType === '전체'
            ? selectedCategories.독해.length > 0
              ? selectedCategories.독해
              : undefined
            : englishMainType === '독해' && englishSubType
            ? [englishSubType]
            : undefined,
        grammar_categories:
          englishMainType === '전체'
            ? selectedCategories.문법.length > 0
              ? selectedCategories.문법
              : undefined
            : englishMainType === '문법' && englishSubType
            ? [englishSubType]
            : undefined,
        vocabulary_categories:
          englishMainType === '전체'
            ? selectedCategories.어휘.length > 0
              ? selectedCategories.어휘
              : undefined
            : englishMainType === '어휘' && englishSubType
            ? [englishSubType]
            : undefined,
      },
      subject_ratios:
        englishMainType === '전체'
          ? Object.entries(englishRatios)
              .filter(([_, ratio]) => ratio > 0)
              .map(([subject, ratio]) => ({ subject, ratio }))
          : [{ subject: englishMainType, ratio: 100 }],
      question_format: questionType === '전체' ? '혼합형' : questionType,
      format_ratios:
        questionType === '전체'
          ? Object.entries(typeRatios)
              .filter(([_, ratio]) => ratio > 0)
              .map(([format, ratio]) => ({
                format: format === '단답형' ? '주관식' : format === '서술형' ? '주관식' : format,
                ratio,
              }))
          : [
              {
                format:
                  questionType === '단답형' || questionType === '서술형' ? '주관식' : questionType,
                ratio: 100,
              },
            ],
      difficulty_distribution:
        difficulty === '전체'
          ? Object.entries(diffRatios)
              .filter(([_, ratio]) => ratio > 0)
              .map(([difficulty, ratio]) => ({ difficulty, ratio }))
          : [{ difficulty, ratio: 100 }],
      additional_requirements: requirements || undefined,
    };

    onGenerate(formData);
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
          title="문제 영역"
          tooltipContent="전체를 선택하면 독해, 어휘, 문법의 비율과 세부 카테고리를 설정할 수 있습니다."
        >
          <OptionSelector
            options={ENGLISH_MAIN_TYPE_OPTIONS}
            selectedValue={englishMainType}
            onSelect={(type) => {
              if (type === '전체') {
                setEnglishRatioError('');
                setIsEnglishRatioOpen(true);
              } else {
                setEnglishMainType(type);
                setEnglishSubType(null);
              }
            }}
          />
          {englishMainType && englishMainType !== '전체' && (
            <div className="mt-4">
              <Select
                value={englishSubType?.toString() || ''}
                onValueChange={(value) => setEnglishSubType(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`${englishMainType} 세부 유형 선택`} />
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
        </GeneratorSection>

        <GeneratorSection
          title="문제 유형"
          tooltipContent="전체를 선택하면 객관식, 단답형, 서술형의 비율을 설정할 수 있습니다."
        >
          <OptionSelector
            options={QUESTION_TYPE_OPTIONS}
            selectedValue={questionType}
            onSelect={(type) => {
              if (type === '전체') {
                setTypeRatioError('');
                setIsTypeRatioOpen(true);
              } else {
                setQuestionType(type);
              }
            }}
          />
        </GeneratorSection>

        <GeneratorSection
          title="난이도"
          tooltipContent="전체를 선택하면 상, 중, 하 난이도의 비율을 설정할 수 있습니다."
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
            maxLength={50}
            className="w-full h-16 resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-2">{requirements.length}/50</div>
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

      <EnglishRatioModal
        isOpen={isEnglishRatioOpen}
        onClose={() => setIsEnglishRatioOpen(false)}
        ratios={englishRatios}
        setRatios={setEnglishRatios}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        error={englishRatioError}
        setError={setEnglishRatioError}
        onSave={() => {
          setEnglishMainType('전체');
          setIsEnglishRatioOpen(false);
        }}
      />

      <RatioModal
        isOpen={isTypeRatioOpen}
        onClose={() => setIsTypeRatioOpen(false)}
        title="문제 유형 비율 설정"
        description="전체 선택 시 각 유형의 출제 비율을 지정합니다. 합계가 100%가 되어야 저장할 수 있어요."
        items={['객관식', '단답형', '서술형']}
        ratios={typeRatios}
        setRatios={setTypeRatios}
        error={typeRatioError}
        onSave={() => {
          if (typeRatioSum !== 100) return setTypeRatioError('합계가 100%가 되어야 합니다.');
          setTypeRatioError('');
          setQuestionType('전체');
          setIsTypeRatioOpen(false);
        }}
      />

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
          if (diffSum !== 100) return setDiffError('합계가 100%가 되어야 합니다.');
          setDiffError('');
          setDifficulty('전체');
          setIsDiffRatioOpen(false);
        }}
      />
    </div>
  );
}

// EnglishRatioModal Component
interface EnglishRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratios: Record<string, number>;
  setRatios: (ratios: Record<string, number>) => void;
  selectedCategories: { 독해: number[]; 어휘: number[]; 문법: number[] };
  setSelectedCategories: (categories: { 독해: number[]; 어휘: number[]; 문법: number[] }) => void;
  error: string;
  setError: (error: string) => void;
  onSave: () => void;
}

function EnglishRatioModal({
  isOpen,
  onClose,
  ratios,
  setRatios,
  selectedCategories,
  setSelectedCategories,
  error,
  setError,
  onSave,
}: EnglishRatioModalProps) {
  if (!isOpen) return null;

  const totalRatio = Object.values(ratios).reduce((sum, ratio) => sum + ratio, 0);

  const toggleCategory = (subject: '독해' | '어휘' | '문법', categoryId: number) => {
    setSelectedCategories({
      ...selectedCategories,
      [subject]: selectedCategories[subject].includes(categoryId)
        ? selectedCategories[subject].filter((id) => id !== categoryId)
        : [...selectedCategories[subject], categoryId],
    });
  };

  const handleSave = () => {
    if (totalRatio !== 100) {
      return setError('합계가 100%가 되어야 합니다.');
    }
    const missingCategories = (['독해', '어휘', '문법'] as const).filter(
      (type) => ratios[type] > 0 && selectedCategories[type].length === 0,
    );
    if (missingCategories.length > 0) {
      return setError(`${missingCategories.join(', ')} 영역의 카테고리를 선택해주세요.`);
    }
    setError('');
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-xl font-semibold">영어 문제 전체 설정</div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          각 영역의 출제 비율과 세부 카테고리를 설정하세요.
          <br />
          비율 합계가 100%가 되어야 하고, 비율이 있는 영역에서는 최소 1개 이상의 카테고리를 선택해야
          합니다.
        </p>
        <div className="space-y-4">
          {(['독해', '어휘', '문법'] as const).map((type) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={ratios[type] ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setRatios({ ...ratios, [type]: v });
                    }}
                    className="w-20 p-1 border rounded-md text-right text-sm"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              {ratios[type] > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">
                    세부 카테고리 선택 (필수)
                    <span
                      className={`ml-2 ${
                        selectedCategories[type].length === 0 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      ({selectedCategories[type].length}개 선택됨)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ENGLISH_TYPES[type].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(type, category.id)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          selectedCategories[type].includes(category.id)
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
          <div className={`${totalRatio === 100 ? 'text-green-600' : 'text-red-600'}`}>
            합계: {totalRatio}%
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>
    </div>
  );
}
