'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  title: string;
  price: number;
  author: string;
  authorId: string;
  tags: string[];
}

const TABS = ['전체', '국어', '영어', '수학'];

export default function MarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');

  //상품 데이터
  const products: Product[] = Array.from({ length: 21 }).map((_, idx) => ({
    id: (idx + 1).toString(),
    title: '중학생',
    price: 20000,
    author: '킹왕짱광구쿤',
    authorId: idx < 5 ? (userProfile?.id?.toString() || 'user123') : `user${idx}`, // 처음 5개는 현재 사용자 상품
    tags: ['중학교', '1학년', '국어', '기출문제', '2단원'],
  }));

  // 탭 필터링
  const filteredProducts =
    selectedTab === '전체'
      ? products
      : products.filter((product) => product.tags.includes(selectedTab));

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const [cols, setCols] = useState('grid-cols-1');

  
    useEffect(() => {
        function handleResize() {
        const width = window.innerWidth;
        if (width >= 1280) setCols('grid-cols-5');
        else if (width >= 1024) setCols('grid-cols-4');
        else if (width >= 768) setCols('grid-cols-3');
        else if (width >= 640) setCols('grid-cols-2');
        else setCols('grid-cols-1');
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
  

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<FiShoppingCart />}
        title="마켓플레이스"
        variant="market"
        description="상품을 등록하거나 구매할 수 있습니다"
      />
      {/* 탭 네비게이션 */}
      <nav
        className="flex justify-between items-center mt-6 mb-4 px-8"
      >
        {/* 탭 리스트 */}
        <div className="flex space-x-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                setCurrentPage(1);
              }}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 마이마켓 버튼 */}
        <button
          onClick={() => router.push('/market/myMarket')}
          className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors"
        >
          마이마켓
        </button>
      </nav>

      {/* 상품 목록 카드 */}
      <Card className="flex-1 flex flex-col shadow-sm"
      style={{ margin: '2rem'}}>
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
        <CardTitle className="text-base font-medium">
            {selectedTab} 상품 목록
        </CardTitle>
        <span className="text-sm font-normal" style={{ color: '#C8C8C8' }}>
            총 {filteredProducts.length}건
        </span>
        </CardHeader>
        <CardContent>
          {/* 상품 그리드 */}
          <div className={`grid ${cols} gap-6`} style={{ minHeight: '400px' }}>
            {displayedProducts.length === 0 ? (
              <div className="col-span-full flex justify-center items-center text-gray-500">
                등록된 상품이 없습니다.
              </div>
            ) : (
              displayedProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/market/${product.id}`)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow transform hover:scale-[1.02]"
                >
                  <div className="bg-gray-100 rounded-md h-70 mb-4 flex items-center justify-center text-gray-400 select-none">
                    이미지
                  </div>
                  <p className="text-gray-400 font-semibold text-sm mb-1 truncate">{product.author}</p>
                  <p className="mb-2 truncate">{product.title}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[#9E9E9E] text-xs select-none"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="w-fit px-3 py-1 rounded-full bg-[#EFEFEF] text-[#0072CE] text-sm font-semibold">
                    ₩{product.price.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded-md font-semibold text-sm transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-[#0072CE] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
