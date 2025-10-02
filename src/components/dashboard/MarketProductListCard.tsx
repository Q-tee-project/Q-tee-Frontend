'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Info, X, Star } from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';

interface MarketProduct {
  id: number;
  title: string;
  subject_type: string;
  satisfaction_rate: number;
  price: number;
  purchase_count: number;
  created_at: string;
}

interface MarketProductListCardProps {
  marketProducts: MarketProduct[];
  selectedProducts: number[];
  handleProductSelect: (productId: number) => void;
  isLoadingProducts: boolean;
}

const MarketProductListCard = ({
  marketProducts,
  selectedProducts,
  handleProductSelect,
  isLoadingProducts,
}: MarketProductListCardProps) => {
  const productColors = React.useMemo(() => ['#9674CF', '#18BBCB'], []);

  return (
    <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-1 min-h-[620px]">
      <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Package className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-base font-medium">등록 상품 관리</h2>
          <div className="relative ml-2 inline-block">
            <div className="group w-4 h-4">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                등록된 상품 목록과
                <br />
                판매 현황을 확인할 수 있습니다
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">총 {marketProducts.length}개</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Selected Products */}
        <div className="mb-4 px-6 pt-6 pb-2 bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg h-52">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-blue-800">
                선택된 상품 ({selectedProducts.length}/2개)
              </h4>
              <div className="relative">
                <div className="group w-4 h-4">
                  <Info className="h-4 w-4 text-blue-600 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    최대 2개의 상품을 선택하여
                    <br />
                    수익을 비교할 수 있습니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                  </div>
                </div>
              </div>
            </div>
            {selectedProducts.length > 0 && (
              <button
                onClick={() => handleProductSelect(-1)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 rounded-md"
                title="모든 상품 선택 해제"
              >
                <X className="h-3 w-3" />
                전체 제거
              </button>
            )}
          </div>
          {selectedProducts.length > 0 ? (
            <div className="space-y-1.5 overflow-hidden" style={{ maxHeight: 'calc(100% - 60px)' }}>
              <AnimatePresence>
                {selectedProducts.map((productId, index) => {
                  const product = marketProducts.find((p) => p.id === productId);
                  if (!product) return null;
                  const color = productColors[index % productColors.length];
                  return (
                    <motion.div
                      key={product.id}
                      data-product-id={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className="group p-2.5 rounded-lg border transition-all backdrop-blur-sm cursor-pointer flex items-center gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.1,
                        ease: 'easeOut',
                      }}
                      style={{
                        backgroundColor: `${color}20`,
                        borderColor: color,
                        boxShadow: `0 4px 6px -1px ${color}20, 0 2px 4px -1px ${color}10`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${color}20`;
                        e.currentTarget.style.borderColor = color;
                      }}
                    >
                      <div className="relative w-3 h-3 flex-shrink-0">
                        <div
                          className="w-3 h-3 rounded-sm group-hover:opacity-0 transition-opacity"
                          style={{ backgroundColor: color }}
                        ></div>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <X className="w-3 h-3 text-red-500" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 flex-1 truncate">{product.title}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0">{product.subject_type}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ height: 'calc(100% - 60px)' }}>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">선택된 상품이 없습니다</p>
                <p className="text-xs text-gray-400 mb-2">차트에는 최근 등록된 상품 정보가 표시됩니다</p>
                <p className="text-xs text-gray-400">아래 목록에서 상품을 선택해주세요</p>
              </div>
            </div>
          )}
        </div>

        {/* All Products List */}
        <div className="h-72 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            <h4 className="text-sm font-medium text-gray-700 p-4 pb-3 bg-white border-b border-gray-100 sticky top-0 z-10">
              전체 상품 목록
            </h4>
            <div className="flex-1 p-4 pt-3 overflow-y-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">상품 목록 로딩 중...</p>
                  </div>
                </div>
              ) : marketProducts.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">등록된 상품이 없습니다</p>
                    <p className="text-xs text-gray-400 mt-1">마켓에서 상품을 등록해보세요</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {marketProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product.id);
                    const canSelect = !isSelected && selectedProducts.length < 2;

                    return (
                      <div
                        key={product.id}
                        onClick={() => (canSelect || isSelected) ? handleProductSelect(product.id) : undefined}
                        className={`p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-gray-50 border-gray-300 cursor-pointer'
                            : canSelect
                            ? 'bg-white border-gray-200 cursor-pointer hover:bg-gray-50'
                            : 'bg-white border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 flex items-start gap-2">
                            {isSelected && (
                              <FaRegCircleCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-medium truncate ${
                                isSelected ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                {product.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                  {product.subject_type}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs text-gray-600">{product.satisfaction_rate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className={`text-sm font-semibold ${
                            isSelected ? 'text-gray-400' : 'text-[#0072CE]'
                          }`}>
                            {product.price.toLocaleString()}P
                          </div>
                          <div className="text-xs text-gray-500">
                            판매 {product.purchase_count}개
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketProductListCard;