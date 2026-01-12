"use client";

import { connectNotificationSSE, getNotifications } from "@/lib/api/notification";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToaster } from "@/proviers/toaster/toaster.hook";

export default function OrderPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const toaster = useToaster();

  useEffect(() => {
    if (!orderId) {
      console.error("Order ID is missing");
      router.replace("/");
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let pollingAttempts = 0;
    const MAX_POLLING_ATTEMPTS = 5; // 5 attempts * 3 seconds = 15 seconds timeout

    // 1. SSE Connection
    const eventSource = connectNotificationSSE();

    const cleanup = () => {
      eventSource.close();
      if (intervalId) clearInterval(intervalId);
    };

    const handleSuccess = () => {
      cleanup();
      router.replace(`/buyer/order/complete?orderId=${orderId}`);
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const eventData = JSON.parse(event.data);
        if (
          eventData.content &&
          eventData.content.includes("주문이 완료되었습니다") &&
          eventData.content.includes(orderId)
        ) {
          console.log("Payment confirmed via SSE.");
          handleSuccess();
        }
      } catch (error) {
        console.warn("Invalid SSE data:", event.data, error);
      }
    };

    eventSource.onerror = (error: Event) => {
      console.error("SSE Error, falling back to polling:", error);
      eventSource.close(); // Close the connection on error, polling will continue
    };

    // 2. Polling Fallback
    const poll = async () => {
      pollingAttempts++;
      if (pollingAttempts > MAX_POLLING_ATTEMPTS) {
        console.warn("Max polling attempts reached. Redirecting to mypage.");
        cleanup();
        toaster("warn", "결제 상태 확인이 지연되고 있습니다. 잠시 후 마이페이지에서 다시 확인해주세요.");
        router.replace("/buyer/mypage");
        return;
      }

      try {
        console.log(`Polling for payment confirmation (Attempt ${pollingAttempts}/${MAX_POLLING_ATTEMPTS})...`);
        const response = await getNotifications({ page: 1, pageSize: 10 });
        const targetNotification = response.list.find(
          (n) => n.content.includes("주문이 완료되었습니다") && n.content.includes(orderId)
        );

        if (targetNotification) {
          console.log("Payment confirmed via polling.");
          handleSuccess();
        }
      } catch (err) {
        console.error("Polling request failed:", err);
      }
    };

    intervalId = setInterval(poll, 3000);

    // Component unmount cleanup
    return cleanup;
  }, [orderId, router, toaster]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">결제 처리 중</h1>
        <p className="mt-4 text-lg text-gray-600">결제가 완료될 때까지 잠시만 기다려주세요.</p>
        <p className="text-sm text-gray-500">(이 페이지를 벗어나지 마세요)</p>
        <div className="mt-8">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}
