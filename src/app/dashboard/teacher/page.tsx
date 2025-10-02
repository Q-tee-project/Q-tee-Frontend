'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { getMarketStats, MarketStats, getMyProducts, MarketProduct } from '@/services/marketApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  FileText,
  ClipboardList,
  BarChart3,
  BookOpen,
  Calendar,
  MessageSquare,
  Info,
  GraduationCap,
  BookOpen as BookIcon,
  CheckSquare,
  UserCheck,
  RefreshCw,
  ArrowRight,
  X,
  Package,
  ShoppingCart,
  Star,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { Calendar as CalendarIcon } from 'lucide-react';
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
  LineChart,
} from 'recharts';

// 애니메이션 카운터 컴포넌트
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [count, value]);

  return (
    <span>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

const TeacherDashboard = () => {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = React.useState('클래스 관리');
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedStudents, setSelectedStudents] = React.useState<number[]>([]);
  const [studentColorMap, setStudentColorMap] = React.useState<Record<number, string>>({});
  const [selectedAssignment, setSelectedAssignment] = React.useState('');
  const [chartPeriod, setChartPeriod] = React.useState<{
    fromYear: number | null;
    fromMonth: number | null;
    toYear: number | null;
    toMonth: number | null;
  }>({
    fromYear: null,
    fromMonth: null,
    toYear: null,
    toMonth: null,
  });
  const [isDateModalOpen, setIsDateModalOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);
  const [marketStats, setMarketStats] = React.useState<MarketStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
  const [marketProducts, setMarketProducts] = React.useState<MarketProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  // 상품 선택 핸들러
  const handleProductSelect = (productId: number) => {
    // 이미 2개가 선택되어 있고, 현재 상품이 선택되지 않은 경우 클릭 무시
    if (selectedProducts.length >= 2 && !selectedProducts.includes(productId)) {
      return;
    }

    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        // 개별 제거 애니메이션
        const cardElement = document.querySelector(
          `[data-product-id="${productId}"]`,
        ) as HTMLElement;
        if (cardElement) {
          cardElement.style.transform = 'translateY(100%)';
          cardElement.style.opacity = '0';
          setTimeout(() => {
            setSelectedProducts((current) => current.filter((id) => id !== productId));
          }, 300);
          return prev; // 애니메이션 완료 후 실제 제거
        }
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // 학생 선택 핸들러
  const handleStudentSelect = (studentId: number) => {
    // 이미 3명이 선택되어 있고, 현재 학생이 선택되지 않은 경우 클릭 무시
    if (selectedStudents.length >= 3 && !selectedStudents.includes(studentId)) {
      return;
    }

    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        // 개별 제거 애니메이션
        const cardElement = document.querySelector(
          `[data-student-id="${studentId}"]`,
        ) as HTMLElement;
        if (cardElement) {
          cardElement.style.transform = 'translateY(100%)';
          cardElement.style.opacity = '0';
          setTimeout(() => {
            setSelectedStudents((current) => current.filter((id) => id !== studentId));
            // 색상 정보는 유지 (제거하지 않음)
          }, 300);
          return prev; // 애니메이션 완료 후 실제 제거
        }
        return prev.filter((id) => id !== studentId);
      } else {
        // 새로운 학생 추가 시 색상 할당 (이미 할당된 색상은 제외)
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
    });
  };

  // 클래스 변경 시 선택된 학생 초기화
  React.useEffect(() => {
    setSelectedStudents([]);
    setStudentColorMap({});
  }, [selectedClass]);

  // 달 범위 제한 함수
  const validateDateRange = (
    fromYear: number,
    fromMonth: number,
    toYear: number,
    toMonth: number,
  ) => {
    const fromDate = new Date(fromYear, fromMonth - 1);
    const toDate = new Date(toYear, toMonth - 1);
    const monthDiff =
      (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
      (toDate.getMonth() - fromDate.getMonth()) +
      1;

    return monthDiff <= 10;
  };

  // 날짜 선택 가능 여부 확인 (오늘 이후 선택 불가)
  const isDateSelectable = (year: number, month: number) => {
    const today = new Date();
    const selectedDate = new Date(year, month - 1);
    return selectedDate <= today;
  };

  // 마켓 통계 로드 함수
  const loadMarketStats = async () => {
    try {
      setIsLoadingStats(true);
      console.log('마켓 통계 로드 시작...');
      
      const stats = await getMarketStats();
      console.log('마켓 통계 로드 성공:', stats);
      setMarketStats(stats);
    } catch (error: any) {
      console.error('마켓 통계 로드 실패:', error);
      
      // 에러 발생 시 기본값 설정
      const fallbackStats = {
        total_products: 0,
        total_sales: 0,
        average_rating: 0,
        total_revenue: 0,
      };
      console.log('기본값으로 설정:', fallbackStats);
      setMarketStats(fallbackStats);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // 마켓 상품 로드 함수
  const loadMarketProducts = async () => {
    try {
      setIsLoadingProducts(true);
      console.log('마켓 상품 로드 시작...');
      
      const products = await getMyProducts();
      console.log('마켓 상품 로드 성공:', products);
      setMarketProducts(products);
      setLastSyncTime(new Date());
    } catch (error: any) {
      console.error('마켓 상품 로드 실패:', error);
      
      // 에러 발생 시 빈 배열 설정
      setMarketProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // 실시간 업데이트 함수
  const handleRefresh = async () => {
    setIsRefreshing(true);

    // 마켓 통계와 상품 동시 새로고침
    await Promise.all([
      loadMarketStats(),
      loadMarketProducts()
    ]);

    // 실제 API 호출을 시뮬레이션 (1초 대기)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRefreshing(false);
  };

  // 과제 선택 핸들러
  const handleAssignmentSelect = (assignmentId: string) => {
    setSelectedAssignments((prev) => {
      if (prev.includes(assignmentId)) {
        return prev.filter((id) => id !== assignmentId);
      } else if (prev.length < 5) {
        return [...prev, assignmentId];
      }
      return prev;
    });
  };

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (type: 'from' | 'to', field: 'year' | 'month', value: string) => {
    const newPeriod = { ...chartPeriod };

    if (type === 'from') {
      newPeriod[`from${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof newPeriod] =
        value ? parseInt(value) : null;

      // 시작 날짜가 종료 날짜보다 미래인 경우 종료 날짜를 시작 날짜로 조정
      if (newPeriod.fromYear && newPeriod.fromMonth && newPeriod.toYear && newPeriod.toMonth) {
        const fromDate = new Date(newPeriod.fromYear, newPeriod.fromMonth - 1);
        const toDate = new Date(newPeriod.toYear, newPeriod.toMonth - 1);

        if (fromDate > toDate) {
          newPeriod.toYear = newPeriod.fromYear;
          newPeriod.toMonth = newPeriod.fromMonth;
        }
      }
    } else {
      newPeriod[`to${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof newPeriod] =
        value ? parseInt(value) : null;

      // 종료 날짜가 시작 날짜보다 과거인 경우 시작 날짜를 종료 날짜로 조정
      if (newPeriod.fromYear && newPeriod.fromMonth && newPeriod.toYear && newPeriod.toMonth) {
        const fromDate = new Date(newPeriod.fromYear, newPeriod.fromMonth - 1);
        const toDate = new Date(newPeriod.toYear, newPeriod.toMonth - 1);

        if (toDate < fromDate) {
          newPeriod.fromYear = newPeriod.toYear;
          newPeriod.fromMonth = newPeriod.toMonth;
        }
      }
    }

    // 범위 유효성 검사 (10달 제한)
    if (newPeriod.fromYear && newPeriod.fromMonth && newPeriod.toYear && newPeriod.toMonth) {
      if (
        !validateDateRange(
          newPeriod.fromYear,
          newPeriod.fromMonth,
          newPeriod.toYear,
          newPeriod.toMonth,
        )
      ) {
        // 10달을 초과하면 종료 날짜를 시작 날짜로부터 10달 후로 조정
        const fromDate = new Date(newPeriod.fromYear, newPeriod.fromMonth - 1);
        const maxToDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 9);
        newPeriod.toYear = maxToDate.getFullYear();
        newPeriod.toMonth = maxToDate.getMonth() + 1;
      }
    }

    setChartPeriod(newPeriod);
  };

  // 임시 클래스 데이터 (생성일 포함)
  const classes = [
    { id: '1', name: '수학 1-1반', createdAt: '2024-01-15' },
    { id: '2', name: '수학 1-2반', createdAt: '2024-01-20' },
    { id: '3', name: '수학 2-1반', createdAt: '2024-02-10' },
    { id: '4', name: '수학 2-2반', createdAt: '2024-02-25' },
    { id: '5', name: '수학 3-1반', createdAt: '2024-03-05' }, // 가장 최근
  ];

  // 가장 최근에 생성된 클래스 ID 찾기
  const getLatestClassId = () => {
    return classes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0].id;
  };

  // 오늘부터 10개월 전 날짜 계산
  const getTenMonthsAgo = () => {
    const today = new Date();
    const tenMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 10, 1);
    return {
      year: tenMonthsAgo.getFullYear(),
      month: tenMonthsAgo.getMonth() + 1,
    };
  };

  // 초기 설정
  React.useEffect(() => {
    // 가장 최근 클래스 설정
    const latestClassId = getLatestClassId();
    setSelectedClass(latestClassId);

    // 오늘 달부터 10개월 전까지 차트 기간 설정
    const tenMonthsAgo = getTenMonthsAgo();
    const today = new Date();
    setChartPeriod({
      fromYear: tenMonthsAgo.year,
      fromMonth: tenMonthsAgo.month,
      toYear: today.getFullYear(),
      toMonth: today.getMonth() + 1,
    });

    // 마켓 통계와 상품 로드
    loadMarketStats();
    loadMarketProducts();
  }, []);

  // 최근 상품 정보를 가져오는 함수 (차트 표시용)
  const getRecentProducts = () => {
    if (marketProducts.length >= 2) {
      return [...marketProducts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2);
    }
    return [];
  };

  // 임시 과제 데이터 (학생별 성적 및 배포 상태 포함) - 테스트용
  const assignments = [
    {
      id: '1',
      title: '1차 중간고사',
      subject: '수학',
      dueDate: '2024-03-15',
      submitted: 25,
      total: 30,
      averageScore: 85,
      studentScores: {
        1: 90, 2: 95, 3: 78, 4: 88, 5: 92,
      },
      assignedStudents: [1, 2, 3, 4, 5] // 모든 학생에게 배포됨
    },
    {
      id: '2',
      title: '2차 중간고사',
      subject: '수학',
      dueDate: '2024-04-20',
      submitted: 28,
      total: 30,
      averageScore: 78,
      studentScores: {
        1: 82, 2: 88, 3: 70, 4: 75, 5: 85,
      },
      assignedStudents: [1, 2, 3, 4, 5] // 모든 학생에게 배포됨
    },
    {
      id: '3',
      title: '기말고사',
      subject: '수학',
      dueDate: '2024-06-10',
      submitted: 15,
      total: 30,
      averageScore: 92,
      studentScores: {
        1: 95, 2: 98, 4: 90, 5: 96, // 학생 3은 응시 안함 (미응시)
      },
      assignedStudents: [1, 2, 3, 4, 5] // 모든 학생에게 배포됨
    },
    { 
      id: '4', 
      title: '과제 1', 
      subject: '수학', 
      dueDate: '2024-03-01', 
      submitted: 30, 
      total: 30,
      averageScore: 88,
      studentScores: {
        1: 92, 2: 90, 3: 85, 4: 88, 5: 87,
      },
      assignedStudents: [1, 2, 3, 4, 5] // 모든 학생에게 배포됨
    },
    { 
      id: '5', 
      title: '과제 2', 
      subject: '수학', 
      dueDate: '2024-03-08', 
      submitted: 27, 
      total: 30,
      averageScore: 75,
      studentScores: {
        1: 78, 2: 82, 3: 68, 5: 80, // 학생 4는 응시 안함 (미응시)
      },
      assignedStudents: [1, 2, 3, 5] // 학생 4에게는 배포되지 않음 (미배포)
    },
    {
      id: '6',
      title: '추가 과제',
      subject: '수학',
      dueDate: '2024-05-15',
      submitted: 20,
      total: 30,
      averageScore: 80,
      studentScores: {
        1: 85, 2: 90, 3: 75, // 학생 4, 5는 응시 안함 (미응시)
      },
      assignedStudents: [1, 2, 3, 4, 5] // 모든 학생에게 배포됨
    },
    {
      id: '7',
      title: '선택 과제',
      subject: '수학',
      dueDate: '2024-05-20',
      submitted: 15,
      total: 30,
      averageScore: 88,
      studentScores: {
        1: 92, 3: 85, 5: 90, // 학생 2, 4는 응시 안함 (미응시)
      },
      assignedStudents: [1, 2, 3, 5] // 학생 4에게는 배포되지 않음 (미배포)
    },
  ];

  // 임시 학생 데이터
  const students: Record<
    string,
    Array<{ id: number; name: string; grade: number; attendance: number }>
  > = {
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
      { id: 22, name: '정수빈', grade: 92, attendance: 98 },
      { id: 23, name: '한지민', grade: 79, attendance: 89 },
      { id: 24, name: '윤도현', grade: 87, attendance: 94 },
      { id: 25, name: '임채원', grade: 83, attendance: 91 },
      { id: 26, name: '강태우', grade: 95, attendance: 100 },
      { id: 27, name: '송미래', grade: 76, attendance: 87 },
      { id: 28, name: '조현우', grade: 89, attendance: 96 },
      { id: 29, name: '배소영', grade: 84, attendance: 92 },
      { id: 30, name: '오지훈', grade: 91, attendance: 97 },
      { id: 31, name: '신예린', grade: 78, attendance: 88 },
      { id: 32, name: '권민석', grade: 86, attendance: 93 },
    ],
  };

  // 월별 데이터 생성 함수 (고정값)
  const generateMonthlyData = (year: number, month: number) => {
    const monthNames = [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ];

    // 고정된 시드 기반 데이터 생성 (년월을 시드로 사용)
    const seed = year * 12 + month;
    const random = (seed * 9301 + 49297) % 233280;
    const normalizedRandom = random / 233280;

    const baseData = {
      전체평균: Math.floor(75 + normalizedRandom * 20), // 75-95 범위
      학생평균: Math.floor(68 + normalizedRandom * 20), // 68-88 범위
      과제수: Math.floor(5 + normalizedRandom * 8), // 5-12 범위
    };

    return {
      name: monthNames[month - 1],
      ...baseData,
      // 월별 특성 반영 (고정)
      전체평균: Math.max(60, Math.min(100, baseData.전체평균 + (month % 2 === 0 ? 5 : -3))),
      학생평균: Math.max(50, Math.min(95, baseData.학생평균 + (month % 3 === 0 ? 8 : -2))),
      과제수: Math.max(3, Math.min(15, baseData.과제수 + (month > 6 ? 2 : -1))),
    };
  };

  // 차트 데이터 생성 (과제별로)
  const getChartData = () => {
    return assignments.map((assignment) => {
      const dataPoint: any = {
        name: assignment.title,
        과제평균: assignment.averageScore,
        과목: assignment.subject,
      };

       // 선택된 학생들의 성적 추가
       if (selectedStudents.length > 0 && selectedClass) {
         selectedStudents.forEach((studentId) => {
           const student = students[selectedClass as keyof typeof students]?.find(
             (s) => s.id === studentId,
           );
           if (student && assignment.studentScores) {
             const scores = assignment.studentScores as Record<number, number>;
             const score = scores[studentId];
             const isAssigned = assignment.assignedStudents?.includes(studentId);
             
             if (!isAssigned) {
               // 미배포: 차트에는 표시하지 않음 (null)
               dataPoint[student.name] = null;
               dataPoint[`${student.name}_status`] = 'unassigned';
             } else if (score !== undefined) {
               // 응시함: 실제 점수
               dataPoint[student.name] = score;
               dataPoint[`${student.name}_status`] = 'completed';
             } else {
               // 미응시: 0점으로 표시 (차트에 0점으로 표시됨)
               dataPoint[student.name] = 0;
               dataPoint[`${student.name}_status`] = 'not_taken';
             }
           }
         });
       }
      
      return dataPoint;
    });
  };

  const baseChartData = getChartData();

  // 기간에 따른 통계 데이터 생성
  const getPeriodStats = () => {
    if (
      !chartPeriod.fromYear ||
      !chartPeriod.fromMonth ||
      !chartPeriod.toYear ||
      !chartPeriod.toMonth
    ) {
      return {
        totalClasses: 12,
        totalProblems: 248,
        activeAssignments: 8,
        totalStudents: 156,
      };
    }

    // 선택된 기간의 월 수 계산
    const fromDate = new Date(chartPeriod.fromYear, chartPeriod.fromMonth - 1);
    const toDate = new Date(chartPeriod.toYear, chartPeriod.toMonth - 1);
    const monthDiff =
      (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
      (toDate.getMonth() - fromDate.getMonth()) +
      1;

    // 기간에 따른 통계 생성
    const avgAssignments = Math.floor(8 + monthDiff * 0.5);
    return {
      totalClasses: 12 + Math.floor(Math.random() * 5) - 2,
      totalProblems: 200 + avgAssignments * 20 + Math.floor(Math.random() * 50),
      activeAssignments: avgAssignments,
      totalStudents: 150 + Math.floor(Math.random() * 20) - 10,
    };
  };

  const periodStats = getPeriodStats();

  // 선택된 학생들의 개별 성적 데이터 생성
  const getSelectedStudentsData = () => {
    if (selectedStudents.length === 0) return {};

    const studentsData: Record<string, number[]> = {};

    // 선택된 순서대로 데이터 생성 (색상 순서 유지)
    selectedStudents.forEach((studentId, index) => {
      const student = students[selectedClass as keyof typeof students]?.find(
        (s) => s.id === studentId,
      );
      if (student) {
        // 각 학생별로 월별 성적 변동 시뮬레이션
        studentsData[student.name] = baseChartData.map((month) => {
          // 학생별로 월별 성적 변동 시뮬레이션 (기본 성적 ± 랜덤 변동)
          const variation = (Math.random() - 0.5) * 20; // ±10점 변동
          return Math.round(Math.max(0, Math.min(100, student.grade + variation)));
        });
      }
    });

    return studentsData;
  };

  const selectedStudentsData = getSelectedStudentsData();

  // 차트 데이터 필터링 및 선택된 학생들의 개별 성적 추가
  const getFilteredChartData = () => {
    // 선택된 과제들만 표시
    if (selectedAssignments.length > 0) {
      return selectedAssignments.map((assignmentId) => {
        const assignment = assignments.find((a) => a.id === assignmentId);
        if (!assignment) return null;
        
        const dataPoint: any = {
          name: assignment.title,
          과제평균: assignment.averageScore,
          과목: assignment.subject,
        };

         // 선택된 학생들의 성적 추가
         if (selectedStudents.length > 0 && selectedClass) {
           selectedStudents.forEach((studentId) => {
             const student = students[selectedClass as keyof typeof students]?.find(
               (s) => s.id === studentId,
             );
             if (student && assignment.studentScores) {
               const scores = assignment.studentScores as Record<number, number>;
               const score = scores[studentId];
               const isAssigned = assignment.assignedStudents?.includes(studentId);
               
               if (!isAssigned) {
                 // 미배포: 차트에는 표시하지 않음 (null)
                 dataPoint[student.name] = null;
                 dataPoint[`${student.name}_status`] = 'unassigned';
               } else if (score !== undefined) {
                 // 응시함: 실제 점수
                 dataPoint[student.name] = score;
                 dataPoint[`${student.name}_status`] = 'completed';
               } else {
                 // 미응시: 0점으로 표시 (차트에 0점으로 표시됨)
                 dataPoint[student.name] = 0;
                 dataPoint[`${student.name}_status`] = 'not_taken';
               }
             }
           });
         }

      return dataPoint;
      }).filter(Boolean);
    }
    
    // 선택된 과제가 없으면 모든 과제 표시 (학생 데이터 포함)
    return getChartData();
  };

  const chartData = getFilteredChartData();

  // 선택된 학생들을 위한 색상 배열 (학생 대시보드 과목별 색상)
  const studentColors = ['#22c55e', '#a855f7', '#eab308']; // 국어(초록), 영어(보라), 수학(노랑)

  // 학생별 고정 색상 매핑 함수
  const getStudentColor = (studentId: number) => {
    return studentColorMap[studentId] || null;
  };

  // 학생 ID에 따른 배경색 매핑 함수
  const getStudentBackgroundColor = (studentId: number) => {
    const color = getStudentColor(studentId);
    if (!color) return 'bg-gray-50';

    // 색상을 배경색으로 변환 (국어, 영어, 수학 계열 기반)
    const colorMap: Record<string, string> = {
      '#22c55e': 'bg-green-100',
      '#a855f7': 'bg-purple-100',
      '#eab308': 'bg-yellow-100',
    };

    return colorMap[color] || 'bg-gray-50';
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ padding: '20px', display: 'flex', gap: '20px' }}
    >
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || 'user'} 대시보드`}
        variant="default"
        description="수업 현황과 학생 관리를 확인하세요"
      />

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('클래스 관리')}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
            selectedTab === '클래스 관리'
              ? 'text-[#0072CE]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          클래스 관리
          {selectedTab === '클래스 관리' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE]" />
          )}
        </button>
        <button
          onClick={() => setSelectedTab('마켓 관리')}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
            selectedTab === '마켓 관리'
              ? 'text-[#0072CE]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          마켓 관리
          {selectedTab === '마켓 관리' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE]" />
          )}
        </button>
      </div>

      {/* 마켓 관리 탭 */}
      {selectedTab === '마켓 관리' && (
        <>
      <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-medium">마켓플레이스</h2>
            {marketStats && (
              <div className="text-xs text-gray-500">
                (데이터 로드됨: {new Date().toLocaleTimeString()})
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadMarketStats}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-[#0072CE] transition-colors duration-200"
              title="마켓 통계 새로고침"
            >
              <RefreshCw className="h-3 w-3" />
              통계 새로고침
            </button>
            <button
              onClick={loadMarketProducts}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-[#0072CE] transition-colors duration-200"
              title="마켓 상품 새로고침"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingProducts ? 'animate-spin' : ''}`} />
              상품 새로고침
            </button>
            <button
              onClick={() => router.push('/market/myMarket')}
              className="flex items-center gap-2 text-sm font-normal text-gray-400 hover:text-[#0072CE] transition-colors duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-[#0072CE]/20 rounded-lg backdrop-blur-sm">
                  <Package className="h-6 w-6 text-[#0072CE]" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#0072CE] mb-1">
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <AnimatedCounter value={marketStats?.total_products || 0} />
                )}
              </div>
              <div className="text-sm text-[#0072CE]/80 font-medium">등록 상품 수</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-50/80 to-cyan-100/60 backdrop-blur-sm rounded-xl border border-cyan-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg backdrop-blur-sm">
                  <ShoppingCart className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-700 mb-1">
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : (
                  <AnimatedCounter value={marketStats?.total_sales || 0} />
                )}
              </div>
              <div className="text-sm text-cyan-600 font-medium">총 판매량</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 backdrop-blur-sm rounded-xl border border-indigo-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-700 mb-1">
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  <AnimatedCounter value={Math.round(marketStats?.average_rating || 0)} suffix="%" />
                )}
              </div>
              <div className="text-sm text-indigo-600 font-medium">평균 평점</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-sky-50/80 to-sky-100/60 backdrop-blur-sm rounded-xl border border-sky-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-sky-500/20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="h-6 w-6 text-sky-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-sky-700 mb-1">
                {isLoadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  <>₩<AnimatedCounter value={marketStats?.total_revenue || 0} /></>
                )}
              </div>
              <div className="text-sm text-sky-600 font-medium">총 수익</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 마켓 판매 분석과 상품 리스트를 나란히 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 마켓 판매 추이 차트 */}
        <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-2 min-h-[620px]">
          <CardHeader className="py-2 px-6 border-b border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-base font-medium">마켓 판매 분석</h2>
              <div className="relative ml-2 inline-block">
                <div className="group w-4 h-4">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                  최대 2개의 상품을 선택하여
                    <br />
                  월별 수익을 비교할 수 있습니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                  </div>
                </div>
              </div>
            </div>

          {/* Period Selection */}
            <div className="flex items-center gap-4">
            <Select defaultValue="all">
                <SelectTrigger className="w-48">
                <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="6months">최근 6개월</SelectItem>
                <SelectItem value="3months">최근 3개월</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#0072CE]" />
                <label className="text-sm font-medium text-gray-700">기간별 차트</label>
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[28rem] bg-white rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(() => {
                  const baseData = [
                    { name: '1월' },
                    { name: '2월' },
                    { name: '3월' },
                    { name: '4월' },
                    { name: '5월' },
                    { name: '6월' },
                    { name: '7월' },
                    { name: '8월' },
                    { name: '9월' },
                    { name: '10월' },
                  ];
                  
                  return baseData.map((month, index) => {
                    const monthData: any = { ...month };
                    
                    // 선택된 상품이 있으면 선택된 상품 사용, 없으면 최근 상품 사용
                    const productsToShow = selectedProducts.length > 0 
                      ? selectedProducts.map(id => marketProducts.find(p => p.id === id)).filter(Boolean)
                      : getRecentProducts();
                    
                    productsToShow.forEach((product, productIndex) => {
                      if (product) {
                        const baseRevenue = product.price * product.purchase_count / 10;
                        const revenueVariation = Math.sin(index + product.id) * baseRevenue * 0.2;
                        const baseSales = product.purchase_count / 10;
                        const salesVariation = Math.sin(index + product.id) * baseSales * 0.2;
                        
                        monthData[product.title] = Math.round(baseRevenue + revenueVariation);
                        monthData[`${product.title}_sales`] = Math.round(baseSales + salesVariation);
                      }
                    });
                    
                    return monthData;
                  });
                })()}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-300/50 rounded-xl shadow-xl min-w-[200px]">
                          <div className="text-center mb-3 pb-2 border-b border-gray-200">
                            <p className="text-base font-semibold text-gray-800">{label}</p>
                          </div>
                          <div className="space-y-3">
                            {payload.map((entry: any, index: number) => {
                              const productName = entry.name;
                              const revenue = entry.value;
                              const salesKey = `${productName}_sales`;
                              const sales = entry.payload[salesKey];
                              
                              return (
                                <div key={index} className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <p className="text-sm font-semibold text-gray-800">{productName}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-600 font-medium">수입</span>
                                      <span className="text-sm font-bold text-green-600">₩{revenue?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-600 font-medium">판매량</span>
                                      <span className="text-sm font-semibold text-blue-600">{sales}개</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  content={(props) => {
                    const { payload } = props;
                    if (!payload) return null;
                    return (
                      <ul style={{ listStyle: 'none', padding: '0', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                        {payload.map((entry, index) => (
                          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '10px', height: '10px', backgroundColor: entry.color, marginRight: '5px' }}></div>
                            <span style={{ color: entry.color }}>{entry.value}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }}
                />
                {(() => {
                  // 선택된 상품이 있으면 선택된 상품 사용, 없으면 최근 상품 사용
                  const productsToShow = selectedProducts.length > 0 
                    ? selectedProducts.map(id => marketProducts.find(p => p.id === id)).filter(Boolean)
                    : getRecentProducts();
                  
                  return productsToShow.map((product, index) => {
                    const colors = ['#9674CF', '#18BBCB'];
                    return product ? (
                      <Line 
                        key={product.id}
                        type="monotone" 
                        dataKey={product.title} 
                        stroke={colors[index]} 
                        activeDot={{ r: 8 }} 
                        strokeWidth={1} 
                      />
                    ) : null;
                  });
                })()}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

        {/* 마켓 상품 리스트 카드 */}
        <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-1 min-h-[620px]">
          <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-base font-medium">등록 상품 관리</h2>
              <div className="relative ml-2 inline-block">
                <div className="group w-4 h-4">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    등록된 상품 목록과
                    <br />
                    판매 현황을 확인할 수 있습니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                  </div>
                </div>
              </div>
            </div>
                              <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">총 {marketProducts.length}개</span>
              {lastSyncTime && (
                <span className="text-xs text-gray-400">
                  ({lastSyncTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 동기화)
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* 선택된 상품 목록 */}
            <div className="mb-4 px-6 pt-6 pb-2 bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg h-52">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-blue-800">
                    선택된 상품 ({selectedProducts.length}/2개)
                  </h4>
                  <div className="relative">
                    <div className="group w-4 h-4">
                      <Info className="h-4 w-4 text-blue-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                        최대 2개의 상품을 선택하여
                        <br />
                        수익을 비교할 수 있습니다
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedProducts([]);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="모든 상품 선택 해제"
                  >
                    <X className="h-3 w-3" />
                    전체 제거
                  </button>
                )}
              </div>
              {selectedProducts.length > 0 ? (
                <div className="space-y-1.5 overflow-hidden" style={{ maxHeight: 'calc(100% - 60px)' }}>
                  {selectedProducts.map((productId, index) => {
                    const product = marketProducts.find((p) => p.id === productId);
                    if (!product) return null;
                    const colors = ['#9674CF', '#18BBCB'];
                                      return (
                      <motion.div
                        key={product.id}
                        data-product-id={product.id}
                        onClick={() => handleProductSelect(product.id)}
                        className="group p-2.5 rounded-lg border transition-all backdrop-blur-sm cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.1,
                          ease: 'easeOut',
                        }}
                        style={{
                          backgroundColor: `${colors[index]}20`,
                          borderColor: colors[index],
                          boxShadow: `0 4px 6px -1px ${colors[index]}20, 0 2px 4px -1px ${colors[index]}10`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fca5a5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${colors[index]}20`;
                          e.currentTarget.style.borderColor = colors[index];
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative w-3 h-3 flex-shrink-0">
                            <div
                              className="w-3 h-3 rounded-sm group-hover:opacity-0 transition-opacity"
                              style={{ backgroundColor: colors[index] }}
                            ></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <X className="w-3 h-3 text-red-500" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900 flex-1 truncate">{product.title}</p>
                          <span className="text-xs text-gray-500 flex-shrink-0">{product.subject_type}</span>
                        </div>
                      </motion.div>
                                      );
                                    })}
                              </div>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 'calc(100% - 60px)' }}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">선택된 상품이 없습니다</p>
                    <p className="text-xs text-gray-400 mb-2">
                      차트에는 최근 등록된 상품 정보가 표시됩니다
                    </p>
                    <p className="text-xs text-gray-400">
                      아래 목록에서 상품을 선택해주세요
                    </p>
                  </div>
                </div>
              )}
                            </div>

            {/* 전체 상품 목록 */}
            <div className="h-72 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-full flex flex-col">
                <h4 className="text-sm font-medium text-gray-700 p-4 pb-3 bg-white border-b border-gray-100 sticky top-0 z-10">
                  전체 상품 목록
                </h4>
                <div className="flex-1 p-4 pt-3 overflow-y-auto">
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">상품 목록 로딩 중...</p>
                      </div>
                    </div>
                  ) : marketProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">등록된 상품이 없습니다</p>
                        <p className="text-xs text-gray-400 mt-1">마켓에서 상품을 등록해보세요</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {marketProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        const canInteract = !isSelected || isSelected;
                        
                        return (
                          <div
                            key={product.id}
                            onClick={() => canInteract ? handleProductSelect(product.id) : undefined}
                            className={`p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-gray-50 border-gray-300 cursor-pointer'
                                : selectedProducts.length >= 2
                                ? 'bg-white border-gray-200 cursor-not-allowed opacity-50'
                                : 'bg-white border-gray-200 cursor-pointer'
                            }`}
                            onMouseEnter={(e) => {
                              if (isSelected || selectedProducts.length < 2) {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isSelected) {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.borderColor = '#d1d5db';
                              } else {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0 flex items-start gap-2">
                                {isSelected && (
                                  <FaRegCircleCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm font-medium truncate ${
                                    isSelected ? 'text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {product.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                      {product.subject_type}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs text-gray-600">{product.satisfaction_rate.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className={`text-sm font-semibold ${
                                isSelected ? 'text-gray-400' : 'text-[#0072CE]'
                              }`}>
                                {product.price.toLocaleString()}P
                              </div>
                              <div className="text-xs text-gray-500">
                                판매 {product.purchase_count}개
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                          </div>
                        </div>
          </CardContent>
        </Card>
                              </div>
      </>
      )}

      {/* 클래스 관리 탭 */}
      {selectedTab === '클래스 관리' && (
      <>
      {/* 클래스 통계 카드 */}
      <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-medium">클래스 현황</h2>
                          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-[#0072CE] transition-colors duration-200"
              title="클래스 통계 새로고침"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
                        </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-[#0072CE]/20 rounded-lg backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6 text-[#0072CE]" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#0072CE] mb-1">
                <AnimatedCounter value={periodStats.totalClasses} />
              </div>
              <div className="text-sm text-[#0072CE]/80 font-medium">전체 클래스</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-50/80 to-cyan-100/60 backdrop-blur-sm rounded-xl border border-cyan-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-cyan-700 mb-1">
                <AnimatedCounter value={periodStats.totalStudents} />
              </div>
              <div className="text-sm text-cyan-600 font-medium">전체 학생</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 backdrop-blur-sm rounded-xl border border-indigo-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm">
                  <ClipboardList className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-700 mb-1">
                <AnimatedCounter value={periodStats.activeAssignments} />
              </div>
              <div className="text-sm text-indigo-600 font-medium">활성 과제</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-sky-50/80 to-sky-100/60 backdrop-blur-sm rounded-xl border border-sky-200/50 shadow-lg">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-sky-500/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-6 w-6 text-sky-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-sky-700 mb-1">
                <AnimatedCounter value={periodStats.totalProblems} />
              </div>
              <div className="text-sm text-sky-600 font-medium">전체 문제</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 클래스 성적 분석 카드 */}
        <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-2 min-h-[620px]">
          <CardHeader className="py-2 px-6 border-b border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-base font-medium">클래스 성적 분석</h2>
              <div className="relative ml-2 inline-block">
                <div className="group w-4 h-4">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    막대 그래프: 과제 평균 성적
                    <br />
                    선 그래프: 선택된 학생별 개별 성적
                    <br />
                    과제별 성적을 비교할 수 있습니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                        </div>
                      </div>
              </div>
            </div>

            {/* Class Selection and Chart Period */}
            <div className="flex items-center gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="클래스 선택" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <BookIcon className="h-4 w-4 text-[#0072CE]" />
                  <label className="text-sm font-medium text-gray-700">
                    과제별 차트
                  </label>
                </div>

                  <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-medium border-[#0072CE]/30 hover:border-[#0072CE]/50 hover:bg-[#0072CE]/5 transition-all duration-200"
                      >
                        <ClipboardList className="h-3 w-3 mr-1" />
                        {selectedAssignments.length > 0
                          ? `${selectedAssignments.length}개 과제 선택됨`
                          : '과제 선택'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-[#0072CE]" />
                          과제 선택 (최대 5개)
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          차트에 표시할 과제를 선택하세요. 최대 5개까지 선택 가능합니다.
                        </div>

                        <div className="space-y-2">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              onClick={() => handleAssignmentSelect(assignment.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                selectedAssignments.includes(assignment.id)
                                  ? 'bg-[#0072CE]/10 border-[#0072CE]/50'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              } ${
                                !selectedAssignments.includes(assignment.id) &&
                                selectedAssignments.length >= 5
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {assignment.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {assignment.subject} • 마감: {assignment.dueDate}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600">
                                    {assignment.submitted}/{assignment.total}명 제출
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedAssignments.length > 0 && (
                          <div className="p-3 bg-[#0072CE]/5 rounded-lg border border-[#0072CE]/20">
                            <div className="text-xs text-[#0072CE] font-medium">
                              선택된 과제: {selectedAssignments.length}개
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAssignmentModalOpen(false)}
                            className="h-9 px-4 text-xs"
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setIsAssignmentModalOpen(false)}
                            className="h-9 px-4 text-xs bg-[#0072CE] hover:bg-[#0072CE]/90"
                          >
                            적용
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[28rem] bg-white rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  width={500}
                  height={400}
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 80,
                    bottom: 40,
                    left: 20,
                  }}
                  style={{ backgroundColor: 'white' }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    domain={['dataMin', 'dataMax']}
                    height={80}
                  />
                  <YAxis 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="text-sm font-medium mb-1">{payload[0].payload.name}</p>
                            {payload[0].payload.과목 && (
                              <p className="text-xs text-gray-600 mb-2">과목: {payload[0].payload.과목}</p>
                            )}
                             {payload.map((entry: any, index: number) => {
                               if (entry.dataKey === '과제평균') {
                                 return (
                                   <p key={index} className="text-sm text-blue-600 font-semibold">
                                     과제 평균: {entry.value}점
                                   </p>
                                 );
                               } else if (entry.dataKey !== '과목' && !entry.dataKey.includes('_status')) {
                                 // 학생 성적인 경우
                                 const studentName = entry.dataKey;
                                 const statusKey = `${studentName}_status`;
                                 const status = payload[0].payload[statusKey];
                                 
                                 let displayText = '';
                                 let textColor = entry.stroke;
                                 
                                 if (status === 'unassigned') {
                                   displayText = '미배포 (-점)';
                                   textColor = '#9ca3af'; // 회색
                                 } else if (status === 'not_taken') {
                                   displayText = '미응시 (-점)';
                                   textColor = '#f59e0b'; // 주황색
                                 } else {
                                   displayText = `${entry.value}점`;
                                   textColor = entry.stroke;
                                 }
                                 
                                 return (
                                   <p key={index} className="text-sm" style={{ color: textColor }}>
                                     {studentName}: {displayText}
                                   </p>
                                 );
                               }
                               return null;
                             })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="과제평균"
                    barSize={50}
                    fill="#60a5fa"
                    stroke="#93c5fd"
                    strokeWidth={1}
                    radius={[2, 2, 0, 0]}
                    maxBarSize={50}
                  />
                  {selectedStudents.length > 0 && selectedClass && selectedStudents.map((studentId) => {
                    const student = students[selectedClass as keyof typeof students]?.find(
                      (s) => s.id === studentId,
                    );
                    if (!student) return null;

                    const color = getStudentColor(studentId);
                    
                    return (
                    <Line
                        key={studentId}
                        type="linear"
                        dataKey={student.name}
                        stroke={color || '#9ca3af'}
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                      />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>

              {/* 커
              
              스텀 범례 */}
              <div className="mt-4 relative z-10">
                {/* 첫 번째 줄: 과제평균 */}
                <div className="flex justify-center gap-6 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: '#60a5fa',
                        }}
                      ></div>
                    <span className="text-sm text-blue-600 font-medium">
                      과제평균
                    </span>
                  </div>
                </div>

                {/* 두 번째 줄: 선택된 학생들 */}
                {selectedStudents.length > 0 && selectedClass && (
                  <div className="flex justify-center gap-6">
                    {selectedStudents.map((studentId, index) => {
                      const student = students[selectedClass as keyof typeof students]?.find(
                        (s) => s.id === studentId,
                      );
                      if (!student) return null;
                      const color = getStudentColor(studentId);
                      return (
                        <div key={studentId} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: color || '#9ca3af' }}
                        ></div>
                          <span className="text-sm" style={{ color: color || '#9ca3af' }}>
                            {student.name}
                        </span>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 학생 관리 카드 */}
        <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-1 min-h-[620px]">
          <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-base font-medium">
                {selectedClass
                  ? `${classes.find((c) => c.id === selectedClass)?.name} 학생 관리`
                  : '학생 관리'}
              </h2>
              <div className="relative ml-2 inline-block">
                <div className="group w-4 h-4">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    클래스를 선택하면
                    <br />
                    해당 클래스의 학생 목록이
                    <br />
                    표시됩니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                  </div>
                </div>
              </div>
            </div>
            {selectedClass && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  총 {students[selectedClass as keyof typeof students]?.length || 0}명
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* 선택된 학생 목록 */}
            {selectedClass && (
              <div className="mb-4 px-6 pt-6 pb-2 bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg h-60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-green-800">
                      선택된 학생 ({selectedStudents.length}/3명)
                    </h4>
                    <div className="relative">
                      <div className="group w-4 h-4">
                        <Info className="h-4 w-4 text-green-600 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                          선택된 학생들의 개별 성적이 차트에 각각 다른 색상의 선으로 표시됩니다.
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedStudents.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedStudents([]);
                        setStudentColorMap({});
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="모든 학생 선택 해제"
                    >
                      <X className="h-3 w-3" />
                      전체 제거
                    </button>
                  )}
                </div>
                {selectedStudents.length > 0 ? (
                  <div
                    className="space-y-2 overflow-hidden"
                    style={{ maxHeight: 'calc(100% - 60px)' }}
                  >
                    {selectedStudents.map((studentId, index) => {
                      const student = students[selectedClass as keyof typeof students]?.find(
                        (s) => s.id === studentId,
                      );
                      if (!student) return null;
                      return (
                        <motion.div
                          key={student.id}
                          data-student-id={student.id}
                          onClick={() => handleStudentSelect(student.id)}
                          className="group flex items-center gap-3 p-2.5 rounded-lg border transition-all backdrop-blur-sm cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{
                            duration: 0.1,
                            delay: index * 0.03,
                            ease: 'easeOut',
                          }}
                          style={{
                            backgroundColor: `${studentColors[index]}20`,
                            borderColor: studentColors[index],
                            boxShadow: `0 4px 6px -1px ${studentColors[index]}20, 0 2px 4px -1px ${studentColors[index]}10`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                            e.currentTarget.style.borderColor = '#fca5a5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = `${studentColors[index]}20`;
                            e.currentTarget.style.borderColor = studentColors[index];
                          }}
                        >
                          <div className="relative w-3 h-3">
                            <div
                              className="w-3 h-3 rounded-sm group-hover:opacity-0 transition-opacity"
                              style={{ backgroundColor: studentColors[index] }}
                            ></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <X className="w-3 h-3 text-red-500" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{ height: 'calc(100% - 60px)' }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">선택된 학생이 없습니다</p>
                      <p className="text-xs text-gray-400">
                        아래 목록에서 학생을 선택해주세요 (최대 3명)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 전체 학생 목록 */}
            <div
              className={`h-80 bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
                selectedStudents.length >= 3 ? 'opacity-25 pointer-events-none' : ''
              }`}
            >
              {selectedClass ? (
                <div className="h-full flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 p-4 pb-3 bg-white border-b border-gray-100 sticky top-0 z-10">
                    전체 학생 목록
                  </h4>
                  <div className="flex-1 p-4 pt-3 overflow-y-auto">
                    <div className="space-y-3">
                      {students[selectedClass as keyof typeof students]
                        ?.sort((a, b) => a.id - b.id)
                        ?.map((student, index) => {
                          const isSelected = selectedStudents.includes(student.id);
                          const canSelect = !isSelected && selectedStudents.length < 3;

                          const studentColor = getStudentColor(student.id);

                          return (
                            <div
                              key={student.id}
                              onClick={() =>
                                canSelect ? handleStudentSelect(student.id) : undefined
                              }
                              className={`p-3 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'text-gray-500 cursor-not-allowed'
                                  : canSelect
                                  ? 'bg-white border-gray-200 cursor-pointer'
                                  : 'bg-white border-gray-200 opacity-50 cursor-not-allowed'
                              }`}
                              style={{
                                backgroundColor: isSelected ? '#f9fafb' : 'white',
                                borderColor: isSelected ? '#e5e7eb' : '#e5e7eb',
                              }}
                              onMouseEnter={(e) => {
                                if (canSelect) {
                                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                                  e.currentTarget.style.borderColor = '#bbf7d0';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (canSelect) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                } else if (isSelected) {
                                  e.currentTarget.style.backgroundColor = '#f9fafb';
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1 min-w-0">
                                  <h4
                                    className={`text-sm font-medium truncate ${
                                      isSelected ? 'text-gray-500' : 'text-gray-900'
                                    }`}
                                  >
                                    {student.name}
                                  </h4>
                                </div>
                                {isSelected && (
                                  <div className="flex items-center text-green-600">
                                    <FaRegCircleCheck className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">클래스를 선택해주세요</p>
                    <p className="text-gray-400 text-xs mt-1">
                      위의 드롭다운에서 클래스를 선택하면
                    </p>
                    <p className="text-gray-400 text-xs">해당 클래스의 학생 목록이 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  );
};

export default TeacherDashboard;