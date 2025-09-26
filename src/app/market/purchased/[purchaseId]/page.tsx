'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiArrowLeft, FiUser, FiCalendar, FiBook, FiDownload } from 'react-icons/fi';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PurchasedMathWorksheetDetail } from '@/components/market/purchased/PurchasedMathWorksheetDetail';
import { PurchasedKoreanWorksheetDetail } from '@/components/market/purchased/PurchasedKoreanWorksheetDetail';
import { PurchasedEnglishWorksheetDetail } from '@/components/market/purchased/PurchasedEnglishWorksheetDetail';

interface PurchasedWorksheet {
  purchase_id: number;
  product_id: number;
  title: string;
  worksheet_title: string;
  service: string;
  original_worksheet_id: number;
  purchased_at: string;
  access_granted: boolean;
}

interface Problem {
  id: number;
  sequence_order: number;
  question: string;
  problem_type: string;
  difficulty: string;
  correct_answer: string;
  choices?: string[];
  solution?: string;
  explanation?: string;
  latex_content?: string;
  has_diagram?: boolean;
  diagram_type?: string;
  diagram_elements?: any[];
}

// 과목별 컴포넌트 타입 정의
interface PurchasedWorksheetDetailProps {
  worksheet: PurchasedWorksheet;
  problems: Problem[];
  showAnswerSheet: boolean;
  onToggleAnswerSheet: () => void;
}

type PurchasedWorksheetDetailComponent = React.ComponentType<PurchasedWorksheetDetailProps>;

export default function PurchasedWorksheetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [worksheet, setWorksheet] = useState<PurchasedWorksheet | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  const purchaseId = params.purchaseId as string;

  // 과목별 컴포넌트 매핑
  const WorksheetDetailComponents: Record<string, PurchasedWorksheetDetailComponent> = useMemo(
    () => ({
      math: PurchasedMathWorksheetDetail,
      korean: PurchasedKoreanWorksheetDetail,
      english: PurchasedEnglishWorksheetDetail,
    }),
    []
  );

  // 구매한 워크시트 정보 로드
  const loadPurchasedWorksheet = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`http://localhost:8005/market/purchased/${purchaseId}/worksheet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('워크시트를 불러올 수 없습니다.');
      }

      const worksheetData = await response.json();
      setWorksheet(worksheetData);

      // 워크시트 문제들 로드 (각 서비스별로 다른 API 호출)
      if (worksheetData.service === 'math') {
        const worksheetId = worksheetData.copied_worksheet_id || worksheetData.original_worksheet_id;
        console.log(`[DEBUG] 수학 문제 로드 시도: worksheet_id=${worksheetId} (copied_id=${worksheetData.copied_worksheet_id}, original_id=${worksheetData.original_worksheet_id})`);

        const problemsResponse = await fetch(`http://localhost:8001/api/worksheets/${worksheetId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`[DEBUG] 수학 API 응답 상태: ${problemsResponse.status} ${problemsResponse.statusText}`);

        if (problemsResponse.ok) {
          const data = await problemsResponse.json();
          console.log(`[DEBUG] 수학 문제 데이터:`, data);
          setProblems(data.problems || []);
        } else {
          const errorText = await problemsResponse.text();
          console.error(`[DEBUG] 수학 API 오류:`, errorText);
        }
      } else if (worksheetData.service === 'korean') {
        const problemsResponse = await fetch(`http://localhost:8004/korean/worksheets/${worksheetData.original_worksheet_id}/problems`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (problemsResponse.ok) {
          const data = await problemsResponse.json();
          setProblems(data.problems || []);
        }
      } else if (worksheetData.service === 'english') {
        const problemsResponse = await fetch(`http://localhost:8002/english/worksheets/${worksheetData.original_worksheet_id}/problems`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (problemsResponse.ok) {
          const data = await problemsResponse.json();
          setProblems(data.problems || []);
        }
      }

    } catch (error) {
      console.error('구매한 워크시트 로드 실패:', error);
      setError('구매한 워크시트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (purchaseId) {
      loadPurchasedWorksheet();
    }
  }, [purchaseId]);

  const getServiceName = (service: string) => {
    switch (service) {
      case 'math': return '수학';
      case 'korean': return '국어';
      case 'english': return '영어';
      default: return service;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !worksheet) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || '워크시트를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 영역 */}
      <PageHeader
        icon={<FiShoppingCart />}
        title="구매한 워크시트"
        variant="market"
        description="구매한 워크시트의 문제를 확인할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0">
        <div className="flex gap-6 h-full">
          {/* 워크시트 정보 사이드바 */}
          <Card className="w-80 h-fit shadow-sm">
            <CardHeader className="py-3 px-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-label="뒤로가기"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <CardTitle className="text-base font-medium">워크시트 정보</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">{worksheet.title}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <FiBook className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-500">원본 제목</div>
                      <div>{worksheet.worksheet_title}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiUser className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-500">과목</div>
                      <Badge variant="secondary">{getServiceName(worksheet.service)}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-500">구매일</div>
                      <div>{new Date(worksheet.purchased_at).toLocaleDateString('ko-KR')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => setShowAnswerSheet(!showAnswerSheet)}
                  className="w-full mb-3"
                  variant={showAnswerSheet ? 'secondary' : 'default'}
                >
                  {showAnswerSheet ? '문제지 보기' : '정답지 보기'}
                </Button>

                <Button
                  onClick={() => {
                    // PDF 다운로드 기능 구현 예정
                    alert('PDF 다운로드 기능은 개발 중입니다.');
                  }}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <FiDownload className="w-4 h-4" />
                  PDF 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 워크시트 상세 내용 */}
          {(() => {
            const WorksheetDetailComponent = WorksheetDetailComponents[worksheet.service];
            if (!WorksheetDetailComponent) {
              // 기본 렌더러 (서비스별 컴포넌트가 없는 경우)
              return (
                <Card className="flex-1 shadow-sm">
                  <CardHeader className="py-3 px-6 border-b border-gray-100">
                    <CardTitle className="text-lg font-medium">
                      문제 목록 ({problems.length}문제)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-center py-8 text-gray-500">
                      이 과목은 아직 지원되지 않습니다.
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <WorksheetDetailComponent
                worksheet={worksheet}
                problems={problems}
                showAnswerSheet={showAnswerSheet}
                onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}