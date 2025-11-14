import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";
import * as pdfjsLib from "pdfjs-dist";
import { storagePut } from "@/lib/storage";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Subject = "english" | "math" | "chemistry";

interface StudyMaterial {
  id: number;
  fileName: string;
  fileUrl: string;
  subject: Subject;
  createdAt: Date;
}

export default function StudyPage() {
  const { subject } = useParams<{ subject: string }>();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const subjectLabel: Record<Subject, string> = {
    english: "영어",
    math: "수학",
    chemistry: "화학",
  };

  // Initialize mutations at component level (not in event handlers)
  const uploadMutation = trpc.materials.upload.useMutation();
  const materialsUtils = trpc.materials.useUtils();

  // Fetch materials
  const { data: materialsData, isLoading } = trpc.materials.list.useQuery(
    { subject: subject as Subject },
    { enabled: !!subject && !!user }
  );

  useEffect(() => {
    if (materialsData) {
      setMaterials(materialsData as StudyMaterial[]);
    }
  }, [materialsData]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !subject) return;

      setUploading(true);
      try {
        // Upload to S3
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const { fileKey, fileUrl } = await response.json();

        // Save to database using pre-initialized mutation
        await uploadMutation.mutateAsync({
          subject: subject as Subject,
          fileName: file.name,
          fileKey,
          fileUrl,
          fileSize: file.size,
        });

        // Refresh materials list using utils
        await materialsUtils.materials.list.invalidate();
      } catch (error) {
        console.error("Upload error:", error);
        alert("파일 업로드에 실패했습니다.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [subject, uploadMutation, materialsUtils]
  );

  const renderPDF = useCallback(async (url: string, pageNum: number = 1) => {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      await renderPage(pdf, pageNum);
    } catch (error) {
      console.error("PDF error:", error);
    }
  }, []);

  const renderPage = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = document.getElementById("pdf-canvas") as HTMLCanvasElement;
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) return;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      setCurrentPage(pageNum);
    } catch (error) {
      console.error("Render error:", error);
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1 && pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage - 1);
    }
  }, [currentPage, renderPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages && pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage + 1);
    }
  }, [currentPage, totalPages, renderPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {subjectLabel[subject as Subject]} 학습
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Materials List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">교재</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                    variant="outline"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        파일 업로드
                      </>
                    )}
                  </Button>
                </div>

                {/* Materials List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {materials.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      업로드된 교재가 없습니다.
                    </p>
                  ) : (
                    materials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => {
                          setSelectedMaterial(material);
                          renderPDF(material.fileUrl);
                        }}
                        className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedMaterial?.id === material.id
                            ? "bg-indigo-100 text-indigo-900"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        {material.fileName}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Viewer */}
          <div className="lg:col-span-3">
            {selectedMaterial ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedMaterial.fileName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* PDF Canvas */}
                    <div className="border rounded-lg bg-white p-4 overflow-auto max-h-96 flex items-center justify-center">
                      <canvas id="pdf-canvas" className="max-w-full" />
                    </div>

                    {/* Page Navigation */}
                    {totalPages > 0 && (
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          variant="outline"
                        >
                          이전
                        </Button>
                        <span className="text-sm text-gray-600">
                          {currentPage} / {totalPages}
                        </span>
                        <Button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          variant="outline"
                        >
                          다음
                        </Button>
                      </div>
                    )}

                    {/* Quiz Button */}
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      📝 백지 퀴즈 생성
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">
                    왼쪽에서 교재를 선택하여 학습을 시작하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
