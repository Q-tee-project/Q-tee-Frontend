'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { productId } = useParams();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const product = {
    id: productId,
    title: '중학생 1학년 국어 1단원, 2단원',
    price: 20000,
    author: 'userName',
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    orderId: `QT-${Math.floor(Math.random() * 1000000)}`,
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
              결제가 완료되었습니다
            </motion.h1>
            <motion.p
              className="text-sm text-gray-500 mt-1"
              variants={itemVariants}
            >
              영수증을 확인하세요
            </motion.p>
          </CardHeader>

          {/* 본문 */}
          <CardContent className="px-6 py-6 space-y-4 text-sm text-gray-700">
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">주문번호</span>
              <span className="font-medium">{product.orderId}</span>
            </motion.div>
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">결제일자</span>
              <span>{product.date}</span>
            </motion.div>
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">상품명</span>
              <span className="font-medium">{product.title}</span>
            </motion.div>
            <motion.div className="flex justify-between" variants={itemVariants}>
              <span className="text-gray-500">판매자</span>
              <span>{product.author}</span>
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
                ₩{product.price.toLocaleString()}
              </motion.span>
            </motion.div>
          </CardContent>

          {/* 버튼 */}
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
              다른 상품 구경하기
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.main>
  );
}
