'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import { getMarketStats, MarketStats, getMyProducts, MarketProduct } from '@/services/marketApi';

// Import dashboard components
import TabNavigation from '@/components/dashboard/TabNavigation';
import MarketStatsCard from '@/components/dashboard/MarketStatsCard';
import ClassStatsCard from '@/components/dashboard/ClassStatsCard';
import MarketSalesChartCard from '@/components/dashboard/MarketSalesChartCard';
import MarketProductListCard from '@/components/dashboard/MarketProductListCard';
import ClassPerformanceChartCard from '@/components/dashboard/ClassPerformanceChartCard';
import StudentManagementCard from '@/components/dashboard/StudentManagementCard';

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

const TeacherDashboard = () => {
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
  const [isLoadingStats, setIsLoadingStats] = React.useState(true);
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([]);
  const [marketProducts, setMarketProducts] = React.useState<MarketProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);



  const classes: ClassData[] = [
    { id: '1', name: '수학 1-1반', createdAt: '2024-01-15' },
    { id: '2', name: '수학 1-2반', createdAt: '2024-01-20' },
    { id: '3', name: '수학 2-1반', createdAt: '2024-02-10' },
    { id: '4', name: '수학 2-2반', createdAt: '2024-02-25' },
    { id: '5', name: '수학 3-1반', createdAt: '2024-03-05' },
  ];

  const students: Record<string, StudentData[]> = {
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

  const assignments: AssignmentData[] = [
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
      assignedStudents: [1, 2, 3, 4, 5]
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
      assignedStudents: [1, 2, 3, 4, 5]
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
        1: 95, 2: 98, 4: 90, 5: 96,
      },
      assignedStudents: [1, 2, 3, 4, 5]
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
      assignedStudents: [1, 2, 3, 4, 5]
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
        1: 78, 2: 82, 3: 68, 5: 80,
      },
      assignedStudents: [1, 2, 3, 5]
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
        1: 85, 2: 90, 3: 75,
      },
      assignedStudents: [1, 2, 3, 4, 5]
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
        1: 92, 3: 85, 5: 90,
      },
      assignedStudents: [1, 2, 3, 5]
    },
  ];

  // Fixed colors for student lines in the chart
  const studentColors = React.useMemo(() => ['#22c55e', '#a855f7', '#eab308'], []); // Green, Purple, Yellow

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
  }, [setStudentColorMap, studentColors, studentColorMap]);

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

  const getStudentColor = React.useCallback((studentId: number): string | null => {
    return studentColorMap[studentId] || null;
  }, [studentColorMap]);

  const getRecentProducts = React.useCallback((): MarketProduct[] => {
    if (marketProducts.length === 0) return [];
    return [...marketProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [marketProducts]);

  // Market stats loading
  const loadMarketStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await getMarketStats();
      setMarketStats(stats);
    } catch (error: any) {
      console.error('마켓 통계 로드 실패:', error);
      const fallbackStats = {
        total_products: 0,
        total_sales: 0,
        average_rating: 0,
        total_revenue: 0,
      };
      setMarketStats(fallbackStats);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load market products
  const loadMarketProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const products = await getMyProducts(); // Assuming getMyProducts returns MarketProduct[]
      setMarketProducts(products);
    } catch (error: any) {
      console.error('마켓 상품 로드 실패:', error);
      setMarketProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadMarketStats(), loadMarketProducts()]);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call delay
    setIsRefreshing(false);
  };

  // Calculate period stats
  const getPeriodStats = () => {
      return {
        totalClasses: 12,
        totalProblems: 248,
        activeAssignments: 8,
        totalStudents: 156,
    };
  };

  const periodStats = getPeriodStats();

  // Initialize
  React.useEffect(() => {
    const latestClassId = classes.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0].id;
    setSelectedClass(latestClassId);
    loadMarketStats();
    loadMarketProducts();
  }, []);


  React.useEffect(() => {
    setSelectedStudents([]);
    setStudentColorMap({});
  }, [selectedClass]);

  return (
    <div className="flex flex-col min-h-screen p-5 space-y-6">
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || 'user'} 대시보드`}
        variant="default"
        description="수업 현황과 학생 관리를 확인하세요"
      />

      <TabNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Market Management Tab */}
      {selectedTab === '마켓 관리' && (
        <div className="space-y-6">
          <MarketStatsCard marketStats={marketStats} isLoadingStats={isLoadingStats} />
          
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MarketSalesChartCard
              selectedProducts={selectedProducts}
              marketProducts={marketProducts}
              getRecentProducts={getRecentProducts}
            />
            <MarketProductListCard
              marketProducts={marketProducts}
              selectedProducts={selectedProducts}
              handleProductSelect={handleProductSelect}
              isLoadingProducts={isLoadingProducts}
            />
          </div>
                  </div>
      )}

      {/* Class Management Tab */}
      {selectedTab === '클래스 관리' && (
        <div className="space-y-6">
          <ClassStatsCard periodStats={periodStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ClassPerformanceChartCard
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              classes={classes}
              students={students}
              assignments={assignments}
              selectedStudents={selectedStudents}
              selectedAssignments={selectedAssignments}
              handleAssignmentSelect={handleAssignmentSelect}
              isAssignmentModalOpen={isAssignmentModalOpen}
              setIsAssignmentModalOpen={setIsAssignmentModalOpen}
              studentColorMap={studentColorMap}
            />
            <StudentManagementCard
              selectedClass={selectedClass}
              classes={classes}
              students={students}
              selectedStudents={selectedStudents}
              handleStudentSelect={handleStudentSelect}
              setStudentColorMap={setStudentColorMap}
              studentColors={studentColors}
              getStudentColor={getStudentColor}
            />
                          </div>
                  </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
