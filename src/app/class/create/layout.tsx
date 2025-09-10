import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}