'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiSearch, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, MarketProduct } from '@/services/marketApi';
import TrendyPopularProducts from '@/components/market/TrendyPopularProducts';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// getPopularProducts 함수 (임시)
const getPopularProducts = async (limit: number): Promise<MarketProduct[]> => {
  return await getProducts({
    limit,
    sort_by: 'satisfaction_rate',
    sort_order: 'desc'
  });
};


const TABS = ['전체', '국어', '영어', '수학'];

export default function MarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<MarketProduct[]>([]);

  const [sortType, setSortType] = useState<'latest' | 'rating' | 'sales'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'title' | 'tags' | 'author'>('title');

  // Mock 데이터 제거됨 - API로 대체

  // 상품 로딩 함수
  const loadProducts = async () => {
    setLoading(true);
    try {
      // 인기상품 로드 (5개)
      const popular = await getPopularProducts(5);
      setPopularProducts(popular);

      // 전체 상품 로드
      const allProducts = await getProducts({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        subject: selectedTab === '전체' ? undefined : selectedTab,
        search: searchQuery || undefined,
        sort_by: sortType === 'latest' ? 'created_at' :
                sortType === 'sales' ? 'purchase_count' :
                'satisfaction_rate',
        sort_order: 'desc'
      });
      setProducts(allProducts);
    } catch (error) {
      console.error('상품 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedTab, sortType, searchQuery]);

  // API에서 이미 필터링/정렬된 데이터를 받아오므로 추가 처리 불필요
  const sortedAndFilteredProducts = products;

  // API에서 페이징 처리한 데이터를 받아오므로 추가 슬라이싱 불필요
  const displayedProducts = sortedAndFilteredProducts;
  const totalPages = Math.ceil(products.length / itemsPerPage); // 임시로 설정, 실제로는 API에서 total_count를 받아와야 함


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
            총 {products.length}건
          </span>

        </CardHeader>
        <CardContent>

          {/* 트렌디한 인기상품 */}
          {selectedTab === '전체' && popularProducts.length > 0 && (
            <div className="mb-8">
              <TrendyPopularProducts products={popularProducts} />
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
              displayedProducts.map((product: MarketProduct) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/market/${product.id}`)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-transform hover:scale-[1.02]"
                >

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md h-48 mb-4 flex flex-col items-center justify-center text-gray-700 select-none border border-gray-200 p-4">
                    <div className="text-center space-y-2">
                      <div className="text-lg font-bold text-[#0072CE]">{product.subject_type}</div>
                      <div className="text-md font-semibold">{product.school_level} {product.grade}학년</div>
                      <div className="text-sm text-gray-600 mt-3 line-clamp-2 leading-tight px-2">
                        {product.title}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 font-semibold text-sm mb-1 truncate">
                    {product.seller_name}
                  </p>
                  <p className="mb-2 font-semibold truncate">{product.title}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[#9E9E9E] text-xs select-none">#{product.subject_type}</span>
                    <span className="text-[#9E9E9E] text-xs select-none">#{product.school_level}</span>
                    <span className="text-[#9E9E9E] text-xs select-none">#{product.grade}학년</span>
                    <span className="text-[#9E9E9E] text-xs select-none">#{product.problem_count}문제</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-fit px-3 py-1 rounded-full bg-[#EFEFEF] text-[#0072CE] text-sm font-semibold">
                      {product.price.toLocaleString()}P
                    </div>
                    <div className="text-xs text-gray-400">
                      판매 {product.purchase_count}건
                    </div>
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
