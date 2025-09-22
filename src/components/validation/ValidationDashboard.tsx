'use client';

import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { ValidationSummary } from './ValidationToast';

interface ValidationDashboardProps {
  summary: ValidationSummary;
  className?: string;
  compact?: boolean;
}

export function ValidationDashboard({
  summary,
  className = '',
  compact = false
}: ValidationDashboardProps) {
  // 상태별 색상 및 아이콘 설정
  const getOverallStatus = () => {
    const { validity_rate, auto_approval_rate } = summary;

    if (validity_rate >= 90 && auto_approval_rate >= 80) {
      return {
        status: 'excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Shield className="w-5 h-5" />
      };
    } else if (validity_rate >= 70 && auto_approval_rate >= 50) {
      return {
        status: 'good',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <Target className="w-5 h-5" />
      };
    } else {
      return {
        status: 'needs_attention',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <AlertTriangle className="w-5 h-5" />
      };
    }
  };

  const overallStatus = getOverallStatus();

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    colorClass = 'text-gray-600',
    bgClass = 'bg-white'
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    colorClass?: string;
    bgClass?: string;
  }) => (
    <div className={`${bgClass} border border-gray-200 rounded-lg p-4 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`${colorClass}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <BarChart3 className="w-3 h-3" />}
          </div>
        )}
      </div>
      <div>
        <p className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
          {value}
        </p>
        <p className={`text-xs text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  if (compact) {
    // 간소화된 대시보드
    return (
      <div className={`${overallStatus.bgColor} ${overallStatus.borderColor} border rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={overallStatus.color}>
              {overallStatus.icon}
            </div>
            <h3 className="font-semibold text-sm text-gray-900">검증 결과</h3>
          </div>
          <div className="text-xs text-gray-500">
            {summary.total_problems}문제 검증 완료
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{summary.auto_approved}</div>
            <div className="text-xs text-gray-500">자동승인</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{summary.manual_review_needed}</div>
            <div className="text-xs text-gray-500">검토필요</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{summary.invalid_problems}</div>
            <div className="text-xs text-gray-500">검증실패</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">유효율</span>
            <span className="font-semibold text-green-600">{summary.validity_rate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-600">자동승인율</span>
            <span className="font-semibold text-blue-600">{summary.auto_approval_rate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // 풀 대시보드
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 전체 상태 헤더 */}
      <div className={`${overallStatus.bgColor} ${overallStatus.borderColor} border rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={overallStatus.color}>
              {overallStatus.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI 검증 완료
              </h2>
              <p className="text-sm text-gray-600">
                {summary.total_problems}개 문제가 검증되었습니다
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {summary.validity_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">전체 유효율</div>
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="자동 승인"
          value={summary.auto_approved}
          subtitle={`${summary.auto_approval_rate.toFixed(1)}% (${summary.total_problems}개 중)`}
          icon={<CheckCircle className="w-5 h-5" />}
          trend="up"
          colorClass="text-green-600"
        />

        <StatCard
          title="수동 검토 필요"
          value={summary.manual_review_needed}
          subtitle="교사 검토 대기 중"
          icon={<Clock className="w-5 h-5" />}
          trend={summary.manual_review_needed > 0 ? "neutral" : "up"}
          colorClass="text-yellow-600"
        />

        <StatCard
          title="검증 실패"
          value={summary.invalid_problems}
          subtitle="수정 또는 재생성 필요"
          icon={<XCircle className="w-5 h-5" />}
          trend={summary.invalid_problems === 0 ? "up" : "down"}
          colorClass="text-red-600"
        />

        <StatCard
          title="신뢰도"
          value={`${((summary.auto_approved / summary.total_problems) * 100).toFixed(0)}%`}
          subtitle="AI 검증 신뢰도"
          icon={<Zap className="w-5 h-5" />}
          trend="up"
          colorClass="text-blue-600"
        />
      </div>

      {/* 자주 발견되는 문제점 */}
      {summary.common_issues && Object.keys(summary.common_issues).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">자주 발견되는 문제점</h3>
          </div>

          <div className="space-y-2">
            {Object.entries(summary.common_issues)
              .sort(([, a], [, b]) => b - a) // 빈도순 정렬
              .slice(0, 5) // 상위 5개만
              .map(([issue, count]) => (
                <div key={issue} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm text-gray-700">{issue}</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {count}회
                    </div>
                    <div className="text-xs text-gray-500">
                      {((count / summary.total_problems) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 권장 액션 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">권장 액션</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {summary.auto_approved === summary.total_problems ? (
            <p>🎉 모든 문제가 자동 승인되었습니다! 바로 사용하실 수 있습니다.</p>
          ) : (
            <>
              {summary.manual_review_needed > 0 && (
                <p>📋 {summary.manual_review_needed}개 문제가 교사 검토를 기다리고 있습니다.</p>
              )}
              {summary.invalid_problems > 0 && (
                <p>⚠️ {summary.invalid_problems}개 문제는 수정이나 재생성이 필요합니다.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}