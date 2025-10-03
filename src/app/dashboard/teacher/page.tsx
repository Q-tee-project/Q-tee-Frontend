'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import { getMarketStats, MarketStats, getMyProducts, MarketProduct } from '@/services/marketApi';
import { classroomService } from '@/services/authService';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';

// Import dashboard components
import TabNavigation from '@/components/dashboard/TabNavigation';
import MarketManagementTab from '@/components/dashboard/MarketManagementTab';
import ClassManagementTab from '@/components/dashboard/ClassManagementTab';

// Type Definitions
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

const TeacherDashboard = React.memo(() => {
  const { userProfile } = useAuth();
  
  // State management
  const [selectedTab, setSelectedTab] = React.useState('클래스 관리');
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedStudents, setSelectedStudents] = React.useState<number[]>([]);
  const [studentColorMap, setStudentColorMap] = React.useState<Record<number, string>>({});
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [marketStats, setMarketStats] = React.useState<MarketStats | null>(null);
  const [isLoadingMarketStats, setIsLoadingMarketStats] = React.useState(true);
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
  const [marketProducts, setMarketProducts] = React.useState<MarketProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);
  const [lastClassSyncTime, setLastClassSyncTime] = React.useState<Date | null>(null);
  
  // 실제 데이터 상태
  const [realClasses, setRealClasses] = React.useState<ClassData[]>([]);
  const [realStudents, setRealStudents] = React.useState<Record<string, StudentData[]>>({});
  const [realAssignments, setRealAssignments] = React.useState<AssignmentData[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = React.useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(true);

  // Fixed colors for student lines in the chart
  const studentColors = React.useMemo(() => ['#22c55e', '#a855f7', '#eab308'], []);

  // Handlers
  const handleProductSelect = React.useCallback((productId: number) => {
    setSelectedProducts((prev) => {
      if (productId === -1) { // Special ID to clear all
        return [];
      }
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else if (prev.length < 2) {
        return [...prev, productId];
      }
      return prev;
    });
  }, []);

  const handleStudentSelect = React.useCallback((studentId: number) => {
    setSelectedStudents((prev) => {
      if (studentId === -1) { // Special ID to clear all
        setStudentColorMap({});
        return [];
      }
      if (prev.includes(studentId)) {
        // Remove student and their color
        setStudentColorMap((prevMap) => {
          const newMap = { ...prevMap };
          delete newMap[studentId];
          return newMap;
        });
        return prev.filter((id) => id !== studentId);
      } else if (prev.length < 3) {
        // Assign a color to the new student
        const usedColors = Object.values(studentColorMap);
        const availableColors = studentColors.filter((color) => !usedColors.includes(color));
        const assignedColor =
          availableColors[0] || studentColors[prev.length % studentColors.length];

        setStudentColorMap((prevMap) => ({
          ...prevMap,
          [studentId]: assignedColor,
        }));
        return [...prev, studentId];
      }
      return prev;
    });
  }, [studentColors, studentColorMap]);

  const handleAssignmentSelect = React.useCallback((assignmentId: string) => {
    setSelectedAssignments((prev) => {
      if (prev.includes(assignmentId)) {
        return prev.filter((id) => id !== assignmentId);
      } else if (prev.length < 5) {
        return [...prev, assignmentId];
      }
      return prev;
    });
  }, []);

  const getStudentColor = React.useCallback((studentId: number): string | null => {
    return studentColorMap[studentId] || null;
  }, [studentColorMap]);

  const getRecentProducts = React.useCallback((): MarketProduct[] => {
    if (marketProducts.length === 0) return [];
    return [...marketProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [marketProducts]);

  // API 재시도 함수 (안전한 버전)
  const retryApiCall = React.useCallback(async <T,>(
    apiCall: () => Promise<T>, 
    maxRetries: number = 1, 
    delay: number = 500
  ): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        // 네트워크 오류나 fetch 실패 시 즉시 에러 던지기
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw error;
        }
        if (i === maxRetries - 1) {
          throw error; // 마지막 시도에서도 실패하면 에러 던지기
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('모든 재시도가 실패했습니다');
  }, []);

  // 과제 배포된 학생 목록 조회
  const getAssignedStudents = React.useCallback(async (assignmentId: number, subject: 'korean' | 'english' | 'math'): Promise<number[]> => {
    try {
      let assignedStudents: number[] = [];
      try {
        if (subject === 'korean') {
          // 국어 과제 배포 정보 조회 - 결과에서 배포된 학생 추출
          try {
            const response = await koreanService.getAssignmentResults(assignmentId);
            
            // 결과에서 학생 ID들을 추출하여 배포된 학생 목록으로 사용
            if (Array.isArray(response)) {
              assignedStudents = response.map((result: any) => 
                result.student_id || result.studentId || result.user_id || result.userId
              ).filter((id: any) => id !== undefined);
            } else if (response && Array.isArray((response as any).results)) {
              assignedStudents = (response as any).results.map((result: any) => 
                result.student_id || result.studentId || result.user_id || result.userId
              ).filter((id: any) => id !== undefined);
            }
          } catch (koreanError) {
            assignedStudents = [];
          }
        } else if (subject === 'english') {
          // 영어 과제 배포 정보 조회 - 결과에서 배포된 학생 추출
          try {
            const response = await EnglishService.getEnglishAssignmentResults(assignmentId);
            
            // 결과에서 학생 ID들을 추출하여 배포된 학생 목록으로 사용
            if (Array.isArray(response)) {
              assignedStudents = response.map((result: any) => 
                result.student_id || result.studentId || result.user_id || result.userId
              ).filter((id: any) => id !== undefined);
            } else if (response && Array.isArray((response as any).results)) {
              assignedStudents = (response as any).results.map((result: any) => 
                result.student_id || result.studentId || result.user_id || result.userId
              ).filter((id: any) => id !== undefined);
            }
          } catch (englishError) {
            assignedStudents = [];
          }
        } else if (subject === 'math') {
          // 수학 과제 배포 정보 조회 - 결과에서 배포된 학생 추출
          try {
            const response = await mathService.getAssignmentResults(assignmentId);
            
            // 결과에서 학생 ID들을 추출하여 배포된 학생 목록으로 사용
            if (Array.isArray(response)) {
              assignedStudents = response.map((result: any) => 
                result.student_id || result.studentId || result.user_id || result.userId
              ).filter((id: any) => id !== undefined);
            } else if (response && Array.isArray((response as any).results)) {
              assignedStudents = (response as any).results.map((result: any) => 
                result.student_id || result.studentId || result.user_id || result.userId
              ).filter((id: any) => id !== undefined);
            }
          } catch (mathError) {
            assignedStudents = [];
          }
        }
      } catch (apiError) {
        // 배포 정보 조회 실패 시 빈 배열 반환
        assignedStudents = [];
      }
      
      return assignedStudents;
    } catch (error) {
      return [];
    }
  }, []);

  // 과제별 학생 점수 데이터 가져오기
  const getAssignmentStudentScores = React.useCallback(async (assignmentId: number, subject: 'korean' | 'english' | 'math'): Promise<Record<number, number>> => {
    try {
      let results: any[] = [];
      
      try {
        if (subject === 'korean') {
          const response = await koreanService.getAssignmentResults(assignmentId);
          
          // 다양한 응답 형태 처리
          if (Array.isArray(response)) {
            results = response;
          } else if (response && typeof response === 'object') {
            const responseObj = response as any;
            if (responseObj.results && Array.isArray(responseObj.results)) {
              results = responseObj.results;
            } else if (responseObj.data && Array.isArray(responseObj.data)) {
              results = responseObj.data;
            } else {
              // 단일 객체인 경우 배열로 변환
              results = [response];
            }
          }
        } else if (subject === 'english') {
          const response = await EnglishService.getEnglishAssignmentResults(assignmentId);
          
          // 영어 서비스에서 반환된 데이터 처리
          if (Array.isArray(response)) {
            results = response;
          } else if (response && typeof response === 'object') {
            const responseObj = response as any;
            if (responseObj.results && Array.isArray(responseObj.results)) {
              results = responseObj.results;
            } else if (responseObj.data && Array.isArray(responseObj.data)) {
              results = responseObj.data;
            } else {
              // 단일 객체인 경우 배열로 변환
              results = [response];
            }
          }
        } else if (subject === 'math') {
          const response = await mathService.getAssignmentResults(assignmentId);
          
          if (Array.isArray(response)) {
            results = response;
          } else if (response && typeof response === 'object') {
            const responseObj = response as any;
            if (responseObj.results && Array.isArray(responseObj.results)) {
              results = responseObj.results;
            } else if (responseObj.data && Array.isArray(responseObj.data)) {
              results = responseObj.data;
            } else {
              results = [response];
            }
          }
        }
      } catch (apiError) {
        // API 호출 실패 시 빈 배열 반환
        results = [];
      }
      
      // 결과를 학생 ID별 점수로 변환
      const studentScores: Record<number, number> = {};
      
      // 점수 데이터 추출 및 변환
      if (Array.isArray(results) && results.length > 0) {
        results.forEach((result) => {
          // 다양한 필드명 지원
          const studentId = result.student_id || result.studentId || result.user_id || result.userId;
          const score = result.score || result.total_score || result.totalScore || result.points || result.point;
          
          if (studentId && score !== undefined && score !== null) {
            const numericScore = Number(score);
            if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 100) {
              studentScores[studentId] = numericScore;
            }
          }
        });
      } else if (results && typeof results === 'object' && !Array.isArray(results)) {
        // 단일 결과 객체인 경우
        const resultObj = results as any;
        const studentId = resultObj.student_id || resultObj.studentId || resultObj.user_id || resultObj.userId;
        const score = resultObj.score || resultObj.total_score || resultObj.totalScore || resultObj.points || resultObj.point;
        
        if (studentId && score !== undefined && score !== null) {
          const numericScore = Number(score);
          if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 100) {
            studentScores[studentId] = numericScore;
          }
        }
        
        // 객체 내 중첩된 배열 처리
        Object.values(results).forEach((value: any) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              const itemStudentId = item.student_id || item.studentId || item.user_id || item.userId;
              const itemScore = item.score || item.total_score || item.totalScore || item.points || item.point;
              
              if (itemStudentId && itemScore !== undefined && itemScore !== null) {
                const numericScore = Number(itemScore);
                if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 100) {
                  studentScores[itemStudentId] = numericScore;
                }
              }
            });
          }
        });
      }
      
      return studentScores;
    } catch (error) {
      return {};
    }
  }, []);

  // 평균 점수 계산 - 실제 응시한 학생들의 점수만으로 계산
  const calculateAverageScore = React.useCallback((studentScores: Record<number, number>): number => {
    // 실제 응시한 학생들의 점수만 필터링 (0점 이상의 유효한 점수)
    const scores = Object.values(studentScores).filter(score => 
      score !== undefined && score !== null && !isNaN(score) && score >= 0 && score <= 100
    );
    
    if (scores.length === 0) {
      return 0;
    }
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const roundedAverage = Math.round(average * 10) / 10; // 소수점 첫째 자리까지 반올림
    return roundedAverage;
  }, []);

  // Market stats loading
  const loadMarketStats = React.useCallback(async () => {
    try {
      setIsLoadingMarketStats(true);
      const stats = await getMarketStats();
      setMarketStats(stats);
      setLastSyncTime(new Date());
    } catch (error: any) {
      const fallbackStats = {
        total_products: 0,
        total_sales: 0,
        average_rating: 0,
        total_revenue: 0,
      };
      setMarketStats(fallbackStats);
    } finally {
      setIsLoadingMarketStats(false);
    }
  }, []);

  // Load market products
  const loadMarketProducts = React.useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const products = await getMyProducts();
      setMarketProducts(products);
      setLastSyncTime(new Date());
    } catch (error: any) {
      setMarketProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 실제 클래스 데이터 로드
  const loadRealClasses = React.useCallback(async () => {
    try {
      setIsLoadingClasses(true);
      const classrooms = await classroomService.getMyClassrooms();
      const classData: ClassData[] = classrooms.map(classroom => ({
        id: classroom.id.toString(),
        name: classroom.name,
        createdAt: classroom.created_at
      }));
      setRealClasses(classData);
    } catch (error) {
      setRealClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  // 실제 학생 데이터 로드
  const loadRealStudents = React.useCallback(async () => {
    try {
      setIsLoadingStudents(true);
      const studentsData: Record<string, StudentData[]> = {};
      
      for (const classroom of realClasses) {
        try {
          const students = await classroomService.getClassroomStudents(parseInt(classroom.id));
          
          studentsData[classroom.id] = students.map(student => ({
            id: student.id,
            name: student.name,
            grade: student.grade,
            attendance: Math.floor(Math.random() * 20) + 80
          }));
          
        } catch (error) {
          studentsData[classroom.id] = [];
        }
      }
      
      setRealStudents(studentsData);
    } catch (error) {
      setRealStudents({});
    } finally {
      setIsLoadingStudents(false);
    }
  }, [realClasses]);

  // 실제 과제 데이터 로드 (선택된 클래스의 배포된 과제만) - 최적화된 버전
  const loadRealAssignments = React.useCallback(async (selectedClassId?: string) => {
    try {
      setIsLoadingAssignments(true);
      const assignmentsData: AssignmentData[] = [];
      
      // 선택된 클래스가 있으면 해당 클래스만, 없으면 모든 클래스 처리
      const classesToProcess = selectedClassId 
        ? realClasses.filter(cls => cls.id === selectedClassId)
        : realClasses;
      
      // 모든 클래스의 과제를 병렬로 로드
      const classPromises = classesToProcess.map(async (classroom) => {
        try {
          // 국어, 영어, 수학 과제를 병렬로 로드
          const [koreanAssignments, englishAssignments, mathAssignments] = await Promise.allSettled([
            retryApiCall(() => koreanService.getDeployedAssignments(classroom.id.toString())),
            retryApiCall(() => EnglishService.getDeployedAssignments(classroom.id.toString())),
            retryApiCall(() => mathService.getDeployedAssignments(classroom.id.toString()))
          ]);

          // 각 과목별 과제 데이터 처리
          const processAssignments = async (assignments: any[], subject: 'korean' | 'english' | 'math') => {
            if (!assignments || assignments.length === 0) return [];
            
            return Promise.all(
              assignments.map(async (assignment) => {
                const [studentScores, assignedStudents] = await Promise.all([
                  getAssignmentStudentScores(assignment.id, subject),
                  getAssignedStudents(assignment.id, subject)
                ]);
                
                const averageScore = calculateAverageScore(studentScores);
                const submittedCount = Object.keys(studentScores).length;
                const totalAssignedStudents = assignedStudents.length;
                
                return {
                  id: assignment.id.toString(),
                  title: assignment.title,
                  subject: subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학',
                  dueDate: assignment.created_at ? new Date(assignment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  submitted: submittedCount,
                  total: totalAssignedStudents,
                  averageScore: averageScore,
                  studentScores: studentScores,
                  assignedStudents: assignedStudents
                };
              })
            );
          };

          const [koreanData, englishData, mathData] = await Promise.all([
            koreanAssignments.status === 'fulfilled' ? processAssignments(koreanAssignments.value, 'korean') : [],
            englishAssignments.status === 'fulfilled' ? processAssignments(englishAssignments.value, 'english') : [],
            mathAssignments.status === 'fulfilled' ? processAssignments(mathAssignments.value, 'math') : []
          ]);

          return [...koreanData, ...englishData, ...mathData];
        } catch (error) {
          return [];
        }
      });

      const results = await Promise.all(classPromises);
      const allAssignments = results.flat();
      
      setRealAssignments(allAssignments);
    } catch (error) {
      setRealAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [realClasses, getAssignmentStudentScores, getAssignedStudents, calculateAverageScore, retryApiCall]);

  // 실제 통계 데이터 상태
  const [realStats, setRealStats] = React.useState({
    totalClasses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    totalProblems: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [apiErrors, setApiErrors] = React.useState<Set<string>>(new Set());

  // 실제 통계 데이터 로드 - 최적화된 버전
  const loadRealStats = React.useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setApiErrors(new Set());
      
      // 1. 전체 클래스 수 (내가 생성한 클래스)
      let myClasses: any[] = [];
      try {
        myClasses = await classroomService.getMyClassrooms();
      } catch (error) {
        myClasses = [];
      }
      const totalClasses = myClasses.length;
      
      // 2. 전체 학생 수와 활성 과제 수를 병렬로 계산
      const [totalStudents, activeAssignments] = await Promise.all([
        // 학생 수 계산
        (async () => {
          let students = 0;
          const studentPromises = myClasses.map(async (classroom) => {
            try {
              const classStudents = await classroomService.getClassroomStudents(classroom.id);
              return classStudents.length;
            } catch (error) {
              return 0;
            }
          });
          const studentCounts = await Promise.all(studentPromises);
          students = studentCounts.reduce((sum, count) => sum + count, 0);
          return students;
        })(),
        
        // 활성 과제 수 계산
        (async () => {
          let assignments = 0;
          const assignmentPromises = myClasses.map(async (classroom) => {
            try {
              const [koreanAssignments, englishAssignments, mathAssignments] = await Promise.allSettled([
                retryApiCall(() => koreanService.getDeployedAssignments(classroom.id.toString())),
                retryApiCall(() => EnglishService.getDeployedAssignments(classroom.id.toString())),
                retryApiCall(() => mathService.getDeployedAssignments(classroom.id.toString()))
              ]);
              
              let classAssignments = 0;
              if (koreanAssignments.status === 'fulfilled') classAssignments += koreanAssignments.value?.length || 0;
              if (englishAssignments.status === 'fulfilled') classAssignments += englishAssignments.value?.length || 0;
              if (mathAssignments.status === 'fulfilled') classAssignments += mathAssignments.value?.length || 0;
              
              return classAssignments;
            } catch (error) {
              return 0;
            }
          });
          const assignmentCounts = await Promise.all(assignmentPromises);
          assignments = assignmentCounts.reduce((sum, count) => sum + count, 0);
          return assignments;
        })()
      ]);
      
      // 3. 전체 문제 수를 병렬로 계산
      const totalProblems = await (async () => {
        try {
          const [koreanWorksheets, englishWorksheets, mathWorksheets] = await Promise.allSettled([
            retryApiCall(() => koreanService.getKoreanWorksheets()),
            retryApiCall(() => EnglishService.getEnglishWorksheets()),
            retryApiCall(() => mathService.getMathWorksheets())
          ]);
          
          let problems = 0;
          if (koreanWorksheets.status === 'fulfilled' && koreanWorksheets.value?.worksheets) {
            problems += koreanWorksheets.value.worksheets.length;
          }
          if (englishWorksheets.status === 'fulfilled' && Array.isArray(englishWorksheets.value)) {
            problems += englishWorksheets.value.length;
          }
          if (mathWorksheets.status === 'fulfilled' && mathWorksheets.value?.worksheets) {
            problems += mathWorksheets.value.worksheets.length;
          }
          
          return problems;
        } catch (error) {
          return 0;
        }
      })();
      
      setRealStats({
        totalClasses,
        totalStudents,
        activeAssignments,
        totalProblems,
      });
      
    } catch (error) {
      setRealStats({
        totalClasses: 0,
        totalStudents: 0,
        activeAssignments: 0,
        totalProblems: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [retryApiCall]);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadMarketStats(), 
      loadMarketProducts(),
      loadRealClasses(),
      loadRealStats(), // 통계 데이터도 새로고침
      loadRealAssignments(selectedClass) // 선택된 클래스의 과제 데이터만 새로고침
    ]);
    setLastClassSyncTime(new Date()); // 클래스 동기화 시간 업데이트
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call delay
    setIsRefreshing(false);
  }, [loadMarketStats, loadMarketProducts, loadRealClasses, loadRealStats, loadRealAssignments, selectedClass]);

  // 점수 데이터만 새로고침하는 함수
  const refreshScoreData = React.useCallback(async () => {
    try {
      await loadRealAssignments(selectedClass); // 선택된 클래스의 과제 데이터와 점수 데이터 새로고침
    } catch (error) {
      // 에러 처리
    }
  }, [loadRealAssignments, selectedClass]);

  // Calculate period stats (폴백용)
  const periodStats = React.useMemo(() => {
    return realStats;
  }, [realStats]);

  // Initialize - 병렬 로딩으로 최적화
  React.useEffect(() => {
    const initializeData = async () => {
      // 마켓 데이터와 클래스 데이터를 병렬로 로드
      await Promise.all([
        loadMarketStats(),
        loadMarketProducts(),
        loadRealClasses()
      ]);
    };
    
    initializeData();
  }, [loadMarketStats, loadMarketProducts, loadRealClasses]);
  
  // 클래스 데이터 로드 후 통계 데이터 로드
  React.useEffect(() => {
    if (realClasses.length > 0) {
      loadRealStats();
    }
  }, [realClasses.length, loadRealStats]);

  // 클래스 데이터가 로드되면 학생 데이터만 로드 (과제는 선택된 클래스에서만)
  React.useEffect(() => {
    if (realClasses.length > 0) {
      loadRealStudents();
      
      // 첫 번째 클래스를 기본 선택
      const latestClassId = realClasses.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0].id;
      setSelectedClass(latestClassId);
    }
  }, [realClasses, loadRealStudents]);

  React.useEffect(() => {
    setSelectedStudents([]);
    setStudentColorMap({});
  }, [selectedClass]);

  // 선택된 클래스가 변경될 때마다 해당 클래스의 과제만 불러오기
  React.useEffect(() => {
    if (selectedClass && realClasses.length > 0) {
      loadRealAssignments(selectedClass);
    }
  }, [selectedClass, realClasses, loadRealAssignments]);
                                 
  return (
    <div className="flex flex-col min-h-screen p-5 space-y-6">
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || 'user'} 대시보드`}
        variant="default"
        description="수업 현황과 마켓 관리를 확인하세요"
      />

      {/* Tab Navigation */}
      <TabNavigation
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {/* Market Management Tab */}
      {selectedTab === '마켓 관리' && (
        <MarketManagementTab
          marketStats={marketStats}
          isLoadingMarketStats={isLoadingMarketStats}
          marketProducts={marketProducts}
          selectedProducts={selectedProducts}
          isLoadingProducts={isLoadingProducts}
          lastSyncTime={lastSyncTime}
          onRefresh={() => {
            loadMarketStats();
            loadMarketProducts();
          }}
          onProductSelect={handleProductSelect}
          getRecentProducts={getRecentProducts}
        />
      )}

      {/* Class Management Tab */}
      {selectedTab === '클래스 관리' && (
        <ClassManagementTab
          realClasses={realClasses}
          realStudents={realStudents}
          realAssignments={realAssignments}
          selectedClass={selectedClass}
          selectedStudents={selectedStudents}
          selectedAssignments={selectedAssignments}
          studentColorMap={studentColorMap}
          studentColors={studentColors}
          isLoadingClasses={isLoadingClasses}
          isLoadingStats={isLoadingStats}
          lastClassSyncTime={lastClassSyncTime}
          isRefreshing={isRefreshing}
          isAssignmentModalOpen={isAssignmentModalOpen}
          periodStats={periodStats}
          onRefresh={handleRefresh}
          onClassSelect={setSelectedClass}
          onStudentSelect={handleStudentSelect}
          onAssignmentSelect={handleAssignmentSelect}
          onAssignmentModalToggle={setIsAssignmentModalOpen}
          onStudentColorMapChange={setStudentColorMap}
          getStudentColor={getStudentColor}
        />
      )}
    </div>
  );
});

export default TeacherDashboard;
