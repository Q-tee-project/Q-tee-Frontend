'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MarketProduct } from '@/services/marketApi';

interface TrendyPopularProductsProps {
  products: MarketProduct[];
  className?: string;
}

export default function TrendyPopularProducts({ products, className }: TrendyPopularProductsProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 자동 슬라이드
  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [products.length, isHovered]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % products.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);

  if (products.length === 0) return null;

  return (
    <div className={cn("relative w-full my-8", className)}>
      {/* 메인 컨테이너 */}
      <div 
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-25 to-indigo-25 p-8 shadow-lg border border-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 상단 제목 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#0072CE] mb-2">
            인기 상품
          </h2>
          <p className="text-gray-500 text-sm">지금 가장 인기 있는 상품들을 만나보세요</p>
        </div>

        {/* 상품 슬라이드 */}
        <div className="relative h-96 flex items-center justify-center">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "absolute inset-0 flex transition-all duration-1000 ease-out",
                index === currentIndex
                  ? "opacity-100 scale-100 translate-x-0"
                  : index === (currentIndex - 1 + products.length) % products.length
                  ? "opacity-30 scale-95 -translate-x-8 blur-md"
                  : index === (currentIndex + 1) % products.length
                  ? "opacity-30 scale-95 translate-x-8 blur-md"
                  : "opacity-0 scale-90 translate-x-12 blur-md"
              )}
            >
              {/* 좌측 이미지 영역 */}
              <div className="w-1/2 flex items-center justify-center">
                <div className="relative group">
                  {/* 배경 이미지들 (겹쳐있는 효과) */}
                  <div className="absolute -top-3 -left-3 w-[32rem] h-80 rounded-lg bg-gradient-to-br from-gray-200 to-slate-200 border border-gray-300 transform rotate-3"></div>
                  <div className="absolute -top-2 -left-2 w-[32rem] h-80 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 border border-gray-200 transform -rotate-1"></div>
                  <div className="absolute -top-1 -left-1 w-[32rem] h-80 rounded-lg bg-gradient-to-br from-gray-150 to-blue-50 border border-gray-250 transform rotate-1"></div>
                  
                  {/* 메인 이미지 컨테이너 */}
                  <div className="relative w-[32rem] h-80 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shadow-lg z-10">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-lg">상품 이미지</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측 정보 영역 */}
              <div className="w-1/2 p-8 flex flex-col justify-center">
                {/* 작성자 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/market/author/${product.seller_name}`);
                  }}
                  className="text-gray-400 text-sm mb-2 hover:text-[#0072CE] transition-colors font-semibold text-left"
                >
                  {product.seller_name}
                </button>

                {/* 제목 */}
                <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                  {product.title}
                </h3>

                {/* 기본 정보 */}
                <p className="text-gray-500 text-sm mb-4">
                  {product.subject_type} | {product.school_level} {product.grade}학년 | {product.problem_count}문제
                </p>

                {/* 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[#9E9E9E] text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 판매 통계 */}
                <div className="text-xs text-gray-400 mb-4">
                  판매 {product.purchase_count}건 | 조회 {product.view_count}회
                </div>

                {/* 가격과 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-semibold text-[#0072CE]">
                    {product.price.toLocaleString()}P
                  </div>
                  <button
                    onClick={() => router.push(`/market/${product.id}`)}
                    className="px-4 py-2 bg-[#0072CE] text-white rounded-lg hover:bg-[#005fa3] transition-colors text-sm font-medium"
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* 인디케이터 */}
        <div className="flex justify-center mt-6 space-x-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-[#0072CE] w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
