'use client';

import React, { useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { TypewriterText } from './TypewriterText';

interface UserTypeCard {
  id: 'teacher' | 'student';
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  hoverGradient: string;
}

interface FocusCardsProps {
  onCardSelect: (type: 'teacher' | 'student') => void;
  selectedType: 'teacher' | 'student' | null;
}

const userTypeCards: UserTypeCard[] = [
  {
    id: 'teacher',
    title: '선생님',
    description: '문제 출제 및 학습 관리',
    icon: <FaChalkboardTeacher className="w-10 h-10" />,
    gradient: 'from-slate-100 to-slate-200',
    hoverGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'student',
    title: '학생',
    description: '문제 풀이 및 학습 참여',
    icon: <FaUserGraduate className="w-10 h-10" />,
    gradient: 'from-slate-100 to-slate-200',
    hoverGradient: 'from-green-50 to-green-100'
  }
];

export const FocusCards: React.FC<FocusCardsProps> = ({ onCardSelect, selectedType }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-8 w-full max-w-lg mx-auto">
      {userTypeCards.map((card) => (
        <Card
          key={card.id}
          card={card}
          hovered={hovered}
          setHovered={setHovered}
          onSelect={onCardSelect}
          isSelected={selectedType === card.id}
          selectedType={selectedType}
        />
      ))}
    </div>
  );
};

interface CardProps {
  card: UserTypeCard;
  hovered: string | null;
  setHovered: React.Dispatch<React.SetStateAction<string | null>>;
  onSelect: (type: 'teacher' | 'student') => void;
  isSelected: boolean;
  selectedType: 'teacher' | 'student' | null;
}

const Card: React.FC<CardProps> = ({ card, hovered, setHovered, onSelect, isSelected, selectedType }) => {
  const isHovered = hovered === card.id || isSelected;
  const shouldShowNormal = isSelected || hovered === card.id;
  const otherCardHovered = selectedType !== null && !shouldShowNormal;

  return (
    <div
      className={cn(
        "relative overflow-hidden h-32 w-full rounded-xl cursor-pointer transition-all duration-500 ease-out",
        "transform-gpu border border-white/20",
        "shadow-lg hover:shadow-xl",
        // 글라스모피즘 베이스 (가독성 개선)
        "bg-white/25 hover:bg-white/35 backdrop-blur-xl",
        {
          "scale-105 z-10": isHovered,
          "scale-95 blur-sm opacity-70": otherCardHovered,
          "ring-2 ring-white/40 shadow-xl bg-white/80": isSelected,
        }
      )}
      onMouseEnter={() => setHovered(card.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onSelect(card.id)}
    >
      {/* 글라스모피즘 배경 레이어 (가독성 개선) */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* 메인 글라스 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/35 to-white/20"></div>
        
        {/* 컬러 그라데이션 오버레이 */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-25 transition-all duration-500",
            card.id === 'teacher' 
              ? (isHovered || isSelected ? 'from-blue-400/35 via-blue-300/25 to-cyan-200/15' : 'from-blue-400/25 via-blue-300/15 to-transparent')
              : (isHovered || isSelected ? 'from-green-400/35 via-emerald-300/25 to-teal-200/15' : 'from-green-400/25 via-emerald-300/15 to-transparent')
          )}
        />
        
        {/* 하이라이트 효과 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-transparent to-transparent"></div>
        
        {/* 블러 배경 원 */}
        {(isHovered || isSelected) && (
          <>
            <div className={cn(
              "absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl transition-all duration-500",
              card.id === 'teacher' ? 'bg-blue-400/30' : 'bg-green-400/30'
            )}></div>
            <div className={cn(
              "absolute -bottom-4 -left-4 w-20 h-20 rounded-full blur-2xl transition-all duration-500",
              card.id === 'teacher' ? 'bg-cyan-300/20' : 'bg-emerald-300/20'
            )}></div>
          </>
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <div className={cn(
          "mb-2 transition-all duration-500 drop-shadow-xl",
          (isHovered || isSelected)
            ? (card.id === 'teacher' ? 'text-blue-600 scale-110' : 'text-green-600 scale-110')
            : 'text-gray-500'
        )}>
          {card.icon}
        </div>
        
        <h3 className={cn(
          "text-lg font-bold mb-1 text-center transition-all duration-300 drop-shadow-lg",
          (isHovered || isSelected) ? 'text-gray-900' : 'text-gray-600'
        )}>
          {card.title}
        </h3>
        
        <div className="h-4 flex items-center justify-center min-w-0 w-full">
          <TypewriterText 
            text={card.description}
            className={cn(
              "text-xs text-center font-medium transition-all duration-300 drop-shadow-md",
              (isHovered || isSelected) ? 'text-gray-900' : 'text-gray-500'
            )}
            isActive={isHovered || isSelected}
            speed={30}
          />
        </div>
      </div>
    </div>
  );
};
