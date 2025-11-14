# Code Analysis & Improvement Guide

## Executive Summary

A comprehensive code analysis has identified **30 issues** across security, performance, architecture, and code quality categories. This document prioritizes improvements with actionable solutions.

## Critical Issues (Must Fix)

### 1. Authentication System (CRITICAL)
**Problem**: User ID extracted from untrusted request headers
```typescript
// ❌ UNSAFE
const userId = req?.headers["x-user-id"] as string | undefined;
```

**Solution**: Implement JWT-based authentication
```typescript
// ✅ SECURE
import jwt from 'jsonwebtoken';

const token = req.cookies.session || req.headers.authorization?.replace('Bearer ', '');
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const userId = decoded.userId;
```

---

### 2. XSS Vulnerability (CRITICAL)
**Problem**: Quiz content rendered without sanitization

**Solution**: Use DOMPurify
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

const SafeQuizQuestion = ({ question }: { question: string }) => {
  const sanitized = DOMPurify.sanitize(question);
  return <p dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

---

### 3. File Upload Security (CRITICAL)
**Problem**: 50MB file uploads without validation; PDF bomb risk

**Solution**: Validate file signature and limit size
```typescript
// In server/_core/routes.ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Validate PDF signature
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'));
    }
    cb(null, true);
  },
});
```

---

## High Priority Issues

### 4. Remove Mock Implementations
**Problem**: 8 API endpoints return hardcoded mock data

**Solution**: Implement actual API calls or add feature flags
```typescript
// ✅ Better approach
if (!process.env.OPENAI_API_KEY) {
  logger.warn('OpenAI API not configured; using fallback');
  return { expressions: [] };
}

// Actual implementation
const response = await openai.vision.analyze(imageBase64);
```

---

### 5. Eliminate Code Duplication
**Problem**: StudyPages (Chemistry, English, Math) share 90% code

**Solution**: Create custom hook `usePDFViewer`
```typescript
// hooks/usePDFViewer.ts
export const usePDFViewer = (url: string) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfText, setPdfText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const extractTextFromPDF = useCallback(async () => {
    const pdf = await pdfjsLib.getDocument(url).promise;
    // ... shared logic
  }, [url]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    pdfText,
    canvasRef,
    extractTextFromPDF,
  };
};

// Usage in pages
export default function EnglishStudyPage() {
  const pdfViewer = usePDFViewer(selectedMaterial.fileUrl);
  // ... use pdfViewer properties
}
```

---

### 6. Add Input Validation
**Problem**: API responses not validated before use

**Solution**: Use Zod schemas
```typescript
// lib/schemas.ts
import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['fill-in-the-blank', 'multiple-choice', 'short-answer']),
  question: z.string().min(1),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  explanation: z.string().optional(),
});

export const QuizResponseSchema = z.array(QuizQuestionSchema);

// In component
const response = await fetch('/api/quiz-generate', options);
const data = await response.json();
const validatedQuestions = QuizResponseSchema.parse(data);
```

---

### 7. Add Security Headers
**Problem**: No Content Security Policy, X-Frame-Options, etc.

**Solution**: Use Helmet middleware
```bash
npm install helmet
```

```typescript
// server/_core/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
```

---

### 8. Add Rate Limiting
**Problem**: No protection against brute force or API abuse

**Solution**: Implement express-rate-limit
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

---

## Medium Priority Improvements

### 9. Extract Large Component
**Problem**: MathStudyPage is 613 lines with 10+ responsibilities

**Solution**: Break into smaller components
```
client/src/pages/MathStudyPage/
├── MathStudyPage.tsx (container)
├── components/
│   ├── PDFViewer.tsx
│   ├── SelectionBox.tsx
│   ├── MathAnalysisPanel.tsx
│   ├── QuestionGuidePanel.tsx
│   └── AnswerExplanationPanel.tsx
└── hooks/
    └── useMathAnalysis.ts
```

---

### 10. Add Error Boundaries
**Problem**: Single component crash crashes entire app

**Solution**: Implement Error Boundary
```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Unhandled error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 11. Centralize API Endpoints
**Problem**: API paths hardcoded throughout codebase

**Solution**: Create constants file
```typescript
// lib/api.ts
export const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  UPLOAD: `${API_BASE}/api/upload`,
  MATH_ANALYZE: `${API_BASE}/api/math-analyze`,
  OCR: `${API_BASE}/api/ocr`,
  QUIZ_GENERATE: `${API_BASE}/api/quiz-generate`,
  ENGLISH_ANALYZE: `${API_BASE}/api/english-analyze`,
  ANSWER_EXPLAIN: `${API_BASE}/api/answer-explain`,
  WORD_DEFINITION: `${API_BASE}/api/word-definition`,
  PDF_PROXY: `${API_BASE}/api/pdf-proxy`,
} as const;

// Usage
const response = await fetch(ENDPOINTS.QUIZ_GENERATE, { ... });
```

---

### 12. Improve Error Handling
**Problem**: Missing response status checks

**Solution**: Wrap fetch calls
```typescript
// lib/api.ts
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Usage
try {
  const questions = await apiCall(ENDPOINTS.QUIZ_GENERATE, {
    method: 'POST',
    body: JSON.stringify({ pdfText, subject }),
  });
} catch (error) {
  logger.error('Quiz generation failed', { error });
  toast.error('Failed to generate quiz');
}
```

---

## Low Priority Improvements

### 13. Add Logging Strategy
**Problem**: No centralized logging; debug info lost in production

**Solution**: Implement structured logging
```bash
npm install pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true },
      }
    : undefined,
});

// Usage
logger.info('Quiz generated', { questionCount: 10, userId });
logger.error('Analysis failed', { error: error.message, imageSize });
```

---

### 14. Add Internationalization (i18n)
**Problem**: Error messages in Korean only; no English support

**Solution**: Use react-i18next
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          errors: {
            uploadFailed: 'File upload failed',
            analysisTimeout: 'Analysis took too long',
          },
        },
      },
      ko: {
        translation: {
          errors: {
            uploadFailed: '파일 업로드 실패',
            analysisTimeout: '분석 시간 초과',
          },
        },
      },
    },
  });
```

---

### 15. Add Accessibility Features
**Problem**: Missing ARIA labels, keyboard navigation

**Solution**: Enhance interactive elements
```typescript
<button
  aria-label="Go to next page"
  aria-pressed={currentPage === totalPages}
  disabled={currentPage === totalPages}
  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
  className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
>
  다음 <span className="sr-only">(Next)</span>
</button>
```

---

## Recommended Implementation Timeline

### Week 1 (Critical)
- [ ] Fix authentication system
- [ ] Add input validation with Zod
- [ ] Remove mock data implementations
- [ ] Add security headers (Helmet)

### Week 2 (High Priority)
- [ ] Fix XSS vulnerability
- [ ] Create usePDFViewer hook
- [ ] Add rate limiting
- [ ] Add error boundaries

### Week 3 (Medium Priority)
- [ ] Extract MathStudyPage components
- [ ] Centralize API endpoints
- [ ] Improve error handling
- [ ] Add logging strategy

### Week 4+ (Low Priority)
- [ ] Add i18n support
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Test coverage expansion

---

## Testing Checklist

Before deploying critical fixes:
- [ ] Unit tests for auth flows
- [ ] Integration tests for API endpoints
- [ ] Security testing (OWASP Top 10)
- [ ] Performance testing (Lighthouse)
- [ ] Manual testing of user flows

---

## Resources

- [OWASP Top 10 Web Application Risks](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Questions?

For detailed implementation help on any specific issue, refer to this document's section numbers or create a GitHub issue with the issue number.

**Last Updated**: 2025-11-14
