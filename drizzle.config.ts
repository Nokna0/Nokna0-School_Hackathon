// drizzle.config.ts
// Drizzle Kit 설정 (MySQL + .env 자동 로드)

import "dotenv/config";               // .env 로드
import { defineConfig } from "drizzle-kit";

// 1) 환경변수 읽기
const connectionString = process.env.DATABASE_URL?.trim();

// 2) 필수 값 검증
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required to run drizzle commands. " +
      "예: DATABASE_URL=\"mysql://user:pass@127.0.0.1:3306/dbname\""
  );
}

// 3) 흔한 실수 안내(경고)
try {
  const u = new URL(connectionString);
  if (u.protocol !== "mysql:") {
    console.warn(
      `[drizzle] 경고: DATABASE_URL 프로토콜이 '${u.protocol}' 입니다. MySQL은 'mysql:' 이어야 합니다.`
    );
  }
  if (u.hostname === "localhost") {
    console.warn(
      "[drizzle] 팁: Windows/XAMPP 환경에선 host를 'localhost' 대신 '127.0.0.1'로 쓰면 문제를 줄일 수 있어요."
    );
  }
  if (u.searchParams.has("connection_limit")) {
    console.warn(
      "[drizzle] 경고: 'connection_limit' 쿼리옵션은 Connection에 적용되지 않습니다. URL에서 제거하세요."
    );
  }
} catch {
  console.warn(
    "[drizzle] 경고: DATABASE_URL 파싱에 실패했습니다. URL 형식을 다시 확인하세요."
  );
}

// 4) 최종 Export
export default defineConfig({
  schema: "./drizzle/schema.ts",  // 스키마 경로에 맞게 유지
  out: "./drizzle",               // 마이그레이션 출력 디렉터리
  dialect: "mysql",               // drizzle-kit v0.30+는 'dialect' 필수
  dbCredentials: {
    url: connectionString,        // .env의 DATABASE_URL
  },
});
