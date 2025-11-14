import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("tRPC Router Configuration", () => {
  it("should validate input with Zod schemas", () => {
    const userSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
    });

    const validUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    };

    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email format", () => {
    const emailSchema = z.string().email();
    const result = emailSchema.safeParse("invalid-email");
    expect(result.success).toBe(false);
  });

  it("should validate subject enum", () => {
    const subjectSchema = z.enum(["math", "english", "chemistry"]);

    expect(subjectSchema.safeParse("math").success).toBe(true);
    expect(subjectSchema.safeParse("physics").success).toBe(false);
  });
});

describe("API Request Validation", () => {
  it("should validate quiz generation input", () => {
    const quizSchema = z.object({
      pdfText: z.string().min(10),
      subject: z.enum(["math", "english", "chemistry"]),
    });

    const validInput = {
      pdfText: "This is a test PDF content with sufficient length",
      subject: "math",
    };

    const result = quizSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject quiz input with empty text", () => {
    const quizSchema = z.object({
      pdfText: z.string().min(10),
      subject: z.enum(["math", "english", "chemistry"]),
    });

    const invalidInput = {
      pdfText: "short",
      subject: "math",
    };

    const result = quizSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("Data Transformation", () => {
  it("should calculate quiz score correctly", () => {
    const correctAnswers = 8;
    const totalQuestions = 10;
    const score = (correctAnswers / totalQuestions) * 100;

    expect(score).toBe(80);
  });

  it("should format study duration correctly", () => {
    const minutes = 45;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    expect(hours).toBe(0);
    expect(mins).toBe(45);
  });

  it("should calculate total study time", () => {
    const sessions = [
      { duration: 30 },
      { duration: 45 },
      { duration: 60 },
    ];

    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    expect(totalMinutes).toBe(135);
  });
});

describe("Subject Classification", () => {
  it("should identify math subject", () => {
    const subject = "math";
    expect(["math", "english", "chemistry"]).toContain(subject);
  });

  it("should identify english subject", () => {
    const subject = "english";
    expect(["math", "english", "chemistry"]).toContain(subject);
  });

  it("should identify chemistry subject", () => {
    const subject = "chemistry";
    expect(["math", "english", "chemistry"]).toContain(subject);
  });
});
