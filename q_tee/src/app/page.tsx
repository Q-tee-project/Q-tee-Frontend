import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Q-tee에 오신 것을 환영합니다</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            온라인 문제 생성 및 관리 플랫폼입니다
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/class" 
              className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">클래스 관리</h3>
              <p className="text-muted-foreground">학생들과 함께 사용할 클래스를 만들고 관리하세요</p>
            </Link>
            
            <Link 
              href="/question/bank" 
              className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">❓</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">문제 은행</h3>
              <p className="text-muted-foreground">다양한 유형의 문제를 생성하고 저장하세요</p>
            </Link>
            
            <Link 
              href="/test" 
              className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">CSS 테스트</h3>
              <p className="text-muted-foreground">UI 컴포넌트와 색상 테마를 확인하세요</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}