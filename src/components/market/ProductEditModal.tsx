'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2, FiMove, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    author: string;
    description: string;
    tags: string[];
  };
  onSave: (updatedProduct: any) => void;
}

interface ImageData {
  id: string;
  label: string;
  url: string;
  isMain: boolean;
}

export default function ProductEditModal({ isOpen, onClose, product, onSave }: ProductEditModalProps) {
  const [editData, setEditData] = useState({
    title: product.title,
    price: product.price,
    description: product.description,
    tags: product.tags.join(', '),
  });

  const [images, setImages] = useState<ImageData[]>([
    { id: 'main', label: '메인 이미지', url: '', isMain: true },
    { id: 'sub1', label: '이미지 1', url: '', isMain: false },
    { id: 'sub2', label: '이미지 2', url: '', isMain: false },
    { id: 'sub3', label: '이미지 3', url: '', isMain: false },
    { id: 'sub4', label: '이미지 4', url: '', isMain: false },
    { id: 'sub5', label: '이미지 5', url: '', isMain: false },
    { id: 'sub6', label: '이미지 6', url: '', isMain: false },
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // 모달이 열릴 때 초기 데이터 설정
  useEffect(() => {
    if (isOpen) {
      setEditData({
        title: product.title,
        price: product.price,
        description: product.description,
        tags: product.tags.join(', '),
      });
    }
  }, [isOpen, product]);

  // 입력값 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value
    }));
  };

  // 유효성 검사
  const validateData = () => {
    if (!editData.title.trim()) {
      setValidationMessage('제목을 입력해주세요.');
      return false;
    }
    if (!editData.description.trim()) {
      setValidationMessage('상품 설명을 입력해주세요.');
      return false;
    }
    if (editData.tags.trim() && editData.tags.split(',').some(tag => !tag.trim())) {
      setValidationMessage('태그를 올바르게 입력해주세요.');
      return false;
    }
    if (editData.price <= 0) {
      setValidationMessage('가격을 올바르게 입력해주세요.');
      return false;
    }
    if (!images.some(img => img.url)) {
      setValidationMessage('최소 하나의 이미지를 업로드해주세요.');
      return false;
    }
    return true;
  };

  // 저장 처리
  const handleSave = () => {
    if (!validateData()) {
      setShowValidationModal(true);
      return;
    }

    const updatedProduct = {
      ...product,
      title: editData.title,
      price: editData.price,
      description: editData.description,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      images: images.filter(img => img.url)
    };

    onSave(updatedProduct);
    onClose();
  };

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiMove className="w-5 h-5" />
              상품 수정
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 이미지 섹션 */}
            <div className="flex-1">
              <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 select-none relative">
                {images[selectedIndex]?.url ? (
                  <img 
                    src={images[selectedIndex].url} 
                    alt={images[selectedIndex].label}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span>{selectedIndex === 0 ? '메인 이미지' : images[selectedIndex]?.label}</span>
                )}
                
                {/* 이미지 액션 버튼들 */}
                {images[selectedIndex]?.url && (
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
                    } cursor-move`}
                    onClick={() => setSelectedIndex(idx)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
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
                    
                    {/* 이미지 액션 버튼들 */}
                    {img.url && (
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
              
              {/* 이미지 업로드 버튼 */}
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
            </div>

            {/* 상품 정보 섹션 */}
            <div className="flex-1">
              <div className="space-y-4">
                {/* 작성자 */}
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-gray-700">{product.author}</p>
                </div>
                
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                    placeholder="상품 제목을 입력하세요"
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상품 설명</label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                  />
                </div>

                {/* 태그 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">태그 (선택사항)</label>
                  <input
                    type="text"
                    name="tags"
                    value={editData.tags}
                    onChange={handleInputChange}
                    placeholder="태그를 쉼표로 구분하여 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">예: 중학교, 1학년, 국어, 기출 문제</p>
                </div>

                {/* 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="price"
                      value={editData.price}
                      onChange={handleInputChange}
                      className="px-4 py-2 border border-gray-300 rounded-full text-[#0072CE] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                      placeholder="가격을 입력하세요"
                    />
                    <span className="text-[#0072CE] text-sm font-semibold">원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors"
            >
              저장
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 유효성 검사 모달 */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <FiAlertCircle className="w-5 h-5" />
              수정 불가
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              {validationMessage}
            </p>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowValidationModal(false)}
              className="px-4 py-2 bg-[#0072CE] text-white rounded-md hover:bg-[#005fa3] transition-colors"
            >
              확인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
