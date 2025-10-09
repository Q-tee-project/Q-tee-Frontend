'use client';

import React, { Suspense } from 'react';
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

// Lazy load heavy components
const MarketManagementTab = React.lazy(() => import('@/components/dashboard/MarketManagementTab'));
const ClassManagementTab = React.lazy(() => import('@/components/dashboard/ClassManagementTab'));

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
      if (productId === -1) {
        // Special ID to clear all
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

  const handleStudentSelect = React.useCallback(
    (studentId: number) => {
      setSelectedStudents((prev) => {
        if (studentId === -1) {
          // Special ID to clear all
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
    },
    [studentColors, studentColorMap],
  );

  const handleAssignmentSelect = React.useCallback((assignmentId: string) => {
    setSelectedAssignments((prev) => {
      if (prev.includes(assignmentId)) {
        return prev.filter((id) => id !== assignmentId);
      } else if (prev.length < 7) {
        return [...prev, assignmentId];
      }
      return prev;
    });
  }, []);

  const getStudentColor = React.useCallback(
    (studentId: number): string | null => {
      return studentColorMap[studentId] || null;
    },
    [studentColorMap],
  );

  const getRecentProducts = React.useCallback((): MarketProduct[] => {
    if (marketProducts.length === 0) return [];
    return [...marketProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [marketProducts]);

  // 에러 메시지를 사용자 친화적으로 변환하는 함수
  const getErrorMessage = React.useCallback((error: any, context: string): string => {
    if (!error) return '알 수 없는 오류가 발생했습니다.';

    // 네트워크 연결 오류
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
    }

    // HTTP 상태 코드 기반 오류
    if (error.status) {
      switch (error.status) {
        case 401:
          return '로그인이 필요합니다. 다시 로그인해주세요.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return `${context}을(를) 찾을 수 없습니다.`;
        case 500:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        case 503:
          return '서비스가 일시적으로 사용할 수 없습니다.';
        default:
          return `${context} 처리 중 오류가 발생했습니다.`;
      }
    }

    // 타임아웃 오류
    if (error.message && error.message.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    // 기타 오류
    return error.message || `${context} 처리 중 오류가 발생했습니다.`;
  }, []);

  // API 재시도 함수 (개선된 버전)
  const retryApiCall = React.useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      context: string = 'API',
      maxRetries: number = 2,
      delay: number = 1000,
    ): Promise<T> => {
      let lastError: any;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await apiCall();
        } catch (error) {
          lastError = error;

          // 네트워크 오류나 fetch 실패 시 즉시 에러 던지기
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw error;
          }

          // 마지막 시도가 아니면 재시도
          if (i < maxRetries - 1) {
            console.log(`${context} 재시도 중... (${i + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
          }
        }
      }

      // 모든 재시도 실패 시 사용자 친화적 에러 메시지와 함께 던지기
      const userFriendlyError = new Error(getErrorMessage(lastError, context));
      (userFriendlyError as any).originalError = lastError;
      throw userFriendlyError;
    },
    [getErrorMessage],
  );

  // 과제 배포된 학생 목록 조회
  const getAssignedStudents = React.useCallback(
    async (assignmentId: number, subject: 'korean' | 'english' | 'math'): Promise<number[]> => {
      try {
        let assignedStudents: number[] = [];
        try {
          if (subject === 'korean') {
            // 국어 과제 배포 정보 조회 - 결과에서 배포된 학생 추출
            try {
              const response = await koreanService.getAssignmentResults(assignmentId);

              // 결과에서 학생 ID들을 추출하여 배포된 학생 목록으로 사용
              if (Array.isArray(response)) {
                assignedStudents = response
                  .map(
                    (result: any) =>
                      result.student_id || result.studentId || result.user_id || result.userId,
                  )
                  .filter((id: any) => id !== undefined);
              } else if (response && Array.isArray((response as any).results)) {
                assignedStudents = (response as any).results
                  .map(
                    (result: any) =>
                      result.student_id || result.studentId || result.user_id || result.userId,
                  )
                  .filter((id: any) => id !== undefined);
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
                assignedStudents = response
                  .map(
                    (result: any) =>
                      result.student_id || result.studentId || result.user_id || result.userId,
                  )
                  .filter((id: any) => id !== undefined);
              } else if (response && Array.isArray((response as any).results)) {
                assignedStudents = (response as any).results
                  .map(
                    (result: any) =>
                      result.student_id || result.studentId || result.user_id || result.userId,
                  )
                  .filter((id: any) => id !== undefined);
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
                assignedStudents = response
                  .map(
                    (result: any) =>
                      result.student_id || result.studentId || result.user_id || result.userId,
                  )
                  .filter((id: any) => id !== undefined);
              } else if (response && Array.isArray((response as any).results)) {
                assignedStudents = (response as any).results
                  .map(
                    (result: any) =>
                      result.student_id || result.studentId || result.user_id || result.userId,
                  )
                  .filter((id: any) => id !== undefined);
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
    },
    [],
  );

  // 과제별 학생 점수 데이터 가져오기
  const getAssignmentStudentScores = React.useCallback(
    async (
      assignmentId: number,
      subject: 'korean' | 'english' | 'math',
    ): Promise<Record<number, number>> => {
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
            const studentId =
              result.student_id || result.studentId || result.user_id || result.userId;
            const score =
              result.score ||
              result.total_score ||
              result.totalScore ||
              result.points ||
              result.point;

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
          const studentId =
            resultObj.student_id || resultObj.studentId || resultObj.user_id || resultObj.userId;
          const score =
            resultObj.score ||
            resultObj.total_score ||
            resultObj.totalScore ||
            resultObj.points ||
            resultObj.point;

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
                const itemStudentId =
                  item.student_id || item.studentId || item.user_id || item.userId;
                const itemScore =
                  item.score || item.total_score || item.totalScore || item.points || item.point;

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
    },
    [],
  );

  // 평균 점수 계산 - 실제 응시한 학생들의 점수만으로 계산
  const calculateAverageScore = React.useCallback(
    (studentScores: Record<number, number>): number => {
      // 실제 응시한 학생들의 점수만 필터링 (0점 이상의 유효한 점수)
      const scores = Object.values(studentScores).filter(
        (score) =>
          score !== undefined && score !== null && !isNaN(score) && score >= 0 && score <= 100,
      );

      if (scores.length === 0) {
        return 0;
      }

      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const roundedAverage = Math.round(average * 10) / 10; // 소수점 첫째 자리까지 반올림
      return roundedAverage;
    },
    [],
  );

  // Market stats loading
  const loadMarketStats = React.useCallback(async () => {
    try {
      setIsLoadingMarketStats(true);
      const stats = await getMarketStats();
      setMarketStats(stats);
      setLastSyncTime(new Date());
    } catch (error: any) {
      console.log('[Dashboard] 마켓 통계 조회 실패, 기본값을 사용합니다.');
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
      console.log('[Dashboard] 마켓 상품 조회 실패, 빈 목록을 표시합니다.');
      setMarketProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 실제 클래스 데이터 로드 (개선된 에러 처리)
  const loadRealClasses = React.useCallback(async () => {
    try {
      setIsLoadingClasses(true);
      setApiErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete('classes');
        return newSet;
      });

      const classrooms = await retryApiCall(
        () => classroomService.getMyClassrooms(),
        '클래스 정보',
        3,
        1000,
      );

      const classData: ClassData[] = classrooms.map((classroom) => ({
        id: classroom.id.toString(),
        name: classroom.name,
        createdAt: classroom.created_at,
      }));

      setRealClasses(classData);
      setLastClassSyncTime(new Date());
      console.log('✅ 클래스 데이터 로딩 성공:', classData.length, '개 클래스');
    } catch (error) {
      console.error('❌ 클래스 데이터 로딩 실패:', error);
      setRealClasses([]);
      setApiErrors((prev) => new Set([...prev, 'classes']));
      setErrorMessages((prev) => ({
        ...prev,
        classes: getErrorMessage(error, '클래스 정보'),
      }));
    } finally {
      setIsLoadingClasses(false);
    }
  }, [retryApiCall, getErrorMessage]);

  // 실제 학생 데이터 로드 (개선된 에러 처리) - 수정된 버전
  const loadRealStudents = React.useCallback(async () => {
    try {
      setIsLoadingStudents(true);
      setApiErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete('students');
        return newSet;
      });

      const studentsData: Record<string, StudentData[]> = {};
      let hasError = false;

      // 각 클래스별로 학생 데이터를 병렬로 로드
      const classPromises = realClasses.map(async (classroom) => {
        try {
          const students = await retryApiCall(
            () => classroomService.getClassroomStudents(parseInt(classroom.id)),
            `클래스 ${classroom.name} 학생 정보`,
            2,
            500,
          );

          // 학생 데이터를 변환하여 저장
          const classStudents: StudentData[] = students.map((student) => ({
            id: student.id,
            name: student.name,
            grade: student.grade,
            attendance: Math.floor(Math.random() * 20) + 80,
          }));

          return { classId: classroom.id, students: classStudents };
        } catch (error) {
          console.error(`❌ 클래스 ${classroom.name} 학생 데이터 로딩 실패:`, error);
          return { classId: classroom.id, students: [] };
        }
      });

      const results = await Promise.all(classPromises);

      // 결과를 studentsData에 저장
      results.forEach(({ classId, students }) => {
        studentsData[classId] = students;
      });

      setRealStudents(studentsData);

      // 에러가 있는지 확인 - 학생이 0명인 것은 정상일 수 있으므로 에러로 처리하지 않음
      // const hasAnyError = results.some((result) => result.students.length === 0);
      // if (hasAnyError) {
      //   setApiErrors((prev) => new Set([...prev, 'students']));
      //   setErrorMessages((prev) => ({
      //     ...prev,
      //     students: '일부 클래스의 학생 정보를 불러올 수 없습니다.',
      //   }));
      // }
    } catch (error) {
      console.error('❌ 학생 데이터 로딩 실패:', error);
      setRealStudents({});
      setApiErrors((prev) => new Set([...prev, 'students']));
      setErrorMessages((prev) => ({
        ...prev,
        students: getErrorMessage(error, '학생 정보'),
      }));
    } finally {
      setIsLoadingStudents(false);
    }
  }, [realClasses, retryApiCall, getErrorMessage]);

  // 실제 과제 데이터 로드 (선택된 클래스의 배포된 과제만) - 최적화된 버전
  const loadRealAssignments = React.useCallback(
    async (selectedClassId?: string) => {
      try {
        setIsLoadingAssignments(true);
        const assignmentsData: AssignmentData[] = [];

        // 선택된 클래스가 있으면 해당 클래스만, 없으면 모든 클래스 처리
        const classesToProcess = selectedClassId
          ? realClasses.filter((cls) => cls.id === selectedClassId)
          : realClasses;

        // 모든 클래스의 과제를 병렬로 로드
        const classPromises = classesToProcess.map(async (classroom) => {
          try {
            // 국어, 영어, 수학 과제를 병렬로 로드
            const [koreanAssignments, englishAssignments, mathAssignments] =
              await Promise.allSettled([
                retryApiCall(() => koreanService.getDeployedAssignments(classroom.id.toString())),
                retryApiCall(() => EnglishService.getDeployedAssignments(classroom.id.toString())),
                retryApiCall(() => mathService.getDeployedAssignments(classroom.id.toString())),
              ]);

            // 각 과목별 과제 데이터 처리
            const processAssignments = async (
              assignments: any[],
              subject: 'korean' | 'english' | 'math',
            ) => {
              if (!assignments || assignments.length === 0) return [];

              return Promise.all(
                assignments.map(async (assignment) => {
                  const [studentScores, assignedStudents] = await Promise.all([
                    getAssignmentStudentScores(assignment.id, subject),
                    getAssignedStudents(assignment.id, subject),
                  ]);

                  const averageScore = calculateAverageScore(studentScores);
                  const submittedCount = Object.keys(studentScores).length;
                  const totalAssignedStudents = assignedStudents.length;

                  return {
                    id: assignment.id.toString(),
                    title: assignment.title,
                    subject:
                      subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학',
                    dueDate: assignment.created_at
                      ? new Date(assignment.created_at).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0],
                    submitted: submittedCount,
                    total: totalAssignedStudents,
                    averageScore: averageScore,
                    studentScores: studentScores,
                    assignedStudents: assignedStudents,
                  };
                }),
              );
            };

            const [koreanData, englishData, mathData] = await Promise.all([
              koreanAssignments.status === 'fulfilled'
                ? processAssignments(koreanAssignments.value, 'korean')
                : [],
              englishAssignments.status === 'fulfilled'
                ? processAssignments(englishAssignments.value, 'english')
                : [],
              mathAssignments.status === 'fulfilled'
                ? processAssignments(mathAssignments.value, 'math')
                : [],
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
    },
    [
      realClasses,
      getAssignmentStudentScores,
      getAssignedStudents,
      calculateAverageScore,
      retryApiCall,
    ],
  );

  // 실제 통계 데이터 상태
  const [realStats, setRealStats] = React.useState({
    totalClasses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    totalProblems: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [apiErrors, setApiErrors] = React.useState<Set<string>>(new Set());
  const [errorMessages, setErrorMessages] = React.useState<Record<string, string>>({});
  const [isRetrying, setIsRetrying] = React.useState(false);

  // API 캐싱을 위한 상태
  const [apiCache, setApiCache] = React.useState<Map<string, { data: any; timestamp: number }>>(
    new Map(),
  );
  const CACHE_DURATION = 30000; // 30초 캐시

  // 캐시된 API 호출 함수
  const cachedApiCall = React.useCallback(
    async <T,>(key: string, apiCall: () => Promise<T>): Promise<T> => {
      const cached = apiCache.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      try {
        const data = await apiCall();
        setApiCache((prev) => new Map(prev).set(key, { data, timestamp: now }));
        return data;
      } catch (error) {
        throw error;
      }
    },
    [apiCache, CACHE_DURATION],
  );

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
              const [koreanAssignments, englishAssignments, mathAssignments] =
                await Promise.allSettled([
                  retryApiCall(() => koreanService.getDeployedAssignments(classroom.id.toString())),
                  retryApiCall(() =>
                    EnglishService.getDeployedAssignments(classroom.id.toString()),
                  ),
                  retryApiCall(() => mathService.getDeployedAssignments(classroom.id.toString())),
                ]);

              let classAssignments = 0;
              if (koreanAssignments.status === 'fulfilled')
                classAssignments += koreanAssignments.value?.length || 0;
              if (englishAssignments.status === 'fulfilled')
                classAssignments += englishAssignments.value?.length || 0;
              if (mathAssignments.status === 'fulfilled')
                classAssignments += mathAssignments.value?.length || 0;

              return classAssignments;
            } catch (error) {
              return 0;
            }
          });
          const assignmentCounts = await Promise.all(assignmentPromises);
          assignments = assignmentCounts.reduce((sum, count) => sum + count, 0);
          return assignments;
        })(),
      ]);

      // 3. 전체 문제 수를 병렬로 계산
      const totalProblems = await (async () => {
        try {
          const [koreanWorksheets, englishWorksheets, mathWorksheets] = await Promise.allSettled([
            retryApiCall(() => koreanService.getKoreanWorksheets()),
            retryApiCall(() => EnglishService.getEnglishWorksheets()),
            retryApiCall(() => mathService.getMathWorksheets()),
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
      loadRealStudents(), // 학생 데이터도 새로고침
      loadRealAssignments(selectedClass), // 선택된 클래스의 과제 데이터만 새로고침
    ]);
    setLastClassSyncTime(new Date()); // 클래스 동기화 시간 업데이트
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call delay
    setIsRefreshing(false);
  }, [
    loadMarketStats,
    loadMarketProducts,
    loadRealClasses,
    loadRealStats,
    loadRealStudents,
    loadRealAssignments,
    selectedClass,
  ]);

  // 클래스 생성 후 데이터 새로고침 함수
  const refreshAfterClassCreation = React.useCallback(async () => {
    console.log('🔄 클래스 생성 후 데이터 새로고침 시작...');
    try {
      // 클래스 데이터 새로고침
      await loadRealClasses();

      // 잠시 대기 후 학생 데이터도 새로고침
      setTimeout(async () => {
        await loadRealStudents();
        console.log('✅ 클래스 생성 후 데이터 새로고침 완료');
      }, 500);
    } catch (error) {
      console.error('❌ 클래스 생성 후 데이터 새로고침 실패:', error);
    }
  }, [loadRealClasses, loadRealStudents]);

  // 점수 데이터만 새로고침하는 함수
  const refreshScoreData = React.useCallback(async () => {
    try {
      await loadRealAssignments(selectedClass); // 선택된 클래스의 과제 데이터와 점수 데이터 새로고침
    } catch (error) {
      // 에러 처리
    }
  }, [loadRealAssignments, selectedClass]);

  // Calculate period stats (폴백용) - 메모이제이션 강화
  const periodStats = React.useMemo(() => {
    return {
      totalClasses: realStats.totalClasses,
      totalStudents: realStats.totalStudents,
      activeAssignments: realStats.activeAssignments,
      totalProblems: realStats.totalProblems,
    };
  }, [
    realStats.totalClasses,
    realStats.totalStudents,
    realStats.activeAssignments,
    realStats.totalProblems,
  ]);

  // 선택된 학생 정보 메모이제이션
  const selectedStudentsInfo = React.useMemo(() => {
    if (!selectedClass || !realStudents[selectedClass]) return [];
    return selectedStudents
      .map((studentId) => {
        const student = realStudents[selectedClass].find((s) => s.id === studentId);
        return student
          ? { id: studentId, name: student.name, color: getStudentColor(studentId) }
          : null;
      })
      .filter(Boolean);
  }, [selectedClass, selectedStudents, realStudents, getStudentColor]);

  // 클래스 선택 옵션 메모이제이션
  const classOptions = React.useMemo(() => {
    return realClasses.map((cls) => ({
      value: cls.id,
      label: cls.name,
    }));
  }, [realClasses]);

  // Initialize - 병렬 로딩으로 최적화
  React.useEffect(() => {
    const initializeData = async () => {
      // 마켓 데이터와 클래스 데이터를 병렬로 로드
      await Promise.all([loadMarketStats(), loadMarketProducts(), loadRealClasses()]);
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  // 클래스 데이터 로드 후 통계 데이터 로드
  React.useEffect(() => {
    if (realClasses.length > 0) {
      loadRealStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realClasses.length]); // loadRealStats 제거하여 무한 루프 방지

  // 클래스 데이터가 로드되면 학생 데이터만 로드 (과제는 선택된 클래스에서만)
  React.useEffect(() => {
    if (realClasses.length > 0) {
      loadRealStudents();

      // 첫 번째 클래스를 기본 선택 (새로 생성된 클래스가 있으면 최신 클래스 선택)
      const latestClassId = realClasses.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0].id;

      // 현재 선택된 클래스가 없거나 새로 생성된 클래스가 있으면 최신 클래스 선택
      if (!selectedClass || !realStudents[selectedClass]) {
        setSelectedClass(latestClassId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realClasses.length]); // realClasses만 length로 추적하여 무한 루프 방지

  // 선택된 클래스가 변경될 때 해당 클래스의 학생 데이터가 없으면 즉시 로드
  React.useEffect(() => {
    if (selectedClass && realClasses.length > 0 && !realStudents[selectedClass]) {
      // 해당 클래스의 학생 데이터만 즉시 로드
      const loadSpecificClassStudents = async () => {
        try {
          const students = await classroomService.getClassroomStudents(parseInt(selectedClass));
          const classStudents: StudentData[] = students.map((student) => ({
            id: student.id,
            name: student.name,
            grade: student.grade,
            attendance: Math.floor(Math.random() * 20) + 80,
          }));

          setRealStudents((prev) => ({
            ...prev,
            [selectedClass]: classStudents,
          }));
        } catch (error) {
          console.error(`❌ 클래스 ${selectedClass} 학생 데이터 로드 실패:`, error);
        }
      };

      loadSpecificClassStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]); // selectedClass 변경 시에만 실행

  React.useEffect(() => {
    setSelectedStudents([]);
    setStudentColorMap({});
  }, [selectedClass]);

  // 선택된 클래스가 변경될 때마다 해당 클래스의 과제만 불러오기
  React.useEffect(() => {
    if (selectedClass && realClasses.length > 0) {
      loadRealAssignments(selectedClass);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]); // selectedClass 변경 시에만 실행

  // 주기적으로 학생 데이터 새로고침 (학생 초대/승인 후 실시간 업데이트)
  // 이 기능은 너무 많은 API 호출을 유발하므로 비활성화
  // 대신 수동 새로고침 버튼을 사용하도록 권장
  /*
  React.useEffect(() => {
    if (!selectedClass) return;

    const interval = setInterval(async () => {
      // 현재 선택된 클래스의 학생 데이터가 있는지 확인
      if (realStudents[selectedClass]) {
        try {
          // 해당 클래스의 학생 데이터만 새로고침
          const students = await classroomService.getClassroomStudents(parseInt(selectedClass));
          const classStudents: StudentData[] = students.map((student) => ({
            id: student.id,
            name: student.name,
            grade: student.grade,
            attendance: Math.floor(Math.random() * 20) + 80,
          }));

          // 기존 데이터와 비교하여 변경사항이 있으면 업데이트
          const currentStudents = realStudents[selectedClass] || [];
          if (
            classStudents.length !== currentStudents.length ||
            !classStudents.every(
              (student, index) =>
                currentStudents[index] && student.id === currentStudents[index].id,
            )
          ) {
            console.log(`🔄 클래스 ${selectedClass}의 학생 데이터가 변경되어 업데이트합니다.`);
            setRealStudents((prev) => ({
              ...prev,
              [selectedClass]: classStudents,
            }));
          }
        } catch (error) {
          console.error(`❌ 클래스 ${selectedClass} 학생 데이터 새로고침 실패:`, error);
        }
      }
    }, 5000); // 5초마다 체크

    return () => clearInterval(interval);
  }, [selectedClass, realStudents]);
  */

  // 에러 상태 표시 컴포넌트
  const ErrorAlert = ({ errorKey, message }: { errorKey: string; message: string }) => (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {errorKey === 'classes' && '클래스 정보 로딩 실패'}

              {errorKey === 'assignments' && '과제 정보 로딩 실패'}
              {errorKey === 'market' && '마켓 정보 로딩 실패'}
            </h3>
            <p className="mt-1 text-sm text-red-700">{message}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setApiErrors((prev) => {
              const newSet = new Set(prev);
              newSet.delete(errorKey);
              return newSet;
            });
            setErrorMessages((prev) => {
              const newMessages = { ...prev };
              delete newMessages[errorKey];
              return newMessages;
            });
          }}
          className="text-red-400 hover:text-red-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen p-5 space-y-6">
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || 'user'} 대시보드`}
        variant="default"
        description="수업 현황과 마켓 관리를 확인하세요"
      />

      {/* 에러 알림 표시 */}
      {Array.from(apiErrors).map((errorKey) => (
        <ErrorAlert
          key={errorKey}
          errorKey={errorKey}
          message={errorMessages[errorKey] || `알 수 없는 오류가 발생했습니다. (에러 키: ${errorKey})`}
        />
      ))}

      {/* Tab Navigation */}
      <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Market Management Tab */}
      {selectedTab === '마켓 관리' && (
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-200 rounded-lg h-96 lg:col-span-2"></div>
                  <div className="bg-gray-200 rounded-lg h-96"></div>
                </div>
              </div>
            </div>
          }
        >
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
        </Suspense>
      )}

      {/* Class Management Tab */}
      {selectedTab === '클래스 관리' && (
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-200 rounded-lg h-96 lg:col-span-2"></div>
                  <div className="bg-gray-200 rounded-lg h-96"></div>
                </div>
              </div>
            </div>
          }
        >
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
            isLoadingAssignments={isLoadingAssignments}
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
        </Suspense>
      )}
    </div>
  );
});

export default TeacherDashboard;
