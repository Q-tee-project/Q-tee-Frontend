'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProduct,
  updateProduct,
  deleteProduct,
  MarketProductDetail,
  MarketProductUpdate,
} from '@/services/marketApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();

  const [product, setProduct] = useState<MarketProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 편집 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<MarketProductUpdate>({
    title: '',
    description: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 등록자와 로그인 사용자 비교
  const isOwner = userProfile?.id === product?.seller_id;

  // 상품 데이터 로드
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(Number(productId));
        setProduct(data);
      } catch (error) {
        console.error('상품 로드 실패:', error);
        setError('상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // 편집 모드 시작
  const handleStartEdit = () => {
    if (!product) return;
    setEditData({
      title: product.title,
      description: product.description || '',
    });
    setIsEditing(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: '',
      description: '',
    });
  };

  // 편집 저장
  const handleSaveEdit = async () => {
    if (!product) return;

    setUpdating(true);
    try {
      const updatedProduct = await updateProduct(product.id, editData);
      setProduct(updatedProduct);
      setIsEditing(false);
      alert('상품이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert('상품 수정에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  // 입력값 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 삭제 확인
  const handleDelete = async () => {
    if (!product) return;

    setDeleting(true);
    try {
      await deleteProduct(product.id);
      alert('상품이 삭제되었습니다.');
      router.push('/market');
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <PageHeader
          icon={<FiShoppingCart />}
          title="마켓플레이스"
          variant="market"
          description="상품의 상세 이미지를 확인하고 구매할 수 있습니다"
        />
        <Card className="flex-1 flex flex-col shadow-sm">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <PageHeader
          icon={<FiShoppingCart />}
          title="마켓플레이스"
          variant="market"
          description="상품의 상세 이미지를 확인하고 구매할 수 있습니다"
        />
        <Card className="flex-1 flex flex-col shadow-sm">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="text-gray-500 mb-4">{error || '상품을 찾을 수 없습니다.'}</div>
              <button
                onClick={() => router.push('/market')}
                className="px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors"
              >
                마켓으로 돌아가기
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<FiShoppingCart />}
        title="마켓플레이스"
        variant="market"
        description="상품의 상세 이미지를 확인하고 구매할 수 있습니다"
      />
      <Card className="flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-3 px-6 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="뒤로가기"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          {/* 액션 버튼들 (본인 상품인 경우) */}
          {isOwner && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    {updating ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    편집
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    삭제
                  </button>
                </>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 상품 이미지 - 텍스트 렌더링 */}
            <div className="flex-1">
              <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center text-gray-700 select-none border border-gray-200 p-6">
                <div className="text-center space-y-6">
                  <div className="text-4xl font-bold text-[#0072CE]">{product.subject_type}</div>
                  <div className="text-2xl font-semibold">
                    {product.school_level} {product.grade}학년
                  </div>
                  <div className="text-lg text-gray-600 mt-6 line-clamp-3 leading-relaxed px-6">
                    {product.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-4">문제 {product.problem_count}개</div>
                </div>
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push(`/market/author/${product.seller_name}`)}
                  className="font-semibold text-gray-700 hover:text-[#0072CE] transition-colors"
                >
                  {product.seller_name}
                </button>
              </div>

              {/* 상품 제목 */}
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleInputChange}
                  className="w-full text-xl font-semibold mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                />
              ) : (
                <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              )}

              {/* 상품 설명 */}
              {isEditing ? (
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full text-sm text-gray-600 leading-6 mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                  placeholder="상품 설명을 입력하세요"
                />
              ) : (
                <p className="text-sm text-gray-600 leading-6 mb-4">
                  {product.description || '설명이 없습니다.'}
                </p>
              )}

              {/* 상품 정보 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[#9E9E9E] text-xs select-none">#{product.subject_type}</span>
                <span className="text-[#9E9E9E] text-xs select-none">#{product.school_level}</span>
                <span className="text-[#9E9E9E] text-xs select-none">#{product.grade}학년</span>
                <span className="text-[#9E9E9E] text-xs select-none">
                  #{product.problem_count}문제
                </span>
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="text-[#9E9E9E] text-xs select-none">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 기본 정보 */}
              <div className="text-sm text-gray-500 mb-4">
                <div>워크시트: {product.worksheet_title}</div>
                <div>
                  조회 {product.view_count}회 • 판매 {product.purchase_count}건
                </div>
                <div>만족도 {product.satisfaction_rate}%</div>
              </div>

              {/* 가격 및 구매 버튼 */}
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-[#0072CE]">
                  {product.price.toLocaleString()}P
                </div>
                {!isOwner && (
                  <button
                    onClick={() => router.push(`/market/${productId}/buy`)}
                    className="px-6 py-2 bg-[#0072CE] text-white rounded-lg hover:bg-[#005fa3] transition-colors font-medium"
                  >
                    구매하기
                  </button>
                )}
              </div>
            </div>
          </div>
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

          <DialogFooter className="flex flex-col items-center gap-4 mt-8">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072CE] focus-visible:ring-offset-2"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
