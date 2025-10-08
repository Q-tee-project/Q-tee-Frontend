'use client';

import React from 'react';
import { FocusCards } from '@/components/ui/FocusCards';

interface UserTypeSelectionProps {
  userType: 'teacher' | 'student' | null;
  onCardSelect: (type: 'teacher' | 'student') => void;
}

export const UserTypeSelection: React.FC<UserTypeSelectionProps> = React.memo(({ 
  userType, 
  onCardSelect 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-center mb-8">사용자 유형을 선택해주세요</h2>
      <FocusCards 
        onCardSelect={onCardSelect}
        selectedType={userType}
      />
    </div>
  );
});

UserTypeSelection.displayName = 'UserTypeSelection';
