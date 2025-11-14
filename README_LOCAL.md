# EduTech - 로컬 Windows 개발 환경 가이드

이 가이드는 **Windows에서 Visual Studio Code**로 EduTech를 실행하는 방법을 설명합니다.

## ✅ 필수 프로그램 설치

### 1. Node.js 설치
- https://nodejs.org/ 에서 **LTS 버전** 다운로드 및 설치
- 설치 후 터미널에서 확인:
  ```bash
  node --version
  npm --version
  ```

### 2. Visual Studio Code 설치
- https://code.visualstudio.com/ 에서 다운로드 및 설치

## 🚀 프로젝트 실행 (3단계)

### 1단계: 프로젝트 폴더 열기
1. VS Code 실행
2. `File` → `Open Folder` → `EduTech` 폴더 선택
3. 터미널 열기: `Ctrl + ~` (또는 `View` → `Terminal`)

### 2단계: 의존성 설치
```bash
npm install
```

### 3단계: 개발 서버 실행
```bash
npm run dev
```

### 4단계: 브라우저에서 접속
- 자동으로 브라우저가 열립니다
- 또는 `http://localhost:5173` 으로 접속

## 📚 주요 기능

### 과목 선택
홈페이지에서 **영어**, **수학**, **화학** 중 선택

### PDF 파일 업로드
각 과목 페이지에서 "PDF 업로드" 버튼으로 학습 자료 업로드

### 학습 기능
- **수학**: 함수식 자동 인식 및 동적 그래프 시각화
- **영어**: AI 기반 어려운 단어 자동 감지 및 번역
- **화학**: 교재 분석 및 학습

### 백지 퀴즈
각 과목에서 "퀴즈 생성" 버튼으로 AI 기반 퀴즈 자동 생성

### 학습 기록
상단 네비게이션에서 "학습 기록" 링크로 이동하여 분석한 수학 공식과 영어 단어 관리

## 🔧 문제 해결

### npm install 오류
```bash
# 캐시 초기화 후 재설치
npm cache clean --force
npm install
```

### 포트 5173이 이미 사용 중
```bash
# 다른 포트에서 실행
npm run dev -- --port 3000
```

### 데이터베이스 오류
```bash
# 데이터베이스 초기화
npm run db:push
```

### PDF 파일이 표시되지 않음
- 브라우저 콘솔(F12)에서 에러 확인
- PDF 파일 크기가 너무 크면 업로드 실패 가능 (10MB 이하 권장)

## ⚙️ 환경 변수

`.env.local` 파일이 프로젝트에 포함되어 있습니다.

**Groq API 키 설정 (무료 AI) - 필수!**

⚠️ **중요**: 로컬 환경에서 AI 기능을 사용하려면 Groq API 키가 필요합니다.

1. https://console.groq.com/ 에서 무료 계정 생성
2. API Keys 메뉴에서 "Create API Key" 클릭
3. 생성된 API 키 복사
4. `.env.local` 파일을 텍스트 편집기로 열기
5. `GROQ_API_KEY` 값을 발급받은 키로 변경

```env
# 예시 (실제 키로 교체하세요)
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**현재 설정된 키**: `.env.local` 파일에 이미 테스트용 키가 포함되어 있지만, **자신의 API 키로 교체하는 것을 권장**합니다.

**API 호출 확인 방법**:
- Groq 콘솔: https://console.groq.com/usage
- 사용량이 0이면 API 키가 잘못 설정된 것입니다

## 📦 추가 명령어

```bash
# TypeScript 타입 체크
npm run type-check

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🎯 주요 특징

- ✅ **인증 없이 작동** - 로그인 불필요
- ✅ **무료 AI 사용** - Groq API (무료)
- ✅ **로컬 데이터베이스** - MySQL (서버에 저장)
- ✅ **PDF 뷰어** - 굿노트 스타일
- ✅ **AI 분석** - 수학 함수, 영어 단어 자동 인식
- ✅ **퀴즈 생성** - AI 기반 백지 퀴즈

## 💡 사용 팁

1. **PDF 업로드**: 10MB 이하 파일 권장
2. **수학 페이지**: 드래그로 영역 선택 후 분석
3. **영어 페이지**: 자동으로 어려운 단어 하이라이트
4. **퀴즈**: 각 과목에서 "퀴즈 생성" 버튼 클릭

## 🆘 지원

문제가 발생하면:
1. 터미널의 에러 메시지 확인
2. 브라우저 콘솔(F12) 확인
3. 개발 서버 재시작: `Ctrl + C` → `npm run dev`

---

**개발 환경**: Windows 10/11, Node.js 18+, VS Code
**브라우저**: Chrome, Edge, Firefox (최신 버전)
