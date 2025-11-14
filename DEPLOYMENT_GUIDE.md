# 🚀 Netlify + Render.com 배포 가이드

이 가이드는 EduTech 프로젝트를 **Netlify**(프론트엔드)와 **Render.com**(백엔드)에 배포하는 전체 과정을 단계별로 안내합니다.

## 📋 목차

- [배포 아키텍처](#배포-아키텍처)
- [사전 준비사항](#사전-준비사항)
- [1단계: 백엔드 배포 (Render.com)](#1단계-백엔드-배포-rendercom)
- [2단계: 프론트엔드 배포 (Netlify)](#2단계-프론트엔드-배포-netlify)
- [3단계: 배포 검증](#3단계-배포-검증)
- [문제 해결](#문제-해결)

---

## 배포 아키텍처

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│  Netlify CDN    │────────▶│  Render.com      │────────▶│   MySQL     │
│  (Frontend)     │  HTTPS  │  (Backend API)   │         │  Database   │
│                 │         │                  │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
        │                            │
        │                            │
        ▼                            ▼
   React App                    Express + tRPC
   (Static)                     (Node.js)
```

**장점**:
- ✅ 프론트엔드는 Netlify CDN을 통해 빠른 로딩
- ✅ 백엔드는 Render.com의 자동 스케일링 지원
- ✅ 무료 플랜으로 시작 가능
- ✅ 자동 HTTPS 인증서
- ✅ Git push시 자동 배포

---

## 사전 준비사항

### 필수 계정 생성

1. **Render.com 계정**: https://render.com/
2. **Netlify 계정**: https://netlify.com/
3. **GitHub 계정**: https://github.com/ (이미 있음)

### 필수 API 키 발급

#### 1. OpenAI API 키
- https://platform.openai.com/api-keys
- "Create new secret key" 클릭
- 키를 안전한 곳에 복사 (다시 볼 수 없음)

#### 2. Cloudinary 설정 (파일 업로드용)
- Cloudinary 계정: https://cloudinary.com/users/register/free
- 무료 플랜: 25GB 스토리지/월, 25GB 대역폭/월
- 대시보드에서 Cloud Name, API Key, API Secret 확인
- 설정 페이지: https://cloudinary.com/console

### 로컬에서 빌드 테스트

```bash
# 의존성 설치
pnpm install

# 클라이언트 빌드 테스트
npm run build:client

# 서버 빌드 테스트
npm run build:server
```

모든 빌드가 성공하면 배포 준비 완료!

---

## 1단계: 백엔드 배포 (Render.com)

### 1-1. 백엔드 서비스 생성

1. **Render.com 대시보드** 접속: https://dashboard.render.com/
2. **"New +"** → **"Web Service"** 클릭
3. **GitHub 리포지토리 연결**:
   - "Connect account" 클릭하여 GitHub 연결
   - `Nokna0-School_Hackathon` 저장소 선택
   - "Connect" 클릭

### 1-2. 서비스 설정

**Basic Settings**:
- **Name**: `edutech-api` (또는 원하는 이름)
- **Region**: `Oregon (US West)` (또는 가까운 지역)
- **Branch**: `main` (또는 배포할 브랜치)
- **Root Directory**: 비워두기
- **Runtime**: `Node`
- **Build Command**:
  ```
  npm install && npm run build:server
  ```
- **Start Command**:
  ```
  npm start
  ```

**Instance Type**:
- **Free** 선택 (무료 플랜)

### 1-3. 환경 변수 설정

"Environment Variables" 섹션에서 **"Add Environment Variable"** 클릭하여 다음 변수 추가:

#### 필수 환경 변수

```env
# 서버 설정
NODE_ENV=production
PORT=3000

# 데이터베이스 (나중에 설정)
DATABASE_URL=mysql://user:password@host:3306/edutech

# CORS (나중에 Netlify URL로 업데이트)
CORS_ORIGIN=https://your-site.netlify.app

# Cloudinary (파일 스토리지)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# OpenAI API
OPENAI_API_KEY=sk-your_openai_api_key_here

# 클라이언트 설정
VITE_APP_TITLE=EduTech
VITE_APP_ID=your_app_id
VITE_OAUTH_PORTAL_URL=https://oauth.example.com
```

⚠️ **주의**:
- `CORS_ORIGIN`은 2단계에서 Netlify URL을 받은 후 업데이트합니다
- 실제 API 키와 비밀번호로 교체하세요

### 1-4. MySQL 데이터베이스 추가

**옵션 A: Render.com PostgreSQL (무료, 권장)**

Render는 PostgreSQL 무료 플랜을 제공합니다. MySQL 대신 PostgreSQL 사용을 권장합니다:

1. Render 대시보드에서 **"New +"** → **"PostgreSQL"**
2. 설정:
   - Name: `edutech-db`
   - Database: `edutech`
   - User: 자동 생성
   - Region: 백엔드와 동일한 리전
   - Plan: **Free**
3. "Create Database" 클릭
4. 생성된 **Internal Database URL** 복사
5. 백엔드 서비스의 환경 변수 `DATABASE_URL`에 붙여넣기

**옵션 B: 외부 MySQL 서비스**

- **PlanetScale**: https://planetscale.com/ (무료 5GB)
- **Railway**: https://railway.app/ (무료 500MB)

### 1-5. 배포 시작

1. **"Create Web Service"** 클릭
2. 빌드 로그를 확인하며 배포 진행 상황 모니터링
3. 배포 완료 후 **URL 복사**: 예) `https://edutech-api.onrender.com`
4. Health check 확인: `https://edutech-api.onrender.com/health`
   - 응답: `{"status":"ok"}` 확인

⚠️ **중요**: Render 무료 플랜은 15분 동안 요청이 없으면 슬립 모드로 전환됩니다. 첫 요청 시 30-60초 정도 걸릴 수 있습니다.

---

## 2단계: 프론트엔드 배포 (Netlify)

### 2-1. Netlify 사이트 생성

1. **Netlify 대시보드** 접속: https://app.netlify.com/
2. **"Add new site"** → **"Import an existing project"** 클릭
3. **GitHub 연동**:
   - "Deploy with GitHub" 선택
   - GitHub 계정 연결
   - `Nokna0-School_Hackathon` 저장소 선택

### 2-2. 빌드 설정 확인

다음 설정이 자동으로 감지됩니다 (`netlify.toml` 파일 덕분):

- **Build command**: `npm run build:client`
- **Publish directory**: `dist/public`
- **Node version**: 20

설정이 올바르지 않다면 수동으로 입력하세요.

### 2-3. 환경 변수 설정

**"Site configuration"** → **"Environment variables"**에서 다음 변수 추가:

```env
# 백엔드 API URL (1단계에서 받은 Render URL)
VITE_API_URL=https://edutech-api.onrender.com

# 클라이언트 설정
VITE_APP_TITLE=EduTech
VITE_APP_ID=your_app_id
VITE_OAUTH_PORTAL_URL=https://oauth.example.com
```

⚠️ **중요**: `VITE_API_URL`에 1단계에서 받은 Render 백엔드 URL을 정확히 입력하세요.

### 2-4. 배포 시작

1. **"Deploy site"** 클릭
2. 빌드 로그 확인
3. 배포 완료 후 **Netlify URL 확인**: 예) `https://your-site.netlify.app`

### 2-5. CORS 설정 업데이트

프론트엔드 URL을 받았으므로 백엔드 CORS 설정을 업데이트해야 합니다:

1. **Render 대시보드**로 돌아가기
2. `edutech-api` 서비스 선택
3. **"Environment"** 탭
4. `CORS_ORIGIN` 변수를 Netlify URL로 업데이트:
   ```
   CORS_ORIGIN=https://your-site.netlify.app
   ```
5. **"Save Changes"** 클릭
6. 서비스가 자동으로 재배포됩니다

---

## 3단계: 배포 검증

### 3-1. 프론트엔드 확인

1. Netlify URL로 접속: `https://your-site.netlify.app`
2. 페이지가 정상적으로 로드되는지 확인
3. 라우팅 테스트: URL을 직접 입력해도 작동하는지 확인
4. 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인

### 3-2. 백엔드 API 확인

**Health Check**:
```bash
curl https://edutech-api.onrender.com/health
# 응답: {"status":"ok"}
```

**tRPC 연결 확인**:
프론트엔드에서 API 호출 시 브라우저 Network 탭에서:
- `https://edutech-api.onrender.com/trpc/...` 요청 확인
- 상태 코드: 200 OK
- CORS 에러 없음

### 3-3. 기능 테스트

1. **사용자 인증**: 로그인 기능 테스트
2. **PDF 업로드**: 파일 업로드 테스트
3. **학습 기록**: 데이터 저장 및 조회 테스트
4. **AI 기능**: 문제 분석 및 퀴즈 생성 테스트

### 3-4. 데이터베이스 마이그레이션

배포 후 데이터베이스 스키마를 적용해야 합니다:

**로컬에서 Render 데이터베이스로 마이그레이션**:

```bash
# Render에서 받은 DATABASE_URL 사용
DATABASE_URL=<render_database_url> npm run db:push
```

또는 **Render Shell 사용**:

1. Render 대시보드 → 서비스 선택
2. **"Shell"** 탭 클릭
3. 다음 명령 실행:
   ```bash
   npm run db:push
   ```

---

## 🎉 배포 완료!

축하합니다! 이제 프로덕션 환경에서 EduTech 플랫폼이 실행됩니다.

**배포된 URL**:
- **프론트엔드**: `https://your-site.netlify.app`
- **백엔드 API**: `https://edutech-api.onrender.com`
- **Health Check**: `https://edutech-api.onrender.com/health`

---

## 🔄 자동 배포 설정

### GitHub → Render 자동 배포

이미 설정되어 있습니다! `main` 브랜치에 push하면:
1. Render가 자동으로 백엔드 재빌드 및 배포
2. 약 2-5분 소요

### GitHub → Netlify 자동 배포

이미 설정되어 있습니다! `main` 브랜치에 push하면:
1. Netlify가 자동으로 프론트엔드 재빌드 및 배포
2. 약 1-3분 소요

**배포 트리거**:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

---

## 🔧 추가 설정

### 커스텀 도메인 연결

#### Netlify 도메인 설정
1. Netlify 대시보드 → **"Domain settings"**
2. **"Add custom domain"** 클릭
3. 도메인 등록 업체에서 DNS 설정:
   ```
   CNAME: your-domain.com → your-site.netlify.app
   ```

#### Render 도메인 설정
1. Render 대시보드 → 서비스 선택 → **"Settings"**
2. **"Custom Domain"** 섹션에서 도메인 추가
3. DNS 설정:
   ```
   CNAME: api.your-domain.com → edutech-api.onrender.com
   ```

### HTTPS 인증서

Netlify와 Render 모두 **자동으로 Let's Encrypt SSL 인증서**를 제공합니다. 추가 설정 불필요!

### 환경별 설정

**개발 환경** (`.env.local`):
```env
VITE_API_URL=http://localhost:3000
```

**프로덕션 환경** (Netlify):
```env
VITE_API_URL=https://edutech-api.onrender.com
```

---

## 🐛 문제 해결

### 문제 1: CORS 에러

**증상**:
```
Access to fetch at 'https://edutech-api.onrender.com/trpc/...'
from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```

**해결**:
1. Render 대시보드에서 `CORS_ORIGIN` 환경 변수 확인
2. Netlify URL과 정확히 일치하는지 확인 (trailing slash 없이)
3. 백엔드 재배포

### 문제 2: 백엔드 응답 없음 (502/503)

**증상**: API 호출 시 502 Bad Gateway 또는 503 Service Unavailable

**원인**: Render 무료 플랜은 15분 비활동 후 슬립 모드

**해결**:
1. 첫 요청 시 30-60초 대기 (콜드 스타트)
2. Health check로 웜업: `curl https://edutech-api.onrender.com/health`
3. 또는 유료 플랜으로 업그레이드 (항상 온라인)

### 문제 3: 환경 변수가 적용되지 않음

**증상**: `VITE_API_URL`이 undefined

**원인**: Vite는 `VITE_` 접두사가 있는 변수만 클라이언트에 노출

**해결**:
1. 환경 변수 이름이 `VITE_`로 시작하는지 확인
2. Netlify에서 변수 저장 후 **재배포** 필요
3. "Trigger deploy" → "Clear cache and deploy site"

### 문제 4: 빌드 실패

**증상**: Netlify/Render 빌드 로그에 에러

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build:client  # 프론트엔드
npm run build:server  # 백엔드

# TypeScript 에러 확인
npm run check
```

### 문제 5: 데이터베이스 연결 실패

**증상**: 백엔드 로그에 `ECONNREFUSED` 또는 `Access denied`

**해결**:
1. `DATABASE_URL` 환경 변수 형식 확인:
   ```
   mysql://user:password@host:port/database
   ```
2. 데이터베이스 서버가 실행 중인지 확인
3. 방화벽 설정으로 Render IP가 허용되는지 확인

### 문제 6: PDF 업로드 실패

**증상**: 파일 업로드 시 에러

**해결**:
1. Cloudinary 환경 변수 확인 (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
2. Cloudinary 계정 상태 확인 (무료 플랜 한도 초과 여부)
3. 업로드 폴더 권한 확인 (Cloudinary 대시보드 → Settings → Upload)

---

## 📊 모니터링 및 로그

### Render 로그 확인

1. Render 대시보드 → 서비스 선택
2. **"Logs"** 탭
3. 실시간 로그 스트리밍 확인

### Netlify 배포 로그

1. Netlify 대시보드 → 사이트 선택
2. **"Deploys"** 탭
3. 최근 배포 클릭 → 빌드 로그 확인

### 브라우저 개발자 도구

- **Console**: JavaScript 에러
- **Network**: API 요청/응답
- **Application**: LocalStorage, Cookies

---

## 💰 비용 및 제한

### Netlify 무료 플랜
- ✅ 대역폭: 100GB/월
- ✅ 빌드 시간: 300분/월
- ✅ 동시 빌드: 1개
- ✅ HTTPS/CDN 포함

### Render 무료 플랜
- ✅ 750시간/월 (한 달 내내 실행 가능)
- ⚠️ 15분 비활동 후 슬립 (콜드 스타트 30초)
- ✅ 자동 배포
- ✅ HTTPS 포함
- ⚠️ 공유 CPU/메모리

### PostgreSQL 무료 플랜 (Render)
- ✅ 1GB 스토리지
- ✅ 90일 후 만료 (연장 가능)
- ✅ 자동 백업 없음

---

## 📚 추가 리소스

- [Render 공식 문서](https://render.com/docs)
- [Netlify 공식 문서](https://docs.netlify.com/)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [tRPC 배포 가이드](https://trpc.io/docs/deploy)

---

## ✅ 최종 체크리스트

### 배포 전
- [ ] 로컬에서 빌드 성공 (`npm run build:client`, `npm run build:server`)
- [ ] 모든 환경 변수 준비 (API 키, 데이터베이스 URL 등)
- [ ] GitHub에 최신 코드 push
- [ ] Render 계정 생성
- [ ] Netlify 계정 생성

### Render 배포 (백엔드)
- [ ] 웹 서비스 생성 및 GitHub 연동
- [ ] 빌드 명령어 설정
- [ ] 모든 환경 변수 추가
- [ ] 데이터베이스 생성 및 연결
- [ ] Health check 확인 (`/health`)
- [ ] 배포 URL 복사

### Netlify 배포 (프론트엔드)
- [ ] 사이트 생성 및 GitHub 연동
- [ ] 빌드 설정 확인
- [ ] `VITE_API_URL` 환경 변수 추가 (Render URL)
- [ ] 배포 완료 확인
- [ ] Netlify URL 복사

### 최종 검증
- [ ] Render에서 `CORS_ORIGIN`을 Netlify URL로 업데이트
- [ ] 프론트엔드 접속 확인
- [ ] API 연결 확인 (Network 탭)
- [ ] 주요 기능 테스트 (로그인, 업로드, 조회)
- [ ] 데이터베이스 마이그레이션 실행

---

**배포 완료!** 🎉

이제 전 세계 어디서나 EduTech 플랫폼에 접속할 수 있습니다.

궁금한 점이 있으면 [GitHub Issues](https://github.com/Nokna0/Nokna0-School_Hackathon/issues)에 문의하세요.
