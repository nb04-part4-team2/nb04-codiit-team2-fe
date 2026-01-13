// src/types/payment.d.ts

export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled" | "paid" | "processing";
export type PaymentProvider = "kakaopay" | "tosspay" | "naverpay";
export type PaymentMethod = "card" | "tosspay" | "naverpay" | "point" | "kakaopay";

export interface Payment {
  id: string;
  price: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  method: PaymentMethod;
  impUid: string | null;
  pgTid: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  approvedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}
