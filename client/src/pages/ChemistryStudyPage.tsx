// useAuth 제거 - 로컬 환경에서는 인증 불필요
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Zap } from "lucide-react";
import { Link } from "wouter";
import * as pdfjsLib from "pdfjs-dist";
import BlankQuiz from "@/components/BlankQuiz";
import { useState, useEffect, useRef } from "react";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface StudyMaterial {
  id: number;
  fileName: string;
  fileUrl: string;
  subject: string;
  createdAt: Date;
}

interface QuizQuestion {
  id: string;
  type: "fill-in-the-blank" | "multiple-choice" | "short-answer";
  question: string;
  blanks?: string[];
  options?: string[];
  correctAnswer: string | string[];
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
}

export default function ChemistryStudyPage() {
  // 로컬 환경용 더미 userId
  const userId = 1;
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  // 파일 업로드 기능 제거됨
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfText, setPdfText] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  // 파일 업로드 기능 제거됨
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Fetch materials
  const { data: materialsData, isLoading } = trpc.materials.list.useQuery(
    { subject: "chemistry" }
  );

  useEffect(() => {
    if (materialsData) {
      setMaterials(materialsData as StudyMaterial[]);
    }
  }, [materialsData]);

  // 파일 업로드 함수 제거됨

  const extractTextFromPDF = async (url: string) => {
    try {
      // Previous render task cancel
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const pdf = await pdfjsLib.getDocument(url).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);

      const page = await pdf.getPage(currentPage);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(" ");
      setPdfText(text);

      // Render PDF page
      if (canvasRef.current) {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const context = canvasRef.current.getContext("2d");
        if (context) {
          canvasRef.current.width = viewport.width;
          canvasRef.current.height = viewport.height;
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          try {
            renderTaskRef.current = page.render({ canvasContext: context, viewport, canvas: canvasRef.current });
            await renderTaskRef.current.promise;
          } catch (renderError: any) {
            if (renderError.name !== 'RenderingCancelledException') {
              console.error("PDF render error:", renderError);
            }
          }
        }
      }
    } catch (error) {
      console.error("PDF load error:", error);
    }
  };

  useEffect(() => {
    if (selectedMaterial) {
      let isMounted = true;
      
      const loadPDF = async () => {
        if (isMounted) {
          await extractTextFromPDF(selectedMaterial.fileUrl);
        }
      };
      
      loadPDF();
      
      return () => {
        isMounted = false;
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }
      };
    }
  }, [selectedMaterial, currentPage]);

  const handleGenerateQuiz = async () => {
    if (!pdfText) return;
    setGeneratingQuiz(true);
    try {
      const response = await fetch("/api/quiz-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText, subject: "chemistry" }),
      });

      const data = await response.json();
      // API 응답 형식에 맞게 처리
      const quizQuestions = Array.isArray(data) ? data : data.questions || [];
      setQuizData({ questions: quizQuestions });
      setShowQuiz(true);
    } catch (error) {
      console.error("Quiz generation error:", error);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // 로컬 환경에서는 로그인 체크 불필요
  if (false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">화학 학습</h1>
          </div>
          <div>
            {/* 파일 업로드 기능 제거됨 */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {!selectedMaterial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : materials.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                업로드된 파일이 없습니다. 위의 "PDF 업로드" 버튼을 클릭하여 파일을 업로드하세요.
              </div>
            ) : (
              materials.map((material) => (
                <Card
                  key={material.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedMaterial(material)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg truncate">{material.fileName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(material.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="flex gap-4 h-[calc(100vh-150px)]">
            {/* PDF Viewer - Center */}
            <div className="flex-1 flex flex-col bg-card rounded-lg border overflow-hidden">
              <div className="flex-1 overflow-auto bg-muted p-4">
                <canvas
                  ref={canvasRef}
                  className="mx-auto shadow-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>

              {/* PDF Navigation */}
              <div className="border-t p-4 flex items-center justify-between">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  이전
                </Button>
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  다음
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 flex flex-col gap-4 overflow-y-auto">
              {/* Material Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedMaterial.fileName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setSelectedMaterial(null)}
                    variant="outline"
                    className="w-full"
                  >
                    다른 파일 선택
                  </Button>
                </CardContent>
              </Card>

              {/* Quiz Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">백지 퀴즈</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz || !pdfText}
                    className="w-full gap-2"
                  >
                    {generatingQuiz ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    퀴즈 생성
                  </Button>
                </CardContent>
              </Card>

              {/* Quiz Display */}
              {showQuiz && quizData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">퀴즈 풀기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BlankQuiz
                      questions={quizData.questions}
                      title="화학 퀴즈"
                      description="현재 페이지의 내용을 바탕으로 한 퀴즈입니다."
                      estimatedTime={10}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
