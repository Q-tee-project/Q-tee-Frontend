'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';
import ClassAverage from '@/components/dashboard/student/ClassAverage';
import SubjectAverage from '@/components/dashboard/student/SubjectAverage';
import PendingAssignmentsList from '@/components/dashboard/student/PendingAssignmentsList';
import GradedAssignmentsList from '@/components/dashboard/student/GradedAssignmentsList';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = React.useState('1'); // 기본값: 첫 번째 클래스
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
  const [selectedMonth, setSelectedMonth] = React.useState('');

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
    },
    {
      name: '2월',
      클래스평균: 88,
      내점수: 82,
    },
    {
      name: '3월',
      클래스평균: 82,
      내점수: 75,
    },
    {
      name: '4월',
      클래스평균: 90,
      내점수: 85,
    },
    {
      name: '5월',
      클래스평균: 87,
      내점수: 80,
    },
    {
      name: '6월',
      클래스평균: 92,
      내점수: 88,
    },
    {
      name: '7월',
      클래스평균: 92,
      내점수: 88,
    },
    {
      name: '8월',
      클래스평균: 92,
      내점수: 88,
    },
    {
      name: '9월',
      클래스평균: 92,
      내점수: 88,
    },
    {
      name: '10월',
      클래스평균: 65,
      내점수: 70,
    },
    {
      name: '11월',
      클래스평균: 92,
      내점수: 50,
    },
    {
      name: '12월',
      클래스평균: 60,
      내점수: 88,
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
      // 월 선택 시 해당 월 데이터만 표시
      if (selectedMonth && selectedMonth !== 'all') {
        return defaultChartData.filter(item => item.name === selectedMonth);
      }
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        
        {/* Left Section */}
        <div className="flex flex-col gap-6 lg:col-span-3 h-full">
          
          {/* Left Top - 클래스별 과제별 전체 평균과 내 평균 */}
          <ClassAverage
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            chartType={chartType}
            setChartType={setChartType}
            selectedAssignments={selectedAssignments}
            setSelectedAssignments={setSelectedAssignments}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            showPeriodModal={showPeriodModal}
            setShowPeriodModal={setShowPeriodModal}
            showAssignmentModal={showAssignmentModal}
            setShowAssignmentModal={setShowAssignmentModal}
            tempSelectedAssignments={tempSelectedAssignments}
            setTempSelectedAssignments={setTempSelectedAssignments}
            customStartYear={customStartYear}
            setCustomStartYear={setCustomStartYear}
            customStartMonth={customStartMonth}
            setCustomStartMonth={setCustomStartMonth}
            customEndYear={customEndYear}
            setCustomEndYear={setCustomEndYear}
            customEndMonth={customEndMonth}
            setCustomEndMonth={setCustomEndMonth}
            composedChartData={composedChartData}
            classes={classes}
            assignments={assignments}
            defaultChartData={defaultChartData}
            onPeriodApply={handlePeriodApply}
            onOpenAssignmentModal={handleOpenAssignmentModal}
            onAssignmentModalApply={handleAssignmentModalApply}
            onAssignmentToggle={handleAssignmentToggle}
            onAssignmentRemove={handleAssignmentRemove}
            generateYearOptions={generateYearOptions}
            generateMonthOptions={generateMonthOptions}
          />

          {/* Left Bottom - Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* Assignment Not Submitted */}
            <PendingAssignmentsList
              unsubmittedAssignments={unsubmittedAssignments}
              isLoadingAssignments={isLoadingAssignments}
              onAssignmentClick={handleAssignmentClick}
            />

            {/* Assignment Graded */}
            <GradedAssignmentsList
              gradedAssignments={gradedAssignments}
              isLoadingAssignments={isLoadingAssignments}
              onAssignmentClick={handleAssignmentClick}
            />
          </div>
        </div>

        {/* Right Section */}
        <SubjectAverage
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          radarData={radarData}
          classes={classes}
        />
      </div>

    </div>
  );
};

export default StudentDashboard;
