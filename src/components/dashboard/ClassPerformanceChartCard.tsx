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
import { BarChart3, Info, BookOpen as BookIcon, ClipboardList } from 'lucide-react';
import AssignmentSelectionModal from './AssignmentSelectionModal';

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

  // Get color for a specific student
  const getStudentColor = (studentId: number): string | null => {
    return studentColorMap[studentId] || null;
  };

  // Generate chart data for assignments
  const getAssignmentChartData = React.useCallback(() => {
    return assignments.map((assignment) => {
      const dataPoint: any = {
        name: assignment.title,
        averageScore: assignment.averageScore,
        subject: assignment.subject,
      };

      // Add selected students' scores
      if (selectedStudents.length > 0 && selectedClass) {
        selectedStudents.forEach((studentId) => {
          const student = students[selectedClass]?.find((s) => s.id === studentId);
          if (student && assignment.studentScores) {
            const score = assignment.studentScores[studentId];
            const isAssigned = assignment.assignedStudents?.includes(studentId);

            if (!isAssigned) {
              dataPoint[student.name] = null; // Not assigned, don't show on chart
              dataPoint[`${student.name}_status`] = 'unassigned';
            } else if (score !== undefined) {
              dataPoint[student.name] = score; // Actual score
              dataPoint[`${student.name}_status`] = 'completed';
            } else {
              dataPoint[student.name] = 0; // Not taken, show as 0
              dataPoint[`${student.name}_status`] = 'not_taken';
            }
          }
        });
      }
      return dataPoint;
    });
  }, [assignments, selectedStudents, selectedClass, students]);

  // Filter assignment chart data based on selected assignments
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

          // Add selected students' scores
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
    return getAssignmentChartData(); // If no assignments selected, show all
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

        {/* Class Selection and Assignment Filter */}
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
            <div className="flex items-center gap-2">
              <BookIcon className="h-4 w-4 text-[#0072CE]" />
              <label className="text-sm font-medium text-gray-700">과제별 차트</label>
            </div>
            <AssignmentSelectionModal
              assignments={assignments}
              selectedAssignments={selectedAssignments}
              handleAssignmentSelect={handleAssignmentSelect}
              isAssignmentModalOpen={isAssignmentModalOpen}
              setIsAssignmentModalOpen={setIsAssignmentModalOpen}
            />
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
                            // Student score
                            const studentName = entry.dataKey;
                            const statusKey = `${studentName}_status`;
                            const status = payload[0].payload[statusKey];

                            let displayText = '';
                            let textColor = entry.stroke;

                            if (status === 'unassigned') {
                              displayText = '미배포 (-점)';
                              textColor = '#9ca3af'; // Gray
                            } else if (status === 'not_taken') {
                              displayText = '미응시 (-점)';
                              textColor = '#f59e0b'; // Orange
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

          {/* Custom Legend */}
          <div className="mt-4 relative z-10">
            {/* First row: Assignment Average */}
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

            {/* Second row: Selected Students */}
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
    </Card>
  );
};

export default ClassPerformanceChartCard;
