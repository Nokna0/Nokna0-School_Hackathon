import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Zap, BookOpen, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import MathVisualizer from "@/components/MathVisualizer";

// pdfjs
import * as pdfjsLib from "pdfjs-dist";
import PDFWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

pdfjsLib.GlobalWorkerOptions.workerPort = new PDFWorker();

interface StudyMaterial {
  id: number;
  fileName: string;
  fileUrl: string;
  subject: string;
}

interface QuestionHelpResult {
  keyConcepts: string[];
  approachSteps: string[];
  cautionPoints: string[];
  phraseExplanations: { phrase: string; meaning: string }[];
}

export default function MathStudyPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [mathExpressions, setMathExpressions] = useState<any[]>([]);
  const [graphDescriptions, setGraphDescriptions] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // ⬇️ 새로 추가된 상태 (답지 상세 설명)
  const [answerExplanation, setAnswerExplanation] = useState<string>("");
  const [answerAnalyzing, setAnswerAnalyzing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<any>(null);

  const { data: materialsData } = trpc.materials.list.useQuery({ subject: "math" });

  // 답지 모드
  const [isAnswerMode, setIsAnswerMode] = useState(false);
  const [mainMaterial, setMainMaterial] = useState<StudyMaterial | null>(null);

  // 문제 접근 가이드
  const [questionHelp, setQuestionHelp] = useState<QuestionHelpResult | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);

  const questionHelpMutation = trpc.mathAssist.questionHelp.useMutation();

  /* ====================== 파일 목록 ======================= */
  useEffect(() => {
    if (Array.isArray(materialsData)) setMaterials(materialsData);
  }, [materialsData]);

  /* ====================== PDF 렌더 ======================= */
  async function extractPage(url: string, pageNum: number) {
    const task = pdfjsLib.getDocument({
      url: `/api/pdf-proxy?u=${encodeURIComponent(url)}`,
      withCredentials: true,
    });

    const pdf = await task.promise;
    setTotalPages(pdf.numPages);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  useEffect(() => {
    if (!selectedMaterial) return;
    extractPage(selectedMaterial.fileUrl, currentPage);

    setSelectionBox(null);
    setMathExpressions([]);
    setGraphDescriptions([]);
    setQuestionHelp(null);
    setGuideExpanded(false);
    setAnswerExplanation("");
  }, [selectedMaterial, currentPage]);

  /* ====================== Crop ======================= */
  function cropCanvas(canvas: HTMLCanvasElement, box: any) {
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = box.containerRect;

    const leftInCanvas = box.left - (canvasRect.left - containerRect.left);
    const topInCanvas = box.top - (canvasRect.top - containerRect.top);

    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const sx = leftInCanvas * scaleX;
    const sy = topInCanvas * scaleY;
    const sw = box.width * scaleX;
    const sh = box.height * scaleY;

    const temp = document.createElement("canvas");
    temp.width = sw;
    temp.height = sh;
    temp.getContext("2d")!.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    return temp.toDataURL("image/png");
  }

  /* ====================== 드래그 ======================= */
  const handleMouseDown = (e: any) => {
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging || !dragStart) return;

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    setSelectionBox({
      left: Math.min(dragStart.x, cx),
      top: Math.min(dragStart.y, cy),
      width: Math.abs(cx - dragStart.x),
      height: Math.abs(cy - dragStart.y),
      containerRect: rect,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  /* ====================== Vision 분석 ======================= */
  const analyzeSelection = async () => {
    if (!selectionBox) return alert("드래그 후 실행하세요");

    const base64 = cropCanvas(canvasRef.current!, selectionBox);

    setAnalyzing(true);

    try {
      const res = await fetch("/api/math-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64.replace(/^data:image\/png;base64,/, ""),
        }),
      });

      const raw = await res.text();
      const data = JSON.parse(raw);

      setMathExpressions(data.expressions || []);
      setGraphDescriptions(data.graphDescriptions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  /* ====================== 문제 접근 가이드 ======================= */
  const analyzeQuestionGuide = async () => {
    if (!selectionBox) return alert("문제를 드래그하세요.");

    const base64img = cropCanvas(canvasRef.current!, selectionBox);

    setGuideLoading(true);

    try {
      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64img }),
      });

      const ocr = await ocrRes.json();
      const text = ocr?.text || "";

      if (!text.trim()) {
        setGuideLoading(false);
        return alert("문장 인식 실패.");
      }

      const result = await questionHelpMutation.mutateAsync({ text });

      setQuestionHelp(result);
      setGuideExpanded(true);
    } catch (e) {
      console.error(e);
      alert("접근 분석 실패");
    } finally {
      setGuideLoading(false);
    }
  };

  /* ====================== 답지 상세 설명 ======================= */
  const analyzeAnswerDetail = async () => {
    if (!isAnswerMode)
      return alert("먼저 '답지 보기'를 누르고 답지에서 영역을 드래그하세요.");

    if (!selectionBox) return alert("답지에서 설명이 필요한 부분을 드래그하세요.");

    const base64 = cropCanvas(canvasRef.current!, selectionBox).replace(
      /^data:image\/png;base64,/,
      ""
    );

    setAnswerAnalyzing(true);

    try {
      const res = await fetch("/api/answer-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const raw = await res.text();
      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        data = { explanation: raw };
      }

      setAnswerExplanation(
        data.explanation ||
          "답지 해설 응답 형식이 예상과 다릅니다.\n\n" + raw
      );
    } catch (e) {
      console.error(e);
      alert("답지 상세 설명 실패");
    } finally {
      setAnswerAnalyzing(false);
    }
  };

  /* ====================== 답지 토글 ======================= */
  const handleToggleAnswer = () => {
    const answer = materials.find((m) => m.fileName === "dapzi.pdf");
    if (!answer) return alert("dapzi.pdf 없음");

    if (!isAnswerMode) {
      if (selectedMaterial) setMainMaterial(selectedMaterial);
      setSelectedMaterial(answer);
      setIsAnswerMode(true);
    } else {
      if (mainMaterial) setSelectedMaterial(mainMaterial);
      setIsAnswerMode(false);
    }

    setCurrentPage(1);
    setAnswerExplanation("");
  };

  /* ====================== 렌더링 ======================= */
  return (
    <div className="p-4 relative">

      {/* 뒤로가기 */}
      <Link href="/">
        <Button variant="outline" className="mb-4 text-lg">
          <ArrowLeft className="w-6 h-6 mr-2" /> 돌아가기
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ==================== PDF 영역 ==================== */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">수학 학습</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-lg">

            {!selectedMaterial && <p>오른쪽에서 파일을 선택하세요.</p>}

            {selectedMaterial && (
              <div className="flex gap-4">

                {/* 답지 버튼 */}
                <div className="w-36">
                  <Button
                    onClick={handleToggleAnswer}
                    variant={isAnswerMode ? "default" : "outline"}
                    className="w-full mb-3 text-lg py-4 font-bold"
                  >
                    {isAnswerMode ? "문제 보기" : "답지 보기"}
                  </Button>
                </div>

                {/* PDF 캔버스 */}
                <div className="flex-1">
                  <div
                    ref={canvasContainerRef}
                    className="relative bg-gray-100 rounded-md overflow-auto flex justify-center items-start"
                    style={{ height: "75vh" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* 가로폭 줄임 max-w-[660px] */}
                    <div className="max-w-[660px] mx-auto">
                      <canvas ref={canvasRef} />
                    </div>

                    {selectionBox && (
                      <div
                        className="absolute bg-blue-300 opacity-30 border-2 border-blue-600"
                        style={{
                          left: selectionBox.left,
                          top: selectionBox.top,
                          width: selectionBox.width,
                          height: selectionBox.height,
                        }}
                      />
                    )}
                  </div>

                  {/* 페이지 이동 */}
                  <div className="flex justify-between mt-4 text-xl font-semibold">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="text-lg px-6"
                    >
                      이전
                    </Button>

                    <span>
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="text-lg px-6"
                    >
                      다음
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* ==================== 사이드바 ==================== */}
        <div className="space-y-4">

          {/* 파일 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">저장된 파일</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-lg">
              {materials
                .filter((m) => m.fileName !== "dapzi.pdf")
                .map((m) => (
                  <button
                    key={m.id}
                    className="block w-full p-4 border rounded-lg hover:bg-gray-100 text-left text-lg"
                    onClick={() => {
                      setSelectedMaterial(m);
                      setMainMaterial(m);
                      setIsAnswerMode(false);
                      setAnswerExplanation("");
                    }}
                  >
                    {m.fileName}
                  </button>
                ))}
            </CardContent>
          </Card>

          {/* 분석 버튼 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-lg">

              {/* 수식 추출 */}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-xl py-5"
                onClick={analyzeSelection}
                disabled={!selectedMaterial || analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    드래그 영역 수식 분석
                  </>
                )}
              </Button>

              {/* 문제 접근 가이드 */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-xl py-5"
                onClick={analyzeQuestionGuide}
                disabled={!selectedMaterial || guideLoading}
              >
                {guideLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-6 h-6 mr-3" />
                    문제 접근 가이드
                  </>
                )}
              </Button>

              {/* ⬇️ 새로 추가됨: 답지 상세 설명 */}
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-xl py-5"
                onClick={analyzeAnswerDetail}
                disabled={!selectedMaterial || answerAnalyzing}
              >
                {answerAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    설명 생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    답지 상세 설명
                  </>
                )}
              </Button>

              {/* 결과 출력 */}
              <div className="border rounded-md p-3 h-48 bg-slate-50 overflow-y-auto whitespace-pre-wrap text-base leading-relaxed">
                {answerExplanation || "답지에서 궁금한 부분을 드래그한 후 위 버튼을 눌러 분석하세요."}
              </div>

            </CardContent>
          </Card>

          {/* 그래프 */}
          {mathExpressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">그래프</CardTitle>
              </CardHeader>
              <CardContent>
                <MathVisualizer initialExpressions={mathExpressions} />
              </CardContent>
            </Card>
          )}

          {/* 그래프 설명 */}
          {graphDescriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">그래프 설명</CardTitle>
              </CardHeader>
              <CardContent className="text-lg">
                {graphDescriptions.map((g, i) => (
                  <div key={i} className="py-2 border-b">
                    {g}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 축소된 문제 접근 */}
          {questionHelp && !guideExpanded && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">문제 접근 가이드</CardTitle>
              </CardHeader>
              <CardContent className="text-lg space-y-3">
                <div>
                  <b className="text-xl">핵심 개념</b>
                  <ul className="list-disc ml-6">
                    {questionHelp.keyConcepts.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full text-lg" onClick={() => setGuideExpanded(true)}>
                  크게 보기
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* ================= 팝업 ================= */}
      {guideExpanded && questionHelp && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center px-6 py-8 z-[999]">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-10 relative">

            <button
              className="absolute top-5 right-5"
              onClick={() => setGuideExpanded(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <h2 className="text-4xl font-extrabold mb-10">문제 접근 가이드</h2>

            <div className="space-y-12 text-xl leading-relaxed">

              <section>
                <div className="font-bold text-2xl mb-3">🔍 핵심 개념</div>
                <ul className="list-disc ml-7 space-y-2">
                  {questionHelp.keyConcepts.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="font-bold text-2xl mb-3">📘 접근 단계</div>
                <ol className="list-decimal ml-7 space-y-2">
                  {questionHelp.approachSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </section>

              <section>
                <div className="font-bold text-2xl mb-3">⚠️ 주의할 점</div>
                <ul className="list-disc ml-7 space-y-2">
                  {questionHelp.cautionPoints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="font-bold text-2xl mb-3">✏️ 문제 표현의 의미</div>
                <ul className="list-disc ml-7 space-y-2">
                  {questionHelp.phraseExplanations.map((p, i) => (
                    <li key={i}>
                      <b>{p.phrase}</b>: {p.meaning}
                    </li>
                  ))}
                </ul>
              </section>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
