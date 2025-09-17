'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Product {
  id: string;
  title: string;
  price: number;
  author: string;
  authorId: string;
  tags: string[];
}

const TABS = ['전체', '국어', '영어', '수학'];

export default function MyMarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'multiple', id?: string } | null>(null);

  //상품 데이터 (실제로는 API에서 가져와야 함)
  const allProducts: Product[] = Array.from({ length: 5 }).map((_, idx) => ({
    id: (idx + 1).toString(),
    title: `중학생 ${idx + 1}학년 국어`,
    price: 20000 + (idx * 5000),
    author: userProfile?.name || '킹왕짱현범쿤',
    authorId: userProfile?.id?.toString() || 'user123',
    tags: ['중학교', `${idx + 1}학년`, '국어', '기출문제', '2단원'],
  }));

  // id 체크
  const myProducts = allProducts.filter(product => product.authorId === userProfile?.id?.toString());

  // 탭 필터링
  const filteredProducts =
    selectedTab === '전체'
      ? myProducts
      : myProducts.filter((product) => product.tags.includes(selectedTab));

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const [cols, setCols] = useState('grid-cols-1');

  // 선택 모드 토글
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedProducts([]);
  };

  // 개별 상품 선택/해제
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedProducts.length === displayedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(displayedProducts.map(p => p.id));
    }
  };

  // 개별 상품 삭제
  const handleDeleteProduct = (productId: string) => {
    setDeleteTarget({ type: 'single', id: productId });
    setShowDeleteModal(true);
  };

  // 선택된 상품들 삭제
  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    setDeleteTarget({ type: 'multiple' });
    setShowDeleteModal(true);
  };

  // 실제 삭제 실행
  const confirmDelete = () => {
    if (deleteTarget?.type === 'single' && deleteTarget.id) {
      // 실제로는 API 호출
      console.log('상품 삭제:', deleteTarget.id);
      // 임시로 상태에서 제거 (실제로는 API 응답 후 처리)
    } else if (deleteTarget?.type === 'multiple') {
      // 실제로는 API 호출
      console.log('선택된 상품들 삭제:', selectedProducts);
      setSelectedProducts([]);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // 상품 수정 (상세보기로 이동)
  const handleEditProduct = (productId: string) => {
    router.push(`/market/${productId}`);
  };

  // 상품 상세보기
  const handleViewProduct = (productId: string) => {
    router.push(`/market/${productId}`);
  };
  
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
        title="마이마켓"
        variant="market"
        description="나의 마켓 상품을 관리 할 수 있습니다"
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

        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          {isSelectMode ? (
            <>
              <button
                onClick={toggleAllSelection}
                className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                {selectedProducts.length === displayedProducts.length ? '전체 해제' : '전체 선택'}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedProducts.length === 0}
                className="text-sm px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                선택 삭제 ({selectedProducts.length})
              </button>
              <button
                onClick={toggleSelectMode}
                className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                선택 완료
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectMode}
                className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors"
              >
                선택하기
              </button>
              <button
                onClick={() => router.push('/market')}
                className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                돌아가기
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 상품 목록 카드 */}
      <Card className="flex-1 flex flex-col shadow-sm"
      style={{ margin: '2rem'}}>
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
        <CardTitle className="text-base font-medium">
            <span style={{ color: '#0072CE' }}>{myProducts[0]?.author}</span>의 {selectedTab} 상품 목록
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
                  className={`relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow transform hover:scale-[1.02] ${
                    isSelectMode ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  {/* 선택 표시 */}
                  {isSelectMode && (
                    <div 
                      className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                        selectedProducts.includes(product.id)
                          ? 'bg-[#0072CE] border-[#0072CE]'
                          : 'bg-white border-gray-300 hover:border-[#0072CE]'
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      {selectedProducts.includes(product.id) && (
                        <FiCheck className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}

                  {/* 상품 이미지 */}
                  <div 
                    className="bg-gray-100 rounded-md h-70 mb-4 flex items-center justify-center text-gray-400 select-none"
                    onClick={() => !isSelectMode && handleViewProduct(product.id)}
                  >
                    이미지
                  </div>

                  {/* 상품 정보 */}
                  <div onClick={() => !isSelectMode && handleViewProduct(product.id)}>
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

                  {/* 수정 버튼
                  {!isSelectMode && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product.id);
                        }}
                        className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#0072CE] text-white text-sm rounded-md hover:bg-[#005fa3] transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  )} */}
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

      {/* 삭제 확인 모달 */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <FiTrash2 className="w-5 h-5" />
              상품 삭제 확인
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {deleteTarget?.type === 'single' ? (
              <>
                <p className="text-gray-700 mb-2">
                  정말로 이 상품을 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500">
                  삭제된 상품은 복구할 수 없습니다.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-2">
                  선택된 {selectedProducts.length}개의 상품을 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500">
                  삭제된 상품들은 복구할 수 없습니다.
                </p>
              </>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
