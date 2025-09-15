'use client';
import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

const REASONS = [
  "서비스 이용이 불편하거나 기대에 미치지 못함",
  "요금제/비용 부담이 큼",
  "사용 시간이 부족하거나 필요성이 줄어듦",
  "불필요한 알림이나 광고가 많음",
  "기타",
];

export default function ProfileWithdrawPage() {
  const [selected, setSelected] = useState("");
  const [etc, setEtc] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalPw, setModalPw] = useState("");
  const [modalPwCheck, setModalPwCheck] = useState("");

  const passwordsFilled = modalPw.length > 0 && modalPwCheck.length > 0;
  const passwordsMismatch = passwordsFilled && modalPw !== modalPwCheck;

  const handleWithdraw = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleModalWithdraw = () => {
    if (passwordsMismatch) {
      return;
    }
    setShowModal(false);
    alert("탈퇴가 완료되었습니다.");
  };

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA] p-0 m-0">
      {/* 상단 로고 + user.name */}
      <div className="flex flex-row items-center justify-center mb-8 mt-4 gap-4">
        <Image src="/logo.svg" alt="로고" width={36} height={36} priority />
        <div className="text-[#222] font-bold text-xl">Q-Tee</div>
      </div>
      {/* 탈퇴 사유 선택 및 입력 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-10 py-12 flex flex-col items-center w-full max-w-[520px]">
        <form className="w-full flex flex-col items-center" onSubmit={handleWithdraw}>
          <div className="w-full border border-gray-200 rounded-t-lg bg-white px-8 pt-8 pb-4">
            {REASONS.map((reason, idx) => (
              <label key={reason} className="flex items-center mb-3 text-base text-[#222] cursor-pointer">
                <input
                  type="radio"
                  name="withdraw-reason"
                  value={reason}
                  checked={selected === reason}
                  onChange={() => setSelected(reason)}
                  className="mr-2 accent-[#0064FF] w-4 h-4"
                />
                {reason}
              </label>
            ))}
            {/* 기타 선택 시 텍스트 입력 */}
            {selected === "기타" && (
              <textarea
                className="w-full border border-gray-200 rounded mt-2 p-3 text-base text-[#222] resize-none min-h-[60px]"
                placeholder="탈퇴 사유를 입력해 주세요"
                value={etc}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEtc(e.target.value)}
              />
            )}
          </div>
          {/* 버튼 영역 */}
          <div className="w-full flex gap-3 mt-8">
            <button type="button" className="flex-1 h-12 rounded-md bg-[#F5F6FA] text-gray-500 font-semibold text-base border border-gray-200">취소</button>
            <button type="submit" className="flex-1 h-12 rounded-md bg-[#0064FF] text-white font-semibold text-base border border-[#0064FF]">탈퇴하기</button>
          </div>
        </form>
      </div>
      {/* 탈퇴 확인 모달 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 배경 어둡게 */}
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="relative bg-white rounded-2xl shadow-md border border-gray-200 p-8 w-[400px] flex flex-col z-10">
            {/* 상단 타이틀 + X버튼 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-bold text-[#222]">탈퇴하기</div>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={()=>setShowModal(false)} aria-label="닫기">×</button>
            </div>
            {/* 안내문구 */}
            <div className="text-sm text-gray-500 mb-6 text-left leading-relaxed">
              탈퇴를 진행하면 회원님의 계정과 모든 이용 기록이 영구적으로 삭제됩니다.<br />
              삭제된 데이터는 복구되지 않습니다. 정말로 탈퇴하시겠습니까?
            </div>
            {/* 입력란 */}
            <div className="w-full flex flex-col mb-4">
              <label className="text-base text-[#111111] pb-2">비밀번호</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-gray-800 outline-none text-sm"
                value={modalPw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPw(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
              <label className="text-base text-[#111111] pb-2">비밀번호 확인</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 outline-none text-sm"
                value={modalPwCheck}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPwCheck(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
            {passwordsMismatch && (
              <div className="text-sm text-[#E53E3E] mb-2">비밀번호가 일치하지 않습니다.</div>
            )}
            {/* 버튼 중앙 정렬, 크기 키움 */}
            <div className="w-full flex gap-3 justify-center mt-2">
              <button type="button" className="h-14 px-12 rounded-md bg-[#F5F6FA] text-gray-500 font-semibold text-lg border border-gray-200" onClick={()=>setShowModal(false)}>취소</button>
              <button type="button" className="h-14 px-12 rounded-md bg-[#0064FF] text-white font-semibold text-lg border border-[#0064FF]" onClick={handleModalWithdraw}>탈퇴</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
