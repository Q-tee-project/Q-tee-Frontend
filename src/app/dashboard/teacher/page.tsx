'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
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
  const [chartMode, setChartMode] = React.useState<'period' | 'assignment'>('period');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
  const [selectedAssignments, setSelectedAssignments] = React.useState<string[]>([]);

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

  // 실시간 업데이트 함수
  const handleRefresh = async () => {
    setIsRefreshing(true);

    // 실제 API 호출을 시뮬레이션 (2초 대기)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 여기서 실제 데이터를 새로고침하는 로직을 추가할 수 있습니다
    // 예: API 호출, 상태 업데이트 등

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
  }, []);

  // 임시 과제 데이터
  const assignments = [
    {
      id: '1',
      title: '1차 중간고사',
      subject: '수학',
      dueDate: '2024-03-15',
      submitted: 25,
      total: 30,
    },
    {
      id: '2',
      title: '2차 중간고사',
      subject: '수학',
      dueDate: '2024-04-20',
      submitted: 28,
      total: 30,
    },
    {
      id: '3',
      title: '기말고사',
      subject: '수학',
      dueDate: '2024-06-10',
      submitted: 15,
      total: 30,
    },
    { id: '4', title: '과제 1', subject: '수학', dueDate: '2024-03-01', submitted: 30, total: 30 },
    { id: '5', title: '과제 2', subject: '수학', dueDate: '2024-03-08', submitted: 27, total: 30 },
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

  // 차트 데이터 생성 (설정된 기간에 따라)
  const getChartData = () => {
    if (
      !chartPeriod.fromYear ||
      !chartPeriod.fromMonth ||
      !chartPeriod.toYear ||
      !chartPeriod.toMonth
    ) {
      // 초기값이 없으면 오늘부터 10개월 전까지
      const currentDate = new Date();
      const tenMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 10, 1);

      const data = [];
      let iterDate = new Date(tenMonthsAgo);
      const endDate = new Date();
      let monthCount = 0;
      while (iterDate <= endDate && monthCount < 10) {
        data.push(generateMonthlyData(iterDate.getFullYear(), iterDate.getMonth() + 1));
        iterDate.setMonth(iterDate.getMonth() + 1);
        monthCount++;
      }
      return data;
    }

    const data = [];
    const fromDate = new Date(chartPeriod.fromYear, chartPeriod.fromMonth - 1);
    const toDate = new Date(chartPeriod.toYear, chartPeriod.toMonth - 1);

    let currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      data.push(generateMonthlyData(currentDate.getFullYear(), currentDate.getMonth() + 1));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return data;
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
    // baseChartData는 이미 설정된 기간에 맞게 생성되므로 필터링 불필요
    return baseChartData.map((month, index) => {
      const dataPoint: any = { ...month };

      // 각 선택된 학생의 해당 월 성적 추가
      Object.keys(selectedStudentsData).forEach((studentName) => {
        dataPoint[studentName] = selectedStudentsData[studentName][index];
      });

      return dataPoint;
    });
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

      {/* 통계 카드 */}
      <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm">
        <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-medium">마켓플레이스</h2>
          </div>
          <button
            onClick={() => router.push('/market/myMarket')}
            className="flex items-center gap-2 text-sm font-normal text-gray-400 hover:text-[#0072CE] transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
                <AnimatedCounter value={24} />
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
                <AnimatedCounter value={1247} />
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
                <AnimatedCounter value={86} suffix="%" />
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
                ₩<AnimatedCounter value={5240000} />
              </div>
              <div className="text-sm text-sky-600 font-medium">총 수익</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 클래스 성적 분석과 학생 관리 카드들을 나란히 배치 */}
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
                    막대 그래프: 학생 평균 성적
                    <br />
                    선 그래프: 선택된 학생별 개별 성적
                    <br />
                    클래스별 성적 추이를 확인할 수 있습니다
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
                <Select
                  value={chartMode}
                  onValueChange={(value: 'period' | 'assignment') => setChartMode(value)}
                >
                  <SelectTrigger className="h-8 px-3 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="period">기간별</SelectItem>
                    <SelectItem value="assignment">과제별</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  {chartMode === 'period' ? (
                    <CalendarIcon className="h-4 w-4 text-[#0072CE]" />
                  ) : (
                    <BookIcon className="h-4 w-4 text-[#0072CE]" />
                  )}
                  <label className="text-sm font-medium text-gray-700">
                    {chartMode === 'period' ? '기간별 차트' : '과제별 차트'}
                  </label>
                </div>

                {chartMode === 'period' ? (
                  <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-medium border-[#0072CE]/30 hover:border-[#0072CE]/50 hover:bg-[#0072CE]/5 transition-all duration-200"
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {chartPeriod.fromYear &&
                        chartPeriod.fromMonth &&
                        chartPeriod.toYear &&
                        chartPeriod.toMonth
                          ? `${chartPeriod.fromYear}.${chartPeriod.fromMonth} ~ ${chartPeriod.toYear}.${chartPeriod.toMonth}`
                          : '기간 선택'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-[#0072CE]" />
                          차트 기간 설정
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* 빠른 선택 버튼들 */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">빠른 선택</label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setChartPeriod({
                                  fromYear: null,
                                  fromMonth: null,
                                  toYear: null,
                                  toMonth: null,
                                })
                              }
                              className="h-9 text-xs font-medium hover:bg-[#0072CE]/5 hover:border-[#0072CE]/30"
                            >
                              전체 기간
                            </Button>
                          </div>
                        </div>

                        {/* 커스텀 기간 선택 */}
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-gray-700">커스텀 기간</label>

                          <div className="grid grid-cols-2 gap-4">
                            {/* 시작 기간 */}
                            <div className="space-y-2">
                              <label className="text-xs text-gray-600 font-medium">시작</label>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={
                                    chartPeriod.fromYear ? chartPeriod.fromYear.toString() : ''
                                  }
                                  onValueChange={(value) =>
                                    handleDateRangeChange('from', 'year', value)
                                  }
                                >
                                  <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="년도" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 5 },
                                      (_, i) => new Date().getFullYear() - 2 + i,
                                    ).map((year) => (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                        className="text-xs"
                                      >
                                        {year}년
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={
                                    chartPeriod.fromMonth ? chartPeriod.fromMonth.toString() : ''
                                  }
                                  onValueChange={(value) =>
                                    handleDateRangeChange('from', 'month', value)
                                  }
                                >
                                  <SelectTrigger className="h-9 text-xs w-16">
                                    <SelectValue placeholder="월" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                                      const year = chartPeriod.fromYear || new Date().getFullYear();
                                      const isDisabled = !isDateSelectable(year, month);
                                      return (
                                        <SelectItem
                                          key={month}
                                          value={month.toString()}
                                          disabled={isDisabled}
                                          className="text-xs"
                                        >
                                          {month}월
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* 종료 기간 */}
                            <div className="space-y-2">
                              <label className="text-xs text-gray-600 font-medium">종료</label>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={chartPeriod.toYear ? chartPeriod.toYear.toString() : ''}
                                  onValueChange={(value) =>
                                    handleDateRangeChange('to', 'year', value)
                                  }
                                >
                                  <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="년도" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 5 },
                                      (_, i) => new Date().getFullYear() - 2 + i,
                                    ).map((year) => (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                        className="text-xs"
                                      >
                                        {year}년
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={chartPeriod.toMonth ? chartPeriod.toMonth.toString() : ''}
                                  onValueChange={(value) =>
                                    handleDateRangeChange('to', 'month', value)
                                  }
                                >
                                  <SelectTrigger className="h-9 text-xs w-16">
                                    <SelectValue placeholder="월" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                                      const year = chartPeriod.toYear || new Date().getFullYear();
                                      const isDisabled = !isDateSelectable(year, month);
                                      return (
                                        <SelectItem
                                          key={month}
                                          value={month.toString()}
                                          disabled={isDisabled}
                                          className="text-xs"
                                        >
                                          {month}월
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 선택된 기간 미리보기 */}
                        {chartPeriod.fromYear &&
                          chartPeriod.fromMonth &&
                          chartPeriod.toYear &&
                          chartPeriod.toMonth && (
                            <div className="p-3 bg-[#0072CE]/5 rounded-lg border border-[#0072CE]/20">
                              <div className="text-xs text-[#0072CE] font-medium">
                                선택된 기간: {chartPeriod.fromYear}년 {chartPeriod.fromMonth}월 ~{' '}
                                {chartPeriod.toYear}년 {chartPeriod.toMonth}월
                              </div>
                            </div>
                          )}

                        {/* 안내 메시지 */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>• 최대 10개월까지 선택 가능합니다</div>
                            <div>• 오늘 이후 날짜는 선택할 수 없습니다</div>
                            <div>• 기간을 선택하면 해당 기간의 데이터가 차트에 표시됩니다</div>
                          </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDateModalOpen(false)}
                            className="h-9 px-4 text-xs"
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setIsDateModalOpen(false)}
                            className="h-9 px-4 text-xs bg-[#0072CE] hover:bg-[#0072CE]/90"
                          >
                            적용
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
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
                )}
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
                  <defs>
                    {/* 밝은 블루 그라데이션 */}
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dbeafe" stopOpacity={1} />
                      <stop offset="30%" stopColor="#bfdbfe" stopOpacity={1} />
                      <stop offset="70%" stopColor="#93c5fd" stopOpacity={1} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                    </linearGradient>

                    {/* 인디고 그라데이션 */}
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="30%" stopColor="#4f46e5" stopOpacity={1} />
                      <stop offset="70%" stopColor="#4338ca" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3730a3" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis
                    dataKey="name"
                    label={{ value: '월', position: 'insideBottomRight', offset: -10 }}
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="과제수"
                    fill="url(#areaGradient)"
                    stroke="#4f46e5"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="학생평균"
                    barSize={50}
                    fill="url(#barGradient)"
                    stroke="#93c5fd"
                    strokeWidth={1}
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.1))',
                    }}
                    radius={[2, 2, 0, 0]}
                    maxBarSize={50}
                  />
                  {Object.keys(selectedStudentsData).map((studentName, index) => (
                    <Line
                      key={studentName}
                      type="linear"
                      dataKey={studentName}
                      stroke={studentColors[index]}
                      strokeWidth={1.5}
                      dot={{
                        fill: 'white',
                        stroke: studentColors[index],
                        strokeWidth: 2,
                        r: 4,
                      }}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>

              {/* 커스텀 범례 */}
              <div className="mt-4 relative z-10">
                {/* 첫 번째 줄: 과제수, 학생평균 */}
                <div className="flex justify-center gap-6 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #3730a3 100%)',
                        boxShadow:
                          '0 0 8px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                        }}
                      ></div>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #3730a3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))',
                      }}
                    >
                      과제수
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{
                        background: 'linear-gradient(135deg, #dbeafe 0%, #60a5fa 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)',
                      }}
                    ></div>
                    <span className="text-sm text-blue-600 font-medium">학생평균</span>
                  </div>
                </div>

                {/* 두 번째 줄: 선택된 학생들 */}
                {Object.keys(selectedStudentsData).length > 0 && (
                  <div className="flex justify-center gap-6">
                    {Object.keys(selectedStudentsData).map((studentName, index) => (
                      <div key={studentName} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: studentColors[index] }}
                        ></div>
                        <span className="text-sm" style={{ color: studentColors[index] }}>
                          {studentName}
                        </span>
                      </div>
                    ))}
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
                        // 전체 제거 애니메이션 (3번째부터 역순으로)
                        const cards = document.querySelectorAll('[data-student-id]');
                        const reversedCards = Array.from(cards).reverse();

                        reversedCards.forEach((card, index) => {
                          setTimeout(() => {
                            (card as HTMLElement).style.transform = 'translateY(100%)';
                            (card as HTMLElement).style.opacity = '0';
                          }, index * 150);
                        });

                        // 모든 애니메이션 완료 후 상태 업데이트
                        setTimeout(() => {
                          setSelectedStudents([]);
                          setStudentColorMap({});
                        }, reversedCards.length * 150 + 200);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 rounded-md"
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
    </div>
  );
};

export default TeacherDashboard;
