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
  isLoadingAssignments: boolean;
  lastClassSyncTime: string | null;
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
  onStudentColorMapChange: (colorMap: Record<number, string>) => void;
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
  isLoadingAssignments,
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

      <ClassStatsCard periodStats={periodStats} />

      {/* 차트와 학생 관리 컴포넌트는 항상 표시 */}
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
          isLoadingAssignments={isLoadingAssignments}
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
    </div>
  );
};

export default ClassManagementTab;
