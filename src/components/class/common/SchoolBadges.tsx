import { Badge } from '@/components/ui/badge';

interface SchoolLevelBadgeProps {
  schoolLevel: 'middle' | 'high';
}

export function SchoolLevelBadge({ schoolLevel }: SchoolLevelBadgeProps) {
  return (
    <Badge
      className={`text-sm border-none px-3 py-1.5 min-w-[60px] text-center ${
        schoolLevel === 'middle'
          ? 'bg-[#E6F3FF] text-[#0085FF]'
          : 'bg-[#FFF5E9] text-[#FF9F2D]'
      }`}
    >
      {schoolLevel === 'middle' ? '중학교' : '고등학교'}
    </Badge>
  );
}

interface GradeBadgeProps {
  grade: number | string;
}

export function GradeBadge({ grade }: GradeBadgeProps) {
  return (
    <Badge className="text-sm border-none px-3 py-1.5 min-w-[60px] text-center bg-[#f5f5f5] text-[#999999]">
      {grade}학년
    </Badge>
  );
}

interface SchoolInfoBadgesProps {
  schoolLevel: 'middle' | 'high';
  grade: number | string;
}

export function SchoolInfoBadges({ schoolLevel, grade }: SchoolInfoBadgesProps) {
  return (
    <div className="flex gap-2">
      <SchoolLevelBadge schoolLevel={schoolLevel} />
      <GradeBadge grade={grade} />
    </div>
  );
}
