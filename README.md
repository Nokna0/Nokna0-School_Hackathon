# Nokna0-School_Hackathon

🎓 **AI-Powered Educational Learning Platform** - 다양한 과목의 학습 자료를 분석하고 개인화된 퀴즈를 생성하는 교육용 플랫폼

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [기능](#기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [환경 변수 설정](#환경-변수-설정)
- [API 엔드포인트](#api-엔드포인트)
- [개발 가이드](#개발-가이드)
- [문제 해결](#문제-해결)

## 프로젝트 개요

이 프로젝트는 학생들이 PDF 형식의 학습 자료를 업로드하고, AI를 활용하여 자동으로 분석 및 처리할 수 있는 교육 플랫폼입니다.

### 주요 특징

- 📄 **PDF 분석**: PDF 파일의 텍스트 및 이미지 인식
- 🧮 **수학 문제 분석**: 수식 추출 및 그래프 시각화
- 📚 **영어 학습**: 단어 분석 및 정의 제공
- 🔬 **과학 학습**: 화학 개념 학습 및 퀴즈 생성
- ✅ **자동 퀴즈 생성**: 학습 자료 기반 백지식 퀴즈 생성
- 📊 **학습 기록**: 학습 진도 및 성적 추적

## 기능

### 현재 구현된 기능

- ✅ 사용자 인증 시스템 (OAuth 연동)
- ✅ PDF 파일 업로드 및 관리
- ✅ 다중 과목 지원 (영어, 수학, 화학)
- ✅ PDF 페이지 네비게이션
- ✅ tRPC를 통한 타입 안전 API

### 개발 예정 기능

- ⏳ AI 기반 이미지 분석 (OpenAI Vision)
- ⏳ OCR 텍스트 인식
- ⏳ 자동 퀴즈 생성
- ⏳ 학습 기록 저장 및 분석
- ⏳ 맞춤형 학습 추천

## 기술 스택

### Frontend

| 기술 | 용도 |
|------|------|
| React 19 | UI 프레임워크 |
| TypeScript | 정적 타입 지정 |
| Vite | 빌드 도구 |
| Tailwind CSS | 스타일링 |
| tRPC | 타입 안전 API 클라이언트 |
| React Query | 서버 상태 관리 |
| Wouter | 라우팅 |
| Radix UI | UI 컴포넌트 |
| PDF.js | PDF 렌더링 |

### Backend

| 기술 | 용도 |
|------|------|
| Express.js | HTTP 서버 프레임워크 |
| Node.js | JavaScript 런타임 |
| tRPC | 타입 안전 RPC |
| TypeScript | 정적 타입 지정 |
| Zod | 데이터 검증 |

### DevTools

| 기술 | 용도 |
|------|------|
| Vitest | 단위 테스트 |
| ESBuild | 번들링 |
| Prettier | 코드 포맷팅 |
| Drizzle ORM | 데이터베이스 접근 |

## 프로젝트 구조

```
Nokna0-School_Hackathon/
├── client/                          # 프론트엔드 (React)
│   ├── src/
│   │   ├── _core/
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   │   └── useAuth.ts      # 인증 관련 hook
│   │   │   └── providers/          # Context providers
│   │   ├── components/             # React 컴포넌트
│   │   │   ├── BlankQuiz.tsx       # 퀴즈 컴포넌트
│   │   │   ├── EnglishHighlighter.tsx
│   │   │   ├── MathVisualizer.tsx
│   │   │   └── ...
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   │   ├── StudyPage.tsx
│   │   │   ├── EnglishStudyPage.tsx
│   │   │   ├── MathStudyPage.tsx
│   │   │   ├── ChemistryStudyPage.tsx
│   │   │   └── StudyRecordsPage.tsx
│   │   ├── lib/
│   │   │   ├── trpc.ts            # tRPC 클라이언트 설정
│   │   │   └── storage.ts         # 스토리지 유틸리티
│   │   ├── const.ts               # 상수 정의
│   │   └── main.tsx
│   └── public/
├── server/                          # 백엔드 (Express + tRPC)
│   ├── _core/
│   │   ├── index.ts               # 서버 진입점
│   │   ├── context.ts             # tRPC 컨텍스트
│   │   └── trpc.ts                # tRPC 설정
│   └── routers/
│       ├── index.ts               # 메인 라우터
│       ├── auth.ts                # 인증 라우터
│       ├── materials.ts           # 자료 관리 라우터
│       ├── mathAssist.ts          # 수학 보조 라우터
│       └── studyRecords.ts        # 학습 기록 라우터
├── shared/                          # 클라이언트-서버 공유 코드
│   └── const.ts                   # 공유 상수
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 설치 및 실행

### 필수 요구사항

- Node.js 18+
- pnpm 10+

### 1. 저장소 복제

```bash
git clone https://github.com/Nokna0/Nokna0-School_Hackathon.git
cd Nokna0-School_Hackathon
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 필요한 값들을 설정하세요. (아래의 [환경 변수 설정](#환경-변수-설정) 참조)

### 4. 개발 서버 실행

**터미널 1 - 백엔드 서버:**
```bash
pnpm dev
```

**터미널 2 - 프론트엔드 서버:**
```bash
cd client
pnpm dev
```

서버는 `http://localhost:3000`에서 실행됩니다.

### 5. 빌드

```bash
pnpm build
```

### 6. 프로덕션 실행

```bash
pnpm start
```

## 환경 변수 설정

### `.env.local` 파일 생성

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Client Configuration
VITE_APP_TITLE=EduTech
VITE_APP_ID=your_app_id
VITE_OAUTH_PORTAL_URL=https://oauth.example.com

# Database
DATABASE_URL=mysql://user:password@localhost:3306/edutech

# Cloudinary (파일 업로드용)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI API (AI 분석용)
OPENAI_API_KEY=your_openai_api_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

## API 엔드포인트

### tRPC 라우터

#### `auth` 라우터

```typescript
// 현재 사용자 정보 조회
trpc.auth.me.useQuery()

// 로그아웃
trpc.auth.logout.useMutation()
```

#### `materials` 라우터

```typescript
// 학습 자료 목록 조회
trpc.materials.list.useQuery({ subject: 'math' })

// 학습 자료 업로드
trpc.materials.upload.useMutation({
  subject: 'math',
  fileName: 'example.pdf',
  fileUrl: 's3://...',
  fileKey: 'key'
})
```

#### `mathAssist` 라우터

```typescript
// 문제 접근 가이드
trpc.mathAssist.questionHelp.useMutation({
  text: '문제 텍스트'
})
```

#### `studyRecords` 라우터

```typescript
// 학습 기록 목록
trpc.studyRecords.list.useQuery()

// 학습 기록 생성
trpc.studyRecords.create.useMutation({
  subject: 'math',
  duration: 45,
  score: 85
})

// 학습 통계
trpc.studyRecords.getStats.useQuery()
```

### REST API 엔드포인트

다음 엔드포인트는 구현 예정입니다:

| Method | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/upload` | 파일 업로드 |
| POST | `/api/math-analyze` | 수학 이미지 분석 |
| POST | `/api/ocr` | 텍스트 인식 |
| POST | `/api/quiz-generate` | 퀴즈 자동 생성 |
| POST | `/api/english-analyze` | 영어 텍스트 분석 |
| POST | `/api/answer-explain` | 답지 설명 생성 |
| GET | `/api/word-definition` | 단어 정의 조회 |
| GET | `/api/pdf-proxy` | PDF 프록시 |

## 개발 가이드

### 컴포넌트 개발

새로운 컴포넌트를 만들 때는 다음 패턴을 따르세요:

```typescript
import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Card>
      <h2>{title}</h2>
      {/* 컴포넌트 내용 */}
    </Card>
  );
};
```

### tRPC 라우터 추가

새로운 라우터를 추가하려면:

```typescript
// server/routers/myRouter.ts
import { router, publicProcedure } from "../_core/trpc.js";
import { z } from "zod";

export const myRouter = router({
  getData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // 로직 구현
      return { data: 'example' };
    }),
});

// server/routers/index.ts에 추가
export const appRouter = router({
  // ... 기존 라우터
  my: myRouter,
});
```

### 테스트 작성

```bash
pnpm test
```

Vitest를 사용하여 단위 테스트를 작성하세요:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    expect(true).toBe(true);
  });
});
```

### 코드 포맷팅

```bash
pnpm format
```

Prettier로 코드를 자동 포맷합니다.

### 타입 체크

```bash
pnpm check
```

TypeScript 타입을 검사합니다.

## 문제 해결

### Q: "Module not found" 에러가 발생합니다.

**A:** `tsconfig.json`의 경로 매핑을 확인하세요:

```json
"paths": {
  "@/*": ["./client/src/*"],
  "@shared/*": ["./shared/*"]
}
```

### Q: PDF가 렌더링되지 않습니다.

**A:** PDF.js worker가 정상적으로 설정되었는지 확인하세요:

```typescript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### Q: tRPC 라우터에 접근할 수 없습니다.

**A:** 라우터가 `server/routers/index.ts`의 `appRouter`에 추가되었는지 확인하세요.

### Q: 환경 변수가 로드되지 않습니다.

**A:** `.env.local` 파일이 프로젝트 루트에 있는지 확인하고, 개발 서버를 재시작하세요.

## 기여 가이드

버그 리포트나 기능 제안은 [GitHub Issues](https://github.com/Nokna0/Nokna0-School_Hackathon/issues)에서 해주세요.

## 라이선스

MIT License - [LICENSE](./LICENSE) 파일 참조

## 연락처

- GitHub: [@Nokna0](https://github.com/Nokna0)
- Email: your.email@example.com

---

**마지막 업데이트**: 2025년 11월 14일
