import { CreateOrderRequest, Order } from "@/types/order";
import { Payment } from "@/types/payment";
import { getAxiosInstance } from "./axiosInstance";

/**
 * 주문 생성 API
 * @param orderData 주문 생성에 필요한 데이터
 * @returns 생성된 Order 객체 (내부에 payments 배열 포함)
 */
export const createOrder = async (
  orderData: CreateOrderRequest,
): Promise<Order> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post("/orders", orderData);
  return response.data;
};

/**
 * 미결제 주문에 대한 신규 결제(Payment) 생성 API
 * @param orderId 결제를 생성할 주문 ID
 * @returns 생성된 Payment 객체
 */
export const preparePayment = async (orderId: string): Promise<Payment> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post(`/payment`, {
    orderId,
    provider: "kakaopay", // 현재는 카카오페이만 지원
    method: "card",
  });
  return response.data;
};

