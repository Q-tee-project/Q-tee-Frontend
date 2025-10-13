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
import { VscSettings } from "react-icons/vsc";
import { Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 타입 정의
interface Assignment {
  id: string;
  name: string;
  subject: string;
  dueDate: string;
  myScore?: number;
  classAverageScore?: number;
  status?: 'completed' | 'pending'; // 응시 여부
}

interface ClassAverageProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  classes: Array<{ id: string; name: string }>;
  assignments?: Assignment[];
}

const ClassAverage: React.FC<ClassAverageProps> = ({
  selectedClass,
  setSelectedClass,
  classes,
  assignments = [],
}) => {
  // 차트 설정 모달 상태
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);
  
  // 필터 상태
  const [subjectFilter, setSubjectFilter] = React.useState<string>('전체');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const allAssignments = assignments || [];

  // assignments prop이 변경될 때 초기 선택된 과제 설정
  React.useEffect(() => {
    if (allAssignments.length > 0) {
      const recentAssignments = [...allAssignments]
        .sort((a, b) => {
          if (!a.dueDate || !b.dueDate) return 0;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        })
        .slice(0, 7)
        .map(a => a.id);
      setSelectedAssignments(recentAssignments);
    }
  }, [assignments]);

  // 과목 및 검색어로 과제 필터링
  const getFilteredAssignments = () => {
    let filtered = allAssignments;

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

  // 모달 닫기
  const handleSettingsApply = () => {
    setShowSettingsModal(false);
  };

  // 과제 선택/해제 (최대 7개)
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

  // 선택된 과제들을 날짜순으로 정렬하여 차트 데이터 생성
  const getChartData = () => {
    return selectedAssignments
      .map(id => allAssignments.find(a => a.id === id))
      .filter((a): a is Assignment => !!a) // undefined 제거
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) // 날짜순 정렬
      .map(assignment => ({
        name: assignment.name,
        '클래스평균': assignment.classAverageScore || 0,
        '내점수': assignment.myScore || 0,
        status: assignment.status, // 응시 여부 추가
      }));
  };

  const displayChartData = getChartData();
  return (
    <Card className="flex-1 shadow-sm px-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">과제별 내 점수</h3>
          <div className="flex items-center gap-3">
            {/* 클래스 선택 */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="클래스를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* 설정 아이콘 */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
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
              <YAxis domain={[0, 100]} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} />
              <Tooltip 
                formatter={(value: any, name: string, props: any) => {
                  const num = typeof value === 'number' ? value : 0;
                  const status = props.payload?.status;
                  
                  // 미응시 (pending)면 "0점 (미응시)"로 표시
                  if (status === 'pending' && num === 0) {
                    return ['0점 (미응시)', name];
                  }
                  
                  // 응시한 경우 점수 표시
                  return [`${num}점`, name];
                }}
              />
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
        <DialogContent className="sm:max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              차트 설정
            </DialogTitle>
            <DialogDescription className="sr-only">
              과목, 과제명을 기준으로 차트에 표시할 데이터를 설정합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 안내 사항 */}
            <div className="p-2 bg-gray-50 rounded-lg">
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• 최대 7개의 과제까지 선택 가능합니다</li>
              </ul>
            </div>
            
            {/* 과제 선택 */}
            <div>
              <label className="text-base font-semibold text-gray-800 mb-3 block">
                과제 선택 (최대 7개) 
                {filteredAssignments.length !== allAssignments.length && (
                  <span className="text-xs text-blue-600 ml-2">
                    ({filteredAssignments.length}개 과제 중)
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

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>선택한 조건에 해당하는 과제가 없습니다.</p>
                    <p className="text-xs mt-1">다른 필터를 선택해보세요.</p>
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
                              <p className="text-xs text-gray-500">{assignment.subject}</p>
                            </div>
                          </div>
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