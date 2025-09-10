'use client'

import React, { useState } from 'react'
import { IoIosArrowDropright } from "react-icons/io"
import { CiCalendar } from "react-icons/ci"
import { AiOutlineBars } from "react-icons/ai"
import { CiMail } from "react-icons/ci"
import { FaRegPenToSquare } from "react-icons/fa6"
import { RiGroupLine } from "react-icons/ri"
import { FiShoppingCart } from "react-icons/fi"

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void;
}

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  }

  const menuItems = [
    { icon: <CiCalendar />, text: '캘린더' },
    { icon: <AiOutlineBars />, text: '리스트' },
    { icon: <CiMail />, text: '메일' },
    { icon: <FaRegPenToSquare />, text: '문제 생성' },
    { icon: <RiGroupLine />, text: '학생 관리' },
    { icon: <FiShoppingCart />, text: '마켓플레이스' }
  ]

  return (
    <div className={`relative w-16 bg-white min-h-screen z-50 flex flex-col border-r ${isOpen ? 'border-[#fff]' : 'border-[#D1D1D1]'}`} style={{ padding: isOpen ? '40px 20px' : '40px 20px' }}>
      <ul className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Toggle Button as first li */}
        <li className="flex items-center justify-center" style={{ gap: '15px', alignItems: 'center' }}>
          <a
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center shrink-0 rounded-md cursor-pointer"
            style={{ width: '25px', height: '25px' }}
          >
            <IoIosArrowDropright 
              className="text-[#333]"
              style={{ 
                width: '25px', 
                height: '25px',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </a>
        </li>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center justify-center" style={{ gap: '15px', alignItems: 'center' }}>
              <a className="flex items-center justify-center shrink-0 rounded-md cursor-pointer" style={{ width: '25px', height: '25px' }}>
                <span 
                  className="text-[#333] text-[25px] leading-none flex items-center justify-center"
                  style={{ width: '25px', height: '25px' }}
                >
                  {item.icon}
                </span>
              </a>
            </li>
            
            {/* Separator after 메일 (3rd item) */}
            {index === 2 && (
              <li>
                <div className="border-b border-[#D1D1D1] mx-4"></div>
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>

      {/* 텍스트 메뉴 (하위 메뉴 방식) */}
      {isOpen && (
        <div className="absolute left-[43px] top-0 w-[184px] bg-white min-h-screen border-r border-[#D1D1D1] z-40" style={{ padding: '40px 20px 40px 0' }}>
          <ul className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Toggle Button 공간 */}
            <li style={{ height: '25px' }}></li>

            {/* Menu Items 텍스트 */}
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <li className="flex items-center justify-left" style={{ height: '25px', alignItems: 'center' }}>
                  <span className="text-sm whitespace-nowrap text-[#333]" style={{ padding: '0 0 0 15px' }}>
                    {item.text}
                  </span>
                </li>
                
                {/* Separator after 메일 (3rd item) */}
                {index === 2 && (
                  <li>
                    <div className="border-b border-[#D1D1D1]"></div>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Sidebar