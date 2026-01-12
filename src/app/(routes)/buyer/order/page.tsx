"use client";

import OrderInfoSection from "@/components/order/OrderInfoSection";
import OrderPointSection from "@/components/order/OrderPointSection";
import OrderProductList from "@/components/order/OrderProductList";
import OrderSummary from "@/components/order/OrderSummary";
import { usePayment } from "@/hooks/usePayment";
import { createOrder, preparePayment } from "@/lib/api/order";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useOrderStore } from "@/store/orderStore";
import { Order } from "@/types/order";
import { User } from "@/types/User";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderPage() {
  const router = useRouter();
  const { selectedItems, getOrderRequest } = useOrderStore();
  const { requestPay } = usePayment();
  const axiosInstance = getAxiosInstance();

  const { data: user } = useQuery({
    queryKey: ["User"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/users/me");
      return data;
    },
  });

  // 2. 결제 생성 Mutation
  const preparePaymentMutation = useMutation({
    mutationFn: (order: Order) => preparePayment(order.id), // order 객체를 받아 id만 사용
    onSuccess: (payment, order) => {
      // onSuccess의 두 번째 인자는 mutate에 전달된 variables(order 객체)
      const firstItemName = order.orderItems[0]?.product.name ?? "주문 상품";
      const productName =
        order.orderItems.length > 1
          ? `${firstItemName} 외 ${order.orderItems.length - 1}건`
          : firstItemName;

      requestPay(
        {
          merchant_uid: payment.id,
          amount: payment.price,
          name: productName,
          buyer_email: user?.email,
          buyer_name: order.name,
          buyer_addr: order.address,
          buyer_tel: order.phoneNumber,
        },
        order.id,
      );
    },
    onError: (error) => {
      console.error("결제 정보 생성 중 오류 발생:", error);
      alert("결제 정보 생성에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 1. 주문 생성 Mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      // 주문 생성 성공 시, 이어서 결제 생성 요청
      preparePaymentMutation.mutate(order);
    },
    onError: (error) => {
      console.error("주문 생성 중 오류 발생:", error);
      alert("주문 생성에 실패했습니다. 다시 시도해주세요.");
    },
  });

  useEffect(() => {
    if (selectedItems.length === 0) {
      router.replace("/buyer/shopping");
    }
  }, [selectedItems, router]);

  return (
    <div>
      <div className="mx-auto h-full max-w-[1520px] bg-white pt-8">
        <div className="flex items-center gap-5">
          <h1 className="text-black01 flex items-center text-[1.75rem] font-extrabold">
            주문 및 결제
          </h1>
        </div>
        <div className="mt-8 flex gap-15">
          <div className="flex-1">
            <OrderInfoSection />
            <OrderProductList />
            <OrderPointSection />
          </div>
          <OrderSummary onClick={() => createOrderMutation.mutate(getOrderRequest())} />
        </div>
      </div>
    </div>
  );
}


