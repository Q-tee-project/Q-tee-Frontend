'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiSearch, FiX, FiArrowLeft, FiCalendar, FiUser, FiEye } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getMyPurchases, MarketPurchase } from '@/services/marketApi';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function PurchaseListPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortType, setSortType] = useState<'latest' | 'oldest' | 'priceHigh' | 'priceLow'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'productName' | 'sellerId'>('productName');
  const [purchases, setPurchases] = useState<MarketPurchase[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 구매 데이터 로드
  const loadPurchases = async () => {
    setLoading(true);
    try {
      const data = await getMyPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('구매 목록 로드 실패:', error);
      setError('구매 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 정렬 + 검색 적용
  const sortedAndFilteredItems = purchases
    .filter((item: MarketPurchase) => {
      // 검색 필터 적용
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      if (searchField === 'productName') {
        return item.product_title.toLowerCase().includes(q);
      }
      if (searchField === 'sellerId') {
        return item.seller_name.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a: MarketPurchase, b: MarketPurchase) => {
      if (sortType === 'latest') return new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime();
      if (sortType === 'oldest') return new Date(a.purchased_at).getTime() - new Date(b.purchased_at).getTime();
      if (sortType === 'priceHigh') return b.purchase_price - a.purchase_price;
      if (sortType === 'priceLow') return a.purchase_price - b.purchase_price;
      return 0;
    });

  const totalPages = Math.ceil(sortedAndFilteredItems.length / itemsPerPage);
  const displayedItems = sortedAndFilteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, searchQuery, searchField]);

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
            {/* 정렬 */}
            <div className="flex items-center gap-4">
              {/* 정렬 Select */}
              <Select value={sortType} onValueChange={(v) => {
                setSortType(v as 'latest' | 'oldest' | 'priceHigh' | 'priceLow');
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
            </div>

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
               <Select value={searchField} onValueChange={(v) => {
                 setSearchField(v as 'productName' | 'sellerId');
               }}>
                <SelectTrigger className="w-28 h-9 text-sm">
                  <SelectValue placeholder="검색 필드" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productName">상품명</SelectItem>
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
             ) : error ? (
               <div className="flex justify-center items-center text-red-500 py-8">
                 {error}
               </div>
             ) : displayedItems.length === 0 ? (
               <div className="flex justify-center items-center text-gray-500 py-8">
                 구매한 상품이 없습니다.
               </div>
             ) : (
               <div className="space-y-3">
                 {displayedItems.map((item: MarketPurchase) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => router.push(`/market/${item.product_id}`)}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* 상태 */}
                      <div className="text-sm text-gray-600">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          item.payment_status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.payment_status === 'completed' ? '결제완료' : item.payment_status}
                        </span>
                      </div>

                      {/* 상품명 */}
                      <div className="text-sm font-medium text-gray-800 col-span-2">
                        {item.product_title}
                      </div>

                      {/* 판매자 */}
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        {item.seller_name}
                      </div>

                      {/* 구매일시 */}
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {new Date(item.purchased_at).toLocaleDateString('ko-KR')}
                      </div>

                      {/* 가격 */}
                      <div className="text-sm font-semibold text-[#0072CE] flex items-center gap-2">
                        {item.purchase_price.toLocaleString()}P
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/market/${item.product_id}`);
                          }}
                          className="text-gray-400 hover:text-[#0072CE] transition-colors"
                          title="상품 보기"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
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