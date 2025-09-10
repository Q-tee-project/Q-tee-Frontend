'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoIosArrowDropright } from 'react-icons/io';
import { CiCalendar } from 'react-icons/ci';
import { AiOutlineBars } from 'react-icons/ai';
import { CiMail } from 'react-icons/ci';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { RiGroupLine } from 'react-icons/ri';
import { FiShoppingCart } from 'react-icons/fi';
import { FaClipboardList } from 'react-icons/fa';
import { FaGraduationCap } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <CiCalendar />, text: '캘린더' },
    { icon: <AiOutlineBars />, text: '리스트' },
    { icon: <CiMail />, text: '메일' },
    { icon: <FaRegPenToSquare />, text: '문제 생성' },
    { icon: <RiGroupLine />, text: '학생 관리' },
    { icon: <FiShoppingCart />, text: '마켓플레이스' },
  ];

  return (
    <div
      className={`bg-white h-screen flex flex-col border-r border-[#D1D1D1] transition-all duration-300 ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      <div className="p-5 flex-1 flex flex-col gap-5">
        {/* Toggle Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-6 h-6 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <IoIosArrowDropright
              className="text-[#333] text-6 transition-transform duration-300"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </div>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center w-6 h-6 rounded-md cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0">
                <span className="text-[#333] text-6 flex items-center justify-center">
                  {item.icon}
                </span>
              </button>
              {isOpen && <span className="text-sm text-[#333] whitespace-nowrap">{item.text}</span>}
            </div>

            {/* Separator after 메일 (3rd item) */}
            {index === 2 && <div className="border-b border-[#D1D1D1] mx-2"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
