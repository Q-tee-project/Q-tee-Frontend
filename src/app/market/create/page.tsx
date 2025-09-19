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

  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 과목 선택시 worksheet 목록 로드
  const handleSubjectChange = async (subject: string) => {
    setForm(prev => ({ ...prev, subject, worksheetId: null }));
    setSelectedWorksheet(null);
    setProblems([]);
    setSelectedProblems([]);

    if (!userProfile?.id || !subject) return;

    try {
      setLoading(true);
      let worksheetData: Worksheet[] = [];

      if (subject === '국어') {
        worksheetData = await getKoreanWorksheets(userProfile.id);
      } else if (subject === '수학') {
        worksheetData = await getMathWorksheets(userProfile.id);
      }

      setWorksheets(worksheetData);
    } catch (error) {
      console.error('Failed to load worksheets:', error);
      alert('문제지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Worksheet 선택시 문제 목록 로드
  const handleWorksheetChange = async (worksheetId: number) => {
    setForm(prev => ({ ...prev, worksheetId }));
    const worksheet = worksheets.find(w => w.id === worksheetId);
    setSelectedWorksheet(worksheet || null);
    setSelectedProblems([]);

    if (!worksheet) return;

    try {
      setLoading(true);
      let data: { worksheet: any; problems: Problem[] };

      if (form.subject === '국어') {
        data = await getKoreanWorksheetProblems(worksheetId);
      } else if (form.subject === '수학') {
        data = await getMathWorksheetProblems(worksheetId);
      } else {
        return;
      }

      setProblems(data.problems);

      // 기본 제목 설정
      if (!form.title) {
        setForm(prev => ({ ...prev, title: worksheet.title }));
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
      alert('문제 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
            className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            돌아가기
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className={`text-sm px-4 py-2 rounded-md text-white transition-colors ${
              isFormValid && !submitting
                ? 'bg-[#0072CE] hover:bg-[#005fa3]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </nav>

      {/* 메인 카드 */}
      <Card className="m-8 flex-1 flex flex-col shadow-sm">
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

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="상품에 대한 설명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
              />
            </div>

            {/* 문제 미리보기 선택 */}
            {problems.length > 0 && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  미리보기 문제 선택 * (최대 3개)
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
