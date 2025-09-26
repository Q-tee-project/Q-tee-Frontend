'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FaBell } from 'react-icons/fa6';
import Notification from './Notification';

type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface FixedNotificationIconProps {
  isSidebarOpen?: boolean;
}

const FixedNotificationIcon = ({ isSidebarOpen = false }: FixedNotificationIconProps) => {
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(true); // 새 알림 여부 (테스트용으로 true로 설정)
  const [position, setPosition] = useState<CornerPosition>('top-right');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPosition, setCustomPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const bellMenuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggleBellMenu = () => {
    if (!isDragging && !hasDragged) {
      setIsBellOpen((prev) => !prev);
      // 알림창을 열면 새 알림 표시 제거
      if (!isBellOpen) {
        setHasNewNotification(false);
      }
    }
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setHasDragged(false);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setIsBellOpen(false); // 드래그 중에는 알림창 닫기
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 마우스 위치에 따라 가장 가까운 모서리 계산
  const getClosestCorner = useCallback((mouseX: number, mouseY: number): CornerPosition => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;
    
    // 마우스가 화면 중앙 기준으로 어느 사분면에 있는지 확인
    let result: CornerPosition;
    if (mouseX < centerX && mouseY < centerY) {
      result = 'top-left';
    } else if (mouseX >= centerX && mouseY < centerY) {
      result = 'top-right';
    } else if (mouseX < centerX && mouseY >= centerY) {
      result = 'bottom-left';
    } else {
      result = 'bottom-right';
    }
    
    console.log(`Mouse: (${mouseX}, ${mouseY}), Center: (${centerX}, ${centerY}), Result: ${result}`);
    return result;
  }, []);

  // 드래그 중
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging && dragStartPos) {
      // 드래그 거리 계산
      const dragDistance = Math.sqrt(
        Math.pow(event.clientX - dragStartPos.x, 2) + 
        Math.pow(event.clientY - dragStartPos.y, 2)
      );
      
      // 5픽셀 이상 드래그했을 때만 드래그로 인식
      if (dragDistance > 5) {
        setHasDragged(true);
        
        const newX = event.clientX - dragOffset.x;
        const newY = event.clientY - dragOffset.y;
        
        // 화면 경계 내에서만 이동 가능
        const maxX = window.innerWidth - 32; // 버튼 크기 고려
        const maxY = window.innerHeight - 32;
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        setCustomPosition({ x: clampedX, y: clampedY });
      }
    }
    // 마우스 따라가기 기능 제거 - 드래그할 때만 움직임
  }, [isDragging, dragOffset, dragStartPos]);

  // 드래그 종료
  const handleMouseUp = (event: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartPos(null);
      
      // 드래그 종료 시 마우스 위치에서 가장 가까운 모서리로 즉시 스냅
      if (hasDragged) {
        const newPosition = getClosestCorner(event.clientX, event.clientY);
        console.log(`Setting position to: ${newPosition}`);
        setPosition(newPosition);
        setCustomPosition(null);
      }
      
      // 드래그 상태 초기화 (약간의 지연 후)
      setTimeout(() => {
        setHasDragged(false);
      }, 100);
    }
  };

  // 마우스 이동 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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

  // 위치에 따른 스타일 클래스 반환
  const getPositionClasses = (pos: CornerPosition): string => {
    const leftOffset = isSidebarOpen ? 'left-[250px]' : 'left-[70px]';
    
    switch (pos) {
      case 'top-left':
        return `top-5 ${leftOffset}`;
      case 'top-right':
        return 'top-5 right-5';
      case 'bottom-left':
        return `bottom-5 ${leftOffset}`;
      case 'bottom-right':
        return 'bottom-5 right-5';
      default:
        return 'top-5 right-5';
    }
  };

  // 드래그 중일 때의 스타일
  const getDragStyles = () => {
    if (customPosition) {
      return {
        position: 'fixed' as const,
        left: `${customPosition.x}px`,
        top: `${customPosition.y}px`,
        transform: 'none',
        transition: isDragging ? 'none' : 'all 0.3s ease-in-out'
      };
    }
    return {};
  };

  return (
    <div
      ref={bellMenuRef}
      className={`fixed ${!customPosition ? getPositionClasses(position) : ''} z-[1000] transition-all duration-200 ease-out`}
      style={getDragStyles()}
    >
      {/* 알림 아이콘 */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={toggleBellMenu}
        className={`w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center transition-all duration-200 ease-in-out relative ${
          isDragging ? 'cursor-grabbing scale-110 shadow-lg' : 'cursor-grab'
        }`}
        aria-label="알림"
      >
        <FaBell className="w-[18px] h-[18px] text-white" />
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
