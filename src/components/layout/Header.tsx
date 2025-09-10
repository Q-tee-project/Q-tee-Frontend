'use client';

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { VscBellDot } from 'react-icons/vsc'
import { FaUserCircle } from 'react-icons/fa'
import { LuUser, LuLogOut } from 'react-icons/lu'
import { LuMail, LuCalendar, LuShoppingCart, LuTriangleAlert, LuCheck, LuPencilLine, LuX, LuTrash2 } from 'react-icons/lu'

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isBellOpen, setIsBellOpen] = React.useState(false)
  const profileMenuRef = React.useRef<HTMLLIElement | null>(null)
  const bellMenuRef = React.useRef<HTMLLIElement | null>(null)

  type NotificationType = 'message' | 'schedule' | 'market' | 'missing' | 'graded' | 'problem'
  type Notification = { id: string; type: NotificationType; title: string }

  const typeMeta: Record<NotificationType, { label: string; icon: React.ReactNode }> = {
    message: { label: '쪽지 알림', icon: <LuMail size={18} /> },
    schedule: { label: '일정 알림', icon: <LuCalendar size={18} /> },
    market: { label: '마켓 알림', icon: <LuShoppingCart size={18} /> },
    missing: { label: '미제출 알림', icon: <LuTriangleAlert size={18} /> },
    graded: { label: '채점 알림', icon: <LuCheck size={18} /> },
    problem: { label: '문제 알림', icon: <LuPencilLine size={18} /> },
  }

  const [notifications, setNotifications] = React.useState<Notification[]>([
    { id: 'm-1', type: 'message', title: '새 쪽지 1건' },
    { id: 'm-2', type: 'message', title: '새 쪽지 1건' },
    { id: 's-1', type: 'schedule', title: '오늘 일정' },
    { id: 's-2', type: 'schedule', title: '내일 일정' },
    { id: 'mk-1', type: 'market', title: '마켓 업데이트' },
    { id: 'mi-1', type: 'missing', title: '미제출 과제' },
    { id: 'g-1', type: 'graded', title: '채점 완료' },
    { id: 'p-1', type: 'problem', title: '새 문제 등록' },
  ])

  const [expandedType, setExpandedType] = React.useState<NotificationType | null>(null)

  const handleRemoveNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
    setExpandedType(null)
    setIsBellOpen(false)
  }

  const toggleProfileMenu = () => {
    setIsProfileOpen((prev) => !prev)
    setIsBellOpen(false)
  }

  const toggleBellMenu = () => {
    setIsBellOpen((prev) => !prev)
    setIsProfileOpen(false)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target instanceof Node ? event.target : null
      const clickedOutsideProfile = profileMenuRef.current && targetNode && !profileMenuRef.current.contains(targetNode)
      const clickedOutsideBell = bellMenuRef.current && targetNode && !bellMenuRef.current.contains(targetNode)
      if (clickedOutsideProfile) setIsProfileOpen(false)
      if (clickedOutsideBell) setIsBellOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setIsBellOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  return (
    <>
      <header
        className="w-full border-b border-border"
        style={{ padding: '10px', borderBottom: '1px solid #D1D1D1', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        role="banner"
        aria-label="상단 네비게이션"
      >
        <div className="flex items-center justify-between w-full" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          <div className="flex items-center gap-md">
            <Link href="/" aria-label="홈으로 이동">
              <Image
                src="/logo.svg"
                alt="Q-Tee 로고"
                width={28}
                height={28}
                priority
              />
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
                {isBellOpen && (
                  <div
                    role="menu"
                    aria-label="알림"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '280px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D1D1',
                      borderRadius: '14px',
                      boxShadow: '0 12px 34px rgba(0,0,0,0.10)',
                      padding: '16px',
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        aria-label="모든 알림 삭제"
                        onClick={handleClearAll}
                        style={{
                          all: 'unset',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          color: '#6B7280',
                          cursor: 'pointer',
                          borderRadius: '8px',
                        }}
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>

                    {(() => {
                      return (
                        <div className="notif-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                          {Object.entries(
                            notifications.reduce<Record<NotificationType, Notification[]>>((acc, cur) => {
                              if (!acc[cur.type]) acc[cur.type] = []
                              acc[cur.type].push(cur)
                              return acc
                            }, { message: [], schedule: [], market: [], missing: [], graded: [], problem: [] })
                          )
                            .filter(([_, list]) => list.length > 0)
                            .map(([typeKey, list], groupIndex) => {
                              const t = typeKey as NotificationType
                              const meta = typeMeta[t]
                              const isOpen = expandedType === t
                              const latest = list[list.length - 1]
                              const panelMaxHeight = isOpen ? Math.min(280, list.length * 64 + 40) : 0
                              return (
                                <div key={t} className="notif-item" style={{ animationDelay: `${groupIndex * 60}ms`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <button
                                    onClick={() => setExpandedType((prev) => (prev === t ? null : t))}
                                    aria-label={`${latest?.title ?? meta.label} ${list.length}개 보기`}
                                    style={{
                                      all: 'unset',
                                      display: 'block',
                                      position: 'relative',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {list.length >= 2 && (
                                      <div aria-hidden style={{
                                        position: 'absolute',
                                        inset: 0,
                                        transform: 'translateY(6px)',
                                        background: '#2F2F2F',
                                        borderRadius: '10px',
                                        opacity: 0.8,
                                        filter: 'brightness(0.9)',
                                      }} />
                                    )}
                                    {list.length >= 2 && (
                                      <div aria-hidden style={{
                                        position: 'absolute',
                                        inset: 0,
                                        transform: 'translateY(3px)',
                                        background: '#2F2F2F',
                                        borderRadius: '10px',
                                        opacity: 0.9,
                                      }} />
                                    )}
                                    <div
                                      style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        background: '#2F2F2F',
                                        color: '#FFFFFF',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span aria-hidden>{meta.icon}</span>
                                        <span style={{ fontSize: '14px' }}>{latest?.title ?? meta.label}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                          fontSize: '12px',
                                          color: '#E5E7EB',
                                          background: 'rgba(255,255,255,0.12)',
                                          padding: '2px 8px',
                                          borderRadius: '9999px',
                                        }}>{list.length}</span>
                                      </div>
                                    </div>
                                  </button>
                                  <div style={{
                                    overflow: 'hidden',
                                    transition: 'max-height 220ms ease',
                                    maxHeight: panelMaxHeight,
                                  }}>
                                    {isOpen && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {list.map((n, index) => (
                                          <div key={n.id} className="notif-item" style={{ position: 'relative', animationDelay: `${index * 60}ms` }}>
                                            <div aria-hidden style={{
                                              position: 'absolute', left: '6px', right: '6px', bottom: '-3px', height: '6px', borderRadius: '6px', background: 'rgba(0,0,0,0.12)', filter: 'blur(4px)'
                                            }} />
                                            <div
                                              style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#2F2F2F', color: '#FFFFFF', padding: '12px 14px', borderRadius: '10px'
                                              }}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span aria-hidden>{typeMeta[n.type].icon}</span>
                                                <span style={{ fontSize: '14px' }}>{n.title}</span>
                                              </div>
                                              <button
                                                aria-label={`${n.title} 닫기`}
                                                style={{ all: 'unset', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', cursor: 'pointer', color: '#FFFFFF' }}
                                                onClick={() => handleRemoveNotification(n.id)}
                                              >
                                                <LuX size={18} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )
                    })()}
                    
                  </div>
                )}
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
                    color: '#AFAFAF',
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

                {isProfileOpen && (
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
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '8px', padding: '8px 16px 12px 16px' }}>
                      <div
                        aria-hidden
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '9999px',
                          background: '#AFAFAF',
                        }}
                      />
                      <div style={{ color: '#6B7280', fontSize: '14px' }}>user.name</div>
                    </div>
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
                      onClick={() => {
                        setIsProfileOpen(false)
                      }}
                    >
                      <LuUser size={18} aria-hidden />
                      <span>프로필</span>
                    </button>
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
                      onClick={() => {
                        // TODO: trigger logout
                        setIsProfileOpen(false)
                      }}
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
  )
}
