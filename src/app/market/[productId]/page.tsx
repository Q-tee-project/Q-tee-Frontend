'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { FiShoppingCart, FiArrowLeft, FiEdit, FiSave, FiX, FiTrash2, FiUpload, FiMove, FiPlus, FiEye } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import ProductEditModal from '@/components/market/ProductEditModal';
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

  // 임시 상품 데이터
  const [product, setProduct] = useState({
    id: Array.isArray(productId) ? productId[0] : productId || '',
    title: '중학생 1학년 국어 1단원, 2단원',
    price: 20000,
    author: 'userName',
    authorId: 'user123',
    description:
      '상세 설명 텍스트 상세 설명 텍스트 상세 설명 텍스트 상세 설명 텍스트 상세 설명 텍스트 상세 설명 텍스트 상세 설명 텍스트 상세 설명',
    tags: ['중학교', '1학년', '국어', '기출 문제', '2단원'],
  });

  // 편집 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: product.title,
    price: product.price,
    description: product.description,
    tags: product.tags.join(', '),
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 등록자와 로그인 사용자 비교
  const isOwner = userProfile?.id?.toString() === product.authorId;

  // 이미지 관리 상태
  const [images, setImages] = useState([
    { id: 'main', label: '메인 이미지', url: '', isMain: true },
    { id: 'sub1', label: '이미지 1', url: '', isMain: false },
    { id: 'sub2', label: '이미지 2', url: '', isMain: false },
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 편집 모드 시작
  const handleStartEdit = () => {
    setEditData({
      title: product.title,
      price: product.price,
      description: product.description,
      tags: product.tags.join(', '),
    });
    setIsEditing(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: product.title,
      price: product.price,
      description: product.description,
      tags: product.tags.join(', '),
    });
  };

  // 편집 저장
  const handleSaveEdit = () => {
    // 실제로는 API 호출
    setProduct(prev => ({
      ...prev,
      title: editData.title,
      price: editData.price,
      description: editData.description,
      tags: editData.tags.split(', ').filter(tag => tag.trim()),
    }));
    setIsEditing(false);
    alert('상품이 성공적으로 수정되었습니다.');
  };

  // 모달에서 상품 수정 저장
  const handleModalSave = (updatedProduct: any) => {
    setProduct(prev => ({
      ...prev,
      ...updatedProduct,
      id: prev.id, // 기존 id 유지
      authorId: prev.authorId, // 기존 authorId 유지
    }));
    alert('상품이 성공적으로 수정되었습니다.');
  };

  // 입력값 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value
    }));
  };

  // 삭제 확인
  const handleDelete = () => {
    // 실제로는 API 호출
    console.log('상품 삭제:', productId);
    alert('상품이 삭제되었습니다.');
    router.push('/market');
  };

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // 빈 슬롯 찾기
            const emptyIndex = images.findIndex(img => !img.url);
            if (emptyIndex !== -1) {
              setImages(prev => prev.map((img, idx) => 
                idx === emptyIndex 
                  ? { ...img, url: e.target!.result as string }
                  : img
              ));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 이미지 삭제
  const handleImageDelete = (index: number) => {
    setImages(prev => prev.map((img, idx) => 
      idx === index 
        ? { ...img, url: '' }
        : img
    ));
    if (selectedIndex === index) {
      setSelectedIndex(0);
    }
  };

  // 메인 이미지 설정
  const handleSetMainImage = (index: number) => {
    setImages(prev => prev.map((img, idx) => ({
      ...img,
      isMain: idx === index
    })));
    setSelectedIndex(index);
  };

  // 이미지 순서 변경 (드래그 앤 드롭)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<FiShoppingCart />}
        title="마켓플레이스"
        variant="market"
        description="상품의 상세 이미를 확인하고 구매 할 수 있습니다"
      />
      <Card className="mx-8 mb-8 shadow-sm">
      <CardHeader className="py-3 px-6 border-b border-gray-100 flex items-center justify-between">
        <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center shadow-sm"
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  저장
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                  상세보기
                </button>
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                  편집
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
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
            
            {/* 메인 이미지 */}
            <div className="flex-1">
              <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 select-none relative">
                {images[selectedIndex]?.url ? (
                  <img 
                    src={images[selectedIndex].url} 
                    alt={images[selectedIndex].label}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span>{selectedIndex === 0 ? '메인 이미지' : images[selectedIndex]?.label}</span>
                )}
                
                {/* 편집 모드에서 이미지 액션 버튼들 */}
                {isEditing && images[selectedIndex]?.url && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleSetMainImage(selectedIndex)}
                      className="w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center hover:bg-[#005fa3] transition-colors"
                      title="메인 이미지로 설정"
                    >
                      <FiMove className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleImageDelete(selectedIndex)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="이미지 삭제"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-7 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative h-20 rounded-md flex items-center justify-center text-gray-400 select-none bg-gray-100 border ${
                      selectedIndex === idx ? 'border-[#0072CE]' : 'border-transparent'
                    } ${isEditing ? 'cursor-move' : 'cursor-pointer'}`}
                    onClick={() => !isEditing && setSelectedIndex(idx)}
                    draggable={isEditing}
                    onDragStart={(e) => isEditing && handleDragStart(e, idx)}
                    onDragOver={isEditing ? handleDragOver : undefined}
                    onDrop={isEditing ? (e) => handleDrop(e, idx) : undefined}
                  >
                    {img.url ? (
                      <img 
                        src={img.url} 
                        alt={img.label}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span>{idx === 0 ? '메인' : idx}</span>
                    )}
                    
                    {/* 편집 모드에서 이미지 액션 버튼들 */}
                    {isEditing && img.url && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetMainImage(idx);
                            }}
                            className="w-6 h-6 bg-[#0072CE] text-white rounded-full flex items-center justify-center hover:bg-[#005fa3] transition-colors"
                            title="메인으로 설정"
                          >
                            <FiMove className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageDelete(idx);
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="삭제"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 편집 모드에서 이미지 업로드 버튼 */}
              {isEditing && (
                <div className="mt-4">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors cursor-pointer"
                  >
                    <FiUpload className="w-4 h-4" />
                    이미지 업로드
                  </label>
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* <div className="w-12 h-12 rounded-full bg-gray-200" /> */}
                <p className="font-semibold text-gray-700">{product.author}</p>
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
                />
              ) : (
                <p className="text-sm text-gray-600 leading-6 mb-4">
                  {product.description}
                </p>
              )}

              {/* 태그 */}
              {isEditing ? (
                <div className="mb-4">
                  <input
                    type="text"
                    name="tags"
                    value={editData.tags}
                    onChange={handleInputChange}
                    placeholder="태그를 쉼표로 구분하여 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="text-[#9E9E9E] text-xs select-none">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 가격 */}
              {isEditing ? (
                <div className="mb-4">
                  <input
                    type="number"
                    name="price"
                    value={editData.price}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-full text-[#0072CE] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                    placeholder="가격을 입력하세요"
                  />
                  <span className="ml-2 text-[#0072CE] text-sm font-semibold">원</span>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/market/${productId}/buy`)}
                  className="px-4 py-2 rounded-full bg-[#EFEFEF] text-[#0072CE] text-sm font-semibold hover:bg-gray-200"
                >
                  ₩{product.price.toLocaleString()}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상품 수정 모달 */}
      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={product}
        onSave={handleModalSave}
      />

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
            <p className="text-gray-700 mb-2">
              정말로 이 상품을 삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-500">
              삭제된 상품은 복구할 수 없습니다.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
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
