'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  author: string;
  authorId: string;
  tags: string[];
}

interface PopularProductsSliderProps {
  products: Product[];
}

export default function PopularProductsSlider({ products }: PopularProductsSliderProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이드 자동 변경
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [products.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % products.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);

  if (products.length === 0) return null;

  return (
    <div className="relative w-full my-10 flex flex-col items-center">
      <section className="relative w-[85%] h-[440px] bg-white overflow-hidden rounded-lg shadow-md border border-gray-200">
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={`absolute inset-0 flex will-change-[opacity,transform] transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)] ${
              idx === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
          >
            {/* 좌측 이미지 */}
            <div
              className="w-1/2 bg-gray-100 flex items-center justify-center cursor-pointer"
              onClick={() => router.push(`/market/${product.id}`)}
            >
              <span className="text-gray-400">이미지</span>
            </div>

            {/* 우측 정보 */}
            <div className="w-1/2 p-8 flex flex-col justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/market/author/${product.authorId}`);
                }}
                className="text-gray-400 font-semibold text-sm mb-1 hover:text-[#0072CE] transition-colors"
              >
                {product.author}
              </button>
              <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-500 text-sm mb-3">{product.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs text-[#9E9E9E]">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="w-fit px-3 py-1 rounded-full bg-[#EFEFEF] text-[#0072CE] text-sm font-semibold">
                ₩{product.price.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 좌우 버튼 */}
      <button
        onClick={prevSlide}
        className="absolute left-[calc(50%-42.5%-50px)] top-[47%] -translate-y-1/2
                   w-10 h-[440px] flex items-center justify-center
                   bg-gradient-to-r from-gray-100 to-white rounded-lg transition-opacity hover:opacity-90"
      >
        <FiChevronLeft size={20} className="text-gray-700" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-[calc(50%-42.5%-50px)] top-[47%] -translate-y-1/2
                   w-10 h-[440px] flex items-center justify-center
                   bg-gradient-to-l from-gray-100 to-white rounded-lg transition-opacity hover:opacity-90"
      >
        <FiChevronRight size={20} className="text-gray-700" />
      </button>

      {/* 하단 인디케이터 */}
      <div className="mt-4 flex justify-center space-x-2">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-6 h-2 rounded-md transition-colors ${
              idx === currentSlide ? 'bg-[#0072CE]' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
