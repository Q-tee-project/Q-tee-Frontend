'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiSearch, FiX, FiArrowLeft, FiCalendar, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface PurchaseItem {
  id: string;
  tag: string;
  productName: string;
  sellerId: string;
  purchaseDate: string;
  price: number;
  purchaseMethod: string;
}

export default function PurchaseListPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortType, setSortType] = useState<'latest' | 'oldest' | 'priceHigh' | 'priceLow'>('latest');
  const [tagFilter, setTagFilter] = useState<'all' | '국어' | '영어' | '수학'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'productName' | 'tag' | 'sellerId'>('productName');

  // 임시 구매 데이터 (더 많은 데이터로 페이징 테스트)
  const purchaseItems: PurchaseItem[] = Array.from({ length: 25 }).map((_, idx) => {
    const now = new Date();
    const purchaseDate = new Date(now.getTime() - (idx * 24 * 60 * 60 * 1000)); // 각각 다른 날짜
    
    const year = purchaseDate.getFullYear();
    const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
    const day = String(purchaseDate.getDate()).padStart(2, '0');
    const hour = String(purchaseDate.getHours()).padStart(2, '0');
    const minute = String(purchaseDate.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${year}년 ${month}월 ${day}일 ${hour}시`;
    
    return {
      id: (idx + 1).toString(),
      tag: idx % 3 === 0 ? '국어' : idx % 3 === 1 ? '영어' : '수학',
      productName: `중학교 ${idx % 3 === 0 ? '국어' : idx % 3 === 1 ? '영어' : '수학'} ${idx + 1}단원 기출문제`,
      sellerId: `teacher${String(idx + 1).padStart(2, '0')}`,
      purchaseDate: formattedDate,
      price: 2000 + idx * 500,
      purchaseMethod: idx % 3 === 0 ? '카카오페이' : idx % 3 === 1 ? 'Q-T Pay' : '계좌이체',
    };
  });

  // 정렬 + 검색 + 태그 필터 적용
  const sortedAndFilteredItems = purchaseItems
    .filter((item: PurchaseItem) => {
      // 태그 필터 적용
      if (tagFilter !== 'all' && item.tag !== tagFilter) {
        return false;
      }
      
      // 검색 필터 적용
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      if (searchField === 'productName') {
        return item.productName.toLowerCase().includes(q);
      }
      if (searchField === 'tag') {
        return item.tag.toLowerCase().includes(q);
      }
      if (searchField === 'sellerId') {
        return item.sellerId.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a: PurchaseItem, b: PurchaseItem) => {
      if (sortType === 'latest') return Number(b.id) - Number(a.id);
      if (sortType === 'oldest') return Number(a.id) - Number(b.id);
      if (sortType === 'priceHigh') return b.price - a.price;
      if (sortType === 'priceLow') return a.price - b.price;
      return 0;
    });

  const totalPages = Math.ceil(sortedAndFilteredItems.length / itemsPerPage);
  const displayedItems = sortedAndFilteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 로딩 함수
  const loadPurchaseItems = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadPurchaseItems();
  }, [currentPage, sortType, tagFilter, searchQuery, searchField]);

  // 페이지/검색 변경 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<FiShoppingCart />}
        title="마켓플레이스"
        variant="market"
        description="구매한 상품 목록을 확인할 수 있습니다"
      />

      {/* 구매 리스트 */}
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
            <CardTitle className="text-base font-medium">구매 목록</CardTitle>
          </div>
          
          <span className="text-sm font-normal" style={{ color: '#C8C8C8' }}>
            총 {sortedAndFilteredItems.length}건
          </span>
        </CardHeader>

        <CardContent>
          {/* 정렬 & 검색 */}
          <div className="w-full flex justify-between items-center mb-6">
            {/* 정렬 & 태그 필터 */}
            <div className="flex items-center gap-4">
              {/* 정렬 Select */}
              <Select value={sortType} onValueChange={(v) => {
                setSortType(v as 'latest' | 'oldest' | 'priceHigh' | 'priceLow');
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="priceHigh">가격 높은순</SelectItem>
                  <SelectItem value="priceLow">가격 낮은순</SelectItem>
                </SelectContent>
              </Select>

              {/* 태그 필터 Select */}
              <Select value={tagFilter} onValueChange={(v) => {
                setTagFilter(v as 'all' | '국어' | '영어' | '수학');
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="태그 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="영어">영어</SelectItem>
                  <SelectItem value="수학">수학</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 검색 */}
            <div className="ml-auto flex items-center gap-2 pr-2">
              <div className="relative w-96">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <Input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setCurrentPage(1);
                   }}
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
               <Select value={searchField} onValueChange={(v) => {
                 setSearchField(v as 'productName' | 'tag' | 'sellerId');
                 setCurrentPage(1);
               }}>
                <SelectTrigger className="w-28 h-9 text-sm">
                  <SelectValue placeholder="검색 필드" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productName">상품명</SelectItem>
                  <SelectItem value="tag">태그</SelectItem>
                  <SelectItem value="sellerId">제작자</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 구매 리스트 테이블 */}
          <div className="rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center items-center text-gray-500 py-8">
                로딩 중...
              </div>
             ) : displayedItems.length === 0 ? (
               <div className="flex justify-center items-center text-gray-500 py-8">
                 구매한 상품이 없습니다.
               </div>
             ) : (
               <div className="space-y-3">
                 {displayedItems.map((item: PurchaseItem) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* 태그 */}
                      <div className="text-sm text-gray-600">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                          {item.tag}
                        </span>
                      </div>
                      
                      {/* 상품명 */}
                      <div className="text-sm font-medium text-gray-800">
                        {item.productName}
                      </div>
                      
                      {/* 판매자 ID */}
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        {item.sellerId}
                      </div>
                      
                      {/* 구매일시 */}
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {item.purchaseDate}
                      </div>
                      
                      {/* 가격 */}
                      <div className="text-sm font-semibold text-[#0072CE]">
                        ₩{item.price.toLocaleString()}
                      </div>
                      
                      {/* 구매 방식 */}
                      <div className="text-sm text-gray-600">
                        {item.purchaseMethod}
                      </div>
                    </div>
                  </div>
                 ))}
               </div>
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
