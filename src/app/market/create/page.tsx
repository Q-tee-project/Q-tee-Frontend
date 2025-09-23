'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  createProduct,
  getKoreanWorksheets,
  getMathWorksheets,
  getKoreanWorksheetProblems,
  getMathWorksheetProblems,
  Worksheet,
  Problem,
  MarketProductCreate
} from '@/services/marketApi';


type FormData = {
  title: string;
  description: string;
  price: string;
  subject: string;
  worksheetId: number | null;
};

export default function CreateMarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    subject: '',
    worksheetId: null,
  });

  const [images, setImages] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<number[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 태그 드롭다운 선택 상태
  const [school, setSchool] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [mathSemester, setMathSemester] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('');


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const filteredValue = value.replace(/[^0-9]/g, '');
      const numValue = Number(filteredValue);

      if (numValue > 50000) {
        setForm(prev => ({ ...prev, price: '50000' }));
        return;
      }

      setForm(prev => ({ ...prev, price: filteredValue }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (value: string) => {
    setForm(prev => ({ ...prev, subject: value, worksheetId: null }));
    setSelectedWorksheet(null);
    setProblems([]);
    setSelectedProblems([]);
  };

  const handleWorksheetChange = (worksheetId: number) => {
    setForm(prev => ({ ...prev, worksheetId }));
    const worksheet = worksheets.find(w => w.id === worksheetId);
    setSelectedWorksheet(worksheet);
    if (worksheet) {
      setProblems(worksheet.problems || []);
    }
  };
  

  // 문제 선택/해제 (최대 3개)
  const toggleProblemSelection = (problemId: number) => {
    setSelectedProblems(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else if (prev.length < 3) {
        return [...prev, problemId];
      } else {
        alert('최대 3개의 문제만 선택할 수 있습니다.');
        return prev;
      }
    });
  };
  

  const handleSubmit = async () => {
    // 유효성 검사
    if (!form.title.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }

    if (!form.subject) {
      alert('과목을 선택해주세요.');
      return;
    }

    if (!form.worksheetId) {
      alert('문제지를 선택해주세요.');
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      alert('가격을 입력해주세요.');
      return;
    }

    if (selectedProblems.length === 0) {
      alert('최소 1개의 문제를 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const productData: MarketProductCreate = {
        title: form.title,
        description: form.description || undefined,
        price: Number(form.price),
        subject_type: form.subject,
        original_service: form.subject === '국어' ? 'korean' : 'math',
        original_worksheet_id: form.worksheetId,
        tags: selectedWorksheet ? [
          selectedWorksheet.school_level,
          `${selectedWorksheet.grade}학년`,
          form.subject
        ] : [form.subject]
      };

      await createProduct(productData);
      alert('상품이 성공적으로 등록되었습니다!');
      router.push('/market/myMarket');

    } catch (error) {
      console.error('Failed to create product:', error);
      alert('상품 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  

  const isFormValid = form.title.trim() && form.subject && form.worksheetId && form.price && Number(form.price) > 0 && selectedProblems.length > 0;

  // 드롭다운으로 구성된 태그를 form.tags에 반영
  useEffect(() => {
    const parts = [
      school,
      grade,
      semester,
      subject,
      subject === '수학' ? mathSemester : '',
      questionCount,
    ].filter(Boolean);
    setForm((prev) => ({ ...prev, tags: parts.join(', ') }));
  }, [school, grade, semester, subject, mathSemester, questionCount]);

  
  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<FiPlus />}
        title="마켓 상품 등록하기"
        variant="market"
        description="마켓에 상품을 등록할 수 있습니다"
      />

      {/* 상단 버튼 */}
      <nav className="flex justify-end items-center mt-6 mb-4 px-8">
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/market/myMarket')}
            className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
          >
            돌아가기
          </button>
          <button
            onClick={handleSubmit}
            className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </nav>

      {/* 메인 카드 */}
      <Card className="flex-1 flex flex-col shadow-sm" style={{ margin: '2rem' }}>
        <CardHeader className="py-3 px-6 border-b border-gray-100">
          <CardTitle className="text-base font-medium">
            상품 등록
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* 과목 선택 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                과목 *
              </label>
              <Select value={form.subject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="과목을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="수학">수학</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 문제지 선택 */}
            {form.subject && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  문제지 *
                </label>
                <Select
                  value={form.worksheetId?.toString()}
                  onValueChange={(value) => handleWorksheetChange(Number(value))}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loading ? "로딩 중..." : "문제지를 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {worksheets.map((worksheet) => (
                      <SelectItem key={worksheet.id} value={worksheet.id.toString()}>
                        {worksheet.title} ({worksheet.problem_count}문제)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 상품 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  상품명 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="상품명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  가격 *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  />
                  <span className="ml-2 text-sm text-gray-700">원</span>
                </div>
              </div>
            </div>


              {/* 태그 미리보기 칩 */}
              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium text-gray-700">선택된 태그</label>
                <div className="flex flex-wrap gap-2 min-h-[36px]">
                  {[school, grade, semester, subject, subject === '수학' ? mathSemester : '', questionCount]
                    .filter(Boolean)
                    .map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {tag}
                        <button
                          type="button"
                          aria-label={`${tag} 제거`}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            if (tag === school) setSchool('');
                            else if (tag === grade) setGrade('');
                            else if (tag === semester) setSemester('');
                            else if (tag === subject) { setSubject(''); setMathSemester(''); }
                            else if (tag === mathSemester) setMathSemester('');
                            else if (tag === questionCount) setQuestionCount('');
                          }}
                        >
                          ×
                        </button>
                      </span>
                  ))}
                </div>
              </div>

              {/* 태그 드롭다운 그룹 */}
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 학교 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">학교</label>
                  <Select value={school} onValueChange={setSchool}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="학교 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="중학교">중학교</SelectItem>
                      <SelectItem value="고등학교">고등학교</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 학년 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">학년</label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="학년 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1학년">1학년</SelectItem>
                      <SelectItem value="2학년">2학년</SelectItem>
                      <SelectItem value="3학년">3학년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 학기 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">학기</label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="학기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1학기">1학기</SelectItem>
                      <SelectItem value="2학기">2학기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 과목 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">과목</label>
                  <Select
                    value={subject}
                    onValueChange={(v) => { setSubject(v); if (v !== '수학') setMathSemester(''); }}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="과목 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="국어">국어</SelectItem>
                      <SelectItem value="영어">영어</SelectItem>
                      <SelectItem value="수학">수학</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* (수학 전용) 학기 */}
                {subject === '수학' && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">수학 학기</label>
                    <Select value={mathSemester} onValueChange={setMathSemester}>
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="학기 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1학기">1학기</SelectItem>
                        <SelectItem value="2학기">2학기</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 문항 수 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">문항</label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="문항 수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10문항">10문항</SelectItem>
                      <SelectItem value="20문항">20문항</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 상품 설명 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  상품 설명
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="상품 설명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  rows={4}
                />
              </div>

              {/* 문제 선택 */}
              {form.worksheetId && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    미리보기 문제 선택 (최대 3개)
                  </label>
                  <div className="text-sm text-gray-500 mb-3">
                    구매 전 고객이 볼 수 있는 미리보기 문제를 선택하세요. ({selectedProblems.length}/3)
                  </div>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                    {problems.map((problem) => (
                      <div
                        key={problem.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedProblems.includes(problem.id)
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleProblemSelection(problem.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                            selectedProblems.includes(problem.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedProblems.includes(problem.id) && (
                              <FiCheck className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">문제 {problem.sequence_order}</div>
                            <div className="text-sm text-gray-700 mt-1 line-clamp-2">
                              {problem.question.length > 100
                                ? `${problem.question.substring(0, 100)}...`
                                : problem.question
                              }
                            </div>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {problem.problem_type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                난이도: {problem.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
