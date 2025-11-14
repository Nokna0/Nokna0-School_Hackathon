import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar 
} from "drizzle-orm/mysql-core";

/**
 * Users table
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Study materials (문제 PDF + 답지 PDF)
 */
export const studyMaterials = mysqlTable("study_materials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: mysqlEnum("subject", ["english", "math", "chemistry"]).notNull(),

  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileMimeType: varchar("fileMimeType", { length: 100 }).default("application/pdf"),
  fileSize: int("fileSize"),

  // ⭐⭐ 새로 추가된 답지 컬럼 (S3 key + URL)
  answerFileKey: varchar("answerFileKey", { length: 512 }),
  answerFileUrl: text("answerFileUrl"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type InsertStudyMaterial = typeof studyMaterials.$inferInsert;

/**
 * Quiz table
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  materialId: int("materialId").notNull(),
  userId: int("userId").notNull(),
  subject: mysqlEnum("subject", ["english", "math", "chemistry"]).notNull(),
  quizData: text("quizData").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Learning history
 */
export const learningHistory = mysqlTable("learning_history", {
  id: int("id").autoincrement().primaryKey(),   // ← ★ autoincrement 수정됨
  userId: int("userId").notNull(),
  materialId: int("materialId").notNull(),
  subject: mysqlEnum("subject", ["english", "math", "chemistry"]).notNull(),
  timeSpent: int("timeSpent").default(0),
  lastAccessedPage: int("lastAccessedPage").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningHistory = typeof learningHistory.$inferSelect;
export type InsertLearningHistory = typeof learningHistory.$inferInsert;

/**
 * Math formulas
 */
export const mathFormulas = mysqlTable("math_formulas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expression: varchar("expression", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }),
  description: text("description"),
  color: varchar("color", { length: 50 }).default("#FF6B6B"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MathFormula = typeof mathFormulas.$inferSelect;
export type InsertMathFormula = typeof mathFormulas.$inferInsert;

/**
 * English words
 */
export const englishWords = mysqlTable("english_words", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  word: varchar("word", { length: 255 }).notNull(),
  meaning: text("meaning"),
  definition: text("definition"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  example: text("example"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EnglishWord = typeof englishWords.$inferSelect;
export type InsertEnglishWord = typeof englishWords.$inferInsert;
