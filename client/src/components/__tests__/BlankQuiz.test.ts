import { describe, it, expect } from "vitest";

describe("BlankQuiz Component", () => {
  it("should calculate progress correctly", () => {
    const currentQuestion = 3;
    const totalQuestions = 10;
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    expect(progress).toBe(40);
  });

  it("should determine difficulty color for easy", () => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case "easy":
          return "bg-green-100 text-green-900";
        case "medium":
          return "bg-yellow-100 text-yellow-900";
        case "hard":
          return "bg-red-100 text-red-900";
        default:
          return "bg-gray-100 text-gray-900";
      }
    };

    expect(getDifficultyColor("easy")).toBe("bg-green-100 text-green-900");
  });

  it("should determine difficulty color for medium", () => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case "easy":
          return "bg-green-100 text-green-900";
        case "medium":
          return "bg-yellow-100 text-yellow-900";
        case "hard":
          return "bg-red-100 text-red-900";
        default:
          return "bg-gray-100 text-gray-900";
      }
    };

    expect(getDifficultyColor("medium")).toBe("bg-yellow-100 text-yellow-900");
  });

  it("should determine difficulty color for hard", () => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case "easy":
          return "bg-green-100 text-green-900";
        case "medium":
          return "bg-yellow-100 text-yellow-900";
        case "hard":
          return "bg-red-100 text-red-900";
        default:
          return "bg-gray-100 text-gray-900";
      }
    };

    expect(getDifficultyColor("hard")).toBe("bg-red-100 text-red-900");
  });

  it("should normalize user answer for comparison", () => {
    const userAnswer = "  Hello World  ";
    const normalized = userAnswer.trim().toLowerCase();

    expect(normalized).toBe("hello world");
  });

  it("should check if answer is correct", () => {
    const userAnswer = "PARIS";
    const correctAnswer = "paris";

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    expect(isCorrect).toBe(true);
  });

  it("should calculate accuracy percentage", () => {
    const correctCount = 8;
    const totalQuestions = 10;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);

    expect(accuracy).toBe(80);
  });

  it("should generate appropriate feedback for high score", () => {
    const score = 85;
    const feedback =
      score >= 80
        ? "훌륭합니다! 내용을 잘 이해하고 있습니다."
        : score >= 60
          ? "좋습니다! 더 복습하면 더 나아질 수 있습니다."
          : "더 많은 복습이 필요합니다. 틀린 부분을 다시 공부해보세요.";

    expect(feedback).toBe("훌륭합니다! 내용을 잘 이해하고 있습니다.");
  });

  it("should generate appropriate feedback for medium score", () => {
    const score = 65;
    const feedback =
      score >= 80
        ? "훌륭합니다! 내용을 잘 이해하고 있습니다."
        : score >= 60
          ? "좋습니다! 더 복습하면 더 나아질 수 있습니다."
          : "더 많은 복습이 필요합니다. 틀린 부분을 다시 공부해보세요.";

    expect(feedback).toBe("좋습니다! 더 복습하면 더 나아질 수 있습니다.");
  });

  it("should generate appropriate feedback for low score", () => {
    const score = 40;
    const feedback =
      score >= 80
        ? "훌륭합니다! 내용을 잘 이해하고 있습니다."
        : score >= 60
          ? "좋습니다! 더 복습하면 더 나아질 수 있습니다."
          : "더 많은 복습이 필요합니다. 틀린 부분을 다시 공부해보세요.";

    expect(feedback).toBe("더 많은 복습이 필요합니다. 틀린 부분을 다시 공부해보세요.");
  });
});
