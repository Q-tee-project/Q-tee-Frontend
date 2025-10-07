'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { createProduct, getUserWorksheets, NormalizedWorksheet, MarketProductCreate } from '@/services/marketApi';

export default function CreateMarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    original_service: '' as 'korean' | 'math' | 'english' | '',
    original_worksheet_id: null as number | null,
  });

  const [worksheets, setWorksheets] = useState<NormalizedWorksheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 워크시트 목록 가져오기
  useEffect(() => {
    if (form.original_service && userProfile?.id) {
      loadWorksheets();
    }
  }, [form.original_service, userProfile?.id]);

  const loadWorksheets = async () => {
    if (!form.original_service) return;

    setLoading(true);
    try {
      const data = await getUserWorksheets(form.original_service, userProfile?.id);
      setWorksheets(data);
    } catch (error) {
      console.error('워크시트 로드 실패:', error);
      alert('워크시트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.original_service || !form.original_worksheet_id) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const productData: MarketProductCreate = {
        title: form.title,
        description: form.description,
        original_service: form.original_service,
        original_worksheet_id: form.original_worksheet_id,
      };

      const result = await createProduct(productData);
      alert('상품이 성공적으로 등록되었습니다!');
      router.push(`/market/${result.id}`);
    } catch (error: any) {
      console.error('상품 등록 실패:', error);
      alert(error.message || '상품 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<FiPlus />}
        title="상품 등록"
        variant="market"
        description="워크시트를 마켓플레이스에 상품으로 등록해보세요"
      />

      <Card className="flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-3 px-6 border-b border-gray-100 flex items-center justify-between">
          <CardTitle className="text-base font-medium">상품 정보 입력</CardTitle>
          <span className="text-sm font-normal text-gray-400">
            필수 항목을 모두 입력해주세요
          </span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* 상품명 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">상품명 *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="상품명을 입력하세요"
                required
                className="h-10"
              />
            </div>

            {/* 상품 설명 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">상품 설명</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="상품에 대한 자세한 설명을 입력하세요 (선택사항)"
                rows={6}
                className="resize-none overflow-y-auto h-32"
              />
            </div>

            {/* 과목 및 워크시트 선택 (가로 정렬) */}
            <div className="flex space-x-4">
              {/* 과목 선택 */}
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">과목 *</label>
                <Select
                  value={form.original_service}
                  onValueChange={(value) => {
                    setForm(prev => ({
                      ...prev,
                      original_service: value as 'korean' | 'math' | 'english',
                      original_worksheet_id: null
                    }));
                    setWorksheets([]);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="과목을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="korean">국어</SelectItem>
                    <SelectItem value="math">수학</SelectItem>
                    <SelectItem value="english">영어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 워크시T 선택 */}
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700">워크시트 *</label>
                <Select
                  value={form.original_worksheet_id?.toString() || ''}
                  onValueChange={(value) => setForm(prev => ({
                    ...prev,
                    original_worksheet_id: parseInt(value)
                  }))}
                  disabled={!form.original_service || loading}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={
                      loading ? '로딩 중...' :
                      !form.original_service ? '먼저 과목을 선택하세요' :
                      '워크시트를 선택하세요'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {worksheets.map((worksheet) => (
                      <SelectItem key={worksheet.id} value={worksheet.id.toString()}>
                        {worksheet.title} ({worksheet.problem_count}문제) - {worksheet.school_level} {worksheet.grade}학년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">상품 등록 안내</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• <strong>상품명</strong>: 마켓에서 판매될 제목 (원본 워크시트 제목과 다름)</li>
                <li>• <strong>가격</strong>: 문제 수에 따라 자동 결정 (10문제: 1,500P, 20문제: 3,000P)</li>
                <li>• <strong>이미지</strong>: 과목, 학년, 상품명으로 자동 생성</li>
                <li>• 등록 후 마이마켓에서 수정/삭제 가능</li>
              </ul>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="flex-1 h-10"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.title || !form.original_service || !form.original_worksheet_id}
                className="flex-1 h-10 bg-[#0072CE] hover:bg-[#005fa3] text-white"
              >
                {submitting ? '등록 중...' : '상품 등록'}
              </Button>
            </div>
          </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}