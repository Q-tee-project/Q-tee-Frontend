### 📁 프로젝트 구조 이해

```
src/
├── types/
│   ├── english.ts          # 영어 타입 정의
│   ├── korean.ts           # 국어 타입 정의 (참고용)
│   └── math.ts             # 수학 타입 정의 (참고용)
├── services/
│   ├── englishService.ts   # 영어 API 호출
│   ├── koreanService.ts    # 국어 API 호출 (참고용)
│   └── mathService.ts      # 수학 API 호출 (참고용)
├── hooks/
│   ├── useEnglishGeneration.ts  # 영어 문제 생성
│   ├── useEnglishBank.ts        # 영어 문제 관리
│   └── ...
├── components/
│   ├── subjects/
│   │   └── EnglishGenerator.tsx # 영어 문제 생성 컴포넌트
│   └── question/
│       └── EnglishQuestionPreview.tsx # 영어 문제 미리보기
└── app/question/bank/components/
    └── EnglishWorksheetDetail.tsx # 영어 문제지 상세보기
```
