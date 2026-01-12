import { usePayment } from "@/hooks/usePayment";
import { preparePayment } from "@/lib/api/order";
import { Order, OrderItemResponse } from "@/types/order";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import Button from "../button/Button";
import ReviewViewModal from "./ReviewViewModal";
import ReviewWriteModal from "./ReviewWriteModal";

interface MypageItemCardProps {
  order: Order;
}

export default function MypageItemCard({ order }: MypageItemCardProps) {
  const [reviewViewTarget, setReviewViewTarget] = useState<OrderItemResponse | null>(null);
  const [reviewWriteTarget, setReviewWriteTarget] = useState<OrderItemResponse | null>(null);
  const { requestPay } = usePayment();

  // 백엔드에서 pending, completed 등으로 내려주는 값에 따라 달라져야 합니다.
  const paymentStatus = order.paymentStatus;
  const orderDate = new Date(order.createdAt).toLocaleDateString();

  const { mutate: preparePaymentMutation } = useMutation({
    mutationFn: () => preparePayment(order.id),
    onSuccess: (payment) => {
      const firstItemName = order.orderItems[0]?.product.name ?? "주문 상품";
      const productName =
        order.orderItems.length > 1 ? `${firstItemName} 외 ${order.orderItems.length - 1}건` : firstItemName;

      requestPay(
        {
          merchant_uid: payment.id, // 새로 생성된 payment의 id
          amount: payment.price,
          name: productName,
          buyer_name: order.name,
          buyer_addr: order.address,
          buyer_tel: order.phoneNumber,
        },
        order.id
      );
    },
    onError: (error) => {
      console.error("결제 정보 준비 중 오류 발생:", error);
      alert("결제를 진행하는 중 오류가 발생했습니다.");
    },
  });

  const handleCloseView = () => setReviewViewTarget(null);
  const handleCloseWrite = () => setReviewWriteTarget(null);
  const handleReviewSubmit = () => handleCloseWrite();

  const getStatusText = () => {
    switch (paymentStatus) {
      case "completed":
        return "결제 완료";
      case "pending":
        return "결제 대기";
      default: // 추후에 상태 더 추가 (결제 취소 등등)
        return "주문 상태 확인 중";
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 border-b border-gray-200 py-4">
      <div className="flex items-center justify-between">
        <span className="font-bold">{getStatusText()}</span>
        <span>주문일: {orderDate}</span>
      </div>
      {order.orderItems.map((item) => (
        <div
          key={item.id}
          className="flex items-end justify-between bg-white"
        >
          <div className="flex items-start gap-5">
            <div className="relative h-[5.625rem] w-[5.625rem]">
              <Image
                src={item.product.image ?? "/images/Mask-group.svg"}
                alt={item.product.name}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-col gap-[0.625rem]">
                <div className="text-black01 text-base/4.5 font-bold">{item.product.name}</div>
              </div>
              <div className="flex gap-3">
                <div className="text-black01 text-base/4.5 font-normal">사이즈 : {item.size.size.ko}</div>
                <div className="flex items-center gap-[0.625rem]">
                  <span className="text-base/4.5 font-extrabold">{item.price.toLocaleString()}원</span>
                  <span className="text-gray01 text-base/4.5 font-normal">| {item.quantity}개</span>
                </div>
              </div>
            </div>
          </div>
          {paymentStatus === "completed" && (
            <Button
              label={item.isReviewed ? "리뷰 보기" : "리뷰 쓰기"}
              size="medium"
              variant="secondary"
              color={item.isReviewed ? "white" : "black"}
              className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
              onClick={() => {
                if (item.isReviewed) setReviewViewTarget(item);
                else setReviewWriteTarget(item);
              }}
            />
          )}
        </div>
      ))}
      {paymentStatus === "pending" && (
        <div className="self-end">
          <Button
            label="결제하기"
            size="medium"
            variant="primary"
            className="h-[3.75rem] w-[12.5rem]"
            onClick={() => preparePaymentMutation()}
          />
        </div>
      )}
      <ReviewViewModal
        open={!!reviewViewTarget}
        onClose={handleCloseView}
        purchase={reviewViewTarget}
      />
      <ReviewWriteModal
        open={!!reviewWriteTarget}
        onClose={handleCloseWrite}
        purchase={reviewWriteTarget}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
