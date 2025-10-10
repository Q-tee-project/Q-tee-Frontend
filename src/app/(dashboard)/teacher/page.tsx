'use client';

import React, { Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { RxDashboard } from 'react-icons/rx';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  setSelectedTab,
  setSelectedClass,
  setSelectedStudents,
  setSelectedAssignments,
  setStudentColorMap,
  setAssignmentModalOpen,
  setSelectedProducts,
  loadClasses,
  loadStudents,
  loadAssignments,
  loadStats,
  loadMarketStats,
  loadMarketProducts,
  refreshAll,
  addApiError,
  removeApiError,
} from '@/store/slices/dashboardSlice';

// Import dashboard components
import TabNavigation from '@/components/dashboard/TabNavigation';

// Lazy load heavy components
const MarketManagementTab = React.lazy(() => import('@/components/dashboard/MarketManagementTab'));
const ClassManagementTab = React.lazy(() => import('@/components/dashboard/ClassManagementTab'));

const TeacherDashboardContent = React.memo(() => {
  const { userProfile } = useAuth();
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.dashboard);

  // Fixed colors for student lines in the chart
  const studentColors = React.useMemo(() => ['#22c55e', '#a855f7', '#eab308'], []);

  // Helper functions
  const getStudentColor = React.useCallback(
    (studentId: number): string | null => {
      return state.studentColorMap[studentId] || null;
    },
    [state.studentColorMap],
  );

  const getRecentProducts = React.useCallback((): any[] => {
    if (state.marketProducts.length === 0) return [];
    return [...state.marketProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [state.marketProducts]);

  // Student selection handler
  const handleStudentSelect = React.useCallback((studentId: number) => {
    const studentColors = ['#22c55e', '#a855f7', '#eab308'];
    
    if (studentId === -1) {
      dispatch(setStudentColorMap({}));
      dispatch(setSelectedStudents([]));
      return;
    }
    
    const prev = state.selectedStudents;
    if (prev.includes(studentId)) {
      const newColorMap = { ...state.studentColorMap };
      delete newColorMap[studentId];
      dispatch(setStudentColorMap(newColorMap));
      dispatch(setSelectedStudents(prev.filter((id) => id !== studentId)));
    } else if (prev.length < 3) {
      const usedColors = Object.values(state.studentColorMap);
      const availableColors = studentColors.filter((color) => !usedColors.includes(color));
      const assignedColor =
        availableColors[0] || studentColors[prev.length % studentColors.length];

      const newColorMap = {
        ...state.studentColorMap,
        [studentId]: assignedColor,
      };
      dispatch(setStudentColorMap(newColorMap));
      dispatch(setSelectedStudents([...prev, studentId]));
    }
  }, [state.selectedStudents, state.studentColorMap, dispatch]);

  // Assignment selection handler
  const handleAssignmentSelect = React.useCallback((assignmentId: string) => {
    const prev = state.selectedAssignments;
    if (prev.includes(assignmentId)) {
      dispatch(setSelectedAssignments(prev.filter((id) => id !== assignmentId)));
    } else if (prev.length < 7) {
      dispatch(setSelectedAssignments([...prev, assignmentId]));
    }
  }, [state.selectedAssignments, dispatch]);

  // Product selection handler
  const handleProductSelect = React.useCallback((productId: number) => {
    const prev = state.selectedProducts;
    if (productId === -1) {
      dispatch(setSelectedProducts([]));
    } else if (prev.includes(productId)) {
      dispatch(setSelectedProducts(prev.filter((id) => id !== productId)));
    } else if (prev.length < 2) {
      dispatch(setSelectedProducts([...prev, productId]));
    }
  }, [state.selectedProducts, dispatch]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        dispatch(loadMarketStats()),
        dispatch(loadMarketProducts()),
        dispatch(loadClasses()),
      ]);
    };

    initializeData();
  }, [dispatch]);

  // Load stats when classes are available
  useEffect(() => {
    if (state.classes.length > 0) {
      dispatch(loadStats());
    }
  }, [state.classes.length, dispatch]);

  // Load students when classes are available
  useEffect(() => {
    if (state.classes.length > 0) {
      dispatch(loadStudents());
      
      const latestClassId = [...state.classes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0].id;

      if (!state.selectedClass || !state.students[state.selectedClass]) {
        dispatch(setSelectedClass(latestClassId));
      }
    }
  }, [state.classes.length, dispatch, state.selectedClass, state.students]);

  // Load assignments when selected class changes
  useEffect(() => {
    if (state.selectedClass && state.classes.length > 0) {
      dispatch(loadAssignments(state.selectedClass));
    }
  }, [state.selectedClass, state.classes.length, dispatch]);

  // Error alert component
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
          onClick={() => dispatch(removeApiError(errorKey))}
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

      {/* Error alerts */}
      {Array.from(state.apiErrors).map((errorKey) => (
        <ErrorAlert
          key={errorKey}
          errorKey={errorKey}
          message={state.errorMessages[errorKey] || `알 수 없는 오류가 발생했습니다. (에러 키: ${errorKey})`}
        />
      ))}

      {/* Tab Navigation */}
      <TabNavigation selectedTab={state.selectedTab} setSelectedTab={(tab) => dispatch(setSelectedTab(tab))} />

      {/* Market Management Tab */}
      {state.selectedTab === '마켓 관리' && (
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
            marketStats={state.marketStats}
            isLoadingMarketStats={state.isLoadingMarketStats}
            marketProducts={state.marketProducts}
            selectedProducts={state.selectedProducts}
            isLoadingProducts={state.isLoadingProducts}
            lastSyncTime={state.lastSyncTime}
            onRefresh={() => {
              dispatch(loadMarketStats());
              dispatch(loadMarketProducts());
            }}
            onProductSelect={handleProductSelect}
            getRecentProducts={getRecentProducts}
          />
        </Suspense>
      )}

      {/* Class Management Tab */}
      {state.selectedTab === '클래스 관리' && (
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
            realClasses={state.classes}
            realStudents={state.students}
            realAssignments={state.assignments}
            selectedClass={state.selectedClass}
            selectedStudents={state.selectedStudents}
            selectedAssignments={state.selectedAssignments}
            studentColorMap={state.studentColorMap}
            studentColors={studentColors}
            isLoadingClasses={state.isLoadingClasses}
            isLoadingStats={state.isLoadingStats}
            isLoadingAssignments={state.isLoadingAssignments}
            lastClassSyncTime={state.lastClassSyncTime}
            isRefreshing={state.isRefreshing}
            isAssignmentModalOpen={state.isAssignmentModalOpen}
            periodStats={state.stats}
            onRefresh={() => dispatch(refreshAll())}
            onClassSelect={(classId) => dispatch(setSelectedClass(classId))}
            onStudentSelect={handleStudentSelect}
            onAssignmentSelect={handleAssignmentSelect}
            onAssignmentModalToggle={(isOpen) => dispatch(setAssignmentModalOpen(isOpen))}
            onStudentColorMapChange={(colorMap) => dispatch(setStudentColorMap(colorMap))}
            getStudentColor={getStudentColor}
          />
        </Suspense>
      )}
    </div>
  );
});

const TeacherDashboard = () => {
  return (
    <ReduxProvider>
      <TeacherDashboardContent />
    </ReduxProvider>
  );
};

export default TeacherDashboard;
