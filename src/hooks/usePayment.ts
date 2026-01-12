"use client";

import { useRouter } from "next/navigation";

// 결제 요청에 필요한 파라미터 타입
export interface RequestPayParams {
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  buyer_tel?: string;
  buyer_addr?: string;
  buyer_postcode?: string;
}

// 포트원 응답 타입
interface IamportResponse {
  success: boolean;
  imp_uid: string | null;
  merchant_uid: string;
  error_msg: string | null;
}

export function usePayment() {
  const router = useRouter();

  const requestPay = (params: RequestPayParams, orderId: string) => {
    const { IMP } = window;
    if (!IMP) {
      alert("결제 모듈을 로드하지 못했습니다.");
      return;
    }

    IMP.init("imp16125162"); // 가맹점 식별코드

    const paymentData = {
      pg: "kakaopay.TC0ONETIME", // PG사
      pay_method: "card", // 결제수단
      ...params,
      m_redirect_url: `/buyer/order/pending?orderId=${orderId}`, // 모바일 결제 후 돌아올 URL
    };

    IMP.request_pay(paymentData, (rsp: IamportResponse) => {
      if (rsp.success) {
        // 결제 인증 성공 시, 웹훅 수신을 기다리는 pending 페이지로 이동
        router.push(`/buyer/order/pending?orderId=${orderId}`);
      } else {
        // 결제 실패 시
        console.error("결제 실패:", rsp.error_msg);
        if (rsp.error_msg && (rsp.error_msg.includes("사용자") && rsp.error_msg.includes("취소"))) {
          router.push(`/buyer/order/cancel?error_msg=${rsp.error_msg}`);
        } else {
          router.push(`/buyer/order/error?error_msg=${rsp.error_msg}`);
        }
      }
    });
  };

  return { requestPay };
}
