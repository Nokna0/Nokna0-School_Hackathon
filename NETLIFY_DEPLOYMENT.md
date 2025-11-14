# 🚀 Netlify 풀스택 배포 가이드

이 가이드는 EduTech 프로젝트를 **프론트엔드 + 백엔드** 모두 Netlify에 배포하는 방법을 설명합니다.

## 🎯 배포 아키텍처

- **프론트엔드**: React + Vite (정적 파일로 배포)
- **백엔드**: Express + tRPC (Netlify Functions로 배포)
- **데이터베이스**: 외부 MySQL 서비스 (PlanetScale, Railway 등)

---

## 📋 배포 전 준비사항

### 1. Netlify 계정 생성
- https://app.netlify.com/signup 에서 GitHub 계정으로 가입

### 2. 데이터베이스 설정 (선택사항)

데이터를 저장하려면 외부 MySQL 데이터베이스가 필요합니다.

#### 옵션 A: PlanetScale (권장 - 무료)
1. https://planetscale.com/ 에서 계정 생성
2. 새 데이터베이스 생성
3. **Connect** → **Create password** 클릭
4. **Connection string** 복사 (나중에 사용)

#### 옵션 B: Railway (무료)
1. https://railway.app/ 에서 계정 생성
2. **New Project** → **Provision MySQL** 클릭
3. **Variables** 탭에서 `DATABASE_URL` 복사

#### 옵션 C: 데이터베이스 없이 배포
- 데이터베이스 없이도 배포 가능 (학습 기록 저장 기능 제외)
- AI 기능은 정상 작동합니다

### 3. 리포지토리 준비
```bash
git add .
git commit -m "Add Netlify fullstack configuration"
git push origin main
```

---

## 🚀 Netlify 배포 방법

### 방법 1: GitHub 연동 (권장)

#### 1단계: 새 사이트 생성
1. Netlify 대시보드: https://app.netlify.com/
2. **"Add new site"** → **"Import an existing project"** 클릭
3. **"Deploy with GitHub"** 선택
4. GitHub 계정 연결 및 리포지토리 선택: `Nokna0-School_Hackathon`

#### 2단계: 빌드 설정 확인
다음 설정이 자동으로 감지됩니다 (`netlify.toml` 덕분):
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`
- **Node version**: 20

#### 3단계: 환경 변수 설정
**"Site configuration"** → **"Environment variables"**에서 다음 변수 추가:

**필수 환경 변수**:
```
GROQ_API_KEY=your_groq_api_key_here
```

**데이터베이스 사용 시 필수**:
```
DATABASE_URL=mysql://user:password@host:3306/database
```

**선택 환경 변수**:
```
VITE_APP_TITLE=EduTech
VITE_APP_LOGO=/logo.png
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

**파일 업로드 사용 시 (AWS S3)**:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket-name
```

> ⚠️ **중요**:
> - GROQ API 키: https://console.groq.com/ (무료)
> - DATABASE_URL: PlanetScale 또는 Railway에서 복사

#### 4단계: 배포 시작
- **"Deploy site"** 클릭
- 빌드 로그를 확인하며 배포 진행 상황 모니터링
- 배포 완료 후 제공되는 URL로 접속 (예: `https://your-site-name.netlify.app`)

---

### 방법 2: Netlify CLI 배포

#### 1단계: Netlify CLI 설치
```bash
npm install -g netlify-cli
```

#### 2단계: 로그인
```bash
netlify login
```

#### 3단계: 프로젝트 초기화
```bash
netlify init
```

#### 4단계: 환경 변수 설정
```bash
# 필수
netlify env:set GROQ_API_KEY "your_groq_api_key_here"

# 데이터베이스 (선택)
netlify env:set DATABASE_URL "mysql://user:password@host:3306/database"

# 기타 (선택)
netlify env:set VITE_APP_TITLE "EduTech"
```

#### 5단계: 배포
```bash
# 프로덕션 배포
netlify deploy --prod

# 또는 미리보기 배포
netlify deploy
```

---

## 🔧 백엔드 API 구조

### API 엔드포인트
배포 후 백엔드 API는 다음 경로에서 사용 가능합니다:

```
https://your-site-name.netlify.app/api/trpc
```

### 사용 가능한 tRPC 프로시저

1. **health** (쿼리) - 서버 상태 확인
   ```typescript
   trpc.health.useQuery()
   ```

2. **getStudyRecords** (쿼리) - 학습 기록 조회
   ```typescript
   trpc.getStudyRecords.useQuery()
   ```

3. **saveMathFormula** (뮤테이션) - 수학 공식 저장
   ```typescript
   trpc.saveMathFormula.useMutation()
   ```

4. **saveEnglishWord** (뮤테이션) - 영어 단어 저장
   ```typescript
   trpc.saveEnglishWord.useMutation()
   ```

5. **generateQuiz** (뮤테이션) - AI 퀴즈 생성
   ```typescript
   trpc.generateQuiz.useMutation()
   ```

6. **analyzePDF** (뮤테이션) - PDF 분석
   ```typescript
   trpc.analyzePDF.useMutation()
   ```

### 라우터 확장 방법
백엔드 기능을 추가하려면 `server/routers/index.ts`를 수정하세요.

---

## 🗄️ 데이터베이스 마이그레이션

### PlanetScale 사용 시

1. **Drizzle 스키마 푸시**:
```bash
# 로컬에서 실행
DATABASE_URL="your_planetscale_url" npm run db:push
```

2. **Netlify 환경 변수 설정**:
```bash
netlify env:set DATABASE_URL "your_planetscale_url"
```

### Railway 사용 시

동일하게 DATABASE_URL 환경 변수를 설정하면 됩니다.

---

## ✅ 배포 후 확인사항

### 1. 프론트엔드 확인
- [ ] 사이트 접속 가능
- [ ] SPA 라우팅 작동 (새로고침 시에도 페이지 유지)
- [ ] 이미지 및 정적 자산 로드 확인

### 2. 백엔드 확인
- [ ] API 헬스체크: `https://your-site-name.netlify.app/api/health`
- [ ] 브라우저 콘솔에서 API 에러 없는지 확인
- [ ] tRPC 엔드포인트 작동 확인

### 3. 기능 확인
- [ ] PDF 업로드 테스트
- [ ] AI 기능 테스트 (수학 분석, 영어 번역 등)
- [ ] 퀴즈 생성 테스트
- [ ] 학습 기록 저장/불러오기 테스트

---

## 🐛 문제 해결

### 빌드 실패 시

1. **로컬에서 빌드 테스트**:
```bash
npm run build
```

2. **Node 버전 확인**:
```bash
node --version  # v20 이상 필요
```

3. **환경 변수 누락 확인**:
빌드 로그에서 `VITE_*` 관련 에러 확인

### API 호출 실패 시

1. **Netlify Functions 로그 확인**:
   - Netlify 대시보드 → **Functions** 탭
   - 최근 호출 로그 확인

2. **환경 변수 확인**:
```bash
netlify env:list
```

3. **CORS 에러 시**:
   - `server/_core/index.ts`의 CORS 설정 확인
   - Netlify에서는 기본적으로 같은 도메인이므로 CORS 문제 없음

### 404 에러 발생 시

- `netlify.toml`의 리다이렉트 규칙 확인
- API 경로가 `/api/*`로 시작하는지 확인
- SPA 라우팅이 제대로 작동하는지 확인

### 데이터베이스 연결 실패 시

1. **DATABASE_URL 형식 확인**:
```
mysql://username:password@host:port/database
```

2. **데이터베이스 서비스 상태 확인**:
   - PlanetScale: https://app.planetscale.com/
   - Railway: https://railway.app/

3. **IP 화이트리스트 확인**:
   - PlanetScale은 IP 제한 없음
   - 다른 서비스는 Netlify IP 허용 필요

### Functions 타임아웃 시

Netlify Functions는 기본적으로 10초 타임아웃입니다.
- 무료 플랜: 10초
- 유료 플랜: 최대 26초

긴 작업은 비동기로 처리하거나 다른 서비스 사용을 고려하세요.

---

## 🔄 자동 배포 설정

GitHub 연동 시, `main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

### Deploy 브랜치 변경
1. Netlify 대시보드 → **Site configuration** → **Build & deploy**
2. **Branch deploys** 섹션에서 브랜치 설정

### Deploy Preview
Pull Request 생성 시 자동으로 미리보기 배포가 생성됩니다.

---

## 📊 모니터링

### Netlify 대시보드
- **Analytics**: 트래픽 및 성능 확인
- **Functions**: API 호출 로그 확인
- **Deploys**: 배포 기록 및 롤백

### 로그 확인
```bash
# 실시간 Functions 로그
netlify functions:log api

# 빌드 로그
netlify open --site
```

---

## 💰 비용

### Netlify 무료 플랜 제한
- **빌드 시간**: 300분/월
- **대역폭**: 100GB/월
- **Functions 실행**: 125K 요청/월, 100시간 실행/월

### 데이터베이스 무료 플랜
- **PlanetScale**: 5GB 저장소, 1B row reads/월
- **Railway**: $5 크레딧/월 (약 500시간 실행)

대부분의 학교 프로젝트는 무료 플랜으로 충분합니다!

---

## 🎓 추가 기능 구현 가이드

### 1. 새 API 엔드포인트 추가

`server/routers/index.ts`에 새 프로시저 추가:

```typescript
export const appRouter = router({
  // 기존 프로시저...

  // 새 프로시저 추가
  myNewEndpoint: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      // 로직 구현
      return { result: "success" };
    }),
});
```

클라이언트에서 사용:
```typescript
const mutation = trpc.myNewEndpoint.useMutation();
mutation.mutate({ name: "test" });
```

### 2. AI 기능 추가 (Groq API)

```typescript
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### 3. 파일 업로드 처리

Netlify Functions에서는 파일 크기 제한(6MB)이 있습니다.
큰 파일은 클라이언트에서 직접 S3에 업로드하는 것을 권장합니다.

---

## 📚 추가 리소스

- [Netlify 공식 문서](https://docs.netlify.com/)
- [Netlify Functions 가이드](https://docs.netlify.com/functions/overview/)
- [tRPC 공식 문서](https://trpc.io/)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [PlanetScale 가이드](https://planetscale.com/docs)

---

## 🎉 배포 완료!

배포가 성공적으로 완료되면:

1. **URL 확인**: `https://your-site-name.netlify.app`
2. **커스텀 도메인 연결** (선택):
   - Netlify 대시보드 → **Domain management**
3. **팀원들과 공유**하세요!

문제가 발생하면 이 가이드의 **문제 해결** 섹션을 참고하거나,
Netlify 대시보드의 빌드 로그를 확인하세요.

**Happy coding! 🚀**
