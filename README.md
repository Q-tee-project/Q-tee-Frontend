# Q-Tee Frontend

Q-Tee는 AI 기반 문제 생성 및 자동 채점 시스템을 제공하는 교육 플랫폼입니다. 선생님은 문제를 쉽게 생성하고 배포할 수 있으며, 학생은 과제를 풀고 즉각적인 피드백을 받을 수 있습니다.

## 프로젝트 개요

### 주요 기능

**선생님용**

- AI 기반 문제 자동 생성 (국어, 영어, 수학)
- 클래스 및 학생 관리
- 과제 배포 및 채점 관리
- 성적 통계 및 분석
- 문제 마켓플레이스 (문제 판매/구매)

**학생용**

- 배포된 과제 풀이
- 실시간 자동 채점 및 피드백
- 성적 조회 및 분석
- 클래스 가입 및 관리

### 시스템 구성

```
Frontend (Next.js 15)
     |
     | REST API
     |
Backend Services
├── Math Service (FastAPI)
├── Korean Service (FastAPI)
├── English Service (FastAPI)
└── Auth Service (FastAPI)
```

## 기술 스택

### Core

- **Next.js 15.5.2** - App Router, Server Components
- **React 18.3.1** - UI 라이브러리
- **TypeScript** - 타입 안전성

### Styling

- **Tailwind CSS 4** - 유틸리티 기반 CSS
- **Framer Motion** - 애니메이션
- **Radix UI** - 접근성 우선 컴포넌트

### Data & State

- **Axios** - HTTP 클라이언트
- **TanStack Table** - 데이터 테이블
- **React Context API** - 전역 상태 관리

### UI Components

- **Lucide React** - 아이콘
- **React Icons** - 추가 아이콘
- **Recharts** - 차트 및 그래프
- **KaTeX** - 수식 렌더링
- **QR Code** - QR 코드 생성

### Developer Tools

- **ESLint** - 코드 품질
- **TypeScript** - 타입 체킹

## 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   ├── join/                 # 회원가입
│   │   └── profile/              # 프로필
│   ├── (workspace)/              # 학습 작업 공간
│   │   ├── test/                 # 과제 풀이
│   │   ├── question/             # 문제 생성/관리
│   │   │   ├── create/           # 문제 생성
│   │   │   ├── bank/             # 문제함
│   │   │   └── export/           # 문제 내보내기
│   │   └── class/                # 클래스 관리
│   │       ├── [id]/             # 클래스 상세
│   │       ├── create/           # 클래스 생성
│   │       └── join/             # 클래스 가입
│   ├── (dashboard)/              # 대시보드
│   │   ├── student/              # 학생 대시보드
│   │   └── teacher/              # 선생님 대시보드
│   ├── market/                   # 마켓플레이스
│   │   ├── my/                   # 내 상품
│   │   ├── purchases/            # 구매 목록
│   │   ├── [productId]/          # 상품 상세
│   │   └── author/[authorId]/    # 작가 페이지
│   └── message/                  # 쪽지
│       ├── post/                 # 쪽지 작성
│       └── [id]/                 # 쪽지 상세
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   ├── class/                    # 클래스 관련 컴포넌트
│   ├── bank/                     # 문제함 컴포넌트
│   ├── test/                     # 테스트 컴포넌트
│   ├── dashboard/                # 대시보드 컴포넌트
│   └── join/                     # 회원가입 컴포넌트
├── contexts/                     # React Context
│   ├── AuthContext.tsx           # 인증 상태 관리
│   └── NotificationContext.tsx   # 알림 관리
├── services/                     # API 서비스
│   ├── authService.ts            # 인증 API
│   ├── mathService.ts            # 수학 API
│   ├── koreanService.ts          # 국어 API
│   ├── englishService.ts         # 영어 API
│   └── marketApi.ts              # 마켓 API
├── types/                        # TypeScript 타입 정의
│   ├── math.ts
│   ├── korean.ts
│   ├── english.ts
│   └── common.ts
└── lib/                          # 유틸리티 함수
```

## 주요 페이지

### 인증

- **/join** - 회원가입 (선생님/학생)
- **/profile** - 프로필 관리

### 대시보드

- **/teacher** - 선생님 대시보드 (클래스 관리, 마켓 통계)
- **/student** - 학생 대시보드 (과제 현황, 성적 분석)

### 문제 관리 (선생님)

- **/question/create** - AI 문제 생성
- **/question/bank** - 문제함 (생성된 문제 관리)
- **/question/export** - 문제 내보내기

### 클래스

- **/class** - 클래스 목록 (학생)
- **/class/create** - 클래스 생성/목록 (선생님)
- **/class/[id]** - 클래스 상세 (과제, 학생, 승인 관리)
- **/class/join** - 클래스 가입 (학생)

### 과제

- **/test** - 과제 풀이 (학생)
- **/class/[id]?tab=assignment** - 과제 배포 (선생님)

### 마켓플레이스

- **/market** - 문제 마켓 메인
- **/market/my** - 내 상품 관리
- **/market/purchases** - 구매한 상품
- **/market/create** - 상품 등록
- **/market/[productId]** - 상품 상세
- **/market/checkout** - 결제 완료

### 메시징

- **/message** - 쪽지함
- **/message/post** - 쪽지 작성
- **/message/[id]** - 쪽지 상세

## 성능 최적화

### 번들 최적화

- **Dynamic Import** - 대용량 컴포넌트 lazy loading
- **Code Splitting** - 라우트별 자동 분할
- **Tree Shaking** - Icon 라이브러리 최적화

### 렌더링 최적화

- **React.memo** - 불필요한 리렌더링 방지
- **Loading States** - Skeleton UI로 로딩 경험 개선
- **Server Components** - Next.js 15 App Router 활용

### 리소스 최적화

- **Font Optimization** - display: swap, preload
- **Image Optimization** - AVIF, WebP 지원
- **Compression** - gzip 압축 활성화

## API 통신

### 엔드포인트

```typescript
// 환경변수 (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MATH_API_URL=http://localhost:8001
NEXT_PUBLIC_KOREAN_API_URL=http://localhost:8002
NEXT_PUBLIC_ENGLISH_API_URL=http://localhost:8003
```

### 서비스별 API

**Auth Service (8000)**

- 선생님/학생 로그인, 회원가입
- 프로필 관리
- 클래스 관리

**Math Service (8001)**

- 수학 문제 생성
- 수학 과제 관리
- 수학 채점

**Korean Service (8002)**

- 국어 문제 생성
- 국어 과제 관리
- 국어 채점

**English Service (8003)**

- 영어 문제 생성
- 영어 과제 관리
- 영어 채점

## 개발 환경 설정

### 요구사항

- Node.js 20+
- pnpm (권장)

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MATH_API_URL=http://localhost:8001
NEXT_PUBLIC_KOREAN_API_URL=http://localhost:8002
NEXT_PUBLIC_ENGLISH_API_URL=http://localhost:8003
```

## 주요 기술적 특징

### 1. 라우트 그룹 활용

Next.js 15의 라우트 그룹을 사용하여 논리적으로 관련된 페이지들을 그룹화하면서도 URL 구조는 유지합니다.

```
(auth)/, (workspace)/, (dashboard)/ - URL에 포함되지 않는 그룹
→ /join, /test, /teacher 등으로 깔끔한 URL 유지
```

### 2. Context API 기반 상태 관리

```typescript
// AuthContext - 사용자 인증 상태
const { userType, userProfile, login, logout } = useAuth();

// NotificationContext - 실시간 알림
const { notifications, markAsRead } = useNotification();
```

### 3. 과목별 서비스 분리

각 과목(수학, 국어, 영어)의 서비스가 독립적으로 운영되며, 프론트엔드에서는 통합된 인터페이스를 제공합니다.

```typescript
// 과목별 서비스 사용
mathService.generateProblems();
koreanService.createWorksheet();
englishService.submitTest();
```

### 4. 실시간 채점 시스템

학생이 과제를 제출하면 백엔드에서 즉시 채점하여 결과를 반환합니다.

- 객관식: 자동 채점
- 단답형: AI 기반 유사도 검사
- 서술형: 선생님 수동 채점

### 5. 문제 마켓플레이스

선생님들이 만든 문제를 다른 선생님들과 공유하거나 판매할 수 있는 플랫폼입니다.

- 포인트 기반 거래 시스템
- 작가별 상품 관리
- 구매 내역 및 다운로드

## 빌드 결과

```
Route (app)                    Size       First Load JS
├ / (홈/로그인)                   10.3 kB    128 kB
├ /teacher (선생님 대시보드)       3.83 kB    146 kB
├ /student (학생 대시보드)         140 kB     297 kB
├ /test (과제 풀이)               8.9 kB     127 kB
├ /question/create             14.4 kB    264 kB
├ /question/bank               25.6 kB    281 kB
├ /class/[id]                  9.88 kB    153 kB
├ /market                      6.44 kB    212 kB
└ /message                     10.9 kB    156 kB

Shared JS across all pages:    103 kB
```
