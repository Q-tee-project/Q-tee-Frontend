'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { VscSettings } from "react-icons/vsc";
import { CalendarIcon, Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 타입 정의
interface Assignment {
  id: string;
  name: string;
  subject: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
  myScore?: number;
  classAverageScore?: number;
}

interface ClassData {
  id: string;
  name: string;
  createdAt: string;
}

interface ClassAverageProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  chartData: any[];
  classes: ClassData[];
  assignments: Assignment[];
  onClassChange?: (classId: string) => Promise<void>;
}

const ClassAverage: React.FC<ClassAverageProps> = ({
  selectedClass,
  setSelectedClass,
  chartData,
  classes,
  assignments,
  onClassChange,
}) => {
  // 통합된 설정 모달 상태 관리
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [subjectFilter, setSubjectFilter] = React.useState<string>('전체');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [startDatePopoverOpen, setStartDatePopoverOpen] = React.useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = React.useState(false);


  // 응시 완료한 과제만 필터링
  const completedAssignments = assignments.filter(assignment => 
    assignment.myScore !== undefined && assignment.myScore !== null
  );

  // 기간, 과목, 검색어에 따른 과제 필터링 함수
  const getFilteredAssignments = () => {
    let filtered = completedAssignments;

    // 기간 필터
    if (startDate && endDate) {
      filtered = filtered.filter(assignment => {
        if (!assignment.dueDate) return false;
        const assignmentDate = new Date(assignment.dueDate);
        return assignmentDate >= startDate && assignmentDate <= endDate;
      });
    }

    // 과목 필터
    if (subjectFilter !== '전체') {
      filtered = filtered.filter(assignment => assignment.subject === subjectFilter);
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(assignment => 
        assignment.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAssignments = getFilteredAssignments();

  // 클래스 변경 핸들러
  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedAssignments([]);
    
    if (onClassChange) {
      await onClassChange(classId);
    }
  };

  // 설정 모달 열기 핸들러
  const handleOpenSettingsModal = () => {
    // 필터 상태 초기화
    setStartDate(undefined);
    setEndDate(undefined);
    setSubjectFilter('전체');
    setSearchQuery('');
    
    setShowSettingsModal(true);
  };


  // 설정 적용 핸들러
  const handleSettingsApply = () => {
    setShowSettingsModal(false);
  };

  // 과제 선택 핸들러
  const handleAssignmentToggle = (assignmentId: string) => {
    setSelectedAssignments(prev => {
      if (prev.includes(assignmentId)) {
        return prev.filter(id => id !== assignmentId);
      } else if (prev.length < 7) {
        return [...prev, assignmentId];
      }
      return prev;
    });
  };

  const handleAssignmentRemove = (assignmentId: string) => {
    setSelectedAssignments(prev => prev.filter(id => id !== assignmentId));
  };

  // 날짜 선택 핸들러 (선택 후 캘린더 자동 닫힘)
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartDatePopoverOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndDatePopoverOpen(false);
  };

  // 차트 데이터 생성 함수
  const getFilteredChartData = () => {
    if (selectedAssignments.length > 0) {
      // 과제별: 선택된 과제들의 데이터
      return selectedAssignments.map((assignmentId, index) => {
        const assignment = completedAssignments.find(a => a.id === assignmentId);
        return {
          name: assignment?.name || `과제${index + 1}`,
          클래스평균: assignment?.classAverageScore || 0,
          내점수: assignment?.myScore || 0,
        };
      });
    } else {
      // 선택된 과제가 없으면 가장 최근 7개 과제를 자동으로 표시
      const recentAssignments = [...completedAssignments]
        .sort((a, b) => {
          if (!a.dueDate || !b.dueDate) return 0;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        })
        .slice(0, 7);
      
      return recentAssignments.map((assignment) => {
        return {
          name: assignment.name,
          클래스평균: assignment.classAverageScore || 0,
          내점수: assignment.myScore || 0,
        };
      });
    }
  };

  const displayChartData = getFilteredChartData();
  return (
    <Card className="flex-1 shadow-sm px-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">과제별 내 점수</h3>
          <div className="flex items-center gap-3">
            {/* 클래스 선택 */}
            <Select value={selectedClass} onValueChange={handleClassChange}>
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
            
            {/* 설정 아이콘 */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenSettingsModal}
              className="h-9 w-9"
            >
              <VscSettings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[28rem]">
          <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={displayChartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
                angle={-45}
                textAnchor="end"
                domain={['dataMin', 'dataMax']}
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend 
                content={(props: any) => {
                  const { payload } = props;
                  if (!payload) return null;
                  return (
                    <div className="flex justify-center gap-8 mt-6">
                      {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Line type="monotone" dataKey="클래스평균" stroke="#9674CF" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="내점수" stroke="#18BBCB" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      {/* 통합 설정 모달 */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              차트 설정
            </DialogTitle>
            <DialogDescription className="sr-only">
              기간, 과목, 과제명을 기준으로 차트에 표시할 데이터를 설정합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 안내 사항 */}
            <div className="p-2 bg-gray-50 rounded-lg">
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• 응시 완료한 과제만 표시됩니다</li>
                <li>• 기간 설정 시 해당 기간 내의 과제만 표시됩니다</li>
                <li>• 최대 7개의 과제까지 선택 가능합니다</li>
              </ul>
            </div>
            
            {/* 기간 설정 */}
            <div>
              <label className="text-base font-semibold text-gray-800 mb-3 block">기간 설정</label>
              <div className="flex items-center gap-2">
                {/* 시작 날짜 박스 */}
                <div className="flex-1">
                  <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-start gap-2 h-10"
                      >
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {startDate ? format(startDate, 'yyyy.MM.dd', { locale: ko }) : '시작 날짜'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        initialFocus
                        locale={ko}
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={new Date().getFullYear()}
                        className="rounded-md border shadow-sm"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 구분선 */}
                <span className="text-gray-400">-</span>

                {/* 종료 날짜 박스 */}
                <div className="flex-1">
                  <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-start gap-2 h-10"
                      >
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {endDate ? format(endDate, 'yyyy.MM.dd', { locale: ko }) : '종료 날짜'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        initialFocus
                        locale={ko}
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={new Date().getFullYear()}
                        className="rounded-md border shadow-sm"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* 과제 선택 */}
            <div>
              <label className="text-base font-semibold text-gray-800 mb-3 block">
                응시 완료한 과제 선택 (최대 7개) 
                {filteredAssignments.length !== completedAssignments.length && (
                  <span className="text-xs text-blue-600 ml-2">
                    ({filteredAssignments.length}개 과제 중)
                  </span>
                )}
                {completedAssignments.length > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    (총 {completedAssignments.length}개 응시 완료)
                  </span>
                )}
              </label>

              {/* 필터 및 검색 */}
              <div className="flex gap-2 mb-3">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="과목" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="국어">국어</SelectItem>
                    <SelectItem value="영어">영어</SelectItem>
                    <SelectItem value="수학">수학</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="과제명 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {completedAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>응시 완료한 과제가 없습니다.</p>
                    <p className="text-xs mt-1">과제를 응시하면 여기에 표시됩니다.</p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>선택한 조건에 해당하는 과제가 없습니다.</p>
                    <p className="text-xs mt-1">다른 조건을 선택해보세요.</p>
                    <p className="text-xs mt-1 text-blue-600">전체 과제: {completedAssignments.length}개</p>
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <div 
                      key={assignment.id} 
                      className={`p-2 border rounded-md cursor-pointer transition-all hover:shadow-sm ${
                        selectedAssignments.includes(assignment.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAssignmentToggle(assignment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedAssignments.includes(assignment.id)}
                              disabled={!selectedAssignments.includes(assignment.id) && selectedAssignments.length >= 7}
                            />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{assignment.name}</h4>
                              <p className="text-xs text-gray-500">
                                {assignment.subject} • 마감: {assignment.dueDate}
                              </p>
                              {assignment.myScore !== undefined && (
                                <p className="text-xs text-green-600 font-medium">
                                  내 점수: {assignment.myScore}점
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.submittedCount}/{assignment.totalCount}명
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleSettingsApply}
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