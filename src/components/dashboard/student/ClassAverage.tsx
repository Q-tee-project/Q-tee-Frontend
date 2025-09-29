'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Calendar, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClassAverageProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  chartType: 'period' | 'assignment';
  setChartType: (value: 'period' | 'assignment') => void;
  selectedAssignments: string[];
  setSelectedAssignments: (assignments: string[]) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  showPeriodModal: boolean;
  setShowPeriodModal: (show: boolean) => void;
  showAssignmentModal: boolean;
  setShowAssignmentModal: (show: boolean) => void;
  tempSelectedAssignments: string[];
  setTempSelectedAssignments: (assignments: string[]) => void;
  customStartYear: string;
  setCustomStartYear: (year: string) => void;
  customStartMonth: string;
  setCustomStartMonth: (month: string) => void;
  customEndYear: string;
  setCustomEndYear: (year: string) => void;
  customEndMonth: string;
  setCustomEndMonth: (month: string) => void;
  composedChartData: any[];
  classes: Array<{ id: string; name: string }>;
  assignments: Array<{ id: string; name: string }>;
  defaultChartData: any[];
  onPeriodApply: () => void;
  onOpenAssignmentModal: () => void;
  onAssignmentModalApply: () => void;
  onAssignmentToggle: (assignmentId: string) => void;
  onAssignmentRemove: (assignmentId: string) => void;
  generateYearOptions: () => string[];
  generateMonthOptions: () => string[];
}

const ClassAverage: React.FC<ClassAverageProps> = ({
  selectedClass,
  setSelectedClass,
  chartType,
  setChartType,
  selectedAssignments,
  selectedMonth,
  setSelectedMonth,
  showPeriodModal,
  setShowPeriodModal,
  showAssignmentModal,
  setShowAssignmentModal,
  tempSelectedAssignments,
  customStartYear,
  setCustomStartYear,
  customStartMonth,
  setCustomStartMonth,
  customEndYear,
  setCustomEndYear,
  customEndMonth,
  setCustomEndMonth,
  composedChartData,
  classes,
  assignments,
  defaultChartData,
  onPeriodApply,
  onOpenAssignmentModal,
  onAssignmentModalApply,
  onAssignmentToggle,
  onAssignmentRemove,
  generateYearOptions,
  generateMonthOptions,
}) => {
  return (
    <Card className="flex-1 shadow-sm px-6">
      <CardHeader className="p-0">
        <h3 className="text-xl font-bold text-gray-900">클래스별 과제별 전체 평균과 내 평균</h3>
      </CardHeader>
      <div className="p-0">
        <div className="flex items-center gap-4 flex-wrap">
          {/* 1. 클래스 드롭다운 */}
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="클래스를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 2. 기간별/과제별 드롭다운 */}
          <Select value={chartType} onValueChange={(value: 'period' | 'assignment') => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="분석 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="period">기간별</SelectItem>
              <SelectItem value="assignment">과제별</SelectItem>
            </SelectContent>
          </Select>

          {/* 3. 기간별 선택 시 월 선택 및 기간 설정 */}
          {chartType === 'period' && (
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {defaultChartData.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowPeriodModal(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                기간 설정
              </Button>
            </div>
          )}

          {/* 4. 과제별 선택 시 과제 선택 버튼 */}
          {chartType === 'assignment' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onOpenAssignmentModal}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                과제 선택 ({selectedAssignments.length}/5)
              </Button>
            </div>
          )}
        </div>

        {/* 선택된 과제들 표시 (과제별 선택 시) */}
        {chartType === 'assignment' && selectedAssignments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAssignments.map((assignmentId) => {
              const assignment = assignments.find(a => a.id === assignmentId);
              return assignment ? (
                <Badge key={assignmentId} variant="secondary" className="flex items-center gap-1">
                  {assignment.name}
                  <button
                    onClick={() => onAssignmentRemove(assignmentId)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>
      <CardContent className="p-0">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={composedChartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="클래스평균" stroke="#9674CF" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="내점수" stroke="#18BBCB" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      {/* 기간 설정 모달 */}
      <Dialog open={showPeriodModal} onOpenChange={setShowPeriodModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              차트 기간 설정
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 커스텀 기간 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">기간 선택</label>
              <div className="space-y-4">
                {/* 시작 기간 */}
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">시작</label>
                  <div className="flex gap-2">
                    <Select value={customStartYear} onValueChange={setCustomStartYear}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="년도" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateYearOptions().map(year => (
                          <SelectItem key={year} value={year}>{year}년</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={customStartMonth} onValueChange={setCustomStartMonth}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="월" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMonthOptions().map(month => (
                          <SelectItem key={month} value={month}>{month}월</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 종료 기간 */}
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">종료</label>
                  <div className="flex gap-2">
                    <Select value={customEndYear} onValueChange={setCustomEndYear}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="년도" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateYearOptions().map(year => (
                          <SelectItem key={year} value={year}>{year}년</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={customEndMonth} onValueChange={setCustomEndMonth}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="월" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMonthOptions().map(month => (
                          <SelectItem key={month} value={month}>{month}월</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* 안내 사항 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 최대 10개월까지 선택 가능합니다</li>
                <li>• 오늘 이후 날짜는 선택할 수 없습니다</li>
                <li>• 기간을 선택하면 해당 기간의 데이터가 차트에 표시됩니다</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPeriodModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={onPeriodApply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 과제 선택 모달 */}
      <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              과제 선택 (최대 5개)
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              차트에 표시할 과제를 선택하세요. 최대 5개까지 선택 가능합니다.
            </p>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                    tempSelectedAssignments.includes(assignment.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onAssignmentToggle(assignment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={tempSelectedAssignments.includes(assignment.id)}
                          disabled={!tempSelectedAssignments.includes(assignment.id) && tempSelectedAssignments.length >= 5}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{assignment.name}</h4>
                          <p className="text-sm text-gray-500">
                            수학 • 마감: 2024-03-{assignment.id}5
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.floor(Math.random() * 15) + 15}/30명 제출
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignmentModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={onAssignmentModalApply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClassAverage;
