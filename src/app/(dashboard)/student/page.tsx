'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';
import { studentClassService } from '@/services/authService';
import ClassAverage from '@/components/dashboard/student/ClassAverage';
import SubjectAverage from '@/components/dashboard/student/SubjectAverage';
import PendingAssignmentsList from '@/components/dashboard/student/PendingAssignmentsList';
import GradedAssignmentsList from '@/components/dashboard/student/GradedAssignmentsList';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [selectedClassForAssignments, setSelectedClassForAssignments] = React.useState(''); // 과제별용
  const [selectedClassForSubjects, setSelectedClassForSubjects] = React.useState(''); // 과목별용
  const [dashboardAssignments, setDashboardAssignments] = React.useState<any[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(false);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = React.useState(true);

  // 컴포넌트 메모이제이션
  const MemoClassAverage = React.useMemo(() => React.memo(ClassAverage), []);
  const MemoSubjectAverage = React.useMemo(() => React.memo(SubjectAverage), []);

  // 상태 업데이트 콜백
  const handleSetClassForAssignments = React.useCallback((val: string) => {
    setSelectedClassForAssignments(val);
  }, []);
  const handleSetClassForSubjects = React.useCallback((val: string) => {
    setSelectedClassForSubjects(val);
  }, []);

  // 클래스 목록 로딩
  React.useEffect(() => {
    const fetchClasses = async () => {
      if (userProfile?.id) {
        try {
          setIsLoadingClasses(true);
          const fetchedClasses = await studentClassService.getMyClasses();
          
          // 가입일(created_at) 기준으로 오름차순 정렬
          const sortedClasses = [...fetchedClasses].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          setClasses(sortedClasses);

          if (sortedClasses.length > 0) {
            const firstClassId = sortedClasses[0].id.toString();
            setSelectedClassForAssignments(firstClassId);
            setSelectedClassForSubjects(firstClassId);
          }
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        } finally {
          setIsLoadingClasses(false);
        }
      }
    };
    fetchClasses();
  }, [userProfile]);


  // 클래스별 레이더 차트 데이터 생성
  const getRadarData = (classId: string) => {
    const classData: Record<string, any> = {
      '1': {
        국어: { 클래스평균: 85, 내점수: 40 },
        영어: { 클래스평균: 60, 내점수: 92 },
        수학: { 클래스평균: 82, 내점수: 75 },
      },
      '2': {
        국어: { 클래스평균: 78, 내점수: 45 },
        영어: { 클래스평균: 72, 내점수: 88 },
        수학: { 클래스평균: 85, 내점수: 70 },
      },
      '3': {
        국어: { 클래스평균: 90, 내점수: 35 },
        영어: { 클래스평균: 65, 내점수: 95 },
        수학: { 클래스평균: 88, 내점수: 80 },
      },
      '4': {
        국어: { 클래스평균: 82, 내점수: 50 },
        영어: { 클래스평균: 70, 내점수: 85 },
        수학: { 클래스평균: 75, 내점수: 65 },
      },
      '5': {
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

  const submittedAssignmentsForModal = React.useMemo(() => {
    return dashboardAssignments
      .filter(assignment => {
        // 응시 완료 상태 필터
        const status = assignment.status?.toLowerCase();
        const isSubmitted = status === 'completed' ||
                            status === 'submitted' ||
                            status === '응시' ||
                            status === 'graded' ||
                            status === 'finished';
        
        if (!isSubmitted) {
          return false;
        }

        // 클래스별 필터
        if (assignment.subject === '영어') {
          return true; // 영어 과제는 classroom_id가 없으므로 항상 포함
        }
        
        // 클래스가 선택되지 않았거나, classroom_id가 없으면 모든 과제 포함
        if (!selectedClassForAssignments || !assignment.classroom_id) {
          return true;
        }
        
        return assignment.classroom_id?.toString() === selectedClassForAssignments;
      })
      .map(assignment => ({
        id: assignment.id,
        name: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.deployed_at,
        submittedCount: 0,
        totalCount: 0,
        myScore: Math.floor(Math.random() * 51) + 50,
        classAverageScore: Math.floor(Math.random() * 51) + 50,
      }));
  }, [dashboardAssignments, selectedClassForAssignments]);

  // 차트 데이터
  const defaultChartData = [
    { name: '1월', 클래스평균: 85, 내점수: 78 },
    { name: '2월', 클래스평균: 88, 내점수: 82 },
    { name: '3월', 클래스평균: 82, 내점수: 75 },
    { name: '4월', 클래스평균: 90, 내점수: 85 },
    { name: '5월', 클래스평균: 87, 내점수: 80 },
    { name: '6월', 클래스평균: 92, 내점수: 88 },
    { name: '7월', 클래스평균: 92, 내점수: 88 },
    { name: '8월', 클래스평균: 92, 내점수: 88 },
    { name: '9월', 클래스평균: 92, 내점수: 88 },
    { name: '10월', 클래스평균: 65, 내점수: 70 },
    { name: '11월', 클래스평균: 92, 내점수: 50 },
    { name: '12월', 클래스평균: 60, 내점수: 88 },
  ];

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
          id: `math-${assignment.assignment_id}`,
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
          id: `korean-${assignment.assignment_id}`,
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
          id: `english-${assignment.assignment?.id || assignment.assignment_id}`, // 고유 ID 생성
          title: assignment.assignment?.title || assignment.title,
          problem_count: assignment.assignment?.total_questions || assignment.total_questions,
          status: assignment.deployment?.status || assignment.status,
          deployed_at: assignment.deployment?.deployed_at || assignment.deployed_at,
        })));
      } catch (error) {
        console.log('영어 과제 로드 실패:', error);
      }

      setDashboardAssignments(allAssignments);
    } catch (error) {
      console.error('과제 로드 실패:', error);
    }
    finally {
      setIsLoadingAssignments(false);
    }
  };

  // 과제 상태별 분류
  const unsubmittedAssignments = dashboardAssignments.filter(assignment => {
    const status = assignment.status?.toLowerCase();
    
    // 미응시 상태들
    const isUnsubmitted = status === 'deployed' || 
           status === 'assigned' || 
           status === '미응시' ||
           status === 'not_started' ||
           status === 'pending' ||
           status === 'active' ||
           status === 'available' ||
           !status;
    
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
            assignments={submittedAssignmentsForModal}
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