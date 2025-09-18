'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiUpload } from 'react-icons/fi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';


type FormData = {
  title: string;
  description: string;
  tags: string;
  price: string;
};

type UploadedImage = {
  url: string;
  file: File;
};

export default function CreateMarketPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    tags: '',
    price: '',
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
  
    let filteredValue = value;
  
    if (name === 'price') {
      filteredValue = value.replace(/[^0-9]/g, '');
      if (filteredValue === '') filteredValue = '0';
  
      const numValue = Number(filteredValue);
  
      if (numValue > 50000) {
        setForm((prev) => ({
          ...prev,
          price: '50000',
        }));
        return;
      }
  
      if (numValue < 0) {
        setForm((prev) => ({
          ...prev,
          price: '0',
        }));
        return;
      }
  
      setForm((prev) => ({
        ...prev,
        price: filteredValue,
      }));
  
      return;
    }
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
  
    const availableSlots = 7 - images.length;
    if (availableSlots <= 0) {
      alert('이미지는 최대 7장까지 업로드할 수 있습니다.');
      return;
    }
  
    const filesToUpload = files.slice(0, availableSlots);
  
    const uploaded = filesToUpload.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
  
    setImages((prev) => [...prev, ...uploaded]);
  
    e.target.value = '';
  };
  

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert('최소 1장 이상의 이미지를 업로드해 주세요.');
      return;
    }
  
    const formattedTags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  
    const payload = {
      ...form,
      tags: formattedTags,
      images: images.map((img) => img.file),
    };
  
    console.log('제출할 데이터:', payload);
  
    alert('상품이 등록되었습니다!');
    router.push('/market/myMarket');
  };
  

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [images]);

  
  return (
    <div className="flex flex-col">
      <PageHeader
        icon={<FiPlus />}
        title="마켓 상품 등록하기"
        variant="market"
        description="마켓에 상품을 등록할 수 있습니다"
      />

      {/* 상단 버튼 */}
      <nav className="flex justify-end items-center mt-6 mb-4 px-8">
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/market/myMarket')}
            className="text-sm px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            돌아가기
          </button>
          <button
            onClick={handleSubmit}
            className="text-sm px-4 py-2 rounded-md bg-[#0072CE] text-white hover:bg-[#005fa3] transition-colors"
          >
            등록하기
          </button>
        </div>
      </nav>

      {/* 메인 카드 */}
      <Card className="m-8 flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-3 px-6 border-b border-gray-100">
          <CardTitle className="text-base font-medium">
            상품 등록
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 이미지 영역 */}
            <div className="flex-1">
              <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 select-none">
                {images[selectedIndex]?.url ? (
                  <img
                    src={images[selectedIndex].url}
                    alt="업로드 이미지"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span>대표 이미지</span>
                )}
              </div>

              {/* 썸네일 */}
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-7 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative h-20 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer border ${
                      selectedIndex === idx
                        ? 'border-[#0072CE]'
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <img
                      src={img.url}
                      alt={`썸네일-${idx}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>

              {/* 이미지 업로드 */}
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

            {/* 상품 정보 입력 */}
            <div className="flex-1">
              {/* 상품명 */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  상품명
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="상품명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                />
              </div>

              {/* 설명 */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  설명
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="상품에 대한 설명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  style={{ height: '246px', resize: 'none' }}
                />
              </div>

              {/* 태그 (Select 컴포넌트 적용) */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    태그
                </label>
                <Select
                    value={form.tags}
                    onValueChange={(value) =>
                    handleChange({ target: { name: "tags", value } })
                    }
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="태그를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="1">중학생</SelectItem>
                    <SelectItem value="2">고등학생</SelectItem>
                    </SelectContent>
                </Select>
                </div>

              {/* 가격 */}
              <div className="mb-4 flex items-center">
                <label className="block mr-3 text-sm font-medium text-gray-700">
                  가격
                </label>
                <input
                  type="number"
                  name="price"
                  min={0}
                  value={form.price}
                  onChange={handleChange}
                  className="px-4 py-2 border border-gray-300 rounded-full text-[#0072CE] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  placeholder="0"
                />
                <span className="ml-2 text-sm text-[#0072CE] font-semibold">
                  원
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
