'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VscBellDot } from 'react-icons/vsc';
import { FaUserCircle } from 'react-icons/fa';
import { LuUser, LuLogOut } from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';
import Notification from './Notification';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, userType, userProfile, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isBellOpen, setIsBellOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLLIElement | null>(null);
  const bellMenuRef = React.useRef<HTMLLIElement | null>(null);

  const toggleProfileMenu = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsProfileOpen((prev) => !prev);
    setIsBellOpen(false);
  };

  const toggleBellMenu = () => {
    setIsBellOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target instanceof Node ? event.target : null;
      const clickedOutsideProfile =
        profileMenuRef.current && targetNode && !profileMenuRef.current.contains(targetNode);
      const clickedOutsideBell =
        bellMenuRef.current && targetNode && !bellMenuRef.current.contains(targetNode);
      if (clickedOutsideProfile) setIsProfileOpen(false);
      if (clickedOutsideBell) setIsBellOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
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
    <>
      <header
        className="w-full border-b border-border"
        style={{
          padding: '10px',
          borderBottom: '1px solid #D1D1D1',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          backgroundColor: '#FFFFFF',
        }}
        role="banner"
        aria-label="상단 네비게이션"
      >
        <div className="flex items-center justify-between w-full" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          <div className="flex items-center gap-md">
            <Link href="/" aria-label="홈으로 이동">
              <Image src="/logo.svg" alt="Q-Tee 로고" width={28} height={28} priority />
            </Link>
          </div>

          <nav aria-label="사용자 메뉴">
            <ul className="flex items-center gap-lg list-none">
              <li style={{ position: 'relative', 
              marginRight: '20px', 
              display: 'flex',
              alignItems: 'center'}}
              ref={bellMenuRef}>
                <button
                  type="button"
                  aria-label="알림"
                  title="알림"
                  aria-haspopup="menu"
                  aria-expanded={isBellOpen}
                  onClick={toggleBellMenu}
                  style={{
                    all: 'unset',
                    color: '#AFAFAF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-default)',
                    cursor: 'pointer',
                  }}
                >
                  <VscBellDot size={22} />
                </button>
                <Notification 
                  isOpen={isBellOpen} 
                  onClose={() => setIsBellOpen(false)} 
                  bellMenuRef={bellMenuRef} 
                />
              </li>
              <li style={{ position: 'relative',
                marginRight: '20px', 
                display: 'flex',
                alignItems: 'center'}} ref={profileMenuRef}>
                <button
                  type="button"
                  aria-label="내 프로필"
                  title="내 프로필"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  onClick={toggleProfileMenu}
                  style={{
                    all: 'unset',
                    color: isAuthenticated ? '#0072CE' : '#AFAFAF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--radius-default)',
                    cursor: 'pointer',
                  }}
                >
                  <FaUserCircle size={24} />
                </button>

                {isProfileOpen && isAuthenticated && (
                  <div
                    role="menu"
                    aria-label="프로필 메뉴"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '240px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D1D1',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      padding: '10px 0',
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '8px 16px 12px 16px',
                      }}
                    >
                      <div
                        aria-hidden
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '9999px',
                          background: '#AFAFAF',
                        }}
                      />
                      <div style={{ color: '#6B7280', fontSize: '14px' }}>
                        {isAuthenticated ? userProfile?.name : '로그인이 필요합니다'}
                      </div>
                      {isAuthenticated && userType && (
                        <div style={{ 
                          fontSize: '12px', 
                          backgroundColor: userType === 'teacher' ? '#EBF6FF' : '#F0F9F0',
                          color: userType === 'teacher' ? '#0072CE' : '#4CAF50',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          {userType === 'teacher' ? '선생님' : '학생'}
                        </div>
                      )}
                    </div>
                    <div style={{ height: '1px', background: '#EFEFEF' }} />
                    <Link
                      href="/profile"
                      role="menuitem"
                      style={{
                        all: 'unset',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: '#1F2937',
                        textDecoration: 'none',
                      }}
                      onClick={() => {
                        setIsProfileOpen(false);
                      }}
                    >
                      <LuUser size={18} aria-hidden />
                      <span>프로필</span>
                    </Link>
                    <div style={{ height: '1px', background: '#EFEFEF' }} />
                    <button
                      role="menuitem"
                      style={{
                        all: 'unset',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: '#1F2937',
                      }}
                      onClick={handleLogout}
                    >
                      <LuLogOut size={18} aria-hidden />
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}