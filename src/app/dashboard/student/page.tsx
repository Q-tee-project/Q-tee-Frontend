'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
import { FileText, ClipboardList, BarChart3, BookOpen, Clock, CheckCircle, Calendar, Settings } from 'lucide-react';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = React.useState('1'); // 기본값: 첫 번째 클래스
  const [selectedAssignment, setSelectedAssignment] = React.useState('');
  const [dashboardAssignments, setDashboardAssignments] = React.useState<any[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(false);
  const [chartType, setChartType] = React.useState<'period' | 'assignment'>('period'); // 기본값: 기간별
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);
  const [showPeriodModal, setShowPeriodModal] = React.useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = React.useState(false);
  const [tempSelectedAssignments, setTempSelectedAssignments] = React.useState<string[]>([]);
  const [customStartYear, setCustomStartYear] = React.useState('');
  const [customStartMonth, setCustomStartMonth] = React.useState('');
  const [customEndYear, setCustomEndYear] = React.useState('');
  const [customEndMonth, setCustomEndMonth] = React.useState('');

  // 임시 클래스 데이터
  const classes = [
    { id: '1', name: '클래스 A' },
    { id: '2', name: '클래스 B' },
    { id: '3', name: '클래스 C' },
    { id: '4', name: '클래스 D' },
    { id: '5', name: '클래스 E' },
  ];

  // 임시 과제 데이터
  const assignments = [
    { id: '1', name: '1차 중간고사' },
    { id: '2', name: '2차 중간고사' },
    { id: '3', name: '기말고사' },
    { id: '4', name: '과제 1' },
    { id: '5', name: '과제 2' },
    { id: '6', name: '과제 3' },
    { id: '7', name: '과제 4' },
  ];

  // 레이더 차트 데이터
  const radarData = [
    {
      subject: '국어',
      클래스평균: 85,
      내점수: 40,
      fullMark: 100,
    },
    {
      subject: '영어',
      클래스평균: 60,
      내점수: 92,
      fullMark: 100,
    },
    {
      subject: '수학',
      클래스평균: 82,
      내점수: 75,
      fullMark: 100,
    },
  ];

  // 기본 ComposedChart 데이터
  const defaultChartData = [
    {
      name: '1월',
      클래스평균: 85,
      내점수: 78,
      과제수: 5,
    },
    {
      name: '2월',
      클래스평균: 88,
      내점수: 82,
      과제수: 7,
    },
    {
      name: '3월',
      클래스평균: 82,
      내점수: 75,
      과제수: 6,
    },
    {
      name: '4월',
      클래스평균: 90,
      내점수: 85,
      과제수: 8,
    },
    {
      name: '5월',
      클래스평균: 87,
      내점수: 80,
      과제수: 6,
    },
    {
      name: '6월',
      클래스평균: 92,
      내점수: 88,
      과제수: 9,
    },
  ];

  // 동적 차트 데이터 생성
  const getChartData = () => {
    if (chartType === 'assignment' && selectedAssignments.length > 0) {
      // 과제별 차트 데이터
      return selectedAssignments.map((assignmentId, index) => {
        const assignment = assignments.find(a => a.id === assignmentId);
        return {
          name: assignment?.name || `과제${index + 1}`,
          클래스평균: Math.floor(Math.random() * 20) + 80, // 임시 데이터
          내점수: Math.floor(Math.random() * 20) + 75, // 임시 데이터
          과제수: Math.floor(Math.random() * 5) + 3, // 임시 데이터
        };
      });
    } else if (chartType === 'period') {
      // 기간별 차트 데이터 (선택된 기간에 따라 필터링)
      if (customStartYear && customEndYear && customStartMonth && customEndMonth) {
        // 커스텀 기간에 따른 데이터 필터링 로직
        return defaultChartData; // 임시로 기본 데이터 반환
      }
      return defaultChartData;
    }
    return defaultChartData;
  };

  const composedChartData = getChartData();

  // 과제 데이터 로딩
  React.useEffect(() => {
    if (userProfile?.id) {
      loadDashboardAssignments();
    }
  }, [userProfile]);

  const loadDashboardAssignments = async () => {
    if (!userProfile?.id) return;
    
    setIsLoadingAssignments(true);
    try {
      const allAssignments: any[] = [];
      
      // 수학 과제
      try {
        const mathAssignments = await mathService.getStudentAssignments(userProfile.id);
        allAssignments.push(...mathAssignments.map((assignment: any) => ({
          ...assignment,
          subject: '수학',
          id: assignment.assignment_id,
          title: assignment.title,
          problem_count: assignment.problem_count,
          status: assignment.status,
          deployed_at: assignment.deployed_at,
        })));
      } catch (error) {
        console.log('수학 과제 로드 실패:', error);
      }

      // 국어 과제
      try {
        const koreanAssignments = await koreanService.getStudentAssignments(userProfile.id);
        allAssignments.push(...koreanAssignments.map((assignment: any) => ({
          ...assignment,
          subject: '국어',
          id: assignment.assignment_id,
          title: assignment.title,
          problem_count: assignment.problem_count,
          status: assignment.status,
          deployed_at: assignment.deployed_at,
        })));
      } catch (error) {
        console.log('국어 과제 로드 실패:', error);
      }

      // 영어 과제
      try {
        const englishAssignments = await EnglishService.getStudentAssignments(userProfile.id);
        allAssignments.push(...englishAssignments.map((assignment: any) => ({
          ...assignment,
          subject: '영어',
          id: assignment.assignment?.id || assignment.assignment_id,
          title: assignment.assignment?.title || assignment.title,
          problem_count: assignment.assignment?.total_questions || assignment.total_questions,
          status: assignment.deployment?.status || assignment.status,
          deployed_at: assignment.deployment?.deployed_at || assignment.deployed_at,
        })));
      } catch (error) {
        console.log('영어 과제 로드 실패:', error);
      }

      setDashboardAssignments(allAssignments);
      console.log('📋 로드된 모든 과제:', allAssignments);
      console.log('📋 과제 상태들:', allAssignments.map(a => ({ title: a.title, status: a.status, subject: a.subject })));
      
      // 미응시 과제 디버깅
      const unsubmitted = allAssignments.filter(assignment => {
        const status = assignment.status?.toLowerCase();
        return status === 'deployed' || 
               status === 'assigned' || 
               status === '미응시' ||
               status === 'not_started' ||
               status === 'pending' ||
               !status;
      });
      console.log('📋 미응시 과제들:', unsubmitted);
    } catch (error) {
      console.error('과제 로드 실패:', error);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  // 과제 상태별 분류 (더 유연한 필터링)
  const unsubmittedAssignments = dashboardAssignments.filter(assignment => {
    const status = assignment.status?.toLowerCase();
    console.log(`🔍 과제 "${assignment.title}" 상태 확인:`, status);
    
    // 미응시 상태들 (더 포괄적으로)
    const isUnsubmitted = status === 'deployed' || 
           status === 'assigned' || 
           status === '미응시' ||
           status === 'not_started' ||
           status === 'pending' ||
           status === 'active' ||
           status === 'available' ||
           !status; // 상태가 없는 경우도 미제출로 간주
    
    console.log(`🔍 "${assignment.title}" 미응시 여부:`, isUnsubmitted);
    return isUnsubmitted;
  });

  const gradedAssignments = dashboardAssignments.filter(assignment => {
    const status = assignment.status?.toLowerCase();
    return status === 'completed' || 
           status === 'submitted' || 
           status === '응시' ||
           status === 'graded' ||
           status === 'finished';
  });

  // 디버깅용 로그
  console.log('🔍 미제출 과제들:', unsubmittedAssignments);
  console.log('🔍 채점 완료 과제들:', gradedAssignments);

  // 과제 클릭 핸들러
  const handleAssignmentClick = (assignment: any) => {
    router.push('/test');
  };

  // 과제 선택 핸들러 (드롭다운에서 선택)
  const handleAssignmentSelect = (assignmentId: string) => {
    if (assignmentId && !selectedAssignments.includes(assignmentId) && selectedAssignments.length < 5) {
      setSelectedAssignments(prev => [...prev, assignmentId]);
      setSelectedAssignment(''); // 드롭다운 초기화
    }
  };

  // 과제 제거 핸들러 (배지에서 제거)
  const handleAssignmentRemove = (assignmentId: string) => {
    setSelectedAssignments(prev => prev.filter(id => id !== assignmentId));
  };

  // 기간 설정 적용
  const handlePeriodApply = () => {
    // 날짜 유효성 검사
    if (!customStartYear || !customStartMonth || !customEndYear || !customEndMonth) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    // 오늘 이후 날짜 체크
    const today = new Date();
    const endDate = new Date(parseInt(customEndYear), parseInt(customEndMonth) - 1);
    if (endDate > today) {
      alert('오늘 이후 날짜는 선택할 수 없습니다.');
      return;
    }

    // 최대 10개월 체크
    const startDate = new Date(parseInt(customStartYear), parseInt(customStartMonth) - 1);
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    if (monthDiff > 10) {
      alert('최대 10개월까지 선택 가능합니다.');
      return;
    }

    setShowPeriodModal(false);
    // 차트 데이터가 자동으로 업데이트됨 (composedChartData가 변경됨)
  };

  // 과제 선택 모달 열기
  const handleOpenAssignmentModal = () => {
    setTempSelectedAssignments([...selectedAssignments]);
    setShowAssignmentModal(true);
  };

  // 과제 선택 모달 적용
  const handleAssignmentModalApply = () => {
    if (tempSelectedAssignments.length < 1) {
      alert('최소 1개 이상의 과제를 선택해주세요.');
      return;
    }
    if (tempSelectedAssignments.length > 5) {
      alert('최대 5개까지 선택 가능합니다.');
      return;
    }
    setSelectedAssignments(tempSelectedAssignments);
    setShowAssignmentModal(false);
  };

  // 과제 선택/해제
  const handleAssignmentToggle = (assignmentId: string) => {
    setTempSelectedAssignments(prev => {
      if (prev.includes(assignmentId)) {
        return prev.filter(id => id !== assignmentId);
      } else if (prev.length < 5) {
        return [...prev, assignmentId];
      }
      return prev;
    });
  };

  // 년도 옵션 생성
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i.toString());
    }
    return years;
  };

  // 월 옵션 생성
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  };

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || '학생'}님의 대시보드`}
        variant="default"
        description="나의 학습 현황과 성적을 확인하세요"
      />

      {/* Main Dashboard Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Left Section */}
        <div className="flex flex-col gap-6 lg:col-span-2 h-full">
          
          {/* Left Top - 과제별 평균 대비 내 점수 */}
          <Card className="flex-1 shadow-sm p-5">
            <CardHeader className="border-b border-gray-100 pb-0 mb-0">
              <h3 className="text-xl font-bold text-gray-900 m-0 p-0">과제별 평균 대비 내 점수</h3>
        </CardHeader>
            <div>
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

                {/* 3. 기간별 선택 시 기간 설정 */}
                {chartType === 'period' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPeriodModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    기간 설정
                  </Button>
                )}

                {/* 4. 과제별 선택 시 과제 선택 버튼 */}
                {chartType === 'assignment' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleOpenAssignmentModal}
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
                          onClick={() => handleAssignmentRemove(assignmentId)}
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
            <CardContent className="pt-4">
              <div className="h-96 bg-white rounded-lg border border-gray-200">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={composedChartData}
                    margin={{
                      top: 20,
                      right: 20,
                      bottom: 20,
                      left: 20,
                    }}
                  >
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="name" scale="band" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="과제수" fill="#8884d8" stroke="#8884d8" />
                    <Bar dataKey="클래스평균" barSize={20} fill="#413ea0" />
                    <Line type="monotone" dataKey="내점수" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Left Bottom - Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* Assignment Not Submitted */}
            <Card className="shadow-sm h-full flex flex-col p-5">
              <CardHeader className="border-b border-gray-100 pb-0 mb-0">
                <h3 className="text-xl font-bold text-gray-900 m-0 p-0">과제 미제출</h3>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-full bg-white rounded-lg border border-gray-200 overflow-y-auto">
                  {isLoadingAssignments ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-xs">로딩 중...</p>
                      </div>
                    </div>
                  ) : unsubmittedAssignments.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <ClipboardList className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">미제출 과제가 없습니다</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 p-5">
                      {unsubmittedAssignments.map((assignment, index) => (
                        <div
                          key={index}
                          onClick={() => handleAssignmentClick(assignment)}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {assignment.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {assignment.subject || '과목 미지정'}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {assignment.problem_count || 0}문제
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="text-xs text-orange-500 font-medium">미응시</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assignment Graded */}
            <Card className="shadow-sm h-full flex flex-col p-5">
              <CardHeader className="border-b border-gray-100 pb-0 mb-0">
                <h3 className="text-xl font-bold text-gray-900 m-0 p-0">과제 채점 완료</h3>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-full bg-white rounded-lg border border-gray-200 overflow-y-auto">
                  {isLoadingAssignments ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-xs">로딩 중...</p>
              </div>
                        </div>
                  ) : gradedAssignments.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">채점 완료된 과제가 없습니다</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {gradedAssignments.slice(0, 3).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleAssignmentClick(assignment)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {assignment.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                                  {assignment.subject}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {assignment.problem_count}문제
                                </span>
                                {assignment.score && (
                                  <span className="text-xs font-medium text-green-600">
                                    {assignment.score}점
                                  </span>
                                )}
                              </div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                      {gradedAssignments.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{gradedAssignments.length - 3}개 더
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Section */}
        <Card className="shadow-sm lg:col-span-1 h-full flex flex-col p-5">
          <CardHeader className="border-b border-gray-100 pb-0 mb-0">
            <h3 className="text-xl font-bold text-gray-900 m-0 p-0">과목별 평균 대비 내 성취도</h3>
          </CardHeader>
          <div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">클래스 선택</label>
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
            </div>
          </div>
          <CardContent className="flex-1 pt-4">
            <div className="h-96 bg-white rounded-lg border border-gray-200">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="클래스평균" dataKey="클래스평균" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="내점수" dataKey="내점수" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* 과목별 점수 요약 정보 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                {/* 국어 */}
                <div className="p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">국어</span>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">i</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-2 text-left">전체 평균</div>
                      <div className="flex flex-col justify-center items-center p-4 bg-green-50 rounded-lg h-24">
                        <div className="text-2xl font-bold text-gray-900">
                          {radarData.find(item => item.subject === '국어')?.클래스평균 || 0}점
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-2 text-left">내 평균</div>
                      <div className="flex flex-col justify-center items-center p-4 bg-green-50 rounded-lg h-24">
                        <div className="text-2xl font-bold text-gray-900">
                          {radarData.find(item => item.subject === '국어')?.내점수 || 0}점
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (radarData.find(item => item.subject === '국어')?.내점수 || 0) >= 
                            (radarData.find(item => item.subject === '국어')?.클래스평균 || 0)
                              ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {(radarData.find(item => item.subject === '국어')?.내점수 || 0) >= 
                             (radarData.find(item => item.subject === '국어')?.클래스평균 || 0) ? '↗' : '↓'} 
                            {Math.abs((radarData.find(item => item.subject === '국어')?.내점수 || 0) - 
                                      (radarData.find(item => item.subject === '국어')?.클래스평균 || 0))}점
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 영어 */}
                <div className="p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">영어</span>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">i</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-2 text-left">전체 평균</div>
                      <div className="flex flex-col justify-center items-center p-4 bg-purple-50 rounded-lg h-24">
                        <div className="text-2xl font-bold text-gray-900">
                          {radarData.find(item => item.subject === '영어')?.클래스평균 || 0}점
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-2 text-left">내 평균</div>
                      <div className="flex flex-col justify-center items-center p-4 bg-purple-50 rounded-lg h-24">
                        <div className="text-2xl font-bold text-gray-900">
                          {radarData.find(item => item.subject === '영어')?.내점수 || 0}점
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (radarData.find(item => item.subject === '영어')?.내점수 || 0) >= 
                            (radarData.find(item => item.subject === '영어')?.클래스평균 || 0)
                              ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {(radarData.find(item => item.subject === '영어')?.내점수 || 0) >= 
                             (radarData.find(item => item.subject === '영어')?.클래스평균 || 0) ? '↗' : '↓'} 
                            {Math.abs((radarData.find(item => item.subject === '영어')?.내점수 || 0) - 
                                      (radarData.find(item => item.subject === '영어')?.클래스평균 || 0))}점
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 수학 */}
                <div className="p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">수학</span>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">i</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-2 text-left">전체 평균</div>
                      <div className="flex flex-col justify-center items-center p-4 bg-yellow-50 rounded-lg h-24">
                        <div className="text-2xl font-bold text-gray-900">
                          {radarData.find(item => item.subject === '수학')?.클래스평균 || 0}점
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="text-xs text-gray-500 mb-2 text-left">내 평균</div>
                      <div className="flex flex-col justify-center items-center p-4 bg-yellow-50 rounded-lg h-24">
                        <div className="text-2xl font-bold text-gray-900">
                          {radarData.find(item => item.subject === '수학')?.내점수 || 0}점
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (radarData.find(item => item.subject === '수학')?.내점수 || 0) >= 
                            (radarData.find(item => item.subject === '수학')?.클래스평균 || 0)
                              ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {(radarData.find(item => item.subject === '수학')?.내점수 || 0) >= 
                             (radarData.find(item => item.subject === '수학')?.클래스평균 || 0) ? '↗' : '↓'} 
                            {Math.abs((radarData.find(item => item.subject === '수학')?.내점수 || 0) - 
                                      (radarData.find(item => item.subject === '수학')?.클래스평균 || 0))}점
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

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
              onClick={handlePeriodApply}
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
                  onClick={() => handleAssignmentToggle(assignment.id)}
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
              onClick={handleAssignmentModalApply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
