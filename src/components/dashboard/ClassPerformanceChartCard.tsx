'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Info, BookOpen as BookIcon, ClipboardList, Calendar as CalendarIcon, Search } from 'lucide-react';
import { VscSettings } from "react-icons/vsc";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ClassData {
  id: string;
  name: string;
  createdAt: string;
}

interface StudentData {
  id: number;
  name: string;
  grade: number;
  attendance: number;
}

interface AssignmentData {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submitted: number;
  total: number;
  averageScore: number;
  studentScores?: Record<number, number>;
  assignedStudents?: number[];
}

interface ClassPerformanceChartCardProps {
  selectedClass: string;
  setSelectedClass: (classId: string) => void;
  classes: ClassData[];
  selectedStudents: number[];
  students: Record<string, StudentData[]>;
  assignments: AssignmentData[];
  selectedAssignments: string[];
  handleAssignmentSelect: (assignmentId: string) => void;
  isAssignmentModalOpen: boolean;
  setIsAssignmentModalOpen: (isOpen: boolean) => void;
  studentColorMap: Record<number, string>;
}

const ClassPerformanceChartCard = ({
  selectedClass,
  setSelectedClass,
  classes,
  selectedStudents,
  students,
  assignments,
  selectedAssignments,
  handleAssignmentSelect,
  isAssignmentModalOpen,
  setIsAssignmentModalOpen,
  studentColorMap,
}: ClassPerformanceChartCardProps) => {
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [subjectFilter, setSubjectFilter] = React.useState<string>('전체');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [startDatePopoverOpen, setStartDatePopoverOpen] = React.useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = React.useState(false);

  const getStudentColor = (studentId: number): string | null => {
    return studentColorMap[studentId] || null;
  };

  const getFilteredAssignments = () => {
    let filtered = assignments;

    if (startDate && endDate) {
      filtered = filtered.filter(assignment => {
        const assignmentDate = new Date(assignment.dueDate);
        return assignmentDate >= startDate && assignmentDate <= endDate;
      });
    }

    if (subjectFilter !== '전체') {
      filtered = filtered.filter(assignment => assignment.subject === subjectFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAssignments = getFilteredAssignments();

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartDatePopoverOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndDatePopoverOpen(false);
  };

  const getAssignmentChartData = React.useCallback(() => {
    return assignments.map((assignment) => {
      const dataPoint: any = {
        name: assignment.title,
        averageScore: assignment.averageScore,
        subject: assignment.subject,
      };

      if (selectedStudents.length > 0 && selectedClass) {
        selectedStudents.forEach((studentId) => {
          const student = students[selectedClass]?.find((s) => s.id === studentId);
          if (student && assignment.studentScores) {
            const score = assignment.studentScores[studentId];
            const isAssigned = assignment.assignedStudents?.includes(studentId);

            if (!isAssigned) {
              dataPoint[student.name] = null;
              dataPoint[`${student.name}_status`] = 'unassigned';
            } else if (score !== undefined) {
              dataPoint[student.name] = score;
              dataPoint[`${student.name}_status`] = 'completed';
            } else {
              dataPoint[student.name] = 0;
              dataPoint[`${student.name}_status`] = 'not_taken';
            }
          }
        });
      }
      return dataPoint;
    });
  }, [assignments, selectedStudents, selectedClass, students]);

  const assignmentChartData = React.useMemo(() => {
    if (selectedAssignments.length > 0) {
      return selectedAssignments
        .map((assignmentId) => {
          const assignment = assignments.find((a) => a.id === assignmentId);
          if (!assignment) return null;

          const dataPoint: any = {
            name: assignment.title,
            averageScore: assignment.averageScore,
            subject: assignment.subject,
          };

          if (selectedStudents.length > 0 && selectedClass) {
            selectedStudents.forEach((studentId) => {
              const student = students[selectedClass]?.find((s) => s.id === studentId);
              if (student && assignment.studentScores) {
                const score = assignment.studentScores[studentId];
                const isAssigned = assignment.assignedStudents?.includes(studentId);

                if (!isAssigned) {
                  dataPoint[student.name] = null;
                  dataPoint[`${student.name}_status`] = 'unassigned';
                } else if (score !== undefined) {
                  dataPoint[student.name] = score;
                  dataPoint[`${student.name}_status`] = 'completed';
                } else {
                  dataPoint[student.name] = 0;
                  dataPoint[`${student.name}_status`] = 'not_taken';
                }
              }
            });
          }
          return dataPoint;
        })
        .filter(Boolean);
    }
    return getAssignmentChartData();
  }, [selectedAssignments, assignments, selectedStudents, selectedClass, students, getAssignmentChartData]);

  return (
    <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-2 min-h-[620px]">
      <CardHeader className="py-2 px-6 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-base font-medium">클래스 성적 분석</h2>
          <div className="relative ml-2 inline-block">
            <div className="group w-4 h-4">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                막대 그래프: 과제 평균 성적
                <br />
                선 그래프: 선택된 학생별 개별 성적
                <br />
                과제별 성적을 비교할 수 있습니다
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="클래스 선택" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAssignmentModalOpen(true)}
              className="h-9 w-9"
            >
              <VscSettings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[28rem] bg-white rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              width={500}
              height={400}
              data={assignmentChartData}
              margin={{
                top: 20,
                right: 80,
                bottom: 40,
                left: 20,
              }}
              style={{ backgroundColor: 'white' }}
            >
              <CartesianGrid stroke="#f5f5f5" />
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
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="text-sm font-medium mb-1">{payload[0].payload.name}</p>
                        {payload[0].payload.subject && (
                          <p className="text-xs text-gray-600 mb-2">과목: {payload[0].payload.subject}</p>
                        )}
                        {payload.map((entry: any, index: number) => {
                          if (entry.dataKey === 'averageScore') {
                            return (
                              <p key={index} className="text-sm text-blue-600 font-semibold">
                                과제 평균: {entry.value}점
                              </p>
                            );
                          } else if (entry.dataKey !== 'subject' && !entry.dataKey.includes('_status')) {
                            const studentName = entry.dataKey;
                            const statusKey = `${studentName}_status`;
                            const status = payload[0].payload[statusKey];

                            let displayText = '';
                            let textColor = entry.stroke;

                            if (status === 'unassigned') {
                              displayText = '미배포 (-점)';
                              textColor = '#9ca3af';
                            } else if (status === 'not_taken') {
                              displayText = '미응시 (-점)';
                              textColor = '#f59e0b';
                            } else {
                              displayText = `${entry.value}점`;
                              textColor = entry.stroke;
                            }

                            return (
                              <p key={index} className="text-sm" style={{ color: textColor }}>
                                {studentName}: {displayText}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="averageScore"
                barSize={50}
                fill="#60a5fa"
                stroke="#93c5fd"
                strokeWidth={1}
                radius={[2, 2, 0, 0]}
                maxBarSize={50}
              />
              {selectedStudents.length > 0 &&
                selectedClass &&
                selectedStudents.map((studentId) => {
                  const student = students[selectedClass]?.find((s) => s.id === studentId);
                  if (!student) return null;

                  const color = getStudentColor(studentId);

                  return (
                    <Line
                      key={studentId}
                      type="linear"
                      dataKey={student.name}
                      stroke={color || '#9ca3af'}
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                    />
                  );
                })}
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 relative z-10">
            <div className="flex justify-center gap-6 mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: '#60a5fa',
                  }}
                ></div>
                <span className="text-sm text-blue-600 font-medium">과제평균</span>
              </div>
            </div>

            {selectedStudents.length > 0 && selectedClass && (
              <div className="flex justify-center gap-6">
                {selectedStudents.map((studentId) => {
                  const student = students[selectedClass]?.find((s) => s.id === studentId);
                  if (!student) return null;
                  const color = getStudentColor(studentId);
                  return (
                    <div key={studentId} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color || '#9ca3af' }}
                      ></div>
                      <span className="text-sm" style={{ color: color || '#9ca3af' }}>
                        {student.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              차트 설정
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-2 bg-gray-50 rounded-lg">
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• 기간 설정 시 해당 기간 내의 과제만 표시됩니다</li>
                <li>• 최대 7개의 과제까지 선택 가능합니다</li>
              </ul>
            </div>
            
            <div>
              <label className="text-base font-semibold text-gray-800 mb-3 block">기간 설정</label>
              <div className="flex items-center gap-2">
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

                <span className="text-gray-400">-</span>

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

            <div>
              <label className="text-base font-semibold text-gray-800 mb-3 block">
                과제 선택 (최대 7개) 
                {filteredAssignments.length !== assignments.length && (
                  <span className="text-xs text-blue-600 ml-2">
                    ({filteredAssignments.length}개 과제 중)
                  </span>
                )}
              </label>

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
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>선택한 기간에 해당하는 과제가 없습니다.</p>
                    <p className="text-xs mt-1">다른 기간을 선택해보세요.</p>
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
                      onClick={() => handleAssignmentSelect(assignment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedAssignments.includes(assignment.id)}
                              disabled={!selectedAssignments.includes(assignment.id) && selectedAssignments.length >= 7}
                            />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{assignment.title}</h4>
                              <p className="text-xs text-gray-500">
                                {assignment.subject} • 마감: {assignment.dueDate}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.submitted}/{assignment.total}명
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
              onClick={() => setIsAssignmentModalOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClassPerformanceChartCard;
