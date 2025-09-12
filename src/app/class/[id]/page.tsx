'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { AssignmentTab } from '@/components/class/AssignmentTab';
import { StudentManagementTab } from '@/components/class/StudentManagementTab';
import { ApprovalTab } from '@/components/class/ApprovalTab';

interface ClassDetailPageProps {
  params: {
    id: string;
  };
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const [activeTab, setActiveTab] = useState('assignment');
  const router = useRouter();
  
  const classId = params.id;

  const tabs = [
    { id: 'assignment', label: '과제 목록', count: 0 },
    { id: 'student', label: '학생 관리', count: 0 },
    { id: 'approval', label: '승인 대기', count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/class/create')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                클래스 상세 정보 (ID: {classId})
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'assignment' && <AssignmentTab classId={classId} />}
        {activeTab === 'student' && <StudentManagementTab classId={classId} />}
        {activeTab === 'approval' && <ApprovalTab classId={classId} />}
      </div>
    </div>
  );
}