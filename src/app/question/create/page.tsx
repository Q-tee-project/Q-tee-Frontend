'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const SUBJECTS = ['국어', '영어', '수학'];
const SCHOOL_OPTIONS = ['중학교', '고등학교'];
const GRADE_OPTIONS = ['1학년', '2학년', '3학년'];
const SEMESTER_OPTIONS = ['1학기', '2학기'];
const DIFFICULTY = ['전체', '상', '중', '하'];
const KOREAN_TYPES = ['전체', '시', '소설', '수필 / 비문학', '말하기 / 듣기 / 쓰기 / 매체', '문법'];
const ENGLISH_MATH_TYPES = ['전체', '객관식', '서술형', '단답형'];
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
    if (subject === '영어' || subject === '수학') return ENGLISH_MATH_TYPES;
    return [];
  };

  // 현재 과목 유형(전체 제외)
  const currentTypes = getTypeOptions().filter((t) => t !== '전체');
  const ratioSum = currentTypes.reduce((sum, t) => sum + (typeRatios[t] || 0), 0);
  const diffSum = ['상','중','하'].reduce((s, k) => s + (diffRatios[k] || 0), 0);

  const isReadyToGenerate =
    subject &&
    school &&
    grade &&
    semester &&
    type &&
    difficulty &&
    questionCount !== null &&
    (type !== '전체' ? true : ratioSum === 100) &&
    (difficulty !== '전체' ? true : diffSum === 100);

  // 예시 문제 생성
  const generateMock = () => {
    const cnt = Math.min(questionCount ?? 2, 5);
    const base = `${subject} · ${school} ${grade} ${semester} · ${type} · ${difficulty}`;
    const q: PreviewQuestion[] = Array.from({ length: cnt }).map((_, i) => ({
      id: i + 1,
      title: `문제 ${i + 1}. ${base} 관련 예시 질문입니다.`,
      options: ['travel - 여행하다', 'apple - 사과', 'book - 책', 'sky - 하늘', 'music - 음악'],
      answerIndex: 1, // 2번 정답
      explanation:
        '해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트 해설 텍스트.',
    }));
    setPreviewTitle(`${subject} ${type} 예시 문제`);
    setPreviewQuestions(q);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-10">
      <div className="w-[400px] bg-white p-6 rounded shadow">
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
          <select value={school} onChange={(e) => setSchool(e.target.value)} className="w-full mb-2 p-2 border rounded">
            <option value="">학교 선택</option>
            {SCHOOL_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full mb-2 p-2 border rounded">
            <option value="">학년 선택</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full p-2 border rounded">
            <option value="">학기 선택</option>
            {SEMESTER_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* 문제 유형 */}
        <div className="mb-4">
          <div className="mb-2 font-semibold">문제 유형</div>
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
          disabled={!isReadyToGenerate}
          className={`w-full p-2 rounded text-white ${
            isReadyToGenerate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={() => {
            generateMock();
          }}
        >
          문제 생성하기
        </button>
      </div>

      {/* 오른쪽 영역 - 결과 미리보기 자리 */}
      <div className="flex-1 bg-white rounded ml-4 p-6 overflow-auto">
        {previewQuestions.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <Image src="/noQuestion.svg" alt="미리보기 없음" width={220} height={160} />
          </div>
        ) : (
          <div className="space-y-6">
            <input
              value={previewTitle}
              onChange={(e) => setPreviewTitle(e.target.value)}
              placeholder="문제의 제목을 입력해 주세요."
              className="w-full p-3 border rounded-md"
            />
            {previewQuestions.map((q) => (
              <div key={q.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <div className="text-sm text-gray-500 mb-2">문제 {q.id}</div>
                  <input value={q.title} readOnly className="w-full p-2 border rounded-md mb-3" />
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                          idx === q.answerIndex ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-400'
                        }`}
                        title={idx === q.answerIndex ? '정답' : '보기'}
                      >
                        {idx === q.answerIndex ? '②' : '·'}
                      </div>
                      <input value={opt} readOnly className="flex-1 p-2 border rounded-md" />
                    </div>
                  ))}
                </div>
                <div className="col-span-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      정답: {q.answerIndex + 1}
                    </div>
                    <textarea
                      value={q.explanation}
                      readOnly
                      className="w-full h-40 p-2 border rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}
