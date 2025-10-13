'use client';

import React, { Suspense, useEffect, useMemo, useCallback } from 'react';
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

import TabNavigation from '@/components/dashboard/TabNavigation';
import { preloadStaticData, preloadUserData, getCachedData, createCacheKey } from '@/utils/preloadData';

const MarketManagementTab = React.lazy(() => import('@/components/dashboard/MarketManagementTab'));
const ClassManagementTab = React.lazy(() => import('@/components/dashboard/ClassManagementTab'));

const LoadingFallback = React.memo(() => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-200 rounded-lg h-80 lg:col-span-2"></div>
        <div className="bg-gray-200 rounded-lg h-80"></div>
      </div>
    </div>
  </div>
));

const QuickLoadingFallback = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
));

const TeacherDashboardContent = React.memo(() => {
  const { userProfile } = useAuth();
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.dashboard);

  const studentColors: string[] = useMemo(() => {
    const cachedColors = getCachedData<string[]>(createCacheKey('static', 'studentColors'));
    return cachedColors || ['#22c55e', '#a855f7', '#eab308'];
  }, []);
  
  const getStudentColor = useCallback(
    (studentId: number): string | null => {
      return state.studentColorMap[studentId] || null;
    },
    [state.studentColorMap],
  );

  const getRecentProducts = useMemo((): any[] => {
    if (state.marketProducts.length === 0) return [];
    return [...state.marketProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  }, [state.marketProducts]);

  const handleTabChange = useCallback((tab: string) => {
    dispatch(setSelectedTab(tab));
  }, [dispatch]);

  const handleMarketRefresh = useCallback(() => {
    dispatch(loadMarketStats());
    dispatch(loadMarketProducts());
  }, [dispatch]);

  const handleClassRefresh = useCallback(() => {
    dispatch(refreshAll());
  }, [dispatch]);

  const handleStudentSelect = React.useCallback((studentId: number) => {
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
      const availableColors = studentColors.filter((color: string) => !usedColors.includes(color));
      const assignedColor =
        availableColors[0] || studentColors[prev.length % studentColors.length];

      const newColorMap = {
        ...state.studentColorMap,
        [studentId]: assignedColor,
      };
      dispatch(setStudentColorMap(newColorMap));
      dispatch(setSelectedStudents([...prev, studentId]));
    }
  }, [state.selectedStudents, state.studentColorMap, dispatch, studentColors]);

  const handleAssignmentSelect = React.useCallback((assignmentId: string) => {
    const prev = state.selectedAssignments;
    if (prev.includes(assignmentId)) {
      dispatch(setSelectedAssignments(prev.filter((id) => id !== assignmentId)));
    } else if (prev.length < 7) {
      dispatch(setSelectedAssignments([...prev, assignmentId]));
    }
  }, [state.selectedAssignments, dispatch]);

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

  useEffect(() => {
    const initializeData = async () => {
      await Promise.allSettled([
        preloadStaticData(),
        userProfile?.id ? preloadUserData(userProfile.id.toString()) : Promise.resolve(),
      ]);

      const classesPromise = dispatch(loadClasses());
      
      const marketPromises = Promise.allSettled([
        dispatch(loadMarketStats()),
        dispatch(loadMarketProducts()),
      ]);

      classesPromise.then(() => {
        dispatch(loadStats());
      });

      marketPromises.catch(() => {
      });
    };

    initializeData();
  }, [dispatch, userProfile?.id]);

  useEffect(() => {
    if (state.classes.length > 0) {
      const loadClassData = async () => {
        const latestClassId = [...state.classes].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0].id;

        await Promise.all([
          dispatch(loadStudents()),
          !state.selectedClass ? dispatch(setSelectedClass(latestClassId)) : Promise.resolve(),
        ]);
      };

      loadClassData();
    }
  }, [state.classes.length, dispatch, state.selectedClass]);

  useEffect(() => {
    if (state.selectedClass && state.classes.length > 0) {

      const timeoutId = setTimeout(() => {
        dispatch(loadAssignments(state.selectedClass));
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [state.selectedClass, dispatch, state.classes.length]);

  const ErrorAlert = React.memo(({ errorKey, message, onRemove }: { 
    errorKey: string; 
    message: string; 
    onRemove: (key: string) => void;
  }) => (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {errorKey === 'classes' && '클래스 정보 로딩 중'}
              {errorKey === 'assignments' && '과제 정보 로딩 중'}
              {errorKey === 'market' && '마켓 정보 로딩 중'}
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              {errorKey === 'classes' && '일부 서비스가 연결되지 않아 기본 정보만 표시됩니다.'}
              {errorKey === 'assignments' && '과제 서비스 연결 중입니다. 잠시 후 다시 시도해주세요.'}
              {errorKey === 'market' && '마켓 서비스 연결 중입니다. 잠시 후 다시 시도해주세요.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(errorKey)}
          className="text-yellow-400 hover:text-yellow-600"
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
  ));

  return (
    <div className="flex flex-col min-h-screen p-5 space-y-6">
      <PageHeader
        icon={<RxDashboard />}
        title={`${userProfile?.name || 'user'} 대시보드`}
        variant="default"
        description="수업 현황과 마켓 관리를 확인하세요"
      />

      {Array.from(state.apiErrors).map((errorKey) => (
        <ErrorAlert
          key={errorKey}
          errorKey={errorKey}
          message={state.errorMessages[errorKey] || `알 수 없는 오류가 발생했습니다. (에러 키: ${errorKey})`}
          onRemove={(key) => dispatch(removeApiError(key))}
        />
      ))}

      <TabNavigation 
        selectedTab={state.selectedTab} 
        setSelectedTab={handleTabChange} 
      />

      {state.selectedTab === '마켓 관리' && (
        <Suspense fallback={<QuickLoadingFallback />}>
          <MarketManagementTab
            marketStats={state.marketStats}
            isLoadingMarketStats={state.isLoadingMarketStats}
            marketProducts={state.marketProducts}
            selectedProducts={state.selectedProducts}
            isLoadingProducts={state.isLoadingProducts}
            lastSyncTime={state.lastSyncTime}
            onRefresh={handleMarketRefresh}
            onProductSelect={handleProductSelect}
            getRecentProducts={() => getRecentProducts}
          />
        </Suspense>
      )}

      {state.selectedTab === '클래스 관리' && (
        <Suspense fallback={<QuickLoadingFallback />}>
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
            onRefresh={handleClassRefresh}
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
