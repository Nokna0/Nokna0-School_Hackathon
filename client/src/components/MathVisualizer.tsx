import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react";

/* -------------------------------------------
   타입 선언
------------------------------------------- */
interface GraphFunction {
  id: string;
  expression: string;
  type: string;
  color: string;
  visible: boolean;
}

interface MathVisualizerProps {
  initialExpressions?: Array<{
    expression: string;
    type: string;
    description?: string;
  }>;
}

/* -------------------------------------------
   파라미터 자동 감지 (a,b,c...)
------------------------------------------- */
function detectParametersFromExpression(expr: string): string[] {
  if (!expr) return [];

  const cleaned = expr.replace(
    /\b(sin|cos|tan|sqrt|abs|exp|log|ln|Math)\b/gi,
    ""
  );

  const matches = cleaned.match(/[a-zA-Z]/g) || [];
  const set = new Set<string>();

  matches.forEach((ch) => {
    const c = ch.toLowerCase();
    if (c !== "x") set.add(c);
  });

  return Array.from(set);
}

/* -------------------------------------------
   COMPONENT
------------------------------------------- */
export default function MathVisualizer({ initialExpressions = [] }: MathVisualizerProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const modalPlotRef = useRef<HTMLDivElement>(null);

  const [functions, setFunctions] = useState<GraphFunction[]>([]);
  const [newExpression, setNewExpression] = useState("");

  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [zoom, setZoom] = useState(1);

  const [activeTab, setActiveTab] = useState("graph");
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [parameters, setParameters] = useState<Record<string, number>>({});

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
  ];

  /* -------------------------------------------
     ① initialExpressions → 누적 추가
------------------------------------------- */
  useEffect(() => {
    if (!initialExpressions || initialExpressions.length === 0) return;

    setFunctions((prev) => {
      const existing = new Set(prev.map((f) => f.expression.trim()));
      const toAdd = initialExpressions.filter(
        (expr) => !existing.has(expr.expression.trim())
      );
      if (toAdd.length === 0) return prev;

      const startIndex = prev.length;
      const newFuncs: GraphFunction[] = toAdd.map((expr, idx) => ({
        id: `func-${startIndex + idx}`,
        expression: expr.expression,
        type: expr.type,
        color: colors[(startIndex + idx) % colors.length],
        visible: true,
      }));

      return [...prev, ...newFuncs];
    });
  }, [initialExpressions]);

  /* -------------------------------------------
     ② 파라미터 자동 감지
------------------------------------------- */
  useEffect(() => {
    const paramSet = new Set<string>();
    functions.forEach((f) =>
      detectParametersFromExpression(f.expression).forEach((p) =>
        paramSet.add(p)
      )
    );

    setParameters((prev) => {
      const next: Record<string, number> = { ...prev };
      let changed = false;

      paramSet.forEach((name) => {
        if (!(name in next)) {
          next[name] = 0;
          changed = true;
        }
      });

      Object.keys(next).forEach((name) => {
        if (!paramSet.has(name)) {
          delete next[name];
          changed = true;
        }
      });

      return changed ? { ...next } : prev;
    });
  }, [functions]);

  /* -------------------------------------------
     ③ Plotly 로드
------------------------------------------- */
  useEffect(() => {
    if ((window as any).Plotly) {
      setPlotlyLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plot.ly/plotly-2.26.0.min.js";
    script.async = true;
    script.onload = () => setPlotlyLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  /* -------------------------------------------
     ④ 수식 평가기
------------------------------------------- */
  const evaluateExpression = (expr: string, x: number): number | null => {
    try {
      let normalized = expr;

      normalized = normalized
        .replace(/y\s*=\s*/i, "")
        .replace(/f\(x\)\s*=\s*/i, "");

      normalized = normalized.replace(/\^/g, "**");
      normalized = normalized.replace(/(\d)([a-zA-Z])/g, "$1*$2");
      normalized = normalized.replace(/([a-zA-Z])(\d)/g, "$1*$2");

      Object.entries(parameters).forEach(([name, value]) => {
        const re = new RegExp(`\\b${name}\\b`, "g");
        normalized = normalized.replace(re, `(${value})`);
      });

      normalized = normalized.replace(/x/gi, `(${x})`);

      normalized = normalized
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/exp\(/g, "Math.exp(")
        .replace(/log\(/g, "Math.log(")
        .replace(/ln\(/g, "Math.log(");

      const fn = new Function("Math", `return ${normalized}`);
      const result = fn(Math);
      return isFinite(result) ? result : null;
    } catch {
      return null;
    }
  };

  /* -------------------------------------------
     ⑤ Plot 데이터 생성
------------------------------------------- */
  const generatePlotData = () => {
    const step = 0.1 / zoom;
    const data: any[] = [];

    functions.forEach((func) => {
      if (!func.visible) return;

      const x: number[] = [];
      const y: number[] = [];

      for (let v = xMin; v <= xMax; v += step) {
        const yVal = evaluateExpression(func.expression, v);
        if (yVal !== null) {
          x.push(v);
          y.push(yVal);
        }
      }

      if (x.length > 0) {
        data.push({
          x,
          y,
          type: "scatter",
          mode: "lines",
          // 🔥 name 제거 → legend에 수식 안나오게
          line: { color: func.color, width: 2 },
        });
      }
    });

    return data;
  };

  /* -------------------------------------------
     ⑥ Plot 업데이트
------------------------------------------- */
  const updatePlot = () => {
    if (!plotRef.current || !plotlyLoaded) return;
    const Plotly = (window as any).Plotly;
    if (!Plotly) return;

    Plotly.react(plotRef.current, generatePlotData(), {
      title: "함수 그래프 시각화",
      xaxis: { title: "x", range: [xMin, xMax] },
      yaxis: { title: "y", range: [yMin, yMax] },
      margin: { l: 60, r: 40, t: 40, b: 60 },
      showlegend: false, // 🔥 legend(함수식 목록) 숨기기
    });
  };

  /* -------------------------------------------
     ⑦ Modal Plot 업데이트
------------------------------------------- */
  const updateModalPlot = () => {
    if (!modalPlotRef.current || !plotlyLoaded) return;
    const Plotly = (window as any).Plotly;
    if (!Plotly) return;

    Plotly.react(modalPlotRef.current, generatePlotData(), {
      title: "확대 그래프",
      xaxis: { title: "x", range: [xMin, xMax] },
      yaxis: { title: "y", range: [yMin, yMax] },
      margin: { l: 60, r: 40, t: 60, b: 60 },
      showlegend: false, // 🔥 확대 화면에서도 legend 숨김
    });
  };

  /* -------------------------------------------
     ⑧ 상태 변경 시 Plot 리렌더링
------------------------------------------- */
  useEffect(() => {
    updatePlot();
    if (isModalOpen) updateModalPlot();
  }, [functions, xMin, xMax, yMin, yMax, plotlyLoaded, parameters, isModalOpen]);

  /* -------------------------------------------
     ⑨ 탭 전환 시 plot 깨짐 방지
------------------------------------------- */
  useEffect(() => {
    if (activeTab === "graph") {
      setTimeout(() => {
        updatePlot();
        if (isModalOpen) updateModalPlot();
      }, 40);
    }
  }, [activeTab]);

  /* -------------------------------------------
     ⑩ 함수 목록 핸들러
------------------------------------------- */
  const addFunction = () => {
    if (!newExpression.trim()) return;

    setFunctions((prev) => {
      const newFunc: GraphFunction = {
        id: `func-${Date.now()}`,
        expression: newExpression,
        type: "custom",
        color: colors[prev.length % colors.length],
        visible: true,
      };
      return [...prev, newFunc];
    });

    setNewExpression("");
  };

  const removeFunction = (id: string) => {
    setFunctions(functions.filter((f) => f.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const updateExpression = (id: string, expression: string) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, expression } : f))
    );
  };

  /* -------------------------------------------
     ⑪ 줌 컨트롤
------------------------------------------- */
  const handleZoomIn = () => {
    const newZoom = zoom * 1.2;
    setZoom(newZoom);

    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;

    setXMin(centerX - (xMax - xMin) / (2 * 1.2));
    setXMax(centerX + (xMax - xMin) / (2 * 1.2));
    setYMin(centerY - (yMax - yMin) / (2 * 1.2));
    setYMax(centerY + (yMax - yMin) / (2 * 1.2));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(1, zoom / 1.2);
    setZoom(newZoom);

    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;

    setXMin(centerX - ((xMax - xMin) * 1.2) / 2);
    setXMax(centerX + ((xMax - xMin) * 1.2) / 2);
    setYMin(centerY - ((yMax - yMin) * 1.2) / 2);
    setYMax(centerY + ((yMax - yMin) * 1.2) / 2);
  };

  const handleReset = () => {
    setZoom(1);
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  /* -------------------------------------------
     렌더링
------------------------------------------- */
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📐 수학 함수 시각화 도구</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="graph">그래프</TabsTrigger>
            <TabsTrigger value="functions">함수 관리</TabsTrigger>
          </TabsList>

          {/* GRAPH 탭 */}
          <TabsContent value="graph" className="space-y-4">
            {/* 기본 그래프 */}
            <div
              ref={plotRef}
              style={{ width: "100%", height: "500px" }}
            />

            {/* 전체 확대 버튼 */}
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setTimeout(updateModalPlot, 50);
              }}
              variant="outline"
              size="sm"
            >
              <ZoomIn className="w-4 h-4 mr-2" />
              전체 확대
            </Button>

            {/* 줌 컨트롤 */}
            <div className="flex gap-2">
              <Button onClick={handleZoomIn} variant="outline" size="sm">
                <ZoomIn className="w-4 h-4 mr-2" />
                확대
              </Button>
              <Button onClick={handleZoomOut} variant="outline" size="sm">
                <ZoomOut className="w-4 h-4 mr-2" />
                축소
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                초기화
              </Button>
            </div>

            {/* X/Y 범위 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">X 범위</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Y 범위</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    value={yMin}
                    onChange={(e) => setYMin(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={yMax}
                    onChange={(e) => setYMax(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* 파라미터 슬라이더 */}
            {Object.keys(parameters).length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">변수 값 설정</label>
                <div className="space-y-3 rounded-md border p-3 bg-slate-50">
                  {Object.entries(parameters).map(([name, value]) => (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{name}</span>
                        <span className="text-xs text-gray-600">
                          {value.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={-10}
                          max={10}
                          step={0.1}
                          value={value}
                          onChange={(e) =>
                            setParameters((prev) => ({
                              ...prev,
                              [name]: parseFloat(e.target.value),
                            }))
                          }
                          className="flex-1"
                        />

                        <Input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setParameters((prev) => ({
                              ...prev,
                              [name]: Number(e.target.value),
                            }))
                          }
                          className="w-24 h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* 함수 관리 탭 */}
          <TabsContent value="functions" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">새 함수 추가</label>
              <div className="flex gap-2">
                <Input
                  value={newExpression}
                  onChange={(e) => setNewExpression(e.target.value)}
                  placeholder="예: x^3 + a*x^2"
                  onKeyDown={(e) => e.key === "Enter" && addFunction()}
                />
                <Button onClick={addFunction} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {functions.length === 0 ? (
                <p className="text-sm text-gray-500">함수가 없습니다.</p>
              ) : (
                functions.map((func) => (
                  <div
                    key={func.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={func.visible}
                      onChange={() => toggleVisibility(func.id)}
                      className="w-4 h-4"
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: func.color }}
                    />
                    <Input
                      value={func.expression}
                      onChange={(e) => updateExpression(func.id, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={() => removeFunction(func.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* 확대 모달 (그래프 + 변수 슬라이더) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-4 shadow-xl flex flex-col gap-4"
            style={{ width: "90vw", height: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 큰 그래프 */}
            <div
              ref={modalPlotRef}
              style={{ width: "100%", height: "70%" }}
            />

            {/* 모달 안의 변수 슬라이더 */}
            {Object.keys(parameters).length > 0 && (
              <div className="space-y-2 h-[25%] overflow-y-auto border rounded-md p-3 bg-slate-50">
                <label className="text-sm font-medium">변수 값 설정</label>

                {Object.entries(parameters).map(([name, value]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{name}</span>
                      <span className="text-xs text-gray-600">
                        {value.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={-10}
                        max={10}
                        step={0.1}
                        value={value}
                        onChange={(e) =>
                          setParameters((prev) => ({
                            ...prev,
                            [name]: parseFloat(e.target.value),
                          }))
                        }
                        className="flex-1"
                      />

                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          setParameters((prev) => ({
                            ...prev,
                            [name]: Number(e.target.value),
                          }))
                        }
                        className="w-20 h-8 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
