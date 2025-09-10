import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function QuestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
