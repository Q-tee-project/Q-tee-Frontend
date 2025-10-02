'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { GraduationCap, Users, ClipboardList, FileText } from 'lucide-react';

interface PeriodStats {
  totalClasses: number;
  totalProblems: number;
  activeAssignments: number;
  totalStudents: number;
}

interface ClassStatsCardProps {
  periodStats: PeriodStats;
}

const ClassStatsCard = ({ periodStats }: ClassStatsCardProps) => {
  return (
    <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm">
      <CardHeader className="py-2 px-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-medium">클래스 현황</h2>
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
  );
};

export default ClassStatsCard;
