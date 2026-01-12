"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function OrderErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error_msg"); // Optional: for debugging or more specific messages

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden bg-white p-4">
      <h1 className="text-black-600 mb-4 text-3xl font-bold">결제 처리 중 오류가 발생했습니다.</h1>
      {errorMessage && <p className="mb-2 text-lg text-gray-700">오류 메시지: {errorMessage}</p>}
      <p className="text-md mb-6 text-gray-600">관리자에게 문의 바랍니다.</p>
      <button
        onClick={() => router.push("/buyer/mypage")}
        className="bg-black01 hover:bg-black02 mt-6 rounded-xl px-6 py-3 text-white shadow transition-colors"
      >
        마이페이지로 이동
      </button>
    </div>
  );
}
