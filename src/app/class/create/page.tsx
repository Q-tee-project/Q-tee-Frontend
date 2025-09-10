'use client';

import React, { useState } from 'react'
import { IoCloseCircleOutline } from "react-icons/io5";

export default function classCreatePage() {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>(Array(2).fill(false));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedRows(Array(2).fill(newSelectAll));
  };

  const handleRowSelect = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows[index] = !newSelectedRows[index];
    setSelectedRows(newSelectedRows);
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedRows.every(selected => selected);
    setSelectAll(allSelected);
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFF0F5', padding: '40px 60px' }}>
      {/* 페이지 제목 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">수업 관리</h1>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="bg-white shadow-sm" style={{ padding: '40px 50px', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* 검색 및 생성 버튼 영역 */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="클래스 명 검색"
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ width: '400px' }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ padding: '0 10px', width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            신규 수업 생성하기
          </button>
        </div>

          <div>
            {/* 수업 목록 카드 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">수업 목록</h2>
            </div>
        
            <div className="overflow-x-auto">
               <table className="w-full">
                 <thead style={{ background: '#fff', borderBottom: '1px solid #E1E1E1' }}>
                   <tr>
                     <th className="px-6 py-4 text-left">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <input 
                           type="checkbox" 
                           checked={selectAll}
                           onChange={handleSelectAll}
                           style={{ 
                             width: '16px', 
                             height: '16px', 
                             border: 'none', 
                             outline: 'none',
                             accentColor: '#0085FF',
                             boxShadow: 'none'
                           }} 
                         />
                       </span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>클래스명</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>학교</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>학년</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>개설 일자</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>학생 수</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>수정</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>삭제</span>
                     </th>
                     <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                       <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333' }}>코드</span>
                     </th>
                   </tr>
                 </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 테이블 행들 */}
                  {Array.from({ length: 2 }, (_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedRows[index]}
                            onChange={() => handleRowSelect(index)}
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              border: 'none', 
                              outline: 'none',
                              accentColor: '#0085FF',
                              boxShadow: 'none'
                            }} 
                          />
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#666' }}>중등 수학 (화, 목)</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          <p style={{ 
                            padding: '4px 14px', 
                            margin: '0', 
                            borderRadius: '5px', 
                            backgroundColor: index % 2 === 0 ? '#E6F3FF' : '#FFF5E9', 
                            border: index % 2 === 0 ? '1px solid #0085FF' : '1px solid #FF9F2D', 
                            color: index % 2 === 0 ? '#0085FF' : '#FF9F2D' 
                          }}>
                            {index % 2 === 0 ? '중등' : '고등'}
                          </p>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          <p style={{ padding: '4px 14px', margin: '0', borderRadius: '5px', backgroundColor: '#fff', border: '1px solid #999999', color: '#999999' }}>
                            1학년
                          </p>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#666' }}>2025.09.03 15:00:00</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#666' }}>총 3명</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}>
                            <svg className="h-5 w-5" fill="none" stroke="#666" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}>
                            <svg className="h-5 w-5" fill="none" stroke="#666" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}>
                            <svg className="h-5 w-5" fill="none" stroke="#666" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
        </div>
      </div>

      {/* 클래스 생성 모달창 */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0, 0, 0, 0.5)' 
          }}
        >
          {/* modal-container */}
          <div 
            className="shadow-xl w-full max-w-md mx-4"
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '5px', 
              padding: '40px' 
            }}
          >
            {/* modal-header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">클래스 생성</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '0', 
                  cursor: 'pointer',
                  color: '#000'
                }}
              >
                <IoCloseCircleOutline size={24} />
              </button>
            </div>

            {/* modal-body */}
            <div className="space-y-4">
              {/* 입력과 선택 부분 */}
              <div className="space-y-4">
                {/* 클래스명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">클래스명</label>
                  <input
                    type="text"
                    placeholder="클래스 이름을 입력해 주세요."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 학년 */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">학년</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>중학교</option>
                      <option>고등학교</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">학년</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>1학년</option>
                      <option>2학년</option>
                      <option>3학년</option>
                    </select>
                  </div>
                </div>

                {/* 요일 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요일 선택</label>
                  <div className="flex gap-2">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                      <button
                        key={day}
                        style={{
                          background: 'none',
                          border: index < 2 ? '1px solid #0072CE' : '1px solid #D1D1D1',
                          borderRadius: '5px',
                          padding: '10px',
                          cursor: 'pointer',
                          color: index < 2 ? '#0072CE' : '#666',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 시작 시간 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>오전</option>
                      <option>오후</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>9시</option>
                      <option>10시</option>
                      <option>11시</option>
                      <option>12시</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>00분</option>
                      <option>30분</option>
                    </select>
                  </div>
                </div>

                {/* 종료 시간 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>오전</option>
                      <option>오후</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>9시</option>
                      <option>10시</option>
                      <option>11시</option>
                      <option>12시</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>00분</option>
                      <option>30분</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 하단의 버튼 */}
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  취소
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: '#0072CE',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
