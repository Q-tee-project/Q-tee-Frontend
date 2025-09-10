'use client';

import Link from 'next/link';
import {
  ArrowRight,
  GraduationCap,
  Users,
  BarChart3,
  BookOpen,
  CheckCircle,
  Zap,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Q-tee</span>
              <span className="hidden sm:inline text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                Quiz + Tutee
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                기능
              </a>
              <a href="#users" className="text-gray-600 hover:text-blue-600 transition-colors">
                사용자별 안내
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                요금제
              </a>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                로그인
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                시작하기
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                <a
                  href="#features"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  기능
                </a>
                <a
                  href="#users"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  사용자별 안내
                </a>
                <a
                  href="#pricing"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  요금제
                </a>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  시작하기
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI가 만드는 <span className="text-blue-600">스마트한 학습</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            교사는 쉽게 문제를 생성하고, 학생은 즐겁게 학습할 수 있는 종합 학습 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/join"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center"
            >
              무료로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition">
              데모 보기
            </button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border">
            <div className="aspect-video bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Q-tee 플랫폼 미리보기</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">핵심 기능</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI 기반 문제 생성부터 실시간 성취도 분석까지, 모든 학습 과정을 한 번에
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI 자동 문제 생성</h3>
            <p className="text-gray-600">
              과목, 범위, 난이도를 선택하면 AI가 자동으로 다양한 유형의 문제를 생성합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">실시간 성취도 분석</h3>
            <p className="text-gray-600">
              학생별 학습 현황을 실시간으로 확인하고 맞춤형 피드백을 제공합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">스마트 오답노트</h3>
            <p className="text-gray-600">
              틀린 문제를 자동으로 분석하고 유사한 문제를 추천하여 약점을 보완합니다.
            </p>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="users" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">사용자별 맞춤 기능</h2>
            <p className="text-xl text-gray-600">
              교사, 학생, 학부모 모두를 위한 특화된 기능을 제공합니다
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* 교사 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">교사</h3>
              <ul className="space-y-3 text-left max-w-sm mx-auto">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">AI 자동 문제 생성 및 편집</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">반 개설 및 학생 관리</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">실시간 응시 현황 모니터링</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">자동 채점 및 성취도 리포트</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">문제 마켓플레이스 참여</span>
                </li>
              </ul>
            </div>

            {/* 학생 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">학생</h3>
              <ul className="space-y-3 text-left max-w-sm mx-auto">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">초대코드로 간편한 반 참여</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">레벨테스트 및 맞춤형 문제</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">즉시 피드백 및 해설</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">오답노트 기반 반복 학습</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">개인 성취도 시각화</span>
                </li>
              </ul>
            </div>

            {/* 학부모 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">학부모</h3>
              <ul className="space-y-3 text-left max-w-sm mx-auto">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">자녀 학습 현황 알림</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">성적 및 등수 확인</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">상세 성취도 리포트</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">학습 패턴 분석</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">자동 요약 리포트 수신</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">생성된 문제 수</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">활성 교사</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-200">학습중인 학생</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-200">만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">요금제</h2>
            <p className="text-xl text-gray-600">모든 사용자를 위한 합리적인 가격</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-300 transition">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">무료</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  ₩0<span className="text-lg font-normal text-gray-500">/월</span>
                </div>
                <p className="text-gray-600 mb-6">개인 교사를 위한 기본 기능</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">월 50문제 생성</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">최대 30명 학생</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">기본 성취도 분석</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">오답노트</span>
                </li>
              </ul>
              <Link
                href="/join"
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition block text-center"
              >
                무료로 시작하기
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-500 hover:border-blue-600 transition relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  인기
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">프로</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  ₩29,000<span className="text-lg font-normal text-gray-500">/월</span>
                </div>
                <p className="text-gray-600 mb-6">전문 교사를 위한 고급 기능</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">무제한 문제 생성</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">최대 100명 학생</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">고급 성취도 분석</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">학부모 리포트 자동 전송</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">마켓플레이스 참여</span>
                </li>
              </ul>
              <Link
                href="/join"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition block text-center"
              >
                프로 시작하기
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200 hover:border-purple-300 transition">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">엔터프라이즈</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  맞춤<span className="text-lg font-normal text-gray-500"> 견적</span>
                </div>
                <p className="text-gray-600 mb-6">학교·학원을 위한 맞춤형 솔루션</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">무제한 사용자</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">전용 서버</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">맞춤형 기능 개발</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">24/7 기술 지원</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-gray-600">교육 및 컨설팅</span>
                </li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition">
                문의하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            지금 바로 Q-tee와 함께 시작하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            AI가 만드는 스마트한 학습 환경에서 더 효과적인 교육을 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
            >
              교사로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/join"
              className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              학생으로 참여하기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="text-2xl font-bold">Q-tee</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI 기반 스마트 학습 플랫폼으로 더 나은 교육 환경을 만들어갑니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    문제 생성
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    성취도 분석
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    오답노트
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    마켓플레이스
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    도움말
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    문의하기
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Q-tee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
