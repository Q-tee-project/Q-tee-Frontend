'use client';

import React from 'react';


interface AssignmentTabProps {
  classId: string;
}

export function AssignmentTab({ classId }: AssignmentTabProps) {
  return (
    <div className="space-y-6" style={{ padding: '10px' }}>
      {/* 과제 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>
          과제 목록
        </h3>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          과제 생성
        </button>
      </div>

      {/* 과제 목록 - 빈 상태 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm" style={{ padding: '40px' }}>
        <div className="text-center">
          <div className="text-gray-500 mb-2">생성된 과제가 없습니다.</div>
          <div className="text-sm text-gray-400">
            과제를 생성하여 학생들에게 배정해보세요.
          </div>
        </div>
      </div>
    </div>
  );
}