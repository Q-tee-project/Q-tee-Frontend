'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useEffect, Suspense } from 'react';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const success = searchParams?.get('success') === 'true';
  const productId = searchParams?.get('productId');
  const title = searchParams?.get('title');
  const price = searchParams?.get('price');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const orderInfo = {
    productId,
    title: title ? decodeURIComponent(title) : '상품명 없음',
    price: price ? parseInt(price) : 0,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    orderId: `QT-${Date.now()}`,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 14 }
    }
  };

  const checkIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 250, damping: 12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  if (!success) {
    return (
      <motion.main
        className="flex justify-center items-start h-screen bg-gray-100 px-4 pt-20 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="w-full max-w-2xl">
          <Card className="w-full shadow-xl rounded-2xl overflow-hidden border border-red-300 bg-white">
            <CardHeader className="text-center py-6">
              <motion.div variants={checkIconVariants}>
                <FiXCircle className="mx-auto text-red-500 w-14 h-14 mb-3 drop-shadow" />
              </motion.div>
              <motion.h1
                className="text-2xl font-extrabold text-gray-800 tracking-tight"
                variants={itemVariants}
              >
                결제에 실패했습니다
              </motion.h1>
              <motion.p
                className="text-sm text-gray-500 mt-1"
                variants={itemVariants}
              >
                다시 시도해주세요
              </motion.p>
            </CardHeader>

            <div className="px-6 pb-6">
              <motion.button
                onClick={() => router.push('/market')}
                className="w-full py-3 rounded-xl font-semibold bg-[#0072CE] text-white shadow-md hover:brightness-110 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                마켓으로 돌아가기
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </motion.main>
    );
  }

  return (
    <motion.main
      className="flex justify-center items-start h-screen bg-gray-100 px-4 pt-20 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardVariants} className="w-full max-w-2xl">
        <Card className="w-full shadow-xl rounded-2xl overflow-hidden border border-dashed border-gray-300 bg-white relative">
          {/* 절취선 효과 */}
          <div className="absolute top-0 left-0 h-full border-r border-dashed border-gray-300"></div>
          <div className="absolute top-0 right-0 h-full border-l border-dashed border-gray-300"></div>

          {/* 헤더 */}
          <CardHeader className="text-center py-6 border-b border-dashed">
            <motion.div variants={checkIconVariants}>
              <FiCheckCircle className="mx-auto text-green-500 w-14 h-14 mb-3 drop-shadow" />
            </motion.div>
            <motion.h1
              className="text-2xl font-extrabold text-gray-800 tracking-tight"
              variants={itemVariants}
            >
              구매가 완료되었습니다!
            </motion.h1>
            <motion.p
              className="text-sm text-gray-500 mt-1"
              variants={itemVariants}
            >
              구매하신 상품을 확인하세요
            </motion.p>
          </CardHeader>

          {/* 본문 */}
          <CardContent className="px-6 py-6 space-y-4 text-sm text-gray-700">
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">주문번호</span>
              <span className="font-medium">{orderInfo.orderId}</span>
            </motion.div>
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">구매일자</span>
              <span>{orderInfo.date}</span>
            </motion.div>
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">상품명</span>
              <span className="font-medium">{orderInfo.title}</span>
            </motion.div>
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">결제방법</span>
              <span>Q-T 포인트</span>
            </motion.div>

            <motion.hr className="border-dashed my-4" variants={itemVariants} />

            <motion.div
              className="flex justify-between text-base font-bold"
              variants={itemVariants}
            >
              <span>총 결제 금액</span>
              <motion.span
                className="text-[#0072CE] text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                {orderInfo.price.toLocaleString()}P
              </motion.span>
            </motion.div>

            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
              variants={itemVariants}
            >
              <p className="text-sm text-blue-800">
                ✅ 구매하신 상품은 <strong>구매목록</strong>에서 확인하실 수 있습니다.
              </p>
              <p className="text-sm text-blue-800 mt-1">
                ✅ 디지털 상품 특성상 구매 후 환불이 불가합니다.
              </p>
            </motion.div>
          </CardContent>

          {/* 버튼 */}
          <div className="px-6 pb-6 space-y-3">
            <motion.button
              onClick={() => router.push('/market/purchases')}
              className="w-full py-3 rounded-xl font-semibold bg-[#0072CE] text-white shadow-md hover:brightness-110 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              구매목록 확인하기
            </motion.button>
            <motion.button
              onClick={() => router.push('/market')}
              className="w-full py-2 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              다른 상품 구경하기
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}