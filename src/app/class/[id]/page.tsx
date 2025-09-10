'use client';

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ClassDetailPage() {
  const [activeTab, setActiveTab] = useState('assignment')

  // 샘플 데이터
  const studentResults = [
    {
      name: '이윤진',
      school: '고등',
      grade: '1학년',
      status: '완료',
      score: '80점',
      timeTaken: '45분',
      completionDate: '2025.09.02 15:00:00'
    },
    {
      name: '이윤진',
      school: '고등',
      grade: '1학년',
      status: '미완료',
      score: '80점',
      timeTaken: '45분',
      completionDate: '2025.09.02 15:00:00'
    },
    {
      name: '이윤진',
      school: '고등',
      grade: '1학년',
      status: '완료',
      score: '80점',
      timeTaken: '45분',
      completionDate: '2025.09.02 15:00:00'
    }
  ]

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: '#EFF0F5', 
        padding: '40px 60px' 
      }}
    >
      {/* 페이지 제목 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        수업 관리
      </h1>
      
      {/* 메인 콘텐츠 영역 */}
      <div 
        className="bg-white shadow-sm" 
        style={{ 
          padding: '40px 50px', 
          borderRadius: '5px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '30px' 
        }}
      >
        {/* 헤더 영역 */}
        <div className="flex items-center gap-3 mb-2">
          <button className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">과외의 아이 (클래스명)</h2>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('assignment')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'assignment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            과제 관리
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'student'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            학생 관리
          </button>
        </div>

        {/* 과제 관리 탭 내용 */}
        {activeTab === 'assignment' && (
          <div className="space-y-6">
            {/* 과제 추가하기 버튼 */}
            <div className="flex justify-end">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                과제 추가하기
              </button>
            </div>

            {/* 과제 입력 필드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">2025.09.02 15:00 까지</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="과제명"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 학생별 풀이 결과 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">학생별 풀이 결과</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">이름</TableHead>
                    <TableHead className="font-medium">학교/학년</TableHead>
                    <TableHead className="font-medium">상태</TableHead>
                    <TableHead className="font-medium">점수</TableHead>
                    <TableHead className="font-medium">소요 시간</TableHead>
                    <TableHead className="font-medium">완료일시</TableHead>
                    <TableHead className="font-medium">재전송</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResults.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            {student.school}
                          </Badge>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            {student.grade}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            student.status === '완료' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.score}</TableCell>
                      <TableCell>{student.timeTaken}</TableCell>
                      <TableCell>{student.completionDate}</TableCell>
                      <TableCell>
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          과제 재전송
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 하단 과제 입력 필드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">2025.09.02 15:00 까지</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="과제명"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 학생 관리 탭 내용 */}
        {activeTab === 'student' && (
          <div className="text-center py-12 text-gray-500">
            학생 관리 기능이 여기에 표시됩니다.
          </div>
        )}
      </div>
    </div>
  )
}
