'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDropright } from 'react-icons/io';
import { RxDashboard } from 'react-icons/rx';
import { MdOutlineEmail } from 'react-icons/md';
import { FiClipboard, FiEdit, FiUsers, FiShoppingCart, FiSun, FiBook, FiHome, FiLogOut } from 'react-icons/fi';
import { CiDark } from 'react-icons/ci';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { userType, logout } = useAuth();

  // Teacher 메뉴
  const teacherMenuItems = [
    { icon: <RxDashboard />, text: '대시보드', path: '/teacher' },
    { icon: <MdOutlineEmail />, text: '메일', path: '/message' },
    { icon: <FiClipboard />, text: '문제함', path: '/question/bank' },
    { icon: <FiEdit />, text: '문제 생성', path: '/question/create' },
    { icon: <FiUsers />, text: '클래스 관리', path: '/class/create' },
    { icon: <FiShoppingCart />, text: '마켓플레이스', path: '/market' },
  ];

  // Student 메뉴
  const studentMenuItems = [
    { icon: <RxDashboard />, text: '대시보드', path: '/student' },
    { icon: <MdOutlineEmail />, text: '메일', path: '/message' },
    { icon: <FiBook />, text: '과제 풀이', path: '/test' },
    { icon: <FiHome />, text: '내 클래스', path: '/class' },
  ];

  // 하단 메뉴 (공통)
  const bottomMenuItems = [
    { 
      icon: isDarkMode ? <FiSun /> : <CiDark />, 
      text: isDarkMode ? '라이트모드' : '다크모드', 
      isToggle: true 
    },
    { icon: <FaUserCircle />, text: '프로필', isProfile: true },
    { icon: <FiLogOut />, text: '로그아웃', isLogout: true },
  ];

  const menuItems = userType === 'teacher' ? teacherMenuItems : studentMenuItems;

  // 메뉴 아이템이 활성화 상태인지 확인하는 함수
  const isActiveMenuItem = (item: any) => {
    if (!item.path) return false;
    if (item.path === '/' && pathname === '/') return true;
    if (item.path !== '/' && pathname.startsWith(item.path)) return true;
    return false;
  };

  return (
    <motion.div
      className="bg-gray-900 flex flex-col border-r border-gray-700 flex-shrink-0 fixed left-0 top-0 z-40"
      animate={{ width: isOpen ? '240px' : '60px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ height: '100vh', justifyContent: 'space-between', minWidth: isOpen ? '240px' : '60px' }}
    >
      {/* 상단 영역 */}
      <div className="p-2.5 flex flex-col gap-3">
        {/* 로고 + 사이드바 토글 */}
        <div className={`flex items-center transition-colors hover:bg-gray-800 rounded-md ${isOpen ? 'justify-between' : 'justify-center'}`} style={{ padding: '10px' }}>
          {isOpen ? (
            <>
              {/* 열린 상태: 로고 + 닫기 버튼 */}
              <Link href="/" aria-label="홈으로 이동">
                <Image src="/logo.svg" alt="Q-Tee 로고" width={20} height={20} priority />
              </Link>
              <motion.button
                onClick={() => {
                  setIsOpen(false);
                  onToggle?.(false);
                }}
                className="flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-800 transition-colors p-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IoIosArrowDropright className="text-white w-5 h-5 rotate-180" />
              </motion.button>
            </>
          ) : (
            /* 닫힌 상태: 호버 시 토글 아이콘 */
            <div 
              className="cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                onToggle?.(true);
              }}
            >
              <div className="group relative">
                <Link href="/" aria-label="홈으로 이동">
                  <Image 
                    src="/logo.svg" 
                    alt="Q-Tee 로고" 
                    width={20} 
                    height={20} 
                    priority 
                    className="group-hover:opacity-0 transition-opacity duration-200"
                  />
                </Link>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <IoIosArrowDropright className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-b border-gray-700" />

        {/* Main Menu Items */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item, index) => {
            const isActive = isActiveMenuItem(item);
            return (
          <React.Fragment key={index}>
            <motion.div
              className={`flex items-center gap-4 rounded-md cursor-pointer transition-colors relative p-2.5 ${
                isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              onClick={() => {
                if (item.path) {
                  router.push(item.path);
                }
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: 'easeOut',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center flex-shrink-0">
                <span className="text-white text-6 flex items-center justify-center">
                  {React.cloneElement(item.icon, {
                    className: "w-5 h-5 text-white"
                  })}
                </span>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    className="text-sm text-white whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                  >
                    {item.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 구분선들 */}
            {index === 1 && (
              <motion.div
                className="border-b border-gray-700"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              />
            )}
            {userType === 'teacher' && index === 5 && (
              <motion.div
                className="border-b border-gray-700"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              />
            )}
          </React.Fragment>
          );
          })}
        </div>
      </div>

      {/* 하단 영역 - 다크모드와 프로필 */}
      <div className="p-2.5 flex flex-col gap-3">
        {/* 구분선 */}
        <div className="border-b border-gray-700" />
        
        {bottomMenuItems.map((item, index) => {
          const isActive = item.isProfile ? pathname === '/profile' : false;
          return (
          <motion.div
            key={index}
            className={`flex items-center gap-4 rounded-md cursor-pointer transition-colors relative p-2.5 ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
            onClick={() => {
              if (item.isProfile) {
                router.push('/profile');
              } else if (item.isToggle) {
                setIsDarkMode(!isDarkMode);
              } else if (item.isLogout) {
                logout();
                router.push('/');
              }
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: 'easeOut',
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center flex-shrink-0">
              <span className="text-white text-6 flex items-center justify-center">
                {React.cloneElement(item.icon, {
                  className: item.isToggle && !isDarkMode 
                    ? "w-5 h-5 text-white stroke-[1.2]" 
                    : "w-5 h-5 text-white"
                })}
              </span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  className="text-sm text-white whitespace-nowrap"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                >
                  {item.text}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Sidebar;
