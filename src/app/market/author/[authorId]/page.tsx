'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiSearch, FiX, FiArrowLeft } from 'react-icons/fi';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, MarketProduct } from '@/services/marketApi';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const TABS = ['전체', '국어', '영어', '수학'];

export default function AuthorMarketPage() {
  const router = useRouter();
  const { authorId } = useParams();
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [authorInfo, setAuthorInfo] = useState<{
    name: string;
    totalProducts: number;
    joinDate: string;
  } | null>(null);

  const [sortType, setSortType] = useState<'latest' | 'rating' | 'sales'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'title' | 'tags' | 'author'>('title');

  // 상품 로딩 함수
  const loadProducts = async () => {
    setLoading(true);
    try {
      // 특정 작성자의 상품 로드
      const allProducts = await getProducts({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        subject: selectedTab === '전체' ? undefined : selectedTab,
        search: searchQuery || undefined,
        search_field: searchField === 'title' ? 'title' :
                     searchField === 'tags' ? 'tags' : 'author',
        sort_by: sortType === 'latest' ? 'created_at' :
                sortType === 'sales' ? 'purchase_count' :
                'satisfaction_rate',
        sort_order: 'desc'
      });

      // 특정 작성자의 상품만 필터링 (authorId는 seller_name으로 필터링)
      const authorProducts = allProducts.filter(product =>
        product.seller_name === decodeURIComponent(authorId as string)
      );

      setProducts(authorProducts);

      // 작성자 정보 설정
      if (authorProducts.length > 0) {
        setAuthorInfo({
          name: authorProducts[0].seller_name,
          totalProducts: authorProducts.length,
          joinDate: '2024-01-01', // 임시 데이터 - 실제로는 API에서 받아야 함
        });
      } else {
        setAuthorInfo({
          name: decodeURIComponent(authorId as string),
          totalProducts: 0,
          joinDate: '2024-01-01',
        });
      }
    } catch (error) {
      console.error('작성자 상품 로드 실패:', error);
      setProducts([]);
      setAuthorInfo({
        name: decodeURIComponent(authorId as string),
        totalProducts: 0,
        joinDate: '2024-01-01',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedTab, sortType, searchQuery]);

  // API에서 이미 필터링/정렬된 데이터를 받아오므로 추가 처리 불필요
  const displayedProducts = products;
  const totalPages = Math.ceil(products.length / itemsPerPage);

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
            onClick={() => router.push('/market/my')}
            className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
          >
            마이마켓
          </button>
        </div>
        </nav>

      {/* 인기상품 슬라이드 */}
      <Card className="flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-3 px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="뒤로가기"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-base font-medium">
              <span style={{ color: '#0072CE' }}>{authorInfo?.name || '로딩중'}</span>의 {selectedTab} 상품 목록
            </CardTitle>
          </div>

          <span className="text-sm font-normal" style={{ color: '#C8C8C8' }}>
            총 {products.length}건
          </span>
        </CardHeader>
        <CardContent>

          {/* 정렬 & 검색 */}
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
          <div className={`grid ${cols} gap-6 transition-all duration-300`} style={{ minHeight: '600px' }}>
            {loading ? (
              <div className="col-span-full flex justify-center items-center text-gray-500">
                로딩 중...
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="col-span-full flex justify-center items-center text-gray-500">
                {authorInfo?.name || '해당 작성자'}님이 등록한 상품이 없습니다.
              </div>
            ) : (
              displayedProducts.map((product: MarketProduct) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/market/${product.id}`)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  {/* 상품 이미지 - 텍스트 렌더링 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md h-48 mb-4 flex items-center justify-center text-gray-700 select-none border border-gray-200 p-4">
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
                    {product.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-[#9E9E9E] text-xs select-none">
                        #{tag}
                      </span>
                    ))}
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
