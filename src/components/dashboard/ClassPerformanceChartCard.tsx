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
import { BarChart3, Info, BookOpen as BookIcon, ClipboardList, Calendar as CalendarIcon, Search, Settings } from 'lucide-react';
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

const ClassPerformanceChartCard = React.memo(({
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
    console.log('📊 차트 데이터 생성 시작...');
    console.log('📚 과제 데이터 개수:', assignments.length);
    console.log('👥 선택된 학생 개수:', selectedStudents.length);
    console.log('👥 선택된 학생 ID들:', selectedStudents);
    console.log('🏫 선택된 클래스:', selectedClass);
    console.log('👥 학생 데이터 클래스 수:', Object.keys(students).length);
    
    // 선택된 학생들의 상세 정보 확인
    if (selectedClass && students[selectedClass]) {
      console.log('👥 선택된 클래스의 학생들:', students[selectedClass]);
      selectedStudents.forEach(studentId => {
        const student = students[selectedClass].find(s => s.id === studentId);
        console.log(`👤 선택된 학생 ${studentId}:`, student);
      });
    }
    
    console.log('📚 과제 데이터 상세:', assignments.map(a => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      averageScore: a.averageScore,
      studentScores: a.studentScores,
      assignedStudents: a.assignedStudents
    })));
    
    console.log('👥 선택된 학생 상세:', selectedStudents);
    console.log('👥 학생 데이터 상세:', students);
    
    return assignments.map((assignment) => {
      console.log(`📝 과제 ${assignment.title} 차트 데이터 생성 중...`);
      console.log(`📊 과제 점수 데이터:`, assignment.studentScores);
      console.log(`📊 과제 점수 데이터 타입:`, typeof assignment.studentScores);
      console.log(`📊 과제 점수 데이터 키들:`, assignment.studentScores ? Object.keys(assignment.studentScores) : '없음');
      console.log(`👥 배정된 학생:`, assignment.assignedStudents);
      console.log(`👥 배정된 학생 타입:`, typeof assignment.assignedStudents);
      console.log(`👥 배정된 학생 길이:`, Array.isArray(assignment.assignedStudents) ? assignment.assignedStudents.length : '배열이 아님');
      
      const dataPoint: any = {
        name: assignment.title,
        averageScore: assignment.averageScore,
        subject: assignment.subject,
      };

      if (selectedStudents.length > 0 && selectedClass) {
        console.log(`👥 선택된 학생 ${selectedStudents.length}명 처리 중...`);
        console.log(`🏫 현재 클래스 ${selectedClass}의 학생들:`, students[selectedClass]);
        
        selectedStudents.forEach((studentId) => {
          const student = students[selectedClass]?.find((s) => s.id === studentId);
          console.log(`👤 학생 ${studentId} 처리 중:`, student);
          console.log(`🔍 학생 ${studentId} 검색 결과:`, {
            studentId,
            student,
            studentsInClass: students[selectedClass],
            foundStudent: students[selectedClass]?.find(s => s.id === studentId)
          });
          
          if (student) {
            // 학생이 존재하는 경우, 점수 데이터와 배정 상태 확인
            const score = assignment.studentScores?.[studentId];
            const isAssigned = assignment.assignedStudents?.includes(studentId);
            
            console.log(`📊 학생 ${student.name} 점수 정보:`, {
              score,
              isAssigned,
              studentId,
              hasScore: score !== undefined,
              studentScoresKeys: assignment.studentScores ? Object.keys(assignment.studentScores) : '없음',
              assignedStudentsArray: assignment.assignedStudents
            });
            
            console.log(`🔍 학생 ${student.name} 상세 분석:`, {
              studentId,
              studentIdType: typeof studentId,
              score,
              scoreType: typeof score,
              isAssigned,
              hasStudentScores: !!assignment.studentScores,
              studentScoresValue: assignment.studentScores?.[studentId]
            });

            if (!isAssigned) {
              // 미배포: 0으로 표시하여 차트에 표시되지만 평균에는 영향 없음
              dataPoint[student.name] = 0;
              dataPoint[`${student.name}_status`] = 'unassigned';
              console.log(`학생 ${student.name}: 과제 미배포 (0으로 표시)`);
            } else if (score !== undefined && score !== null) {
              // 응시 완료: 실제 점수 표시
              dataPoint[student.name] = score;
              dataPoint[`${student.name}_status`] = 'completed';
              console.log(`학생 ${student.name}: ${score}점`);
            } else {
              // 미응시/미제출: 0으로 표시하여 차트에 표시되지만 평균에는 영향 없음
              dataPoint[student.name] = 0;
              dataPoint[`${student.name}_status`] = 'not_taken';
              console.log(`학생 ${student.name}: 미응시 (0으로 표시)`);
            }
          } else {
            console.log(`학생 ${studentId} 데이터 없음:`, { 
              student, 
              hasScores: !!assignment.studentScores,
              selectedClass,
              studentsInClass: students[selectedClass]
            });
          }
        });
      }
      

      return dataPoint;
    });
  }, [assignments, selectedStudents, selectedClass, students]);

  const assignmentChartData = React.useMemo(() => {

    if (selectedAssignments.length > 0) {

      const filteredData = selectedAssignments
        .map((assignmentId) => {
          const assignment = assignments.find((a) => a.id === assignmentId);

          
          if (!assignment) {

            return null;
          }


          const dataPoint: any = {
            name: assignment.title,
            averageScore: assignment.averageScore,
            subject: assignment.subject,
          };

          if (selectedStudents.length > 0 && selectedClass) {
            console.log(`👥 선택된 학생 ${selectedStudents.length}명 처리 중...`);
            console.log(`🏫 현재 클래스 ${selectedClass}의 학생들:`, students[selectedClass]);
            
            selectedStudents.forEach((studentId) => {
              const student = students[selectedClass]?.find((s) => s.id === studentId);
              console.log(`👤 학생 ${studentId} 처리 중:`, student);
              console.log(`🔍 학생 ${studentId} 검색 결과:`, {
                studentId,
                student,
                studentsInClass: students[selectedClass],
                foundStudent: students[selectedClass]?.find(s => s.id === studentId)
              });
              
              if (student) {
                // 학생이 존재하는 경우, 점수 데이터와 배정 상태 확인
                const score = assignment.studentScores?.[studentId];
                const isAssigned = assignment.assignedStudents?.includes(studentId);
                
                console.log(`📊 학생 ${student.name} 점수 정보:`, {
                  score,
                  isAssigned,
                  studentId,
                  hasScore: score !== undefined,
                  studentScores: assignment.studentScores,
                  assignedStudents: assignment.assignedStudents
                });
                
                console.log(`🔍 학생 ${student.name} 상세 분석:`, {
                  studentId,
                  studentIdType: typeof studentId,
                  score,
                  scoreType: typeof score,
                  isAssigned,
                  hasStudentScores: !!assignment.studentScores,
                  studentScoresValue: assignment.studentScores?.[studentId]
                });

              if (!isAssigned) {
                // 미배포: 0으로 표시하여 차트에 표시되지만 평균에는 영향 없음
                dataPoint[student.name] = 0;
                dataPoint[`${student.name}_status`] = 'unassigned';
                console.log(`❌ 학생 ${student.name}: 과제 미배포 (0으로 표시)`);
              } else if (score !== undefined && score !== null) {
                // 응시 완료: 실제 점수 표시
                dataPoint[student.name] = score;
                dataPoint[`${student.name}_status`] = 'completed';
                console.log(`✅ 학생 ${student.name}: ${score}점`);
              } else {
                // 미응시/미제출: 0으로 표시하여 차트에 표시되지만 평균에는 영향 없음
                dataPoint[student.name] = 0;
                dataPoint[`${student.name}_status`] = 'not_taken';
                console.log(`⏳ 학생 ${student.name}: 미응시 (0으로 표시)`);
              }
              } else {
                console.log(`⚠️ 학생 ${studentId} 데이터 없음:`, { 
                  student, 
                  hasScores: !!assignment.studentScores,
                  selectedClass,
                  studentsInClass: students[selectedClass]
                });
              }
            });
          }
          
          console.log(`📋 선택된 과제 ${assignment.title} 최종 차트 데이터:`, dataPoint);
          return dataPoint;
        })
        .filter(Boolean);
      
      console.log('📊 선택된 과제 차트 데이터 완성:', filteredData);
      console.log('📊 선택된 과제 차트 데이터 상세:', filteredData.map(d => {
        const studentData: any = {};
        selectedStudents.forEach(studentId => {
          const student = students[selectedClass]?.find(s => s.id === studentId);
          if (student) {
            studentData[student.name] = (d as any)[student.name];
            studentData[`${student.name}_status`] = (d as any)[`${student.name}_status`];
          }
        });
        return {
          name: d.name,
          averageScore: d.averageScore,
          ...studentData
        };
      }));
      return filteredData;
    }
    
    console.log('📊 전체 과제 차트 데이터 사용');
    const allData = getAssignmentChartData();
    console.log('📊 전체 과제 차트 데이터 상세:', allData.map(d => {
      const studentData: any = {};
      selectedStudents.forEach(studentId => {
        const student = students[selectedClass]?.find(s => s.id === studentId);
        if (student) {
          studentData[student.name] = (d as any)[student.name];
          studentData[`${student.name}_status`] = (d as any)[`${student.name}_status`];
        }
      });
      return {
        name: d.name,
        averageScore: d.averageScore,
        ...studentData
      };
    }));
    return allData;
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
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="relative flex-1 bg-white rounded-lg p-4" style={{ minHeight: '32rem' }}>
          {assignmentChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">표시할 과제가 없습니다</h3>
                <p className="text-gray-500 mb-4">
                  {selectedAssignments.length === 0 
                    ? "과제를 선택하거나 새로운 과제를 생성해주세요."
                    : "선택된 과제에 대한 데이터가 없습니다."
                  }
                </p>
                <div className="text-sm text-gray-400">
                  <p>• 과제를 배포하고 학생들이 응시하면</p>
                  <p>• 여기에 성적 차트가 표시됩니다</p>
                </div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={assignmentChartData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 100,
                  left: 20,
                }}
                style={{ backgroundColor: 'white' }}
              >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis
                dataKey="name"
                type="category"
                tick={{ 
                  fontSize: 10,
                  textAnchor: 'middle',
                  dominantBaseline: 'hanging'
                }}
                tickLine={false}
                axisLine={false}
                tickMargin={15}
                interval={0}
                angle={-30}
                textAnchor="end"
                domain={['dataMin', 'dataMax']}
                height={120}
                tickFormatter={(value) => {
                  // 긴 텍스트를 줄바꿈으로 처리
                  if (value.length > 12) {
                    const words = value.split(' ');
                    const lines = [];
                    let currentLine = '';
                    
                    for (const word of words) {
                      if ((currentLine + word).length > 12) {
                        if (currentLine) lines.push(currentLine.trim());
                        currentLine = word + ' ';
                      } else {
                        currentLine += word + ' ';
                      }
                    }
                    if (currentLine) lines.push(currentLine.trim());
                    
                    return lines.length > 2 ? lines.slice(0, 2).join('\n') + '...' : lines.join('\n');
                  }
                  return value;
                }}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    console.log('🖱️ 툴팁 표시:', payload[0].payload);
                    
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
                            const score = entry.value;

                            console.log(`학생 ${studentName} 툴팁 정보:`, {
                              score,
                              status,
                              dataKey: entry.dataKey
                            });

                            let displayText = '';
                            let textColor = entry.stroke;

                            if (status === 'unassigned') {
                              displayText = '미배포';
                              textColor = '#9ca3af';
                            } else if (status === 'not_taken') {
                              displayText = '미응시';
                              textColor = '#ef4444';
                            } else if (status === 'completed' && score !== null && score !== undefined && score >= 0) {
                              displayText = `${score}점`;
                              textColor = entry.stroke;
                            } else {
                              displayText = '미응시';
                              textColor = '#ef4444';
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
                  console.log(`📈 학생 ${studentId} Line 차트 생성:`, student);
                  console.log(`🔍 Line 차트 생성 시 학생 검색:`, {
                    studentId,
                    student,
                    selectedClass,
                    studentsInClass: students[selectedClass],
                    foundStudent: students[selectedClass]?.find(s => s.id === studentId)
                  });
                  
                  if (!student) {
                    return null;
                  }

                  const color = getStudentColor(studentId);
                  return (
                    <Line
                      key={studentId}
                      type="linear"
                      dataKey={student.name}
                      stroke={color || '#9ca3af'}
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const value = payload[student.name];
                        const status = payload[`${student.name}_status`];
                        
                        // 모든 값에 대해 점 표시 (0점도 포함)
                        if (value !== null && value !== undefined) {
                          let dotColor = color || '#9ca3af';
                          let dotRadius = 4;
                          
                          // 상태에 따른 색상 및 크기 조정
                          if (status === 'unassigned') {
                            dotColor = '#9ca3af'; // 회색
                            dotRadius = 3;
                          } else if (status === 'not_taken') {
                            dotColor = '#ef4444'; // 빨간색
                            dotRadius = 3;
                          } else if (status === 'completed') {
                            dotColor = color || '#9ca3af'; // 학생 색상
                            dotRadius = 4;
                          }
                          
                          return (
                            <circle
                              key={`${student.name}-${status}-${cx}-${cy}`}
                              cx={cx}
                              cy={cy}
                              r={dotRadius}
                              fill={dotColor}
                              stroke={dotColor}
                              strokeWidth={2}
                            />
                          );
                        }
                        
                        // 값이 없는 경우 투명한 점
                        return (
                          <circle
                            key={`${student.name}-hidden-${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={0}
                            fill="transparent"
                            stroke="transparent"
                          />
                        );
                      }}
                      activeDot={{ 
                        r: 6,
                        fill: color || '#9ca3af',
                        stroke: color || '#9ca3af'
                      }}
                      connectNulls={false}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          )}

          <div className="mt-2 relative z-10 px-4 overflow-hidden">
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor: '#60a5fa',
                  }}
                ></div>
                <span className="text-sm text-blue-600 font-medium">과제평균</span>
              </div>

              {selectedStudents.length > 0 && selectedClass && (
                <>
                  {selectedStudents.map((studentId) => {
                    const student = students[selectedClass]?.find((s) => s.id === studentId);
                    if (!student) return null;
                    const color = getStudentColor(studentId);
                    return (
                      <div key={studentId} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: color || '#9ca3af' }}
                        ></div>
                        <span 
                          className="text-sm truncate max-w-[80px] block" 
                          style={{ color: color || '#9ca3af' }}
                          title={student.name}
                        >
                          {student.name}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
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
});

export default ClassPerformanceChartCard;
