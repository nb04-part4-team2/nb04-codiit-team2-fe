"use client";

import Button from "@/components/button/Button";
import { useRouter } from "next/navigation";

export default function OrderCompletePage() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <div className="text-center">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-gray-800">주문이 완료되었습니다!</h1>
        <p className="mt-2 text-lg text-gray-600">주문해주셔서 감사합니다.</p>
        <div className="mt-10 flex justify-center gap-4">
          <Button
            label="주문 내역 보기"
            size="medium"
            variant="primary"
            className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
            onClick={() => router.push(`/buyer/mypage`)}
          />
          <Button
            label="쇼핑 계속하기"
            size="medium"
            variant="secondary"
            className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
            onClick={() => router.push("/")}
          />
        </div>
      </div>
    </div>
  );
}
