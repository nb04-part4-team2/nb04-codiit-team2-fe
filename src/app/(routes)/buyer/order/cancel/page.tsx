"use client";

import { useRouter } from "next/navigation";

export default function OrderCancelPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-white p-4">
      <h1 className="text-black-600 mb-4 text-3xl font-bold">결제가 취소되었습니다.</h1>
      <p className="text-md mb-6 text-gray-600">마이페이지로 이동하여 주문 내역을 확인해주세요.</p>
      <button
        onClick={() => router.push("/buyer/mypage")}
        className="bg-black01 hover:bg-black02 mt-6 rounded-xl px-6 py-3 text-white shadow transition-colors"
      >
        마이페이지로 이동
      </button>
    </div>
  );
}
