'use client';

import React from "react";
import Image from "next/image";
import { LuUser } from "react-icons/lu";
import { MdOutlineManageAccounts } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const handleLogout = () => {
    alert("로그아웃 되었습니다.");
    router.push("/login");
  };
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA] p-0 m-0">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-10 py-12 flex flex-col items-center w-full max-w-[420px]">
        {/* 로고 + 이름 (가로 정렬) */}
        <div className="flex flex-row items-center justify-center mb-8 gap-3">
          <Image src="/logo.svg" alt="로고" width={36} height={36} priority />
          <div className="text-[#222] font-bold text-xl">Q-Tee</div>
        </div>
        {/* 메뉴 카드 */}
        <div className="w-full flex flex-col gap-2 mb-6">
          <button
            className="flex items-center gap-3 w-full h-12 px-5 bg-[#F5F8FA] rounded transition hover:bg-[#EAF2FB] border border-transparent hover:border-[#B5D3F5] text-left text-base text-[#222]"
            onClick={() => router.push("/profile/edit")}
          >
            <LuUser size={20} className="text-[#0064FF]" />
            <span>프로필 수정</span>
          </button>
          <button
            className="flex items-center gap-3 w-full h-12 px-5 bg-[#F5F8FA] rounded transition hover:bg-[#EAF2FB] border border-transparent hover:border-[#B5D3F5] text-left text-base text-[#222]"
            onClick={() => router.push("/profile/privacy")}
          >
            <MdOutlineManageAccounts size={20} className="text-[#0064FF]" />
            <span>개인정보관리</span>
          </button>
        </div>
        {/* 구분선 */}
        <div className="w-full border-b border-[#E5E7EB] mb-6" />
        {/* 로그아웃 버튼 */}
        <button
          className="w-full h-12 bg-[#0064FF] text-white font-semibold rounded-md transition hover:bg-[#0052CC] text-base"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
