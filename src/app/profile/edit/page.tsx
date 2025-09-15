'use client';

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfileEditPage() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [push, setPush] = useState("");
  const router = useRouter();

  const handleCancel = () => {
    router.push("/");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`저장 완료!\n이름: ${name}\n아이디: ${id}\n푸시: ${push}`);
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
        {/* 입력 폼 */}
        <form className="w-full flex flex-col gap-0" onSubmit={handleSave}>
          {/* 이름 */}
          <div className="flex flex-col mb-2">
            <label className="text-base text-[#111111] pt-2 pb-1 pl-1">이름</label>
            <input type="text" className="w-full border border-gray-300 rounded px-2 py-2 text-gray-800 outline-none text-base" value={name} onChange={e => setName(e.target.value)} />
          </div>
          {/* 아이디 */}
          <div className="flex flex-col mb-2">
            <label className="text-base text-[#111111] pt-2 pb-1 pl-1">아이디</label>
            <input type="text" className="w-full border border-gray-300 rounded px-2 py-2 text-gray-800 outline-none text-base" value={id} onChange={e => setId(e.target.value)} />
          </div>
          {/* 푸시 알림 수신 동의 */}
          <div className="flex flex-col mb-2">
            <label className="text-base text-[#111111] pt-2 pb-1 pl-1">푸시 알림 수신 동의</label>
            <input type="text" className="w-full border border-gray-300 rounded px-2 py-2 text-gray-800 outline-none text-base" value={push} onChange={e => setPush(e.target.value)} placeholder="아이디를 입력하세요" />
          </div>
          {/* 버튼 영역 */}
          <div className="flex gap-3 mt-8">
            <button type="button" className="flex-1 h-12 rounded-md bg-[#F5F6FA] text-gray-500 font-semibold text-base border border-gray-200" onClick={handleCancel}>취소</button>
            <button type="submit" className="flex-1 h-12 rounded-md bg-[#0064FF] text-white font-semibold text-base border border-[#0064FF]">저장</button>
          </div>
        </form>
      </div>
    </main>
  );
}
