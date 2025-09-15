'use client';

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePrivacyPage() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleCancel = () => {
    router.push("/");
  };

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("변경 완료!");
    router.push("/");
  };

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA] p-0 m-0">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-10 py-12 flex flex-col items-center w-full max-w-[420px]">
        {/* 로고 + 이름 (가로 정렬) */}
        <div className="flex flex-row items-center justify-center mb-8 gap-3">
          <Image src="/logo.svg" alt="로고" width={36} height={36} priority />
          <div className="text-[#222] font-bold text-xl">Q-Tee</div>
        </div>
        <form className="w-full flex flex-col gap-0" onSubmit={handleChange}>
          {/* 이메일 변경이 첫 번째 항목 */}
          <label className="text-base text-[#111111] pt-2 pb-1 pl-1">이메일 변경</label>
          <input type="email" className="w-full border border-gray-300 rounded px-2 py-2 mb-4 text-gray-800 outline-none text-base" value={email} onChange={e => setEmail(e.target.value)} />
          <label className="text-base text-[#111111] pt-2 pb-1 pl-1">현재 비밀번호</label>
          <input type="password" className="w-full border border-gray-300 rounded px-2 py-2 mb-2 text-gray-800 outline-none text-base" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          <label className="text-base text-[#111111] pt-2 pb-1 pl-1">새 비밀번호</label>
          <input type="password" className="w-full border border-gray-300 rounded px-2 py-2 mb-2 text-gray-800 outline-none text-base" value={newPw} onChange={e => setNewPw(e.target.value)} />
          <label className="text-base text-[#111111] pt-2 pb-1 pl-1">새 비밀번호 확인</label>
          <input type="password" className="w-full border border-gray-300 rounded px-2 py-2 mb-4 text-gray-800 outline-none text-base" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          {/* 안내문구 예시 */}
          <div className="text-sm text-gray-500 mb-4 pl-1">영문, 숫자, 특수문자 조합 8~20자</div>
          {/* 탈퇴하기 버튼(폼 하단) 유지 */}
          <div className="flex justify-start mb-2">
            <button type="button" className="h-10 w-32 rounded bg-[#FDE8E8] text-[#E53E3E] text-sm border border-[#F5B5B5] hover:bg-[#F5B5B5] transition" onClick={()=>router.push('/profile/withdraw')}>탈퇴하기</button>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" className="flex-1 h-12 rounded-md bg-[#F5F6FA] text-gray-500 font-semibold text-base border border-gray-200" onClick={handleCancel}>취소</button>
            <button type="submit" className="flex-1 h-12 rounded-md bg-[#0064FF] text-white font-semibold text-base border border-[#0064FF]">변경하기</button>
          </div>
        </form>
      </div>
    </main>
  );
}
