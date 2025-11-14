import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function StudyRecordsPage() {
  const [, setLocation] = useLocation();
  
  const mathFormulasQuery = trpc.studyRecords.getMathFormulas.useQuery();
  const englishWordsQuery = trpc.studyRecords.getEnglishWords.useQuery();
  
  const deleteMathMutation = trpc.studyRecords.deleteMathFormula.useMutation({
    onSuccess: () => {
      mathFormulasQuery.refetch();
    },
  });
  
  const deleteEnglishMutation = trpc.studyRecords.deleteEnglishWord.useMutation({
    onSuccess: () => {
      englishWordsQuery.refetch();
    },
  });

  // 로컬 환경에서는 로그인 체크 불필요

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => setLocation("/")}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">학습 기록</h1>
          <p className="text-gray-600">분석한 수학 공식과 영어 단어를 저장하고 관리하세요.</p>
        </div>

        <Tabs defaultValue="math" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="math">수학 공식</TabsTrigger>
            <TabsTrigger value="english">영어 단어</TabsTrigger>
          </TabsList>

          <TabsContent value="math">
            <div className="space-y-4">
              {mathFormulasQuery.isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500">로딩 중...</p>
                  </CardContent>
                </Card>
              ) : (mathFormulasQuery.data?.length ?? 0) === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500 text-center py-8">
                      저장된 수학 공식이 없습니다.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                mathFormulasQuery.data?.map((formula) => (
                  <Card key={formula.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: formula.color || "#FF6B6B" }}
                            />
                            <CardTitle className="text-lg font-mono">
                              {formula.expression}
                            </CardTitle>
                          </div>
                          {formula.type && (
                            <p className="text-sm text-gray-500 mt-1">
                              유형: {formula.type}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMathMutation.mutate({ id: formula.id })}
                          disabled={deleteMathMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    {formula.description && (
                      <CardContent>
                        <p className="text-gray-700">{formula.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="english">
            <div className="space-y-4">
              {englishWordsQuery.isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500">로딩 중...</p>
                  </CardContent>
                </Card>
              ) : (englishWordsQuery.data?.length ?? 0) === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500 text-center py-8">
                      저장된 영어 단어가 없습니다.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                englishWordsQuery.data?.map((word) => (
                  <Card key={word.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{word.word}</CardTitle>
                          <div className="mt-2 space-y-1">
                            {word.meaning && (
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">뜻:</span> {word.meaning}
                              </p>
                            )}
                            {word.difficulty && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">난이도:</span>{" "}
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    word.difficulty === "easy"
                                      ? "bg-green-100 text-green-800"
                                      : word.difficulty === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {word.difficulty === "easy"
                                    ? "쉬움"
                                    : word.difficulty === "medium"
                                    ? "중간"
                                    : "어려움"}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEnglishMutation.mutate({ id: word.id })}
                          disabled={deleteEnglishMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    {word.definition && (
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">정의:</span> {word.definition}
                        </p>
                      </CardContent>
                    )}
                    {word.example && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 italic">
                          예: {word.example}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
