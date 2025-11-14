import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface HighlightedWord {
  word: string;
  startIndex: number;
  endIndex: number;
  difficulty: "easy" | "medium" | "hard";
  koreanMeaning: string;
  englishDefinition: string;
}

interface EnglishHighlighterProps {
  text: string;
  highlightedWords: HighlightedWord[];
}

export default function EnglishHighlighter({
  text,
  highlightedWords,
}: EnglishHighlighterProps) {
  const [selectedWord, setSelectedWord] = useState<HighlightedWord | null>(null);
  const [wordDetails, setWordDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-yellow-100 text-yellow-900";
      case "medium":
        return "bg-orange-100 text-orange-900";
      case "hard":
        return "bg-red-100 text-red-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "쉬움";
      case "medium":
        return "중간";
      case "hard":
        return "어려움";
      default:
        return "불명";
    }
  };

  const handleWordClick = async (word: HighlightedWord) => {
    setSelectedWord(word);
    setLoadingDetails(true);

    try {
      const response = await fetch(`/api/word-definition?word=${encodeURIComponent(word.word)}`);
      if (response.ok) {
        const data = await response.json();
        setWordDetails(data);
      }
    } catch (error) {
      console.error("Error fetching word details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Build highlighted text
  const renderHighlightedText = () => {
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort highlighted words by start index
    const sortedWords = [...highlightedWords].sort((a, b) => a.startIndex - b.startIndex);

    sortedWords.forEach((word) => {
      // Add text before the highlighted word
      if (lastIndex < word.startIndex) {
        segments.push(text.substring(lastIndex, word.startIndex));
      }

      // Add the highlighted word
      segments.push(
        <span
          key={`${word.startIndex}-${word.endIndex}`}
          onClick={() => handleWordClick(word)}
          className="bg-blue-200 text-blue-900 cursor-pointer hover:bg-blue-300 transition-colors rounded px-1"
          title={`${word.koreanMeaning}`}
        >
          {text.substring(word.startIndex, word.endIndex)}
        </span>
      );

      lastIndex = word.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push(text.substring(lastIndex));
    }

    return segments;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>📚 영어 텍스트 학습</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {highlightedWords.length}
              </div>
              <div className="text-sm text-gray-600">어려운 단어</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {highlightedWords.filter((w) => w.difficulty === "hard").length}
              </div>
              <div className="text-sm text-gray-600">매우 어려운</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {highlightedWords.filter((w) => w.difficulty === "medium").length}
              </div>
              <div className="text-sm text-gray-600">중간 난이도</div>
            </div>
          </div>

          {/* Highlighted Text */}
          <div className="bg-white border rounded-lg p-6 text-lg leading-relaxed">
            {renderHighlightedText()}
          </div>

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-900 rounded"></div>
              <span className="text-sm">쉬운 단어</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-900 rounded"></div>
              <span className="text-sm">중간 난이도</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-900 rounded"></div>
              <span className="text-sm">어려운 단어</span>
            </div>
          </div>

          {/* Word List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">어려운 단어 목록</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {highlightedWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  className={`text-left p-3 rounded-lg transition-colors ${getDifficultyColor(
                    word.difficulty
                  )} hover:shadow-md`}
                >
                  <div className="font-semibold">{word.word}</div>
                  <div className="text-sm">{word.koreanMeaning}</div>
                  <Badge className="mt-1" variant="outline">
                    {getDifficultyLabel(word.difficulty)}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Details Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedWord?.word}</DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin">⏳</div>
              <p className="mt-2 text-gray-600">정보를 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Difficulty Badge */}
              <div>
                <Badge className={getDifficultyColor(selectedWord?.difficulty || "")}>
                  {getDifficultyLabel(selectedWord?.difficulty || "")}
                </Badge>
              </div>

              {/* Korean Meaning */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">한국어 뜻</h3>
                <p className="text-gray-700">{selectedWord?.koreanMeaning}</p>
              </div>

              {/* English Definition */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">영어 정의</h3>
                <p className="text-gray-700">{selectedWord?.englishDefinition}</p>
              </div>

              {/* Additional Details */}
              {wordDetails && (
                <>
                  {wordDetails.pronunciation && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">발음</h3>
                      <p className="text-gray-700">{wordDetails.pronunciation}</p>
                    </div>
                  )}

                  {wordDetails.partOfSpeech && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">품사</h3>
                      <p className="text-gray-700">{wordDetails.partOfSpeech}</p>
                    </div>
                  )}

                  {wordDetails.examples && wordDetails.examples.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">예문</h3>
                      <ul className="space-y-2">
                        {wordDetails.examples.map((example: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 italic">
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
