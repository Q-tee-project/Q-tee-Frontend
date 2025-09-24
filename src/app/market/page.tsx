'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiSearch, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import TrendyPopularProducts from '@/components/market/TrendyPopularProducts';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  author: string;
  authorId: string;
  tags: string[];
}

type MarketProduct = Product;


const TABS = ['전체', '국어', '영어', '수학'];

export default function MarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [loading, setLoading] = useState(true);

  const [sortType, setSortType] = useState<'latest' | 'rating' | 'sales'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'title' | 'tags' | 'author'>('title');

  // 상품 데이터
  const products: Product[] = Array.from({ length: 22 }).map((_, idx) => ({
    id: (idx + 1).toString(),
    title: `상품 ${idx + 1}`,
    description: '중학교 1학년 국어 기출문제 2단원',
    price: 2000 + idx * 500,
    author: idx < 5 ? (userProfile?.id?.toString() || 'user123') : `user${idx}`,
    authorId: idx < 5 ? (userProfile?.id?.toString() || 'user123') : `user${idx}`,
    tags: ['중학교', '1학년', idx % 2 === 0 ? '국어' : '영어', '기출문제'],
  }));
  // 인기상품 데이터 (상위 5개)
  const featuredProducts = products.slice(0, 5);

  // 필터링된 상품 (탭에 따른 필터링)
  const filteredProducts = products.filter((product) => {
    if (selectedTab === '전체') return true;
    return product.tags.includes(selectedTab);
  });


  // 상품 로딩 함수
  const loadProducts = () => {
    setLoading(true);
    // 실제 API 호출이 필요한 경우 여기에 구현
    // 현재는 정적 데이터를 사용하므로 로딩 상태만 관리
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedTab]);


  // 정렬 + 검색 적용
  const sortedAndFilteredProducts = filteredProducts
    .filter((p: Product) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      if (searchField === 'title') {
        return p.title.toLowerCase().includes(q);
      }
      if (searchField === 'tags') {
        return p.tags.some((tag: string) => tag.toLowerCase().includes(q));
      }
      if (searchField === 'author') {
        return p.author.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a: Product, b: Product) => {
      if (sortType === 'latest') return Number(b.id) - Number(a.id);
      if (sortType === 'rating') return (b.price % 5) - (a.price % 5); // 예시 별점
      if (sortType === 'sales') return b.price - a.price; // 예시 구매 수
      return 0;
    });

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);
  const displayedProducts = sortedAndFilteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  // 반응형 그리드
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

  // 페이지/탭 변경 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedTab]);

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<FiShoppingCart />}
        title="마켓플레이스"
        variant="market"
        description="상품을 등록하거나 구매할 수 있습니다"
      />

      {/* 탭 네비게이션 */}
      <nav className="flex justify-between items-center">
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

        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/market/myMarket')}
            className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors"
          >
            마이마켓
          </button>
          <button
            onClick={() => router.push('/market/purchaseList')}
            className="text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
          >
            구매목록
          </button>
        </div>
      </nav>

      {/* 인기상품 슬라이드 */}
      <Card className="flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">


          <CardTitle className="text-base font-medium">{selectedTab} 상품 목록</CardTitle>
          <span className="text-sm font-normal text-gray-400">
            총 {filteredProducts.length}건
          </span>

        </CardHeader>
        <CardContent>

          {/* 트렌디한 인기상품 */}
          {selectedTab === '전체' && (
            <div className="mb-8">
              <TrendyPopularProducts products={featuredProducts} />
            </div>
          )}

          {/* 정렬 & 검색 */}
          {/* 드롭다운은 Select 컴포넌트로 대체 */}
          <div className="w-full flex justify-between items-center mb-4 mt-6">
            {/* 정렬 Select */}
            <Select value={sortType} onValueChange={(v) => setSortType(v as 'latest' | 'rating' | 'sales')}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="rating">별점 높은 순</SelectItem>
                <SelectItem value="sales">구매 많은 순</SelectItem>
              </SelectContent>
            </Select>

            {/* 검색 */}
            <div className="ml-auto flex items-center gap-2 pr-2">
              <div className="relative w-96">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어 입력"
                  className="pl-9 pr-8 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="검색어 지우기"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Select value={searchField} onValueChange={(v) => setSearchField(v as 'title' | 'tags' | 'author')}>
                <SelectTrigger className="w-28 h-9 text-sm">
                  <SelectValue placeholder="검색 필드" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">상품명</SelectItem>
                  <SelectItem value="tags">태그</SelectItem>
                  <SelectItem value="author">제작자</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* 상품 그리드 */}
          <div className={`grid ${cols} gap-6`} style={{ minHeight: '400px' }}>
            {loading ? (
              <div className="col-span-full flex justify-center items-center text-gray-500">
                로딩 중...
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="col-span-full flex justify-center items-center text-gray-500">
                등록된 상품이 없습니다.
              </div>
            ) : (
              displayedProducts.map((product: Product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/market/${product.id}`)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-transform hover:scale-[1.02]"
                >

                  <div className="bg-gray-100 rounded-md h-48 mb-4 flex items-center justify-center text-gray-400 select-none">
                    이미지
                  </div>
                  <p className="text-gray-400 font-semibold text-sm mb-1 truncate">
                    {product.author}
                  </p>
                  <p className="mb-2 font-semibold truncate">{product.title}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-[#9E9E9E] text-xs select-none">

                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="w-fit px-3 py-1 rounded-full bg-[#EFEFEF] text-[#0072CE] text-sm font-semibold">
                    ₩{Number(product.price).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`${currentPage === idx + 1 ? 'bg-[#0072CE] text-white hover:bg-[#005fa3]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-3 py-1 rounded-md font-semibold text-sm`}
                  variant={currentPage === idx + 1 ? 'default' : 'secondary'}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
