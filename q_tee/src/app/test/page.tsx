'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [isDark, setIsDark] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');

  useEffect(() => {
    // 시스템 다크 모드 설정 확인
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isSystemDark = mediaQuery.matches;
    setIsDark(isSystemDark);

    // 초기 다크 모드 적용
    if (isSystemDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // HTML 요소에 dark 클래스를 추가/제거하여 다크 모드 적용
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">CSS 테스트 페이지</h1>
          <p className="text-muted-foreground mb-4">
            라이트/다크 모드 색상 변경사항을 확인할 수 있는 테스트 페이지입니다.
          </p>
          
          {/* 테마 토글 버튼 */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            {isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          </button>
        </div>

        {/* 색상 팔레트 섹션 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">색상 팔레트</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--background)' }}></div>
              <p className="text-sm font-medium">Background</p>
              <p className="text-xs text-muted-foreground">var(--background)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--foreground)' }}></div>
              <p className="text-sm font-medium">Foreground</p>
              <p className="text-xs text-muted-foreground">var(--foreground)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--primary)' }}></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">var(--primary)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--secondary)' }}></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-muted-foreground">var(--secondary)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--accent)' }}></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-muted-foreground">var(--accent)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--muted)' }}></div>
              <p className="text-sm font-medium">Muted</p>
              <p className="text-xs text-muted-foreground">var(--muted)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--destructive)' }}></div>
              <p className="text-sm font-medium">Destructive</p>
              <p className="text-xs text-muted-foreground">var(--destructive)</p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: 'var(--border)' }}></div>
              <p className="text-sm font-medium">Border</p>
              <p className="text-xs text-muted-foreground">var(--border)</p>
            </div>
          </div>
        </section>

        {/* 기본 버튼 컴포넌트 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">기본 버튼 컴포넌트</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all">
              Primary Button
            </button>
            <button className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-all">
              Secondary Button
            </button>
            <button className="px-6 py-3 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-all">
              Accent Button
            </button>
            <button className="px-6 py-3 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all">
              Destructive Button
            </button>
            <button className="px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-all">
              Outline Button
            </button>
          </div>
        </section>

        {/* 커스텀 버튼 스타일 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">커스텀 버튼 스타일</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Gray 버튼</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-gray">Gray Button</button>
                <button className="btn-gray" disabled>Disabled Gray</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Blue 버튼 (토글 스타일)</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-blue">활성화</button>
                <button className="btn-blue inactive">비활성화</button>
              </div>

            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">동작하는 토글 버튼</h3>
              <div className="flex gap-2">
                <button 
                  className={`btn-blue ${selectedFilter === '활성화' ? '' : 'inactive'}`}
                  onClick={() => setSelectedFilter('활성화')}
                >
                  활성화
                </button>
                <button 
                  className={`btn-blue ${selectedFilter === '비활성화' ? '' : 'inactive'}`}
                  onClick={() => setSelectedFilter('비활성화')}
                >
                  비활성화
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                현재 선택: <span className="font-medium">{selectedFilter}</span>
              </p>
            </div>
          </div>
        </section>

        {/* 입력 컴포넌트 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">입력 컴포넌트</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">텍스트 입력</label>
              <input
                type="text"
                placeholder="텍스트를 입력하세요"
                className="w-full px-3 py-2 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">이메일 입력</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">비밀번호 입력</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3 py-2 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">텍스트 영역</label>
              <textarea
                placeholder="여러 줄 텍스트를 입력하세요"
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </section>

        {/* 기본 카드 컴포넌트 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">기본 카드 컴포넌트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">기본 카드</h3>
              <p className="text-muted-foreground mb-4">
                이것은 기본 카드 컴포넌트입니다. 배경색과 테두리 색상을 확인할 수 있습니다.
              </p>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all">
                액션 버튼
              </button>
            </div>
            <div className="p-6 rounded-lg border border-border bg-secondary">
              <h3 className="text-lg font-semibold mb-2">Secondary 카드</h3>
              <p className="text-muted-foreground mb-4">
                Secondary 배경색을 사용한 카드입니다.
              </p>
              <button className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-all">
                보조 버튼
              </button>
            </div>
            <div className="p-6 rounded-lg border border-destructive bg-destructive/10">
              <h3 className="text-lg font-semibold mb-2 text-destructive">경고 카드</h3>
              <p className="text-muted-foreground mb-4">
                Destructive 색상을 사용한 경고 카드입니다.
              </p>
              <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-all">
                위험 버튼
              </button>
            </div>
          </div>
        </section>

        {/* 커스텀 카드 컴포넌트 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">커스텀 카드 컴포넌트</h2>
          <div className="space-y-8">
            {/* 기본 카드 구조 */}
            <div>
              <h3 className="text-lg font-medium mb-4">기본 카드 구조</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">카드 제목</h4>
                    <p className="card-description">카드 설명입니다.</p>
                  </div>
                  <div className="card-content">
                    <p>카드 내용이 여기에 표시됩니다. 다양한 정보를 담을 수 있습니다.</p>
                  </div>
                  <div className="card-footer">
                    <button className="btn-blue">액션</button>
                  </div>
                </div>
                <div className="card card-sm">
                  <div className="card-header">
                    <h4 className="card-title">작은 카드</h4>
                    <p className="card-description">작은 크기</p>
                  </div>
                  <div className="card-content">
                    <p>작은 카드입니다.</p>
                  </div>
                </div>
                <div className="card card-lg">
                  <div className="card-header">
                    <h4 className="card-title">큰 카드</h4>
                    <p className="card-description">큰 크기</p>
                  </div>
                  <div className="card-content">
                    <p>큰 카드입니다. 더 많은 공간을 제공합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 카드 색상 변형 */}
            <div>
              <h3 className="text-lg font-medium mb-4">카드 색상 변형</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card card-primary">
                  <div className="card-header">
                    <h4 className="card-title">Primary 카드</h4>
                    <p className="card-description">Primary 색상</p>
                  </div>
                  <div className="card-content">
                    <p>Primary 색상을 사용한 카드입니다.</p>
                  </div>
                </div>
                <div className="card card-secondary">
                  <div className="card-header">
                    <h4 className="card-title">Secondary 카드</h4>
                    <p className="card-description">Secondary 색상</p>
                  </div>
                  <div className="card-content">
                    <p>Secondary 색상을 사용한 카드입니다.</p>
                  </div>
                </div>
                <div className="card card-muted">
                  <div className="card-header">
                    <h4 className="card-title">Muted 카드</h4>
                    <p className="card-description">Muted 색상</p>
                  </div>
                  <div className="card-content">
                    <p>Muted 색상을 사용한 카드입니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 카드 스타일 변형 */}
            <div>
              <h3 className="text-lg font-medium mb-4">카드 스타일 변형</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card card-outline">
                  <div className="card-header">
                    <h4 className="card-title">Outline 카드</h4>
                    <p className="card-description">테두리만 있는 카드</p>
                  </div>
                  <div className="card-content">
                    <p>투명 배경에 테두리만 있는 카드입니다.</p>
                  </div>
                </div>
                <div className="card card-interactive">
                  <div className="card-header">
                    <h4 className="card-title">Interactive 카드</h4>
                    <p className="card-description">호버 효과가 있는 카드</p>
                  </div>
                  <div className="card-content">
                    <p>마우스를 올리면 효과가 나타나는 카드입니다.</p>
                  </div>
                </div>
                <div className="card card-interactive card-outline">
                  <div className="card-header">
                    <h4 className="card-title">Interactive Outline</h4>
                    <p className="card-description">호버 + 테두리</p>
                  </div>
                  <div className="card-content">
                    <p>호버 효과와 테두리 스타일을 결합한 카드입니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 타이포그래피 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">타이포그래피</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-semibold">Heading 3</h3>
            <h4 className="text-xl font-semibold">Heading 4</h4>
            <h5 className="text-lg font-semibold">Heading 5</h5>
            <h6 className="text-base font-semibold">Heading 6</h6>
            <p className="text-base">
              이것은 일반 텍스트입니다. <strong>굵은 텍스트</strong>와 <em>기울임 텍스트</em>를 포함합니다.
            </p>
            <p className="text-sm text-muted-foreground">
              이것은 작은 크기의 muted 텍스트입니다.
            </p>
            <p className="text-xs text-muted-foreground">
              이것은 매우 작은 크기의 muted 텍스트입니다.
            </p>
          </div>
        </section>

        {/* 유틸리티 클래스 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">유틸리티 클래스</h2>
          <div className="space-y-6">
            {/* 간격 유틸리티 */}
            <div>
              <h3 className="text-lg font-medium mb-3">간격 (Spacing)</h3>
              <div className="space-y-2">
                <div className="p-sm bg-secondary rounded">p-sm (4px)</div>
                <div className="p-md bg-secondary rounded">p-md (16px)</div>
                <div className="p-lg bg-secondary rounded">p-lg (24px)</div>
              </div>
            </div>

            {/* 간격 유틸리티 */}
            <div>
              <h3 className="text-lg font-medium mb-3">간격 (Gap)</h3>
              <div className="flex gap-sm">
                <div className="p-2 bg-primary text-primary-foreground rounded">gap-sm</div>
                <div className="p-2 bg-primary text-primary-foreground rounded">gap-sm</div>
              </div>
              <div className="flex gap-md mt-2">
                <div className="p-2 bg-primary text-primary-foreground rounded">gap-md</div>
                <div className="p-2 bg-primary text-primary-foreground rounded">gap-md</div>
              </div>
              <div className="flex gap-lg mt-2">
                <div className="p-2 bg-primary text-primary-foreground rounded">gap-lg</div>
                <div className="p-2 bg-primary text-primary-foreground rounded">gap-lg</div>
              </div>
            </div>

            {/* 텍스트 정렬 */}
            <div>
              <h3 className="text-lg font-medium mb-3">텍스트 정렬</h3>
              <div className="space-y-2">
                <div className="text-left p-2 bg-muted rounded">text-left</div>
                <div className="text-center p-2 bg-muted rounded">text-center</div>
                <div className="text-right p-2 bg-muted rounded">text-right</div>
              </div>
            </div>

            {/* Flexbox 유틸리티 */}
            <div>
              <h3 className="text-lg font-medium mb-3">Flexbox 유틸리티</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <div className="p-1 bg-primary text-primary-foreground rounded text-xs">flex</div>
                  <div className="p-1 bg-primary text-primary-foreground rounded text-xs">items-center</div>
                </div>
                <div className="flex justify-between gap-2 p-2 bg-muted rounded">
                  <div className="p-1 bg-primary text-primary-foreground rounded text-xs">justify-between</div>
                  <div className="p-1 bg-primary text-primary-foreground rounded text-xs">justify-between</div>
                </div>
                <div className="flex flex-col gap-2 p-2 bg-muted rounded">
                  <div className="p-1 bg-primary text-primary-foreground rounded text-xs">flex-col</div>
                  <div className="p-1 bg-primary text-primary-foreground rounded text-xs">flex-col</div>
                </div>
              </div>
            </div>

            {/* 테두리 반경 */}
            <div>
              <h3 className="text-lg font-medium mb-3">테두리 반경</h3>
              <div className="flex gap-4">
                <div className="rounded-sm p-2 bg-secondary">rounded-sm</div>
                <div className="rounded p-2 bg-secondary">rounded</div>
                <div className="rounded-lg p-2 bg-secondary">rounded-lg</div>
              </div>
            </div>

            {/* 그림자 */}
            <div>
              <h3 className="text-lg font-medium mb-3">그림자</h3>
              <div className="flex gap-4">
                <div className="p-4 bg-background border border-border rounded shadow-sm">shadow-sm</div>
                <div className="p-4 bg-background border border-border rounded shadow">shadow</div>
                <div className="p-4 bg-background border border-border rounded shadow-md">shadow-md</div>
                <div className="p-4 bg-background border border-border rounded shadow-lg">shadow-lg</div>
              </div>
            </div>
          </div>
        </section>

        {/* 반응형 디자인 테스트 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">반응형 디자인</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-primary text-primary-foreground rounded text-center">
                <p className="text-sm">모바일: 1열</p>
                <p className="text-sm">태블릿: 2열</p>
                <p className="text-sm">데스크톱: 3열</p>
              </div>
              <div className="p-4 bg-secondary text-secondary-foreground rounded text-center">
                <p className="text-sm">반응형</p>
                <p className="text-sm">그리드</p>
                <p className="text-sm">테스트</p>
              </div>
              <div className="p-4 bg-accent text-accent-foreground rounded text-center">
                <p className="text-sm">화면 크기를</p>
                <p className="text-sm">조절해보세요</p>
                <p className="text-sm">(768px, 1024px)</p>
              </div>
            </div>
          </div>
        </section>

        {/* CSS 변수 디버깅 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">CSS 변수 디버깅</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted">
              <h3 className="text-lg font-medium mb-3">색상 변수</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>--background:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--background)</span>
                </div>
                <div className="flex justify-between">
                  <span>--foreground:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--foreground)</span>
                </div>
                <div className="flex justify-between">
                  <span>--primary:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--primary)</span>
                </div>
                <div className="flex justify-between">
                  <span>--secondary:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--secondary)</span>
                </div>
                <div className="flex justify-between">
                  <span>--muted:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--muted)</span>
                </div>
                <div className="flex justify-between">
                  <span>--border:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--border)</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted">
              <h3 className="text-lg font-medium mb-3">간격 변수</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>--spacing-sm:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--spacing-sm)</span>
                </div>
                <div className="flex justify-between">
                  <span>--spacing-md:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--spacing-md)</span>
                </div>
                <div className="flex justify-between">
                  <span>--spacing-lg:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--spacing-lg)</span>
                </div>
                <div className="flex justify-between">
                  <span>--radius:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--radius)</span>
                </div>
                <div className="flex justify-between">
                  <span>--transition:</span>
                  <span style={{ color: 'var(--foreground)' }}>var(--transition)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 현재 테마 정보 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">현재 테마 정보</h2>
          <div className="p-4 rounded-lg border border-border bg-muted">
            <p className="text-sm">
              <strong>현재 모드:</strong> {isDark ? '다크 모드' : '라이트 모드'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>배경색:</strong> <span style={{ color: 'var(--foreground)' }}>var(--background)</span>
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>실제 배경색:</strong> <span style={{ color: 'var(--foreground)' }}>#1e1e1e (다크 모드)</span>
            </p>
            <p className="text-sm text-muted-foreground">
              시스템 설정에 따라 자동으로 감지되거나 위의 토글 버튼으로 변경할 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
