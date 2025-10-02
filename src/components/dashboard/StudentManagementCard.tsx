'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Info, X } from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';

interface ClassData {
  id: string;
  name: string;
}

interface StudentData {
  id: number;
  name: string;
  grade: number;
  attendance: number;
}

interface StudentManagementCardProps {
  selectedClass: string;
  classes: ClassData[];
  students: Record<string, StudentData[]>;
  selectedStudents: number[];
  handleStudentSelect: (studentId: number) => void;
  setStudentColorMap: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  studentColors: string[];
  getStudentColor: (studentId: number) => string | null;
}

const StudentManagementCard = ({
  selectedClass,
  classes,
  students,
  selectedStudents,
  handleStudentSelect,
  setStudentColorMap,
  studentColors,
  getStudentColor,
}: StudentManagementCardProps) => {
  const currentClassStudents = selectedClass ? students[selectedClass] : undefined;

  return (
    <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-1 min-h-[620px]">
      <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Users className="h-5 w-5 text-green-600 mr-2" />
          <h2 className="text-base font-medium">
            {selectedClass
              ? `${classes.find((c) => c.id === selectedClass)?.name} 학생 관리`
              : '학생 관리'}
          </h2>
          <div className="relative ml-2 inline-block">
            <div className="group w-4 h-4">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                클래스를 선택하면
                <br />
                해당 클래스의 학생 목록이
                <br />
                표시됩니다
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
              </div>
            </div>
          </div>
        </div>
        {selectedClass && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              총 {currentClassStudents?.length || 0}명
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Selected Students */}
        {selectedClass && (
          <div className="mb-4 px-6 pt-6 pb-2 bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg h-60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-green-800">
                  선택된 학생 ({selectedStudents.length}/3명)
                </h4>
                <div className="relative">
                  <div className="group w-4 h-4">
                    <Info className="h-4 w-4 text-green-600 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                      선택된 학생들의 개별 성적이 차트에 각각 다른 색상의 선으로 표시됩니다.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                    </div>
                  </div>
                </div>
              </div>
              {selectedStudents.length > 0 && (
                <Button
                  onClick={() => {
                    handleStudentSelect(-1); // Use a dummy ID to clear all
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  variant="ghost"
                  size="sm"
                  title="모든 학생 선택 해제"
                >
                  <X className="h-3 w-3" />
                  전체 제거
                </Button>
              )}
            </div>
            {selectedStudents.length > 0 ? (
              <div className="space-y-2 overflow-hidden" style={{ maxHeight: 'calc(100% - 60px)' }}>
                <AnimatePresence>
                  {selectedStudents.map((studentId, index) => {
                    const student = currentClassStudents?.find((s) => s.id === studentId);
                    if (!student) return null;
                    const color = getStudentColor(studentId);
                    return (
                      <motion.div
                        key={student.id}
                        data-student-id={student.id}
                        onClick={() => handleStudentSelect(student.id)}
                        className="group flex items-center gap-3 p-2.5 rounded-lg border transition-all backdrop-blur-sm cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.1,
                          delay: index * 0.03,
                          ease: 'easeOut',
                        }}
                        style={{
                          backgroundColor: color ? `${color}20` : '#f3f4f6',
                          borderColor: color || '#d1d5db',
                          boxShadow: color ? `0 4px 6px -1px ${color}20, 0 2px 4px -1px ${color}10` : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fca5a5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = color ? `${color}20` : '#f3f4f6';
                          e.currentTarget.style.borderColor = color || '#d1d5db';
                        }}
                      >
                        <div className="relative w-3 h-3">
                          <div
                            className="w-3 h-3 rounded-sm group-hover:opacity-0 transition-opacity"
                            style={{ backgroundColor: color || '#9ca3af' }}
                          ></div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <X className="w-3 h-3 text-red-500" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 'calc(100% - 60px)' }}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">선택된 학생이 없습니다</p>
                  <p className="text-xs text-gray-400">아래 목록에서 학생을 선택해주세요 (최대 3명)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Students List */}
        <div
          className={`h-80 bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
            selectedStudents.length >= 3 ? 'opacity-25 pointer-events-none' : ''
          }`}
        >
          {selectedClass ? (
            <div className="h-full flex flex-col">
              <h4 className="text-sm font-medium text-gray-700 p-4 pb-3 bg-white border-b border-gray-100 sticky top-0 z-10">
                전체 학생 목록
              </h4>
              <div className="flex-1 p-4 pt-3 overflow-y-auto">
                <div className="space-y-3">
                  {currentClassStudents
                    ?.sort((a, b) => a.id - b.id)
                    ?.map((student, index) => {
                      const isSelected = selectedStudents.includes(student.id);
                      const canSelect = !isSelected && selectedStudents.length < 3;

                      return (
                        <div
                          key={student.id}
                          onClick={() =>
                            canSelect ? handleStudentSelect(student.id) : undefined
                          }
                          className={`p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'text-gray-500 cursor-not-allowed'
                              : canSelect
                              ? 'bg-white border-gray-200 cursor-pointer'
                              : 'bg-white border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                          style={{
                            backgroundColor: isSelected ? '#f9fafb' : 'white',
                            borderColor: isSelected ? '#e5e7eb' : '#e5e7eb',
                          }}
                          onMouseEnter={(e) => {
                            if (canSelect) {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.borderColor = '#bbf7d0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (canSelect) {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            } else if (isSelected) {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <h4
                                className={`text-sm font-medium truncate ${
                                  isSelected ? 'text-gray-500' : 'text-gray-900'
                                }`}
                              >
                                {student.name}
                              </h4>
                            </div>
                            {isSelected && (
                              <div className="flex items-center text-green-600">
                                <FaRegCircleCheck className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">클래스를 선택해주세요</p>
                <p className="text-gray-400 text-xs mt-1">
                  위의 드롭다운에서 클래스를 선택하면
                </p>
                <p className="text-gray-400 text-xs">해당 클래스의 학생 목록이 표시됩니다</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentManagementCard;