'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function ProductBuyPage() {
  const { productId } = useParams();
  const router = useRouter();

  const product = {
    id: productId,
    title: '중학생 1학년 국어 1단원, 2단원',
    price: 20000,
    author: 'userName',
    tags: ['중학교', '1학년', '국어'],
  };

  const methods = [
    { id: '1', name: '카카오페이' },
    { id: '2', name: 'Q-T Pay' },
    { id: '3', name: '계좌이체' },
  ];

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const formattedPrice = useMemo(
    () => `₩${product.price.toLocaleString()}`,
    [product.price]
  );

  const canPay = agreeTerms && Boolean(selectedMethod);

  const handlePayment = () => {
    if (!canPay) return;
    router.push(`/market/${productId}/buy/checkout`);
  };

  return (
    <div className="flex flex-col">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition ${
                      selectedMethod === m.id
                        ? 'border-[#0072CE] bg-[#F0F7FF] text-[#0072CE]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 약관 동의 카드 */}
          <Card className="shadow-md">
            <CardHeader className="py-3 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-semibold">약관 동의</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  주문 상품, 결제 대행 서비스 이용약관 및 개인정보 제3자 제공에 모두 동의합니다.
                </span>
              </label>
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
              <div>
                <p className="text-sm text-gray-500 mb-1">상품명</p>
                <p className="font-semibold text-gray-800">{product.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">판매자</p>
                <p className="text-gray-700">{product.author}</p>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">결제 금액</span>
                <span className="text-lg font-bold text-[#0072CE]">{formattedPrice}</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={!canPay}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  canPay
                    ? 'bg-[#0072CE] text-white hover:brightness-110'
                    : 'bg-gray-300 text-white cursor-not-allowed'
                }`}
              >
                {formattedPrice} 결제하기
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
