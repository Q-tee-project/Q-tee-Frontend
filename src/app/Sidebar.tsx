'use client'

import React, { useState } from 'react'
import { IoIosArrowDropright } from "react-icons/io"
import { CiCalendar } from "react-icons/ci"
import { AiOutlineBars } from "react-icons/ai"
import { CiMail } from "react-icons/ci"
import { FaRegPenToSquare } from "react-icons/fa6"
import { RiGroupLine } from "react-icons/ri"
import { FiShoppingCart } from "react-icons/fi"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: <CiCalendar />, text: '캘린더' },
    { icon: <AiOutlineBars />, text: '리스트' },
    { icon: <CiMail />, text: '메일' },
    { icon: <FaRegPenToSquare />, text: '문제 생성' },
    { icon: <RiGroupLine />, text: '학생 관리' },
    { icon: <FiShoppingCart />, text: '마켓플레이스' }
  ]

  return (
    <>
      <div className={`fixed left-0 bg-white min-h-screen border-r border-[#D1D1D1] z-50 ${
        isOpen ? 'w-[200px]' : 'w-16'
      } flex flex-col`} style={{ padding: '20px' }}>
        <ul className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Toggle Button as first li */}
          <li className={`flex items-center ${isOpen ? 'px-4' : 'justify-center'}`} style={{ gap: '15px', alignItems: 'center' }}>
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
              <li className="px-4 flex items-center" style={{ gap: '15px', alignItems: 'center' }}>
                <a className="flex items-center justify-center shrink-0 rounded-md cursor-pointer" style={{ width: '25px', height: '25px' }}>
                  <span 
                    className="text-[#333] text-[25px] leading-none flex items-center justify-center"
                    style={{ width: '25px', height: '25px' }}
                  >
                    {item.icon}
                  </span>
                </a>
                {isOpen && (
                  <span className="text-sm whitespace-nowrap ml-3 text-[#333]">
                    {item.text}
                  </span>
                )}
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
      </div>
    </>
  )
}

export default Sidebar