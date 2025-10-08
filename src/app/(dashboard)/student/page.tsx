'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import { studentClassService } from '@/services/authService';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';

// Import dashboard components
import ClassAverage from '@/components/dashboard/student/ClassAverage';
import SubjectAverage from '@/components/dashboard/student/SubjectAverage';
import PendingAssignmentsList from '@/components/dashboard/student/PendingAssignmentsList';
import GradedAssignmentsList from '@/components/dashboard/student/GradedAssignmentsList';

// Type Definitions
interface ClassData {
  id: string;
  name: string;
  createdAt: string;
}

interface DetailedAssignmentData {
  id: string;
  title: string;
  subject: '국어' | '영어' | '수학';
  dueDate: string;
  status: 'completed' | 'pending';
  myScore?: number;
  averageScore?: number;
  problem_count?: number;
  raw_id: number;
  raw_subject: 'korean' | 'english' | 'math';
  category?: string; // 세부 카테고리
  classroom_id?: string; // 클래스룸 ID
}

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const router = useRouter();

  // State management
  const [selectedClass, setSelectedClass] = React.useState('');
  
  // Data states
  const [realClasses, setRealClasses] = React.useState<ClassData[]>([]);
  const [allAssignments, setAllAssignments] = React.useState<DetailedAssignmentData[]>([]);
  const [unsubmittedAssignments, setUnsubmittedAssignments] = React.useState<DetailedAssignmentData[]>([]);
  const [gradedAssignments, setGradedAssignments] = React.useState<DetailedAssignmentData[]>([]);
  
  // Chart data states
  const [lineChartData, setLineChartData] = React.useState<any[]>([]);
  const [radarData, setRadarData] = React.useState<any[]>([]);
  const [categoryData, setCategoryData] = React.useState<Record<string, any[]>>({});

  // Loading states
  const [isLoadingClasses, setIsLoadingClasses] = React.useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(true);

  // Load classes
  const loadRealClasses = React.useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      setIsLoadingClasses(true);
      const classrooms = await studentClassService.getMyClasses();
      const classData: ClassData[] = classrooms.map((classroom: any) => ({
        id: classroom.id.toString(),
        name: classroom.name,
        createdAt: classroom.created_at,
      }));
      // 가입 순서대로 정렬 (오름차순)
      const sortedClasses = [...classData].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setRealClasses(sortedClasses);
      
      // 가장 먼저 가입한 클래스를 기본값으로
      if (sortedClasses.length > 0) {
        setSelectedClass(sortedClasses[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setRealClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [userProfile]);

  React.useEffect(() => {
    loadRealClasses();
  }, [loadRealClasses]);

  const retryApiCall = React.useCallback(async <T,>(apiCall: () => Promise<T>, maxRetries = 1, delay = 500): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw error;
        }
        if (i === maxRetries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('모든 재시도가 실패했습니다');
  }, []);

  const calculateAverageScore = React.useCallback((studentScores: Record<number, number>): number => {
    const scores = Object.values(studentScores).filter(score => 
      score !== undefined && score !== null && !isNaN(score) && score >= 0 && score <= 100
    );
    
    if (scores.length === 0) {
      return 0;
    }
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average * 10) / 10;
  }, []);

  // 과제 목록 불러오기 (클래스별로 - 선생님 대시보드 방식 참고)
  const loadRealAssignments = React.useCallback(async () => {
    if (!userProfile?.id || realClasses.length === 0) return;
    setIsLoadingAssignments(true);
    try {
      const allAssignmentsData: DetailedAssignmentData[] = [];
      
      // 모든 클래스를 순회하며 과제 가져오기 (선생님 대시보드 방식)
      for (const classroom of realClasses) {
        const classroomId = classroom.id;
        
        // 클래스별 과제 목록을 처리하는 함수
        const processAssignments = async (assignments: any[], subject: 'korean' | 'english' | 'math', classId: string): Promise<DetailedAssignmentData[]> => {
        if (!assignments || assignments.length === 0) return [];
        
        return Promise.all(
          assignments.map(async (assignment) => {
            // assignment_id 또는 assignment 객체에서 ID 추출
            const assignmentId = assignment.id || assignment.assignment_id || assignment.assignment?.id;
            const assignmentTitle = assignment.title || assignment.assignment?.title;
            
            let results: any[] = [];
            try {
                if (subject === 'korean') {
                    const response = await koreanService.getAssignmentResults(assignmentId);
                    if (Array.isArray(response)) results = response;
                    else if (response && Array.isArray((response as any).results)) results = (response as any).results;
                } else if (subject === 'english') {
                    const response = await EnglishService.getEnglishAssignmentResults(assignmentId);
                    if (Array.isArray(response)) results = response;
                    else if (response && Array.isArray((response as any).results)) results = (response as any).results;
                } else if (subject === 'math') {
                    const response = await mathService.getAssignmentResults(assignmentId);
                    if (Array.isArray(response)) results = response;
                    else if (response && Array.isArray((response as any).results)) results = (response as any).results;
                }
            } catch (e) {
                results = [];
            }

            // 내 결과 찾기 (점수 계산용)
            const myResult = results.find(r => {
                const studentId = r.student_id || r.studentId || r.user_id || r.userId;
                return studentId === userProfile.id;
            });
            
            // 학생의 응시 상태 확인: myResult.status를 확인
            let normalizedStatus: 'completed' | 'pending' = 'pending';
            if (myResult) {
              const status = myResult.status || '';
              // '완료', 'completed', 'submitted' → completed
              // '미시작', 'assigned', 'pending' → pending
              if (status === '완료' || status === 'completed' || status === 'submitted') {
                normalizedStatus = 'completed';
              }
            }

            // 학생들의 점수 수집 (평균 계산용) - 완료 상태인 학생만
            const studentScores: Record<number, number> = {};
            results.forEach((result) => {
                const studentId = result.student_id || result.studentId || result.user_id || result.userId;
                const resultStatus = result.status || '';
                
                // 완료 상태인 학생만 점수에 포함
                if (resultStatus === '완료' || resultStatus === 'completed' || resultStatus === 'submitted') {
                  const score = result.score || result.total_score || result.totalScore || result.points || result.point;
                  if (studentId && score !== undefined && score !== null) {
                      const numericScore = Number(score);
                      if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 100) {
                          studentScores[studentId] = numericScore;
                      }
                  }
                }
            });

            const myScore = studentScores[userProfile.id];
            const averageScore = calculateAverageScore(studentScores);
            
            // 세부 카테고리 추출
            let category = '';
            if (subject === 'korean') {
              category = assignment.korean_type || assignment.assignment?.korean_type || '전체';
            } else if (subject === 'english') {
              // 영어는 worksheet_subject를 사용하거나 기본값 '전체'
              category = assignment.worksheet_subject || assignment.assignment?.worksheet_subject || '전체';
            } else if (subject === 'math') {
              category = assignment.unit_name || assignment.assignment?.unit_name || '전체';
            }
            
            return {
              id: `${subject}-${assignmentId}`,
              raw_id: assignmentId,
              raw_subject: subject,
              title: assignmentTitle,
              subject: subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학',
              dueDate: assignment.deployed_at || assignment.created_at ? new Date(assignment.deployed_at || assignment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: normalizedStatus, // 백엔드에서 받은 status 사용
              myScore: myScore,
              averageScore: averageScore,
              problem_count: assignment.problem_count || assignment.assignment?.total_questions || 0,
              category: category,
              classroom_id: classId, // 클래스별 루프에서 전달받은 ID 사용
            } as DetailedAssignmentData;
          })
        );
      };

        // 클래스별로 getDeployedAssignments를 사용하여 과제 목록 가져오기 (선생님 대시보드 방식)
        const [koreanAssignments, englishAssignments, mathAssignments] = await Promise.allSettled([
          retryApiCall(() => koreanService.getDeployedAssignments(classroomId)),
          retryApiCall(() => EnglishService.getDeployedAssignments(classroomId)),
          retryApiCall(() => mathService.getDeployedAssignments(classroomId))
        ]);

        const koreanData = koreanAssignments.status === 'fulfilled' ? await processAssignments(koreanAssignments.value, 'korean', classroomId) : [];
        const englishData = englishAssignments.status === 'fulfilled' ? await processAssignments(englishAssignments.value, 'english', classroomId) : [];
        const mathData = mathAssignments.status === 'fulfilled' ? await processAssignments(mathAssignments.value, 'math', classroomId) : [];

        allAssignmentsData.push(...koreanData, ...englishData, ...mathData);
      }
      
      setAllAssignments(allAssignmentsData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAllAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [userProfile, retryApiCall, calculateAverageScore, realClasses]);

  // 컴포넌트 마운트 시 과제 목록 불러오기
  // getStudentAssignments는 classId가 아닌 studentId를 사용
  React.useEffect(() => {
    loadRealAssignments();
  }, [loadRealAssignments]);

  React.useEffect(() => {
    // 전체 클래스의 응시한 과제 (completed) - 하단 리스트용
    const allGraded = allAssignments.filter(a => a.status === 'completed');
    
    // 전체 클래스의 미응시 과제 (pending) - 하단 리스트용
    const allUnsubmitted = allAssignments.filter(a => a.status === 'pending');
    
    setGradedAssignments(allGraded);
    setUnsubmittedAssignments(allUnsubmitted);

    // 선택된 클래스의 응시한 과제만 차트 계산에 사용
    const classGraded = selectedClass 
      ? allAssignments.filter(a => a.classroom_id === selectedClass && a.status === 'completed')
      : allGraded;

    const sortedGraded = [...classGraded].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setLineChartData(
      sortedGraded.map(a => ({
        name: a.title,
        '클래스평균': a.averageScore,
        '내점수': a.myScore,
      }))
    );

    const subjects: ('국어' | '영어' | '수학')[] = ['국어', '영어', '수학'];
    const radarChartData = subjects.map(subject => {
      const subjectAssignments = classGraded.filter(a => a.subject === subject);
      
      // 응시한 과제들의 점수만 평균 계산 (미응시는 제외)
      const myScores = subjectAssignments.map(a => a.myScore).filter(score => score !== undefined) as number[];
      const avgScores = subjectAssignments.map(a => a.averageScore).filter(score => score !== undefined) as number[];
      
      const myTotalScore = myScores.length > 0 
        ? myScores.reduce((sum, score) => sum + score, 0) / myScores.length 
        : 0;
      const classTotalScore = avgScores.length > 0 
        ? avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length 
        : 0;

      return {
        subject: subject,
        '클래스평균': Math.round(classTotalScore * 10) / 10,
        '내점수': Math.round(myTotalScore * 10) / 10,
        fullMark: 100,
        hasData: myScores.length > 0, // 응시 여부
      };
    });
    setRadarData(radarChartData);

    // 과목별 세부 카테고리 데이터 집계 (고정 카테고리 기반)
    // 백엔드 설계에 정의된 카테고리 목록 ('전체' 포함)
    const fixedCategories: Record<string, string[]> = {
      '국어': ['전체', '시', '소설', '수필/비문학', '문법'],
      '영어': ['전체', '독해', '어휘', '문법'],
      '수학': ['전체', '소인수분해', '정수와 유리수', '방정식', '그래프와 비례'],
    };

    const categoryScores: Record<string, any[]> = {
      '국어': [],
      '영어': [],
      '수학': [],
    };

    subjects.forEach(subject => {
      const subjectAssignments = classGraded.filter(a => a.subject === subject);
      const categoryMap: Record<string, { myScores: number[]; avgScores: number[] }> = {};

      // 실제 과제 데이터에서 카테고리별 점수 수집
      subjectAssignments.forEach(assignment => {
        const category = assignment.category;
        if (category && fixedCategories[subject].includes(category)) {
          if (!categoryMap[category]) {
            categoryMap[category] = { myScores: [], avgScores: [] };
          }
          
          // 응시한 과제의 점수만 수집
          if (assignment.myScore !== undefined) {
            categoryMap[category].myScores.push(assignment.myScore);
          }
          if (assignment.averageScore !== undefined) {
            categoryMap[category].avgScores.push(assignment.averageScore);
          }
        }
      });

      // 고정 카테고리 목록 기준으로 모두 표시
      fixedCategories[subject].forEach(category => {
        let myAvg = 0;
        let classAvg = 0;
        let hasData = false;
        
        if (category === '전체') {
          // '전체'는 해당 과목의 모든 과제 평균
          const allMyScores = subjectAssignments.map(a => a.myScore).filter(score => score !== undefined) as number[];
          const allAvgScores = subjectAssignments.map(a => a.averageScore).filter(score => score !== undefined) as number[];
          
          myAvg = allMyScores.length > 0 
            ? allMyScores.reduce((sum, score) => sum + score, 0) / allMyScores.length 
            : 0;
          classAvg = allAvgScores.length > 0 
            ? allAvgScores.reduce((sum, score) => sum + score, 0) / allAvgScores.length 
            : 0;
          hasData = allMyScores.length > 0;
        } else {
          // 개별 카테고리
          const data = categoryMap[category];
          myAvg = data && data.myScores.length > 0 
            ? data.myScores.reduce((sum, score) => sum + score, 0) / data.myScores.length 
            : 0;
          classAvg = data && data.avgScores.length > 0 
            ? data.avgScores.reduce((sum, score) => sum + score, 0) / data.avgScores.length 
            : 0;
          hasData = data && data.myScores.length > 0;
        }

        categoryScores[subject].push({
          subject: category,
          '클래스평균': Math.round(classAvg * 10) / 10,
          '내점수': Math.round(myAvg * 10) / 10,
          fullMark: 100,
          hasData: hasData, // 응시 여부
        });
      });
    });

    setCategoryData(categoryScores);
  }, [allAssignments, selectedClass]);

  // 과제 클릭 핸들러 - localStorage로 과제 정보 전달
  const handleAssignmentClick = (assignment: DetailedAssignmentData) => {
    // 과목을 한글로 변환
    const subjectMap: Record<string, string> = {
      'korean': '국어',
      'english': '영어',
      'math': '수학',
    };
    const koreanSubject = subjectMap[assignment.raw_subject] || assignment.subject;
    
    // localStorage에 과제 정보 저장
    const assignmentData = {
      assignmentId: assignment.raw_id.toString(),
      assignmentTitle: assignment.title,
      subject: koreanSubject,
      viewResult: assignment.status === 'completed' ? 'true' : 'false',
      timestamp: Date.now(), // 타임스탬프 추가 (오래된 데이터 방지)
    };
    
    localStorage.setItem('selectedAssignment', JSON.stringify(assignmentData));
    
    console.log('🎯 과제 클릭 - localStorage 저장:', assignmentData);
    
    // /test 페이지로 바로 이동 (URL 파라미터 없음)
    router.push('/test');
  };

  return (
    <div className="flex flex-col p-5 space-y-6">
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || '학생'}님의 대시보드`}
        variant="default"
        description="나의 학습 현황과 성적을 확인하세요"
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        <div className="lg:col-span-3 grid grid-rows-2 gap-6">
          <ClassAverage
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            classes={realClasses.map(c => ({ id: c.id, name: c.name }))}
            assignments={
              // 선택된 클래스의 과제만 전달 (미응시 포함)
              allAssignments
                .filter(a => a.classroom_id === selectedClass)
                .map(a => ({
                  id: a.id,
                  name: a.title,
                  subject: a.subject,
                  dueDate: a.dueDate,
                  myScore: a.status === 'completed' ? a.myScore : 0, // 미응시는 0점
                  classAverageScore: a.status === 'completed' ? a.averageScore : 0, // 미응시는 0점
                  submittedCount: 0,
                  totalCount: 0,
                  status: a.status, // 응시 여부 전달
                }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PendingAssignmentsList
              unsubmittedAssignments={unsubmittedAssignments}
              isLoadingAssignments={isLoadingAssignments}
              onAssignmentClick={handleAssignmentClick}
            />
            <GradedAssignmentsList
              gradedAssignments={gradedAssignments}
              isLoadingAssignments={isLoadingAssignments}
              onAssignmentClick={handleAssignmentClick}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <SubjectAverage
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            radarData={radarData}
            categoryData={categoryData}
            classes={realClasses.map(c => ({ id: c.id, name: c.name }))}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;