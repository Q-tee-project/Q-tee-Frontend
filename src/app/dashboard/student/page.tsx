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
  const [selectedClassForAssignments, setSelectedClassForAssignments] = React.useState('1'); // 과제별용
  const [selectedClassForSubjects, setSelectedClassForSubjects] = React.useState('1'); // 과목별용
  const [dashboardAssignments, setDashboardAssignments] = React.useState<any[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(false);

  // 컴포넌트 메모이제이션 (불필요한 리렌더 방지)
  const MemoClassAverage = React.useMemo(() => React.memo(ClassAverage), []);
  const MemoSubjectAverage = React.useMemo(() => React.memo(SubjectAverage), []);

  // 독립 상태 업데이트 콜백 (참조 안정화 및 디버깅)
  const handleSetClassForAssignments = React.useCallback((val: string) => {
    setSelectedClassForAssignments(val);
  }, []);
  const handleSetClassForSubjects = React.useCallback((val: string) => {
    setSelectedClassForSubjects(val);
  }, []);

  // 임시 클래스 데이터 (참조 안정화)
  const classes = React.useMemo(() => ([
    { id: '1', name: '클래스 A' },
    { id: '2', name: '클래스 B' },
    { id: '3', name: '클래스 C' },
    { id: '4', name: '클래스 D' },
    { id: '5', name: '클래스 E' },
  ]), []);


  // 클래스별 레이더 차트 데이터 생성
  const getRadarData = (classId: string) => {
    // 클래스별 데이터 (실제로는 API에서 가져와야 함)
    const classData: Record<string, any> = {
      '1': { // 클래스 A
        국어: { 클래스평균: 85, 내점수: 40 },
        영어: { 클래스평균: 60, 내점수: 92 },
        수학: { 클래스평균: 82, 내점수: 75 },
      },
      '2': { // 클래스 B
        국어: { 클래스평균: 78, 내점수: 45 },
        영어: { 클래스평균: 72, 내점수: 88 },
        수학: { 클래스평균: 85, 내점수: 70 },
      },
      '3': { // 클래스 C
        국어: { 클래스평균: 90, 내점수: 35 },
        영어: { 클래스평균: 65, 내점수: 95 },
        수학: { 클래스평균: 88, 내점수: 80 },
      },
      '4': { // 클래스 D
        국어: { 클래스평균: 82, 내점수: 50 },
        영어: { 클래스평균: 70, 내점수: 85 },
        수학: { 클래스평균: 75, 내점수: 65 },
      },
      '5': { // 클래스 E
        국어: { 클래스평균: 88, 내점수: 42 },
        영어: { 클래스평균: 68, 내점수: 90 },
        수학: { 클래스평균: 80, 내점수: 72 },
      },
    };

    const currentClassData = classData[classId] || classData['1'];
    
    return [
      {
        subject: '국어',
        클래스평균: currentClassData.국어.클래스평균,
        내점수: currentClassData.국어.내점수,
        fullMark: 100,
      },
      {
        subject: '영어',
        클래스평균: currentClassData.영어.클래스평균,
        내점수: currentClassData.영어.내점수,
        fullMark: 100,
      },
      {
        subject: '수학',
        클래스평균: currentClassData.수학.클래스평균,
        내점수: currentClassData.수학.내점수,
        fullMark: 100,
      },
    ];
  };

  const radarData = React.useMemo(() => getRadarData(selectedClassForSubjects), [selectedClassForSubjects]);

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

  // 간단한 차트 데이터 (백엔드 담당자를 위해 단순화)
  // 좌측 라인차트 데이터 고정 (불필요한 재생성으로 인한 애니메이션 방지)
  const composedChartData = React.useMemo(() => defaultChartData, []);

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
    const assignmentId = assignment.assignment_id || assignment.id;
    const assignmentTitle = assignment.title;
    const subject = assignment.subject;
    
    // 과제 상태에 따라 viewResult 파라미터 설정
    const status = assignment.status?.toLowerCase();
    const isCompleted = status === 'completed' || status === 'submitted' || status === 'graded' || status === 'finished' || status === '응시';
    
    const params = new URLSearchParams({
      assignmentId: assignmentId.toString(),
      assignmentTitle: assignmentTitle,
      subject: subject
    });
    
    if (isCompleted) {
      params.append('viewResult', 'true');
    }
    
    router.push(`/test?${params.toString()}`);
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
        <div className="lg:col-span-3 grid grid-rows-2 gap-6">
          
          {/* Left Top - 클래스별 과제별 전체 평균과 내 평균 */}
          <MemoClassAverage
            selectedClass={selectedClassForAssignments}
            setSelectedClass={handleSetClassForAssignments}
            chartData={composedChartData}
            classes={classes}
          />

          {/* Left Bottom - Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
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
        <div className="lg:col-span-2">
          <MemoSubjectAverage
            selectedClass={selectedClassForSubjects}
            setSelectedClass={handleSetClassForSubjects}
            radarData={radarData}
            classes={classes}
          />
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;