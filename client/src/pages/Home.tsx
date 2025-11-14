import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { BookOpen, Zap, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">🎓 EduTech</div>
          <div>
            <Link href="/records">
              <Button variant="outline" size="sm">
                학습 기록
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            모우미
            <br />
            <span className="text-indigo-600">스마트 학습 플랫폼</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            교육 격차를 해소하고 모든 학생이 동등한 학습 기회를 가질 수 있도록 돕습니다.
            AI 기반 개인 맞춤형 학습으로 더 효과적인 공부를 시작하세요.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>스마트 교재 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  PDF 교재를 업로드하면 AI가 자동으로 분석하여 핵심 내용을 추출하고
                  학습 자료로 변환합니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>과목별 맞춤 학습</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  영어, 수학, 화학 등 과목별 특화된 학습 도구로 더 효과적인 공부를 경험하세요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>백지 퀴즈</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  학습한 내용을 바탕으로 자동 생성된 퀴즈로 이해도를 확인하고 복습하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subject Selection Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          학습할 과목을 선택하세요
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* English */}
          <Link href="/english">
            <Card className="cursor-pointer border-2 border-transparent hover:border-indigo-400 hover:shadow-lg transition-all h-full">
              <CardHeader>
                <div className="text-5xl mb-4">📚</div>
                <CardTitle className="text-2xl">영어</CardTitle>
                <CardDescription>
                  어려운 단어 학습 및 독해 능력 향상
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI가 감지한 어려운 단어를 하이라이트하고 한국어 뜻을 제공합니다.
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  시작하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Math */}
          <Link href="/math">
            <Card className="cursor-pointer border-2 border-transparent hover:border-indigo-400 hover:shadow-lg transition-all h-full">
              <CardHeader>
                <div className="text-5xl mb-4">📐</div>
                <CardTitle className="text-2xl">수학</CardTitle>
                <CardDescription>
                  함수식 시각화 및 동적 그래프 학습
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  수학 함수를 동적 그래프로 시각화하고 계수를 변경하며 학습합니다.
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  시작하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Chemistry */}
          <Link href="/chemistry">
            <Card className="cursor-pointer border-2 border-transparent hover:border-indigo-400 hover:shadow-lg transition-all h-full">
              <CardHeader>
                <div className="text-5xl mb-4">⚗️</div>
                <CardTitle className="text-2xl">화학</CardTitle>
                <CardDescription>
                  화학 개념 정리 및 퀴즈 학습
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  화학 교재를 분석하여 백지 퀴즈로 학습 효과를 극대화합니다.
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  시작하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            EduTech의 장점
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-indigo-100">무료 이용</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-indigo-100">언제든 학습</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">AI</div>
              <p className="text-indigo-100">개인 맞춤형</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">∞</div>
              <p className="text-indigo-100">무제한 반복</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">EduTech</h3>
              <p className="text-sm">
                시골 지역 학생들을 위한 스마트 학습 플랫폼
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">학습</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/english" className="hover:text-white">영어</Link></li>
                <li><Link href="/math" className="hover:text-white">수학</Link></li>
                <li><Link href="/chemistry" className="hover:text-white">화학</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">정보</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">소개</a></li>
                <li><a href="#" className="hover:text-white">기능</a></li>
                <li><a href="#" className="hover:text-white">연락처</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">법률</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">이용약관</a></li>
                <li><a href="#" className="hover:text-white">개인정보</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 EduTech. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
