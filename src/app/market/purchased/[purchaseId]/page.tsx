'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiArrowLeft, FiUser, FiCalendar, FiBook } from 'react-icons/fi';
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

// 영어 문제 전용 타입 (API 응답에 맞춤)
interface EnglishProblemFromAPI {
  id: number;
  sequence_order: number;
  question: string;
  problem_type: string;
  question_subject: string;
  difficulty: string;
  correct_answer: string;
  choices?: string[];
  explanation?: string;
  learning_point?: string;
  example_content?: string;
  passage_content?: string;
  source_text?: string;
  source_title?: string;
}

// 과목별 컴포넌트 타입 정의 (공통)
interface BasePurchasedWorksheetDetailProps {
  worksheet: PurchasedWorksheet;
  showAnswerSheet: boolean;
  onToggleAnswerSheet: () => void;
}

// 각 과목별 특화 타입
interface PurchasedMathWorksheetDetailProps extends BasePurchasedWorksheetDetailProps {
  problems: Problem[];
}

interface PurchasedKoreanWorksheetDetailProps extends BasePurchasedWorksheetDetailProps {
  problems: Problem[];
}

interface PurchasedEnglishWorksheetDetailProps extends BasePurchasedWorksheetDetailProps {
  problems: EnglishProblemFromAPI[];
}

export default function PurchasedWorksheetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [worksheet, setWorksheet] = useState<PurchasedWorksheet | null>(null);
  const [problems, setProblems] = useState<Problem[] | EnglishProblemFromAPI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  const purchaseId = params.purchaseId as string;

  // 과목별 컴포넌트 매핑
  const WorksheetDetailComponents = useMemo(
    () => ({
      math: PurchasedMathWorksheetDetail as React.FC<PurchasedMathWorksheetDetailProps>,
      korean: PurchasedKoreanWorksheetDetail as React.FC<PurchasedKoreanWorksheetDetailProps>,
      english: PurchasedEnglishWorksheetDetail as React.FC<PurchasedEnglishWorksheetDetailProps>,
    }),
    [],
  );

  // 구매한 워크시트 정보 로드
  const loadPurchasedWorksheet = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(
        `http://localhost:8005/market/purchased/${purchaseId}/worksheet`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('워크시트를 불러올 수 없습니다.');
      }

      const worksheetData = await response.json();
      setWorksheet(worksheetData);

      // 워크시트 문제들 로드 (각 서비스별로 다른 API 호출)
      if (worksheetData.service === 'math') {
        const worksheetId =
          worksheetData.copied_worksheet_id || worksheetData.original_worksheet_id;

        const problemsResponse = await fetch(
          `http://localhost:8001/api/worksheets/${worksheetId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (problemsResponse.ok) {
          const data = await problemsResponse.json();
          console.log(`[DEBUG] 수학 문제 데이터:`, data);
          const mathProblems: Problem[] = data.problems || [];
          setProblems(mathProblems);
        } else {
          const errorText = await problemsResponse.text();
          console.error(`[DEBUG] 수학 API 오류:`, errorText);
        }
      } else if (worksheetData.service === 'korean') {
        // 복사된 워크시트 ID 사용 (copied_worksheet_id가 있으면 사용, 없으면 original_worksheet_id 사용)
        const worksheetId =
          worksheetData.copied_worksheet_id || worksheetData.original_worksheet_id;
        console.log(
          `[DEBUG] 국어 문제 로드 시도: worksheet_id=${worksheetId} (copied_id=${worksheetData.copied_worksheet_id}, original_id=${worksheetData.original_worksheet_id})`,
        );

        const problemsResponse = await fetch(
          `http://localhost:8004/api/korean-generation/worksheets/${worksheetId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (problemsResponse.ok) {
          const data = await problemsResponse.json();
          console.log(`[DEBUG] 국어 문제 데이터:`, data);
          const koreanProblems: Problem[] = data.problems || [];
          setProblems(koreanProblems);
        } else {
          const errorText = await problemsResponse.text();
          console.error(`[DEBUG] 국어 API 오류:`, errorText);
        }
      } else if (worksheetData.service === 'english') {
        // 복사된 워크시트 ID 사용
        const worksheetId =
          worksheetData.copied_worksheet_id || worksheetData.original_worksheet_id;
        const problemsResponse = await fetch(
          `http://localhost:8002/market/worksheets/${worksheetId}/problems`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (problemsResponse.ok) {
          const data = await problemsResponse.json();
          // 영어 서비스는 {worksheet: ..., problems: [...]} 구조로 응답
          const englishProblems: EnglishProblemFromAPI[] = data.problems || [];
          setProblems(englishProblems);
        } else {
          if (problemsResponse.status === 404) {
            setError('구매한 문제지를 찾을 수 없습니다. 원본 데이터가 삭제되었을 수 있습니다.');
          } else {
            const errorText = await problemsResponse.text();
            console.error(`영어 API 오류:`, errorText);
            setError('문제 데이터를 불러오는 데 실패했습니다.');
          }
          setProblems([]); // 에러 발생 시 문제 목록 초기화
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
      case 'math':
        return '수학';
      case 'korean':
        return '국어';
      case 'english':
        return '영어';
      default:
        return service;
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
              </div>
            </CardContent>
          </Card>

          {/* 워크시트 상세 내용 */}
          {(() => {
            switch (worksheet.service) {
              case 'math':
                return (
                  <WorksheetDetailComponents.math
                    worksheet={worksheet}
                    problems={problems as Problem[]}
                    showAnswerSheet={showAnswerSheet}
                    onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
                  />
                );
              case 'korean':
                return (
                  <WorksheetDetailComponents.korean
                    worksheet={worksheet}
                    problems={problems as Problem[]}
                    showAnswerSheet={showAnswerSheet}
                    onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
                  />
                );
              case 'english':
                return (
                  <WorksheetDetailComponents.english
                    worksheet={worksheet}
                    problems={problems as EnglishProblemFromAPI[]}
                    showAnswerSheet={showAnswerSheet}
                    onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
                  />
                );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
