# 🚀 Netlify 배포 가이드

이 가이드는 EduTech 프로젝트를 Netlify에 배포하는 방법을 설명합니다.

## 📋 배포 전 준비사항

### 1. Netlify 계정 생성
- https://app.netlify.com/signup 에서 GitHub 계정으로 가입

### 2. 리포지토리 준비
- 모든 변경사항을 GitHub에 푸시
```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

## 🎯 Netlify 배포 방법

### 방법 1: GitHub 연동 (권장)

#### 1단계: 새 사이트 생성
1. Netlify 대시보드에서 **"Add new site"** → **"Import an existing project"** 클릭
2. **"Deploy with GitHub"** 선택
3. GitHub 계정 연결 및 리포지토리 선택: `Nokna0-School_Hackathon`

#### 2단계: 빌드 설정 확인
다음 설정이 자동으로 감지됩니다 (`netlify.toml` 덕분):
- **Build command**: `npm run build:client`
- **Publish directory**: `dist/public`
- **Node version**: 20

#### 3단계: 환경 변수 설정
**"Site configuration"** → **"Environment variables"**에서 다음 변수 추가:

**필수 환경 변수**:
```
GROQ_API_KEY=your_groq_api_key_here
```

**선택 환경 변수**:
```
VITE_APP_TITLE=EduTech
VITE_APP_LOGO=/logo.png
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

> ⚠️ **중요**: GROQ API 키는 https://console.groq.com/ 에서 발급받으세요 (무료)

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
netlify env:set GROQ_API_KEY "your_groq_api_key_here"
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

## ⚠️ 중요: 백엔드 기능 제한

현재 프로젝트는 Express 서버와 MySQL 데이터베이스를 사용하는 풀스택 애플리케이션입니다.
**Netlify에 프론트엔드만 배포하는 경우, 다음 기능들이 작동하지 않습니다**:

### 작동하지 않는 기능:
- ❌ 학습 기록 저장/불러오기 (MySQL 데이터베이스)
- ❌ PDF 파일 업로드 (서버 저장소/S3)
- ❌ AI API 호출 (서버에서 Groq API 호출)
- ❌ tRPC API 엔드포인트

### 해결 방법:

#### 옵션 1: 백엔드를 별도 서비스에 배포 (권장)

**Render, Railway, Fly.io 등에 백엔드 배포**:
1. 백엔드를 별도로 배포 (예: Render.com - 무료)
2. 환경 변수로 API URL 설정:
```
VITE_API_URL=https://your-backend.onrender.com
```

**Render 배포 예시**:
```bash
# render.yaml 생성
services:
  - type: web
    name: edutech-api
    env: node
    buildCommand: npm run build:server
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: edutech-db
          property: connectionString
```

#### 옵션 2: Netlify Functions 사용

Netlify Functions로 서버리스 API 구현 (복잡함, 별도 마이그레이션 필요)

#### 옵션 3: 전체를 Vercel에 배포

Vercel은 풀스택 애플리케이션을 기본 지원합니다:
- https://vercel.com/
- `vercel` CLI로 한 번에 배포 가능

---

## 🔧 배포 후 설정

### 커스텀 도메인 연결 (선택)
1. Netlify 대시보드 → **"Domain settings"**
2. **"Add custom domain"** 클릭
3. 도메인 등록 업체에서 DNS 설정

### HTTPS 자동 활성화
Netlify는 자동으로 Let's Encrypt SSL 인증서를 제공합니다.

### 자동 배포 설정
GitHub 연동 시, `main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

---

## 📊 배포 상태 확인

### 빌드 로그 확인
```bash
netlify open --site
```

### 환경 변수 확인
```bash
netlify env:list
```

### 배포 기록 확인
Netlify 대시보드 → **"Deploys"** 탭

---

## 🐛 문제 해결

### 빌드 실패 시
1. **로컬에서 빌드 테스트**:
```bash
npm run build:client
```

2. **Node 버전 확인**:
```bash
node --version  # v20 이상 필요
```

3. **환경 변수 누락 확인**:
빌드 로그에서 `VITE_*` 관련 에러 확인

### 404 에러 발생 시
- `netlify.toml`과 `_redirects` 파일이 올바르게 설정되어 있는지 확인
- SPA 라우팅이 제대로 작동하는지 확인

### 환경 변수가 적용되지 않을 때
- Netlify 대시보드에서 환경 변수 재확인
- 변수 이름이 `VITE_`로 시작하는지 확인 (Vite 빌드 시 필요)
- 재배포 트리거: **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 📚 추가 리소스

- [Netlify 공식 문서](https://docs.netlify.com/)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [Netlify Functions 가이드](https://docs.netlify.com/functions/overview/)

---

## ✅ 체크리스트

배포 전 확인사항:
- [ ] GitHub에 모든 변경사항 푸시 완료
- [ ] `netlify.toml` 파일 존재
- [ ] `client/public/_redirects` 파일 존재
- [ ] Groq API 키 발급 완료
- [ ] Netlify 계정 생성 완료
- [ ] 백엔드 배포 방법 결정 (선택)

배포 후 확인사항:
- [ ] 사이트 접속 확인
- [ ] SPA 라우팅 작동 확인 (새로고침 시에도 페이지 유지)
- [ ] 환경 변수 적용 확인
- [ ] 이미지 및 정적 자산 로드 확인

---

**배포 성공 시 URL**: `https://your-site-name.netlify.app`

🎉 배포 완료 후 팀원들과 공유하세요!
