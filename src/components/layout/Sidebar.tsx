'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoIosArrowDropright } from 'react-icons/io';
import { FiCalendar } from 'react-icons/fi';
import { FiList } from 'react-icons/fi';
import { FiMail } from 'react-icons/fi';
import { FiEdit } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';
import { FiShoppingCart } from 'react-icons/fi';
import { FiClipboard } from 'react-icons/fi';
import { FiBook } from 'react-icons/fi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { icon: <FiCalendar />, text: '캘린더' },
    { icon: <FiList />, text: '리스트' },
    { icon: <FiMail />, text: '메일' },
    { icon: <FiClipboard />, text: '문제 관리', path: '/question/bank' },
    { icon: <FiBook />, text: '과제 풀이', path: '/test' },
    { icon: <FiEdit />, text: '문제 생성' },
    { icon: <FiUsers />, text: '학생 관리' },
    { icon: <FiShoppingCart />, text: '마켓플레이스' },
  ];

  return (
    <div
      className="bg-white h-screen flex flex-col border-r border-[#D1D1D1] transition-all duration-300"
    >
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Toggle Button */}
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ padding: '10px' }}
          >
            <IoIosArrowDropright
              className="text-[#333] text-6 transition-transform duration-300"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                width: '20px',
                height: '20px',
                color: '#333'
              }}
            />
          </button>
        </div>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <div 
              className="flex items-center gap-4 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => item.path && router.push(item.path)}
              style={{ padding: '10px' }}
            >
              <button
                className="flex items-center justify-center flex-shrink-0"
              >
                <span className="text-[#333] text-6 flex items-center justify-center">
                  {React.cloneElement(item.icon, { style: { width: '20px', height: '20px', color: '#333' } })}
                </span>
              </button>
              {isOpen && (
                <span className="text-sm text-[#333] whitespace-nowrap">
                  {item.text}
                </span>
              )}
            </div>

            {/* Separator after 메일 (3rd item) */}
            {index === 2 && <div className="border-b border-[#D1D1D1]"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
