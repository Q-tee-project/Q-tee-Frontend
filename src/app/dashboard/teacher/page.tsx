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

const TeacherDashboard = () => {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = React.useState('');

  // 임시 클래스 데이터
  const classes = [
    { id: '1', name: '수학 1-1반' },
    { id: '2', name: '수학 1-2반' },
    { id: '3', name: '수학 2-1반' },
    { id: '4', name: '수학 2-2반' },
    { id: '5', name: '수학 3-1반' },
  ];

  // 임시 학생 데이터
  const students: Record<string, Array<{id: number, name: string, grade: number, attendance: number}>> = {
    '1': [
      { id: 1, name: '김민수', grade: 85, attendance: 95 },
      { id: 2, name: '이지영', grade: 92, attendance: 98 },
      { id: 3, name: '박준호', grade: 78, attendance: 90 },
      { id: 4, name: '최수진', grade: 88, attendance: 92 },
      { id: 5, name: '정현우', grade: 95, attendance: 100 },
    ],
    '2': [
      { id: 6, name: '강민지', grade: 82, attendance: 88 },
      { id: 7, name: '윤태현', grade: 90, attendance: 95 },
      { id: 8, name: '임소영', grade: 75, attendance: 85 },
      { id: 9, name: '한지훈', grade: 87, attendance: 93 },
    ],
    '3': [
      { id: 10, name: '송예린', grade: 89, attendance: 96 },
      { id: 11, name: '조민석', grade: 83, attendance: 91 },
      { id: 12, name: '배지원', grade: 91, attendance: 97 },
      { id: 13, name: '오현수', grade: 76, attendance: 87 },
      { id: 14, name: '신유진', grade: 94, attendance: 99 },
    ],
    '4': [
      { id: 15, name: '권도현', grade: 86, attendance: 94 },
      { id: 16, name: '서나연', grade: 79, attendance: 89 },
      { id: 17, name: '홍성민', grade: 93, attendance: 98 },
    ],
    '5': [
      { id: 18, name: '김하늘', grade: 88, attendance: 95 },
      { id: 19, name: '이준서', grade: 81, attendance: 92 },
      { id: 20, name: '박서연', grade: 90, attendance: 97 },
      { id: 21, name: '최민규', grade: 85, attendance: 93 },
    ],
  };

  // 성적 분석 차트 데이터
  const chartData = [
    {
      name: '1월',
      전체평균: 85,
      학생평균: 78,
      과제수: 5,
    },
    {
      name: '2월',
      전체평균: 88,
      학생평균: 82,
      과제수: 7,
    },
    {
      name: '3월',
      전체평균: 82,
      학생평균: 75,
      과제수: 6,
    },
    {
      name: '4월',


      전체평균: 90,
      학생평균: 85,
      과제수: 8,
    },
    {
      name: '5월',
      전체평균: 87,
      학생평균: 80,
      과제수: 6,
    },
    {
      name: '6월',
      전체평균: 92,
      학생평균: 88,
      과제수: 9,
    },
  ];

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || '선생님'}님의 대시보드`}
        variant="default"
        description="수업 현황과 학생 관리를 확인하세요"
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
              <div className="text-sm text-gray-600">총 클래스</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex justify-center mb-2">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">248</div>
              <div className="text-sm text-gray-600">총 문제</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-center mb-2">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
              <div className="text-sm text-gray-600">진행 중 과제</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">156</div>
              <div className="text-sm text-gray-600">총 학생</div>
            </div>
          </div>

          {/* Class Selection */}
          <div className="mb-6">
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
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section - Chart Area */}
            <div className="bg-gray-50 rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedClass ? classes.find(c => c.id === selectedClass)?.name : '클래스'} 성적 분석
                </h3>
                <div className="relative group ml-2">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="relative group ml-2">
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    막대 그래프: 전체 평균 성적<br />
                    선 그래프: 학생별 평균 성적<br />
                    클래스별 성적 추이를 확인할 수 있습니다
                  </div>
                </div>
                </div>
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
                  >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="name" label={{ value: '월', position: 'insideBottomRight', offset: 0 }} scale="band" />
                    <YAxis label={{ value: '점수', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="과제수" fill="#8884d8" stroke="#8884d8" />
                    <Bar dataKey="전체평균" barSize={20} fill="#413ea0" />
                    <Line type="monotone" dataKey="학생평균" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Section - Student List */}
            <div className="bg-gray-50 rounded-lg p-6 lg:col-span-1">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">학생 관리</h3>
                <div className="relative group ml-2">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    클래스를 선택하면<br />
                    해당 클래스의 학생 목록이<br />
                    표시됩니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
                <div className="h-96 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {selectedClass ? (
                    <div className="h-full overflow-y-auto">
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {classes.find(c => c.id === selectedClass)?.name} 학생 목록
                          </span>
                          <span className="text-xs text-gray-500">
                            총 {students[selectedClass as keyof typeof students]?.length || 0}명
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        {students[selectedClass as keyof typeof students]?.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-blue-600">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">학생 ID: {student.id}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{student.grade}점</p>
                              <p className="text-xs text-gray-500">출석률 {student.attendance}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">클래스를 선택해주세요</p>
                        <p className="text-gray-400 text-xs mt-1">위의 드롭다운에서 클래스를 선택하면</p>
                        <p className="text-gray-400 text-xs">해당 클래스의 학생 목록이 표시됩니다</p>
                      </div>
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

export default TeacherDashboard;
