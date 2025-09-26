'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getProduct, getUserPoints, purchaseProduct, MarketProductDetail } from '@/services/marketApi';

export default function ProductBuyPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { } = useAuth();

  const [product, setProduct] = useState<MarketProductDetail | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const methods = [
    { id: 'points', name: 'Q-T 포인트' },
  ];

  const [selectedMethod, setSelectedMethod] = useState<string>('points');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 상품 및 포인트 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productData, pointsData] = await Promise.all([
          getProduct(Number(productId)),
          getUserPoints()
        ]);
        setProduct(productData);
        setUserPoints(pointsData.available_points);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId]);

  const formattedPrice = useMemo(
    () => product ? `${product.price.toLocaleString()}P` : '0P',
    [product?.price]
  );

  const canPay = agreeTerms && Boolean(selectedMethod) && product && userPoints >= product.price;
  const insufficientPoints = product && userPoints < product.price;

  const handlePayment = async () => {
    if (!canPay || !product) return;

    setPurchasing(true);
    try {
      await purchaseProduct({ product_id: product.id });
      // 구매 성공 시 결과 페이지로 이동
      router.push(`/market/checkout?success=true&productId=${product.id}&title=${encodeURIComponent(product.title)}&price=${product.price}`);
    } catch (error: any) {
      console.error('구매 실패:', error);
      alert(error.message || '구매에 실패했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <PageHeader
          icon={<FiShoppingCart />}
          title="마켓플레이스"
          variant="market"
          description="안전하고 간편한 결제"
        />
        <Card className="flex-1 flex flex-col shadow-sm">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <PageHeader
          icon={<FiShoppingCart />}
          title="마켓플레이스"
          variant="market"
          description="안전하고 간편한 결제"
        />
        <Card className="flex-1 flex flex-col shadow-sm">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-gray-500 mb-4">{error || '상품을 찾을 수 없습니다.'}</div>
              <button
                onClick={() => router.push('/market')}
                className="px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors"
              >
                마켓으로 돌아가기
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<FiShoppingCart />}
        title="마켓플레이스"
        variant="market"
        description="안전하고 간편한 결제"
      />

      <div className="mx-4 lg:mx-8 mb-24 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* 좌측: 결제 수단 및 약관 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 결제 수단 카드 */}
          <Card className="shadow-md">
            <CardHeader className="flex items-center justify-between py-3 px-6 border-b border-gray-100">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition"
                aria-label="뒤로가기"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <CardTitle className="text-base font-semibold">결제 수단 선택</CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4">
                {/* 포인트 잔액 표시 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5 text-[#0072CE]" />
                      <span className="font-medium">보유 포인트</span>
                    </div>
                    <span className={`font-bold text-lg ${
                      insufficientPoints ? 'text-red-500' : 'text-[#0072CE]'
                    }`}>
                      {userPoints.toLocaleString()}P
                    </span>
                  </div>
                  {insufficientPoints && (
                    <div className="mt-2 text-sm text-red-500">
                      포인트가 부족합니다. ({(product.price - userPoints).toLocaleString()}P 부족)
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      disabled={m.id === 'points' && !!insufficientPoints}
                      className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        selectedMethod === m.id
                          ? 'border-[#0072CE] bg-[#F0F7FF] text-[#0072CE]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${
                        m.id === 'points' && insufficientPoints
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 약관 동의 카드 */}
          <Card className="shadow-md">
            <CardHeader className="py-3 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-semibold">약관 동의</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    구매 약관 및 포인트 결제에 동의합니다.
                  </span>
                </label>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 구매한 상품은 즉시 이용 가능합니다.</p>
                  <p>• 디지털 상품 특성상 구매 후 환불이 불가합니다.</p>
                  <p>• 구매 완료 후 마이마켓에서 확인할 수 있습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 우측: 주문 요약 */}
        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-4">
            <CardHeader className="py-3 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-semibold">주문 요약</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* 상품 이미지 - 텍스트 렌더링 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg h-32 flex items-center justify-center text-gray-700 select-none border border-gray-200 p-4">
                <div className="text-center space-y-2">
                  <div className="text-lg font-bold text-[#0072CE]">{product.subject_type}</div>
                  <div className="text-sm font-semibold">{product.school_level} {product.grade}학년</div>
                  <div className="text-xs text-gray-600 line-clamp-2 leading-tight px-2">
                    {product.title}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">상품명</p>
                <p className="font-semibold text-gray-800">{product.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">판매자</p>
                <p className="text-gray-700">{product.seller_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">워크시트</p>
                <p className="text-gray-700">{product.worksheet_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">문제 수</p>
                <p className="text-gray-700">{product.problem_count}문제</p>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">결제 금액</span>
                <span className="text-lg font-bold text-[#0072CE]">{formattedPrice}</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={!canPay || purchasing}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  canPay && !purchasing
                    ? 'bg-[#0072CE] text-white hover:brightness-110'
                    : 'bg-gray-300 text-white cursor-not-allowed'
                }`}
              >
                {purchasing ? '구매 중...' :
                 insufficientPoints ? '포인트 부족' :
                 `${formattedPrice} 결제하기`}
              </button>

              {insufficientPoints && (
                <button
                  onClick={() => router.push('/market/points')}
                  className="w-full py-2 mt-2 rounded-lg border border-[#0072CE] text-[#0072CE] hover:bg-blue-50 transition-colors text-sm"
                >
                  포인트 충전하기
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
