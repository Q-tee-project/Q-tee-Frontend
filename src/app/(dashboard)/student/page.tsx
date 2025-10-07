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
      setRealClasses(classData);
      if (classData.length > 0) {
        const sortedClasses = [...classData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const loadRealAssignments = React.useCallback(async (classId: string) => {
    if (!userProfile?.id) return;
    setIsLoadingAssignments(true);
    try {
      const processAssignments = async (assignments: any[], subject: 'korean' | 'english' | 'math'): Promise<DetailedAssignmentData[]> => {
        if (!assignments || assignments.length === 0) return [];
        
        return Promise.all(
          assignments.map(async (assignment) => {
            let results: any[] = [];
            try {
                if (subject === 'korean') {
                    const response = await koreanService.getAssignmentResults(assignment.id);
                    if (Array.isArray(response)) results = response;
                    else if (response && Array.isArray((response as any).results)) results = (response as any).results;
                } else if (subject === 'english') {
                    const response = await EnglishService.getEnglishAssignmentResults(assignment.id);
                    if (Array.isArray(response)) results = response;
                    else if (response && Array.isArray((response as any).results)) results = (response as any).results;
                } else if (subject === 'math') {
                    const response = await mathService.getAssignmentResults(assignment.id);
                    if (Array.isArray(response)) results = response;
                    else if (response && Array.isArray((response as any).results)) results = (response as any).results;
                }
            } catch (e) {
                results = [];
            }

            const myResult = results.find(r => (r.student_id || r.studentId || r.user_id || r.userId) === userProfile.id);
            const hasTaken = myResult !== undefined;

            const studentScores: Record<number, number> = {};
            results.forEach((result) => {
                const studentId = result.student_id || result.studentId || result.user_id || result.userId;
                const score = result.score || result.total_score || result.totalScore || result.points || result.point;
                if (studentId && score !== undefined && score !== null) {
                    const numericScore = Number(score);
                    if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 100) {
                        studentScores[studentId] = numericScore;
                    }
                }
            });

            const myScore = studentScores[userProfile.id];
            const averageScore = calculateAverageScore(studentScores);
            
            return {
              id: `${subject}-${assignment.id}`,
              raw_id: assignment.id,
              raw_subject: subject,
              title: assignment.title,
              subject: subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학',
              dueDate: assignment.created_at ? new Date(assignment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: hasTaken ? 'completed' : 'pending',
              myScore: myScore,
              averageScore: averageScore,
              problem_count: assignment.problem_count || 0,
            } as DetailedAssignmentData;
          })
        );
      };

      const [koreanAssignments, englishAssignments, mathAssignments] = await Promise.allSettled([
        retryApiCall(() => koreanService.getDeployedAssignments(classId)),
        retryApiCall(() => EnglishService.getDeployedAssignments(classId)),
        retryApiCall(() => mathService.getDeployedAssignments(classId))
      ]);

      const koreanData = koreanAssignments.status === 'fulfilled' ? await processAssignments(koreanAssignments.value, 'korean') : [];
      const englishData = englishAssignments.status === 'fulfilled' ? await processAssignments(englishAssignments.value, 'english') : [];
      const mathData = mathAssignments.status === 'fulfilled' ? await processAssignments(mathAssignments.value, 'math') : [];

      setAllAssignments([...koreanData, ...englishData, ...mathData]);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAllAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [userProfile, retryApiCall, calculateAverageScore]);

  React.useEffect(() => {
    if (selectedClass) {
      loadRealAssignments(selectedClass);
    }
  }, [selectedClass, loadRealAssignments]);

  React.useEffect(() => {
    const graded = allAssignments.filter(a => {
      const status = a.status?.toLowerCase();
      return status === 'completed' || status === 'submitted' || status === '응시' || status === 'graded' || status === 'finished';
    });
    const unsubmitted = allAssignments.filter(a => {
        const status = a.status?.toLowerCase();
        const pendingStatuses = ['deployed', 'assigned', '미응시', 'not_started', 'pending'];
        return pendingStatuses.includes(status) || !status;
    });
    
    setGradedAssignments(graded);
    setUnsubmittedAssignments(unsubmitted);

    const sortedGraded = [...graded].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setLineChartData(
      sortedGraded.map(a => ({
        name: a.title,
        '클래스평균': a.averageScore,
        '내점수': a.myScore,
      }))
    );

    const subjects: ('국어' | '영어' | '수학')[] = ['국어', '영어', '수학'];
    const radarChartData = subjects.map(subject => {
      const subjectAssignments = graded.filter(a => a.subject === subject);
      let myTotalScore = 0;
      let classTotalScore = 0;
      
      if (subjectAssignments.length > 0) {
        myTotalScore = subjectAssignments.reduce((sum, a) => sum + (a.myScore || 0), 0) / subjectAssignments.length;
        classTotalScore = subjectAssignments.reduce((sum, a) => sum + (a.averageScore || 0), 0) / subjectAssignments.length;
      }

      return {
        subject: subject,
        '클래스평균': Math.round(classTotalScore * 10) / 10,
        '내점수': Math.round(myTotalScore * 10) / 10,
        fullMark: 100,
      };
    });
    setRadarData(radarChartData);
  }, [allAssignments]);

  const handleAssignmentClick = (assignment: any) => {
    const params = new URLSearchParams({
      assignmentId: assignment.raw_id.toString(),
      assignmentTitle: assignment.title,
      subject: assignment.raw_subject,
    });
    
    if (assignment.status === 'completed') {
      params.append('viewResult', 'true');
    }
    
    router.push(`/test?${params.toString()}`);
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
            assignments={allAssignments.map(a => ({
              id: a.id,
              name: a.title,
              subject: a.subject,
              dueDate: a.dueDate,
              myScore: a.myScore,
              classAverageScore: a.averageScore,
              submittedCount: 0, // Not available
              totalCount: 0, // Not available
            }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PendingAssignmentsList
              unsubmittedAssignments={unsubmittedAssignments.map(a => ({
                id: a.id,
                title: a.title,
                subject: a.subject,
                problem_count: a.problem_count || 0,
                status: a.status,
                deployed_at: a.dueDate,
              }))}
              isLoadingAssignments={isLoadingAssignments}
              onAssignmentClick={handleAssignmentClick}
            />
            <GradedAssignmentsList
              gradedAssignments={gradedAssignments.map(a => ({
                id: a.id,
                title: a.title,
                subject: a.subject,
                problem_count: a.problem_count || 0,
                status: a.status,
                score: a.myScore,
                deployed_at: a.dueDate,
              }))}
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
            classes={realClasses.map(c => ({ id: c.id, name: c.name }))}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;