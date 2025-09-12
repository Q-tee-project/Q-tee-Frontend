'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDropright } from 'react-icons/io';
import { FiCalendar } from 'react-icons/fi';
import { FiList } from 'react-icons/fi';
import { FiMail } from 'react-icons/fi';
import { FiEdit } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';
import { FiShoppingCart } from 'react-icons/fi';
import { FiClipboard } from 'react-icons/fi';
import { FiBook } from 'react-icons/fi';
import path from 'path';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { icon: <FiCalendar />, text: '캘린더' },
    { icon: <FiList />, text: '리스트' },
    { icon: <FiMail />, text: '메일' },
    { icon: <FiClipboard />, text: '문제 관리', path: '/question/bank' },
    { icon: <FiBook />, text: '과제 풀이', path: '/test' },
    { icon: <FiEdit />, text: '문제 생성', path: '/question/create' },
    { icon: <FiUsers />, text: '학생 관리', path: '/class/create' },
    { icon: <FiShoppingCart />, text: '마켓플레이스' },
  ];

  return (
    <motion.div
      className="bg-white h-screen flex flex-col border-r border-[#D1D1D1]"
      animate={{ width: isOpen ? '240px' : '80px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Toggle Button */}
        <div className="flex items-center">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ padding: '10px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <IoIosArrowDropright
                className="text-[#333] text-6"
                style={{
                  width: '20px',
                  height: '20px',
                  color: '#333',
                }}
              />
            </motion.div>
          </motion.button>
        </div>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <motion.div
              className="flex items-center gap-4 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => item.path && router.push(item.path)}
              style={{ padding: '10px' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: 'easeOut',
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <button className="flex items-center justify-center flex-shrink-0">
                <span className="text-[#333] text-6 flex items-center justify-center">
                  {React.cloneElement(item.icon, {
                    style: { width: '20px', height: '20px', color: '#333' },
                  })}
                </span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    className="text-sm text-[#333] whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Separator after 메일 (3rd item) */}
            {index === 2 && (
              <motion.div
                className="border-b border-[#D1D1D1]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;
