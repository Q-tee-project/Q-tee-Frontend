'use client'

import { useSidebar } from "@/contexts/SidebarContext";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  
  return (
    <main className={`flex-1 transition-all duration-300 ${
      isOpen ? 'ml-[200px]' : 'ml-16'
    }`}>
      {children}
    </main>
  );
}