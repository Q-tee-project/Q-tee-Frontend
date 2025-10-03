import React from 'react';
import ClassStatsCard from './ClassStatsCard';
import ClassPerformanceChartCard from './ClassPerformanceChartCard';
import StudentManagementCard from './StudentManagementCard';
import RefreshButton from './RefreshButton';

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

interface ClassManagementTabProps {
  realClasses: ClassData[];
  realStudents: Record<string, StudentData[]>;
  realAssignments: AssignmentData[];
  selectedClass: string;
  selectedStudents: number[];
  selectedAssignments: string[];
  studentColorMap: Record<number, string>;
  studentColors: string[];
  isLoadingClasses: boolean;
  isLoadingStats: boolean;
  lastClassSyncTime: Date | null;
  isRefreshing: boolean;
  isAssignmentModalOpen: boolean;
  periodStats: {
    totalClasses: number;
    totalStudents: number;
    activeAssignments: number;
    totalProblems: number;
  };
  onRefresh: () => void;
  onClassSelect: (classId: string) => void;
  onStudentSelect: (studentId: number) => void;
  onAssignmentSelect: (assignmentId: string) => void;
  onAssignmentModalToggle: (isOpen: boolean) => void;
  onStudentColorMapChange: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  getStudentColor: (studentId: number) => string | null;
}

const ClassManagementTab: React.FC<ClassManagementTabProps> = ({
  realClasses,
  realStudents,
  realAssignments,
  selectedClass,
  selectedStudents,
  selectedAssignments,
  studentColorMap,
  studentColors,
  isLoadingClasses,
  isLoadingStats,
  lastClassSyncTime,
  isRefreshing,
  isAssignmentModalOpen,
  periodStats,
  onRefresh,
  onClassSelect,
  onStudentSelect,
  onAssignmentSelect,
  onAssignmentModalToggle,
  onStudentColorMapChange,
  getStudentColor
}) => {
  return (
    <div className="space-y-6">
      {/* Class Management Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">클래스 관리</h2>
        <div className="flex items-center gap-3">
          <RefreshButton
            onClick={onRefresh}
            disabled={isRefreshing}
            isLoading={isRefreshing}
            lastSyncTime={lastClassSyncTime}
            variant="green"
            tooltipTitle="전체 새로고침"
          />
        </div>
      </div>

      <ClassStatsCard periodStats={periodStats} isLoading={isLoadingStats} />

      {/* 데이터가 없을 때 표시 */}
      {!isLoadingClasses && realClasses.length === 0 && (
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">생성된 클래스가 없습니다.</p>
          <p className="text-sm text-gray-500">새로운 클래스를 생성하면 학생과 과제 정보가 표시됩니다.</p>
        </div>
      )}

      {/* 차트 컴포넌트 렌더링 */}
      {realClasses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClassPerformanceChartCard
            selectedClass={selectedClass}
            setSelectedClass={onClassSelect}
            classes={realClasses}
            students={realStudents}
            assignments={realAssignments}
            selectedStudents={selectedStudents}
            selectedAssignments={selectedAssignments}
            handleAssignmentSelect={onAssignmentSelect}
            isAssignmentModalOpen={isAssignmentModalOpen}
            setIsAssignmentModalOpen={onAssignmentModalToggle}
            studentColorMap={studentColorMap}
          />
          <StudentManagementCard
            selectedClass={selectedClass}
            classes={realClasses}
            students={realStudents}
            selectedStudents={selectedStudents}
            handleStudentSelect={onStudentSelect}
            setStudentColorMap={onStudentColorMapChange}
            studentColors={studentColors}
            getStudentColor={getStudentColor}
          />
        </div>
      )}
    </div>
  );
};

export default ClassManagementTab;
