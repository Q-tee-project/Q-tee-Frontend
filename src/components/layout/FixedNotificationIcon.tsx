'use client';

import React, { useState, useRef, useCallback } from 'react';
import { FaBell } from 'react-icons/fa6';
import Notification from './Notification';
import { useNotification } from '@/contexts/NotificationContext';

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const FixedNotificationIcon = () => {
  const { unreadCount } = useNotification();
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellMenuRef = useRef<HTMLDivElement | null>(null);

  const hasNewNotification = unreadCount > 0;

  const toggleBellMenu = () => {
    setIsBellOpen((prev) => !prev);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target instanceof Node ? event.target : null;
      const clickedOutsideBell =
        bellMenuRef.current && targetNode && !bellMenuRef.current.contains(targetNode);
      if (clickedOutsideBell) setIsBellOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBellOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={bellMenuRef}
      className="fixed top-5 right-5 z-[1000]"
    >
      {/* 알림 아이콘 */}
      <button
        onClick={toggleBellMenu}
        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out relative hover:bg-gray-50 hover:scale-105"
        aria-label="알림"
      >
        <FaBell className="w-[18px] h-[18px] text-gray-400" />
        {/* 새 알림 표시 */}
        {hasNewNotification && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isBellOpen && (
        <Notification 
          isOpen={isBellOpen} 
          onClose={() => setIsBellOpen(false)} 
          bellMenuRef={bellMenuRef}
        />
      )}
    </div>
  );
};

export default FixedNotificationIcon;
