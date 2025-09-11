'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SUBJECTS = ['국어', '영어', '수학'];
const SCHOOL_OPTIONS = ['중학교', '고등학교'];
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'];
const SEMESTER_OPTIONS = ['1학기', '2학기'];
const DIFFICULTY = ['전체', '상', '중', '하'];
const KOREAN_TYPES = ['전체', '시', '소설', '수필 / 비문학', '말하기 / 듣기 / 쓰기 / 매체', '문법'];
const ENGLISH_MATH_TYPES = ['전체', '객관식', '서술형', '단답형'];

// 영어 문제 유형 데이터
const ENGLISH_TYPES = {
  '독해': [
    '주제/제목/요지 추론',
    '세부 정보 파악',
    '내용 일치/불일치',
    '빈칸 추론',
    '문장 삽입',
    '어조/분위기 파악',
    '글의 구조 파악',
    '추론 문제',
    '비판적 사고'
  ],
  '어휘': [
    '단어 의미',
    '동의어/반의어',
    '어휘 선택',
    '문맥상 어휘',
    '관용표현',
    '숙어/구동사',
    '어휘 추론',
    '어휘 활용'
  ],
  '문법': [
    '시제',
    '태',
    '조동사',
    '가정법',
    '관계사',
    '비교급/최상급',
    '부정사/동명사',
    '분사',
    '접속사/전치사',
    '문장 구조',
    '일치/화법'
  ]
};
const QUESTION_COUNTS = [10, 20];

export default function CreatePage() {
  const [subject, setSubject] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [type, setType] = useState<string>(''); // 기본 선택 해제
  const [difficulty, setDifficulty] = useState<string>(''); // 기본 선택 해제
  const [requirements, setRequirements] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  
  // 영어 문제 유형 선택 상태
  const [englishMainType, setEnglishMainType] = useState<string>(''); // 독해/어휘/문법
  const [englishSubType, setEnglishSubType] = useState<string>(''); // 세부 유형
  
  // 영어 전체(비율) 설정 모달
  const [isEnglishRatioOpen, setIsEnglishRatioOpen] = useState(false);
  const [englishRatios, setEnglishRatios] = useState<Record<string, number>>({ 독해: 0, 어휘: 0, 문법: 0 });
  const [englishRatioError, setEnglishRatioError] = useState<string>('');

  // 미리보기용 목업 데이터 타입/상태
  type PreviewQuestion = {
    id: number;
    title: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);

  // 전체(비율) 설정 모달 - 문제 유형
  const [isTypeRatioOpen, setIsTypeRatioOpen] = useState(false);
  const [typeRatios, setTypeRatios] = useState<Record<string, number>>({});
  const [ratioError, setRatioError] = useState<string>('');

  // 전체(비율) 설정 모달 - 난이도
  const [isDiffRatioOpen, setIsDiffRatioOpen] = useState(false);
  const [diffRatios, setDiffRatios] = useState<Record<string, number>>({ 상: 0, 중: 0, 하: 0 });
  const [diffError, setDiffError] = useState<string>('');

  const chipBase = 'px-3 py-1 rounded-md border-2 text-sm';
  const chipSelected = 'border-blue-500 bg-blue-50 text-blue-600';
  const chipUnselected = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50';

  const getTypeOptions = () => {
    if (subject === '국어') return KOREAN_TYPES;
    if (subject === '수학') return ENGLISH_MATH_TYPES;
    if (subject === '영어') return ['전체', '독해', '어휘', '문법'];
    return [];
  };

  // 영어 세부 유형 옵션 가져오기
  const getEnglishSubTypeOptions = () => {
    if (subject === '영어' && englishMainType && ENGLISH_TYPES[englishMainType as keyof typeof ENGLISH_TYPES]) {
      return ENGLISH_TYPES[englishMainType as keyof typeof ENGLISH_TYPES];
    }
    return [];
  };

  // 현재 과목 유형(전체 제외)
  const currentTypes = getTypeOptions().filter((t) => t !== '전체');
  const ratioSum = currentTypes.reduce((sum, t) => sum + (typeRatios[t] || 0), 0);
  const diffSum = ['상','중','하'].reduce((s, k) => s + (diffRatios[k] || 0), 0);
  const englishRatioSum = ['독해', '어휘', '문법'].reduce((s, k) => s + (englishRatios[k] || 0), 0);

  const isReadyToGenerate =
    subject &&
    school &&
    grade &&
    semester &&
    (subject === '영어' ? (englishMainType && (englishMainType === '전체' ? englishRatioSum === 100 : englishSubType)) : type) &&
    difficulty &&
    questionCount !== null &&
    (type !== '전체' ? true : ratioSum === 100) &&
    (difficulty !== '전체' ? true : diffSum === 100);

  // 타이핑 애니메이션 함수
  const typeText = (text: string, callback: (text: string) => void, delay: number = 50) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        callback(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay);
  };

  // 예시 문제 생성
  const generateMock = async () => {
    setIsGenerating(true);
    setTypingProgress(0);
    setPreviewQuestions([]);
    
    const cnt = Math.min(questionCount ?? 2, 5);
    const typeInfo = subject === '영어' 
      ? (englishMainType === '전체' ? '전체 (독해/어휘/문법)' : `${englishMainType} - ${englishSubType}`)
      : type;
    const base = `${subject} · ${school} ${grade} ${semester} · ${typeInfo} · ${difficulty}`;
    
    // 제목 타이핑
    const titleText = `${subject} ${typeInfo} 예시 문제`;
    typeText(titleText, setPreviewTitle, 30);
    
    // 문제들 생성
    const questions: PreviewQuestion[] = [];
    for (let i = 0; i < cnt; i++) {
      await new Promise(resolve => setTimeout(resolve, 800)); // 문제 간 지연
      
      const newQuestion: PreviewQuestion = {
        id: i + 1,
        title: `문제 ${i + 1}. ${base} 관련 예시 질문입니다.`,
        options: ['travel - 여행하다', 'apple - 사과', 'book - 책', 'sky - 하늘', 'music - 음악'],
        answerIndex: 1,
        explanation: '해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트.',
      };
      
      questions.push(newQuestion);
      setPreviewQuestions([...questions]);
      setTypingProgress(((i + 1) / cnt) * 100);
    }
    
    setIsGenerating(false);
    setIsEditing(true);
  };

  // 문제 제목 수정
  const updateQuestionTitle = (questionId: number, newTitle: string) => {
    setPreviewQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, title: newTitle } : q)
    );
  };

  // 선택지 수정
  const updateOption = (questionId: number, optionIndex: number, newOption: string) => {
    setPreviewQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? newOption : opt) }
          : q
      )
    );
  };

  // 정답 변경
  const updateAnswer = (questionId: number, newAnswerIndex: number) => {
    setPreviewQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, answerIndex: newAnswerIndex } : q)
    );
  };

  // 해설 수정
  const updateExplanation = (questionId: number, newExplanation: string) => {
    setPreviewQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, explanation: newExplanation } : q)
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 p-10">
      <div className="w-[400px] bg-white p-6 rounded shadow overflow-y-auto">
        {/* 과목 선택 */}
        <div className="mb-4">
          <div className="mb-2 font-semibold">과목 선택</div>
          <div className="flex gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setType('');            // 과목 변경 시 초기화
                  setTypeRatios({});      // 유형 비율 초기화
                  setEnglishMainType(''); // 영어 메인 유형 초기화
                  setEnglishSubType('');  // 영어 세부 유형 초기화
                  setEnglishRatios({ 독해: 0, 어휘: 0, 문법: 0 }); // 영어 비율 초기화
                }}
                className={`${chipBase} ${subject === s ? chipSelected : chipUnselected}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 지문 불러오기 */}
        <div className="mb-4">
          <div className="mb-2 font-semibold">지문 불러오기</div>
          <div className="space-y-2">
            <Select value={school} onValueChange={setSchool}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="학교 선택" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="학기 선택" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 문제 유형 */}
        <div className="mb-4">
          <div className="mb-2 font-semibold">문제 유형</div>
          {subject === '영어' ? (
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
                        setEnglishSubType(''); // 세부 유형 초기화
                      }
                    }}
                    className={`${chipBase} ${englishMainType === mainType ? chipSelected : chipUnselected}`}
                  >
                    {mainType}
                  </button>
                ))}
              </div>
              
              {/* 영어 세부 유형 선택 */}
              {englishMainType && englishMainType !== '전체' && (
                <div>
                  <div className="mb-2 text-sm text-gray-600">{englishMainType} 세부 유형</div>
                  <Select value={englishSubType} onValueChange={setEnglishSubType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`${englishMainType} 세부 유형을 선택하세요`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getEnglishSubTypeOptions().map((subType) => (
                        <SelectItem key={subType} value={subType}>
                          {subType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {getTypeOptions().map((t) => (
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
          )}
        </div>

        {/* 난이도 */}
        <div className="mb-4">
          <div className="mb-2 font-semibold">난이도</div>
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
            isReadyToGenerate && !isGenerating ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={() => {
            generateMock();
          }}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>문제 생성 중... {Math.round(typingProgress)}%</span>
            </div>
          ) : (
            '문제 생성하기'
          )}
        </button>
      </div>

      {/* 오른쪽 영역 - 결과 미리보기 자리 */}
      <div className="flex-1 bg-white rounded ml-4 flex flex-col h-full">
        {isGenerating ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg font-medium text-gray-700 mb-2">문제를 생성하고 있습니다...</div>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${typingProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">{Math.round(typingProgress)}% 완료</div>
            </div>
          </div>
        ) : previewQuestions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Image src="/noQuestion.svg" alt="미리보기 없음" width={220} height={160} />
          </div>
        ) : (
          <>
            {/* 스크롤 가능한 문제 영역 */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="space-y-6">
                <input
                  value={previewTitle}
                  onChange={(e) => setPreviewTitle(e.target.value)}
                  placeholder="문제지의 제목을 입력해 주세요."
                  className="w-full p-3 border rounded-md"
                />
                {previewQuestions.map((q, index) => (
                  <div 
                    key={q.id} 
                    className="grid grid-cols-12 gap-4 animate-fade-in"
                    style={{ 
                      animationDelay: `${index * 0.2}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="col-span-8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-500">문제 {q.id}</div>
                        <div className="flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <textarea 
                        value={q.title} 
                        onChange={(e) => updateQuestionTitle(q.id, e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full p-3 border rounded-md mb-3 h-24 resize-none ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                        rows={3}
                      />
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => isEditing && updateAnswer(q.id, idx)}
                            disabled={!isEditing}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                              idx === q.answerIndex ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-400'
                            } ${isEditing ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'}`}
                            title={idx === q.answerIndex ? '정답' : '보기'}
                          >
                            {String.fromCharCode(9312 + idx)}
                          </button>
                          <input 
                            value={opt} 
                            onChange={(e) => updateOption(q.id, idx, e.target.value)}
                            readOnly={!isEditing}
                            className={`flex-1 p-2 border rounded-md ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="col-span-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          정답: {String.fromCharCode(9312 + q.answerIndex)}
                        </div>
                        <div className="text-sm font-medium text-gray-600 mb-2">해설</div>
                        <textarea
                          value={q.explanation}
                          onChange={(e) => updateExplanation(q.id, e.target.value)}
                          readOnly={!isEditing}
                          className={`w-full h-40 p-2 border rounded-md text-sm ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 하단 고정 버튼 영역 */}
            <div className="border-t bg-gray-50 p-4">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium">
                문제 저장하기
              </button>
            </div>
          </>
        )}
      </div>

      {/* 전체 비율 설정 모달 - 문제 유형 */}
      {isTypeRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsTypeRatioOpen(false)} />
          <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-semibold">문제 유형 비율 설정</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsTypeRatioOpen(false)}>✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">전체 선택 시 각 유형의 출제 비율을 지정합니다.<br/>
            합계가 100%가 되어야 저장할 수 있어요.</p>

            <div className="space-y-3 max-h-[300px] overflow-auto">
              {currentTypes.length === 0 && <div className="text-sm text-gray-500">먼저 과목을 선택해 주세요.</div>}
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
                          const others = currentTypes.reduce((s, k) => (k === ct ? s : s + (prev[k] || 0)), 0);
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
              <div className={`text-sm ${ratioSum === 100 ? 'text-green-600' : 'text-red-600'}`}>합계: {ratioSum}%</div>
              {ratioError && <div className="text-sm text-red-600">{ratioError}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setIsTypeRatioOpen(false)} className="px-5 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200">취소</button>
              <button
                onClick={() => {
                  if (currentTypes.length === 0) return setRatioError('과목을 먼저 선택해 주세요.');
                  if (ratioSum !== 100) return setRatioError('합계가 100%가 되어야 합니다.');
                  setRatioError('');
                  setType('전체');
                  setIsTypeRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${ratioSum === 100 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                disabled={ratioSum !== 100 || currentTypes.length === 0}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 전체 비율 설정 모달 - 난이도 */}
      {isDiffRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDiffRatioOpen(false)} />
          <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-semibold">난이도 비율 설정</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsDiffRatioOpen(false)}>✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">합계가 100%가 되어야 저장할 수 있어요.</p>

            {['상','중','하'].map((lv) => (
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
                        const others = ['상','중','하'].reduce((s, k) => (k === lv ? s : s + (prev[k] || 0)), 0);
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
              <div className={`text-sm ${diffSum === 100 ? 'text-green-600' : 'text-red-600'}`}>합계: {diffSum}%</div>
              {diffError && <div className="text-sm text-red-600">{diffError}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setIsDiffRatioOpen(false)} className="px-5 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200">취소</button>
              <button
                onClick={() => {
                  if (diffSum !== 100) return setDiffError('합계가 100%가 되어야 합니다.');
                  setDiffError('');
                  setDifficulty('전체');
                  setIsDiffRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${diffSum === 100 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                disabled={diffSum !== 100}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 영어 문제 유형 비율 설정 모달 */}
      {isEnglishRatioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEnglishRatioOpen(false)} />
          <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-semibold">영어 문제 유형 비율 설정</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsEnglishRatioOpen(false)}>✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">전체 선택 시 각 유형의 출제 비율을 지정합니다.<br/>
            합계가 100%가 되어야 저장할 수 있어요.</p>

            <div className="space-y-3">
              {['독해', '어휘', '문법'].map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type}</span>
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
                          const others = ['독해', '어휘', '문법'].reduce((s, k) => (k === type ? s : s + (prev[k] || 0)), 0);
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
              <div className={`text-sm ${englishRatioSum === 100 ? 'text-green-600' : 'text-red-600'}`}>합계: {englishRatioSum}%</div>
              {englishRatioError && <div className="text-sm text-red-600">{englishRatioError}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setIsEnglishRatioOpen(false)} className="px-5 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200">취소</button>
              <button
                onClick={() => {
                  if (englishRatioSum !== 100) return setEnglishRatioError('합계가 100%가 되어야 합니다.');
                  setEnglishRatioError('');
                  setEnglishMainType('전체');
                  setIsEnglishRatioOpen(false);
                }}
                className={`px-5 py-2 rounded-md text-white ${englishRatioSum === 100 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                disabled={englishRatioSum !== 100}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
