# Q-tee Frontend 코드 정리 작업

## 🎯 목표
과도하게 설정된 코드들을 정리하여 유지보수성 향상

---

## ✅ 작업 항목

### 1. API URL 환경변수로 통합
**문제점:**
- `mathService.ts`, `useMathGeneration.ts` 등에 `http://localhost:8001` 하드코딩
- 환경별 설정 불가능

**해결방안:**
- `.env.local`에 `NEXT_PUBLIC_MATH_API_URL` 추가
- 모든 하드코딩된 URL을 환경변수로 교체

**영향 파일:**
- `src/services/mathService.ts`
- `src/hooks/useMathGeneration.ts`

---

### 2. 토큰 관리 로직 통합
**문제점:**
- `mathService.ts`의 `getToken()` 함수 (L13-18)
- `authService.ts`의 `tokenStorage` 객체 (L119-157)
- 중복 로직 존재

**해결방안:**
- `authService.tokenStorage`로 통일
- `mathService.ts`의 `getToken()` 제거 및 교체

**영향 파일:**
- `src/services/mathService.ts`
- `src/hooks/useMathGeneration.ts`

---

### 3. Mock 데이터 및 과도한 Fallback 로직 제거/간소화
**문제점:**
- 각 API 함수마다 3-4번의 엔드포인트 재시도
- Mock 데이터 반환 (프로덕션 코드에 부적절)
- 불필요한 네트워크 오버헤드

**해결방안:**
- Fallback 로직을 1회로 제한 또는 제거
- Mock 데이터 제거 (또는 개발 환경 분리)

**영향 파일:**
- `src/services/mathService.ts` (대부분의 함수)

---

### 4. 디버깅 코드 및 과도한 검증 로직 정리
**문제점:**
- `useMathGeneration.ts`에 100+ console.log
- 문제 검증 로직 72줄 (L327-398)
- 강제 표시 로직 (L407-422) 불필요

**해결방안:**
- console.log 대부분 제거 (중요한 것만 남김)
- 검증 로직 간소화 (10줄 이내)
- 디버깅 모드 제거

**영향 파일:**
- `src/hooks/useMathGeneration.ts`
- `src/hooks/useMathBank.ts`

---

### 5. 불필요한 파일 삭제
**문제점:**
- `src/types/login.ts` - 빈 파일

**해결방안:**
- 파일 삭제

**영향 파일:**
- `src/types/login.ts`

---

## 📝 추가 검토 필요
- `localStorage` 직접 접근을 커스텀 훅으로 추상화 (선택적)
- 타입 정의 중복 검토 및 통합 (선택적)

---

## 🚀 작업 순서
1. ✅ 불필요한 파일 삭제 (login.ts) - 완료
2. ✅ API URL 환경변수로 통합 - 완료
3. ✅ 토큰 관리 로직 통합 - 완료
4. ✅ Mock 데이터 및 fallback 로직 제거/간소화 - 완료
5. ✅ 디버깅 코드 및 과도한 검증 로직 정리 - 완료

---

## 📊 완료 요약

### 삭제된 항목
- `src/types/login.ts` (빈 파일)
- `mathService.ts`의 중복 `getToken()` 함수
- 3-4번 반복되는 fallback API 호출 로직
- Mock 데이터 반환 코드
- 100+ console.log 디버깅 코드
- 72줄의 과도한 문제 검증 로직

### 통합/간소화된 항목
- 모든 하드코딩된 API URL → 환경변수 사용
- 토큰 관리 → `authService.tokenStorage`로 통일
- 문제 검증 로직 → 5줄로 간소화
- 에러 메시지 정리

### 코드 감소량
- `mathService.ts`: ~150줄 감소
- `useMathGeneration.ts`: ~100줄 감소
- **총 ~250줄 이상 감소**

---

*작성일: 2025-10-03*
*완료일: 2025-10-03*

---

## 🔄 추가 리팩토링 (2025-10-03)

### mathService.ts 헬퍼 함수 생성 및 중복 제거

**문제점:**
- 728줄의 파일에서 26개 함수 모두 동일한 패턴 반복
- 토큰 체크 + fetch + 에러 처리 중복
- 불필요한 console.log 15개

**해결:**
- `apiRequest<T>` 제네릭 헬퍼 함수 생성
- 모든 API 호출을 헬퍼 함수로 통합
- console.log 모두 제거

**결과:**
- **728줄 → 236줄 (67% 감소, 492줄 제거)**
- 코드 가독성 및 유지보수성 대폭 향상
- 에러 처리 일관성 확보
- 타입 안정성 향상

---

## 📚 향후 작업 가이드 (국어/영어 서비스)

### 🎯 적용 대상
다음 서비스 파일들도 동일한 리팩토링 패턴 적용 권장:
- `src/services/koreanService.ts`
- `src/services/englishService.ts`
- 관련 hooks: `useKoreanGeneration.ts`, `useEnglishGeneration.ts` 등

### 📋 리팩토링 체크리스트

#### 1. 헬퍼 함수 생성
```typescript
// 각 서비스 파일 상단에 추가
const API_BASE_URL = process.env.NEXT_PUBLIC_[SUBJECT]_API_URL || 'http://localhost:800X';

const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = tokenStorage.getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed: ${response.status}`);
  }

  return response.json();
};
```

#### 2. API 함수 간소화 예시

**Before (반복 패턴):**
```typescript
async getWorksheets(): Promise<Worksheet[]> {
  const token = tokenStorage.getToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/api/worksheets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch worksheets');
  }

  const data = await response.json();
  console.log('Fetched worksheets:', data);
  return data;
}
```

**After (헬퍼 사용):**
```typescript
getWorksheets: async (): Promise<Worksheet[]> => {
  return apiRequest('/api/worksheets');
},
```

#### 3. 제거 대상 항목

**필수 제거:**
- [x] 중복된 `getToken()` 함수
- [x] 각 함수의 토큰 체크 로직
- [x] 반복되는 fetch + 에러 처리 코드
- [x] console.log (프로덕션 코드)
- [x] 3-4번 재시도하는 fallback 로직
- [x] Mock 데이터 반환 코드

**선택 제거:**
- [ ] 과도한 주석
- [ ] 디버깅 코드
- [ ] 불필요한 변수 선언

#### 4. 주의사항

**특수 케이스 (헬퍼 함수 사용 불가):**
- Blob 응답 (PDF 다운로드 등)
- FormData 업로드 (파일 업로드)
- 스트리밍 응답

이런 경우는 직접 fetch 사용하되, 간소화된 형태로 작성

**예시:**
```typescript
downloadPDF: async (id: number): Promise<void> => {
  const token = tokenStorage.getToken();
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/api/export/${id}.pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('PDF 생성 실패');

  const blob = await response.blob();
  // ... blob 처리
},
```

#### 5. 예상 효과

각 서비스 파일당:
- **코드량 60-70% 감소** 예상
- **유지보수 시간 50% 단축**
- **버그 발생률 감소** (일관된 에러 처리)
- **타입 안정성 향상** (제네릭 활용)

### 🔧 작업 우선순위

1. **High Priority:** `koreanService.ts` (수학과 유사한 구조)
2. **Medium Priority:** `englishService.ts`
3. **Low Priority:** 관련 hooks 파일들

### 📊 진행 상황 추적

- [ ] `koreanService.ts` 리팩토링
- [ ] `englishService.ts` 리팩토링
- [ ] `useKoreanGeneration.ts` 정리
- [ ] `useEnglishGeneration.ts` 정리
- [ ] 통합 테스트

---

*참고: mathService.ts 리팩토링 완료 (2025-10-03)*
