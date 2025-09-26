'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, ClipboardList, BarChart3, BookOpen, Calendar, MessageSquare, Info } from 'lucide-react';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StudentDashboard = () => {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);

  // 임시 클래스 데이터
  const classes = [
    { id: '1', name: '수학 1-1반' },
    { id: '2', name: '수학 1-2반' },
    { id: '3', name: '수학 2-1반' },
    { id: '4', name: '수학 2-2반' },
    { id: '5', name: '수학 3-1반' },
  ];

  // 임시 과제 데이터
  const assignments = [
    { id: '1', title: '1차 중간고사', subject: '수학', dueDate: '2024-03-15' },
    { id: '2', title: '2차 중간고사', subject: '수학', dueDate: '2024-04-20' },
    { id: '3', title: '기말고사', subject: '수학', dueDate: '2024-06-10' },
    { id: '4', title: '과제 1', subject: '수학', dueDate: '2024-03-01' },
    { id: '5', title: '과제 2', subject: '수학', dueDate: '2024-03-08' },
  ];

  // 성적 분석 차트 데이터
  const chartData = [
    {
      name: '1월',
      클래스평균: 85,
      본인평균: 78,
      과제수: 5,
    },
    {
      name: '2월',
      클래스평균: 88,
      본인평균: 82,
      과제수: 7,
    },
    {
      name: '3월',
      클래스평균: 82,
      본인평균: 75,
      과제수: 6,
    },
    {
      name: '4월',
      클래스평균: 90,
      본인평균: 85,
      과제수: 8,
    },
    {
      name: '5월',
      클래스평균: 87,
      본인평균: 80,
      과제수: 6,
    },
    {
      name: '6월',
      클래스평균: 92,
      본인평균: 88,
      과제수: 9,
    },
  ];

  // 과목별 평균 비교 데이터
  const subjectComparisonData = [
    { subject: '국어', 클래스평균: 85, 내평균: 78 },
    { subject: '영어', 클래스평균: 88, 내평균: 82 },
    { subject: '수학', 클래스평균: 82, 내평균: 75 },
  ];

  // 미제출 과제 데이터
  const unsubmittedAssignments = [
    { id: 1, title: '수학 과제 3', dueDate: '2024-03-15', subject: '수학' },
    { id: 2, title: '영어 에세이', dueDate: '2024-03-20', subject: '영어' },
  ];

  // 채점 완료 과제 데이터
  const completedAssignments = [
    { id: 1, title: '수학 과제 1', score: 85, maxScore: 100, subject: '수학' },
    { id: 2, title: '국어 독서록', score: 92, maxScore: 100, subject: '국어' },
  ];

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || '학생'}님의 대시보드`}
        variant="default"
        description="학습 현황과 성적을 확인하세요"
      />

      {/* Main Dashboard Card */}
      <Card className="flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-medium">대시보드</h2>
          <span className="text-sm font-normal text-gray-400">
            실시간 업데이트
          </span>
        </CardHeader>
        <CardContent>
          {/* Selection Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">클래스 선택</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="나의 클래스 중 선택" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">과제 선택 (최소 3개-최대 5개)</label>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="과제를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Section - Class vs Personal Average Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">성적 분석</h3>
                <div className="relative group ml-2">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    막대 그래프: 클래스 평균<br />
                    선 그래프: 본인 평균<br />
                    월별 성적 추이를 확인할 수 있습니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>클래스 평균 막대</p>
                <p>본인 평균 라인</p>
              </div>
              <div className="h-96 bg-white rounded-lg border border-gray-200 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    width={500}
                    height={400}
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 80,
                      bottom: 20,
                      left: 20,
                    }}
                    style={{ backgroundColor: 'white' }}
                  >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="name" label={{ value: '월', position: 'insideBottomRight', offset: 0 }} scale="band" />
                    <YAxis label={{ value: '점수', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="과제수" fill="#8884d8" stroke="#8884d8" />
                    <Bar dataKey="클래스평균" barSize={20} fill="#413ea0" />
                    <Line type="monotone" dataKey="본인평균" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Section - Subject Comparison */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">과목별 평균 비교</h3>
                <div className="relative group ml-2">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    클래스에서 (국, 영, 수) 평균<br />
                    내 평균 비교<br />
                    과목별 성적을 확인할 수 있습니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>클래스에서 (국, 영, 수) 평균</p>
                <p>내 평균 비교</p>
              </div>
              <div className="h-96 bg-white rounded-lg border border-gray-200 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    width={500}
                    height={400}
                    data={subjectComparisonData}
                    margin={{
                      top: 20,
                      right: 80,
                      bottom: 20,
                      left: 20,
                    }}
                    style={{ backgroundColor: 'white' }}
                  >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="subject" label={{ value: '과목', position: 'insideBottomRight', offset: 0 }} scale="band" />
                    <YAxis label={{ value: '점수', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="클래스평균" barSize={20} fill="#413ea0" />
                    <Bar dataKey="내평균" barSize={20} fill="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Bottom - Unsubmitted Assignments */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ClipboardList className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">과제 미제출</h3>
              </div>
              <div className="h-64 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
                {unsubmittedAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {unsubmittedAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-xs text-gray-500">{assignment.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-red-600 font-medium">미제출</p>
                          <p className="text-xs text-gray-500">마감: {assignment.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">미제출 과제가 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Bottom - Completed Assignments */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">과제 채점 완료 (결과 확인)</h3>
              </div>
              <div className="h-64 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
                {completedAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {completedAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-xs text-gray-500">{assignment.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{assignment.score}/{assignment.maxScore}</p>
                          <p className="text-xs text-gray-500">채점완료</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 text-sm">채점 완료된 과제가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;