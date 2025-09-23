'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { FaPlus, FaEdit } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProducts, deleteProduct, updateProduct, getProduct, MarketProduct, MarketProductDetail } from '@/services/marketApi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// MarketProductDetail을 Product로 사용
type Product = MarketProductDetail;

const TABS = ['전체', '국어', '영어', '수학'];

export default function MyMarketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [loading, setLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cols, setCols] = useState('grid-cols-1');

  // 수정 모달 상태
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // 상품 데이터 로드 (개발 환경에서는 mock 데이터 사용)
  const loadProducts = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    
    // 개발 환경에서는 API 서버가 없을 가능성이 높으므로 mock 데이터 사용
    console.log('개발 환경: mock 데이터 사용');
    
    // Mock 데이터 생성
    const mockProducts: Product[] = Array.from({ length: 5 }).map((_, idx) => ({
      id: idx + 1,
      title: `중학생 ${idx + 1}학년 국어`,
      description: `중학교 ${idx + 1}학년 국어 기출문제 모음집입니다. 각 단원별로 체계적으로 정리된 문제들로 구성되어 있어 효과적인 학습이 가능합니다.`,
      price: 20000 + idx * 5000,
      seller_name: userProfile?.name || '킹왕짱현범쿤',
      seller_id: userProfile?.id || 1,
      subject_type: '국어',
      tags: ['중학교', `${idx + 1}학년`, '국어', '기출문제', '2단원'],
      main_image: undefined,
      view_count: 0,
      purchase_count: 0,
      created_at: new Date().toISOString(),
      original_service: 'korean',
      original_worksheet_id: idx + 1,
      status: 'active',
      images: [],
      updated_at: new Date().toISOString(),
    }));
    
    // 로딩 시뮬레이션
    setTimeout(() => {
      setAllProducts(mockProducts);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadProducts();
  }, [userProfile]);

  // 내 상품 필터링 (seller_id로 비교)
  const myProducts = allProducts.filter(product => product.seller_id === userProfile?.id);

  const filteredProducts =
    selectedTab === '전체'
      ? myProducts
      : myProducts.filter((product) => product.subject_type === selectedTab);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts;



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

  const handleViewProduct = (productId: string) => {
    router.push(`/market/${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteTarget(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    // 로컬에서 삭제
    setAllProducts(prev => prev.filter(product => product.id.toString() !== deleteTarget));
    
    setDeleteTarget(null);
    setShowDeleteModal(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditTarget(product);
    setEditTitle(product.title);
    setEditDescription(product.description || '');
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    if (!editTarget) return;
    
    // 로컬에서 수정
    setAllProducts(prev => prev.map(product => 
      product.id === editTarget.id 
        ? { ...product, title: editTitle, description: editDescription }
        : product
    ));
    
    setEditTarget(null);
    setShowEditModal(false);
    setEditTitle('');
    setEditDescription('');
  };

  const cancelEdit = () => {
    setEditTarget(null);
    setShowEditModal(false);
    setEditTitle('');
    setEditDescription('');
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<FiShoppingCart />}
        title="마이마켓"
        variant="market"
        description="나의 마켓 상품을 관리 할 수 있습니다"
      />

      {/* 탭 & 버튼 */}
      <nav className="flex justify-between items-center mt-6 mb-4 px-8">
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

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/market')}
            className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
          >
            돌아가기
          </button>
          <button
            onClick={() => router.push('/market/create')}
            className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
          >
            <FaPlus />
          </button>
        </div>
      </nav>

      {/* 상품 카드 */}
      <Card className="flex-1 flex flex-col shadow-sm" style={{ margin: '2rem' }}>
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">

          <CardTitle className="text-base font-medium">
            <span style={{ color: '#0072CE' }}>{myProducts[0]?.seller_name}</span> 님의 {selectedTab} 상품 목록
          </CardTitle>
          <span className="text-sm font-normal" style={{ color: '#C8C8C8' }}>

            총 {filteredProducts.length}건
          </span>
        </CardHeader>
        <CardContent>
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
                  className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow transform hover:scale-[1.02] cursor-pointer"
                >


                  {/* 이미지 */}
                  <div
                    className="bg-gray-100 rounded-md h-70 mb-4 flex items-center justify-center text-gray-400 select-none"
                    onClick={() => handleViewProduct(product.id.toString())}
                  >
                    이미지
                  </div>


                  {/* 정보 */}
                  <div onClick={() => handleViewProduct(product.id.toString())}>
                    <p className="text-gray-400 font-semibold text-sm mb-1 truncate">{product.seller_name}</p>

                    <p className="mb-2 truncate">{product.title}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.tags?.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[#9E9E9E] text-xs select-none"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="w-fit px-3 py-1 rounded-full bg-[#EFEFEF] text-[#0072CE] text-sm font-semibold">
                      ₩{Number(product.price).toLocaleString()}
                    </div>
                    {/* 하단 버튼 */}
                    <div className="mt-4 flex justify-end gap-2">
                      {/* 수정 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE]"
                        aria-label="수정"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id.toString());
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        aria-label="삭제"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
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
            <p className="text-gray-700 mb-2">정말로 이 상품을 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500">삭제된 상품은 복구할 수 없습니다.</p>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
            >
              취소
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
              삭제
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0072CE]">
              <FaEdit className="w-5 h-5" />
              상품 수정
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* 상품 제목 */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                상품 제목
              </label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                placeholder="상품 제목을 입력하세요"
              />
            </div>

            {/* 상품 상세 설명 */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                상품 상세 설명
              </label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent resize-none"
                placeholder="상품 상세 설명을 입력하세요"
              />
            </div>


            </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
            >
              취소
            </button>
            <button
              onClick={confirmEdit}
              disabled={!editTitle.trim()}
              className="px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
            >
              수정 완료
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
