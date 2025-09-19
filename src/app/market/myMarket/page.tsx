'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { FaPlus, FaEdit } from "react-icons/fa";
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

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedTab, setSelectedTab] = useState('전체');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cols, setCols] = useState('grid-cols-1');

  useEffect(() => {
    if (!userProfile) return;
    const initialProducts: Product[] = Array.from({ length: 30 }).map((_, idx) => ({
      id: (idx + 1).toString(),
      title: `중학생 ${idx + 1}학년 국어`,
      price: 20000 + idx * 5000,
      author: userProfile?.name || '킹왕짱현범쿤',
      authorId: userProfile?.id?.toString() || 'user123',
      tags: ['중학교', `${idx + 1}학년`, '국어', '기출문제', '2단원'],
    }));
    setAllProducts(initialProducts);
  }, [userProfile]);

  const myProducts = allProducts.filter(product => product.authorId === userProfile?.id?.toString());

  const filteredProducts =
    selectedTab === '전체'
      ? myProducts
      : myProducts.filter((product) => product.tags.includes(selectedTab));

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
    setAllProducts(prev => prev.filter(product => product.id !== deleteTarget));
    setDeleteTarget(null);
    setShowDeleteModal(false);
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
            <span style={{ color: '#0072CE' }}>{myProducts[0]?.author}</span> 님의 {selectedTab} 상품 목록
          </CardTitle>
          <span className="text-sm font-normal" style={{ color: '#C8C8C8' }}>
            총 {filteredProducts.length}건
          </span>
        </CardHeader>
        <CardContent>
          <div className={`grid ${cols} gap-6`} style={{ minHeight: '400px' }}>
            {displayedProducts.length === 0 ? (
              <div className="col-span-full flex justify-center items-center text-gray-500">
                등록된 상품이 없습니다.
              </div>
            ) : (
              displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow transform hover:scale-[1.02] cursor-pointer"
                >


                  {/* 이미지 */}
                  <div
                    className="bg-gray-100 rounded-md h-70 mb-4 flex items-center justify-center text-gray-400 select-none"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    이미지
                  </div>

                  {/* 정보 */}
                  <div onClick={() => handleViewProduct(product.id)}>
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
                    {/* 하단 버튼 */}
                    <div className="mt-4 flex justify-end gap-2">
                      {/* 수정 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/market/edit/${product.id}`);
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
                          handleDeleteProduct(product.id);
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
    </div>
  );
}
