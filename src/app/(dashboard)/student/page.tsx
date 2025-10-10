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

// 대시보드 컴포넌트
import ClassAverage from '@/components/dashboard/student/ClassAverage';
import SubjectAverage from '@/components/dashboard/student/SubjectAverage';
import PendingAssignmentsList from '@/components/dashboard/student/PendingAssignmentsList';
import GradedAssignmentsList from '@/components/dashboard/student/GradedAssignmentsList';

// 타입 정의
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
  raw_id: number; // 실제 문제지 ID (동기화 기준)
  deployment_id?: number; // 배포 레코드 ID (과제 열기용)
  raw_subject: 'korean' | 'english' | 'math';
  category?: string;
  classroom_id?: string; // 클래스별 필터링용
}


const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const router = useRouter();

  // 클래스 선택 상태 (좌/우 독립)
  const [selectedClassForClassAvg, setSelectedClassForClassAvg] = React.useState('');
  const [selectedClassForSubjectAvg, setSelectedClassForSubjectAvg] = React.useState('');
  
  // 과제 데이터
  const [realClasses, setRealClasses] = React.useState<ClassData[]>([]);
  const [allAssignments, setAllAssignments] = React.useState<DetailedAssignmentData[]>([]); // 모든 클래스의 과제
  const [unsubmittedAssignments, setUnsubmittedAssignments] = React.useState<DetailedAssignmentData[]>([]); // 미제출 (중복 제거)
  const [gradedAssignments, setGradedAssignments] = React.useState<DetailedAssignmentData[]>([]); // 완료 (중복 제거)
  const [uniqueAssignments, setUniqueAssignments] = React.useState<DetailedAssignmentData[]>([]); // 중복 제거된 전체
  
  // 차트 데이터
  const [radarData, setRadarData] = React.useState<any[]>([]); // 과목별 평균
  const [categoryData, setCategoryData] = React.useState<Record<string, any[]>>({}); // 카테고리별 평균

  // 로딩 상태
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(true);


  // API 재시도 함수
  const retryApiCall = React.useCallback(async <T,>(
    apiCall: () => Promise<T>,
    maxRetries = 1,
    delay = 500
  ): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        // 네트워크 오류 시 즉시 에러 던지기
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

  // 평균 점수 계산
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

  // 가입한 클래스 목록 로드
  const loadRealClasses = React.useCallback(async () => {
    if (!userProfile?.id) return;
    
    try {
      const classrooms = await studentClassService.getMyClasses();
      
      const classData: ClassData[] = classrooms.map((classroom: any) => ({
        id: classroom.id.toString(),
        name: classroom.name,
        createdAt: classroom.created_at,
      }));
      
      // 가입 순서대로 정렬 (오름차순)
      const sortedClasses = [...classData].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setRealClasses(sortedClasses);
      
      // 가장 먼저 가입한 클래스를 기본값으로 선택 (좌측, 우측 모두)
      if (sortedClasses.length > 0) {
        setSelectedClassForClassAvg(sortedClasses[0].id);
        setSelectedClassForSubjectAvg(sortedClasses[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setRealClasses([]);
    }
  }, [userProfile]);

  // 모든 클래스의 배포된 과제 로드 배포된 과제만 필터링 (is_deployed === 'deployed')
  const loadRealAssignments = React.useCallback(async () => {
    if (!userProfile?.id || realClasses.length === 0) return;
    
    setIsLoadingAssignments(true);
    
    try {
      const allAssignmentsData: DetailedAssignmentData[] = [];
      
      // 모든 클래스를 순회하며 과제 가져오기
      for (const classroom of realClasses) {
        const classroomId = classroom.id;
        
        // 과제 데이터를 DetailedAssignmentData 형식으로 변환
        const processAssignments = async (
          assignments: any[],
          subject: 'korean' | 'english' | 'math',
          classId: string
        ): Promise<DetailedAssignmentData[]> => {
          if (!assignments || assignments.length === 0) return [];
          
          return Promise.all(
            assignments.map(async (assignment) => {
              // 배포 레코드 ID와 실제 문제지 ID 추출
              const assignmentId = assignment.id || assignment.assignment_id || assignment.assignment?.id;
              const assignmentTitle = assignment.title || assignment.assignment?.title;
              
              // 실제 문제지/워크시트 ID 추출 (중복 판단에 사용)
              let worksheetId: number;
              if (subject === 'korean') {
                worksheetId = assignment.worksheet_id || assignment.assignment?.worksheet_id || assignmentId;
              } else if (subject === 'english') {
                worksheetId = assignment.worksheet_id || assignment.assignment?.worksheet_id || assignmentId;
              } else if (subject === 'math') {
                worksheetId = assignment.worksheet_id || assignment.problem_set_id || assignment.assignment?.worksheet_id || assignment.assignment?.problem_set_id || assignmentId;
              } else {
                worksheetId = assignmentId;
              }
              
              // 과제 결과 데이터 조회
              let results: any[] = [];
              try {
                if (subject === 'korean') {
                  const response = await koreanService.getAssignmentResults(assignmentId);
                  if (Array.isArray(response)) {
                    results = response;
                  } else if (response && Array.isArray((response as any).results)) {
                    results = (response as any).results;
                  }
                } else if (subject === 'english') {
                  const response = await EnglishService.getEnglishAssignmentResults(assignmentId);
                  if (Array.isArray(response)) {
                    results = response;
                  } else if (response && Array.isArray((response as any).results)) {
                    results = (response as any).results;
                  }
                } else if (subject === 'math') {
                  const response = await mathService.getAssignmentResults(assignmentId);
                  if (Array.isArray(response)) {
                    results = response;
                  } else if (response && Array.isArray((response as any).results)) {
                    results = (response as any).results;
                  }
                }
              } catch (e) {
                results = [];
              }

              // 내 결과 찾기
              const myResult = results.find(r => {
                const studentId = r.student_id || r.studentId || r.user_id || r.userId;
                return studentId === userProfile.id;
              });
              
              // 응시 상태 확인
              let normalizedStatus: 'completed' | 'pending' = 'pending';
              let myScore: number | undefined = undefined;
              
              if (myResult) {
                const status = myResult.status || '';
                if (status === '완료' || status === 'completed' || status === 'submitted') {
                  normalizedStatus = 'completed';
                  // 내 점수 추출
                  const score = myResult.score || myResult.total_score || myResult.totalScore || myResult.points || myResult.point;
                  if (score !== undefined && score !== null) {
                    const numericScore = Number(score);
                    if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 100) {
                      myScore = numericScore;
                    } else {
                      myScore = 0; // 잘못된 점수는 0점 처리
                    }
                  } else {
                    // 응시했는데 점수 데이터가 없으면 0점으로 처리 (모두 틀린 경우)
                    myScore = 0;
                  }
                }
              }

              // 학생들의 점수 수집 (평균 계산용 - 완료 상태인 학생만)
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

              const averageScore = calculateAverageScore(studentScores);
              
              // 세부 카테고리 추출
              let category = '';
              if (subject === 'korean') {
                category = assignment.korean_type || assignment.assignment?.korean_type || '전체';
              } else if (subject === 'english') {
                category = assignment.worksheet_subject || assignment.assignment?.worksheet_subject || '전체';
              } else if (subject === 'math') {
                category = assignment.unit_name || assignment.assignment?.unit_name || '전체';
              }
              
              return {
                id: `${subject}-${assignmentId}-${classId}`, // 배포 단위로 고유한 ID
                raw_id: worksheetId, // 실제 문제지 ID (동기화 기준)
                deployment_id: assignmentId, // 배포 레코드 ID (과제 열기용)
                raw_subject: subject,
                title: assignmentTitle,
                subject: subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학',
                dueDate: assignment.deployed_at || assignment.created_at 
                  ? new Date(assignment.deployed_at || assignment.created_at).toISOString().split('T')[0] 
                  : new Date().toISOString().split('T')[0],
                status: normalizedStatus,
                myScore: myScore,
                averageScore: averageScore,
                problem_count: assignment.problem_count || assignment.assignment?.total_questions || 0,
                category: category,
                classroom_id: classId,
              } as DetailedAssignmentData;
            })
          );
        };

        // 클래스별 배포된 과제 가져오기 (국어, 영어, 수학)
        const [koreanAssignments, englishAssignments, mathAssignments] = await Promise.allSettled([
          retryApiCall(() => koreanService.getDeployedAssignments(classroomId)),
          retryApiCall(() => EnglishService.getDeployedAssignments(classroomId)),
          retryApiCall(() => mathService.getDeployedAssignments(classroomId))
        ]);

        // 각 과목별 과제 처리 (배포된 것만 필터링)
        const koreanData = koreanAssignments.status === 'fulfilled' 
          ? await processAssignments(
              koreanAssignments.value.filter(a => a.is_deployed === 'deployed'), 
              'korean', 
              classroomId
            ) 
          : [];
        const englishData = englishAssignments.status === 'fulfilled' 
          ? await processAssignments(
              englishAssignments.value.filter(a => a.is_deployed === 'deployed'), 
              'english', 
              classroomId
            ) 
          : [];
        const mathData = mathAssignments.status === 'fulfilled' 
          ? await processAssignments(
              mathAssignments.value.filter(a => a.is_deployed === 'deployed'), 
              'math', 
              classroomId
            ) 
          : [];

        allAssignmentsData.push(...koreanData, ...englishData, ...mathData);
      }
      
      // 클래스가 다르면 같은 문제지라도 별도 과제로 처리 (동기화 제거)
      setAllAssignments(allAssignmentsData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAllAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [userProfile, retryApiCall, calculateAverageScore, realClasses]);

  // 과제 클릭 시 풀이 페이지로 이동
  const handleAssignmentClick = (assignment: DetailedAssignmentData) => {
    // 과목 한글 변환
    const subjectMap: Record<string, string> = {
      'korean': '국어',
      'english': '영어',
      'math': '수학',
    };
    const koreanSubject = subjectMap[assignment.raw_subject] || assignment.subject;
    
    // localStorage에 과제 정보 저장 (배포 ID 사용)
    const assignmentData = {
      assignmentId: (assignment.deployment_id || assignment.raw_id).toString(),
      assignmentTitle: assignment.title,
      subject: koreanSubject,
      viewResult: assignment.status === 'completed' ? 'true' : 'false',
      timestamp: Date.now(),
    };
    
    localStorage.setItem('selectedAssignment', JSON.stringify(assignmentData));
    
    // 과제 풀이 페이지로 이동
    router.push('/test');
  };

  // 클래스 목록 로드
  React.useEffect(() => {
    loadRealClasses();
  }, [loadRealClasses]);

  // 과제 목록 로드
  React.useEffect(() => {
    loadRealAssignments();
  }, [loadRealAssignments]);

  // 과제 목록용 중복 제거 / 클래스가 다르면 같은 문제지라도 별도 과제로 처리
  const removeDuplicateAssignments = (assignments: DetailedAssignmentData[]) => {
    const assignmentMap = new Map<string, DetailedAssignmentData>();
    
    assignments.forEach(assignment => {
      // 배포된 문제지 ID + 과목 + 클래스 ID로 중복 판단
      const key = `${assignment.raw_id}-${assignment.raw_subject}-${assignment.classroom_id}`;
      const existing = assignmentMap.get(key);
      
      if (!existing) {
        assignmentMap.set(key, assignment);
      } else {
        // completed 상태 우선
        if (assignment.status === 'completed') {
          if (existing.status === 'pending') {
            assignmentMap.set(key, assignment);
          } else if (existing.status === 'completed') {
            // 둘 다 completed면 점수가 있는 것을 우선
            if (assignment.myScore !== undefined && existing.myScore === undefined) {
              assignmentMap.set(key, assignment);
            }
          }
        }
      }
    });
    
    return Array.from(assignmentMap.values());
  };

  // 과제 데이터 변경 시 차트 데이터 계산
  React.useEffect(() => {
    // 중복 제거 (과제 목록용)
    const uniqueAssignmentsData = removeDuplicateAssignments(allAssignments);
    
    // 중복 제거된 과제를 상태에 저장 (과제 목록용)
    setUniqueAssignments(uniqueAssignmentsData);
    
    // 중복 제거된 과제를 완료/미제출로 분류
    const allGraded = uniqueAssignmentsData.filter(a => a.status === 'completed');
    const allUnsubmitted = uniqueAssignmentsData.filter(a => a.status === 'pending');
    
    setGradedAssignments(allGraded);
    setUnsubmittedAssignments(allUnsubmitted);

    // 레이더 차트 데이터 (과목별 평균) - 선택된 클래스만 필터링
    const subjects: ('국어' | '영어' | '수학')[] = ['국어', '영어', '수학'];
    
    // 선택된 클래스의 완료 과제만 필터링
    const classGradedForSubjectAvg = allAssignments.filter(
      a => a.classroom_id === selectedClassForSubjectAvg && a.status === 'completed'
    );
    
    const radarChartData = subjects.map(subject => {
      const subjectAssignments = classGradedForSubjectAvg.filter(a => a.subject === subject);
      
      const myScores = subjectAssignments
        .map(a => a.myScore)
        .filter(score => score !== undefined) as number[];
      const avgScores = subjectAssignments
        .map(a => a.averageScore)
        .filter(score => score !== undefined) as number[];
      
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
        hasData: myScores.length > 0,
      };
    });
    setRadarData(radarChartData);

    // 과목별 세부 카테고리 데이터
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
      const subjectAssignments = classGradedForSubjectAvg.filter(a => a.subject === subject);
      const categoryMap: Record<string, { myScores: number[]; avgScores: number[] }> = {};

      // 카테고리별 점수 수집
      subjectAssignments.forEach(assignment => {
        const category = assignment.category;
        if (category && fixedCategories[subject].includes(category)) {
          if (!categoryMap[category]) {
            categoryMap[category] = { myScores: [], avgScores: [] };
          }
          
          if (assignment.myScore !== undefined) {
            categoryMap[category].myScores.push(assignment.myScore);
          }
          if (assignment.averageScore !== undefined) {
            categoryMap[category].avgScores.push(assignment.averageScore);
          }
        }
      });

      // 고정 카테고리 목록 기준으로 표시
      fixedCategories[subject].forEach(category => {
        let myAvg = 0;
        let classAvg = 0;
        let hasData = false;
        
        if (category === '전체') {
          // 전체: 해당 과목의 모든 과제 평균
          const allMyScores = subjectAssignments
            .map(a => a.myScore)
            .filter(score => score !== undefined) as number[];
          const allAvgScores = subjectAssignments
            .map(a => a.averageScore)
            .filter(score => score !== undefined) as number[];
          
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
          hasData: hasData,
        });
      });
    });

    setCategoryData(categoryScores);
  }, [allAssignments, selectedClassForSubjectAvg]);

  // 렌더링
  return (
    <div className="flex flex-col p-5 space-y-6">
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || '학생'}님의 대시보드`}
        variant="default"
        description="나의 학습 현황과 성적을 확인하세요"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* 좌측: 클래스 평균 차트 */}
          <ClassAverage
            selectedClass={selectedClassForClassAvg}
            setSelectedClass={setSelectedClassForClassAvg}
            classes={realClasses.map(c => ({ id: c.id, name: c.name }))}
            assignments={
              // 선택된 클래스에 배포된 과제만 필터링
              allAssignments
                .filter(a => a.classroom_id === selectedClassForClassAvg)
                .map((a: DetailedAssignmentData) => ({
                  id: a.id,
                  name: a.title,
                  subject: a.subject,
                  dueDate: a.dueDate,
                  myScore: a.status === 'completed' ? a.myScore : 0,
                  classAverageScore: a.status === 'completed' ? a.averageScore : 0,
                  status: a.status,
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
        <div className="col-span-1 lg:col-span-2">
          {/* 우측: 과목별 평균 차트 */}
          <SubjectAverage
            selectedClass={selectedClassForSubjectAvg}
            setSelectedClass={setSelectedClassForSubjectAvg}
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