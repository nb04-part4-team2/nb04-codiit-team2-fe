import { Payment, PaymentStatus } from "./payment";
import { CartProduct } from "./cart";
import { ProductInfoData } from "./Product";

// 결제에 필요한 정보 타입
export interface PaymentInfo {
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
}

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  isReviewed: boolean;
  productId: string;
  product: {
    name: string;
    image?: string; // 이미지 속성 추가
    reviews: Array<{
      id: string;
      rating: number;
      content: string;
      createdAt: string;
    }>;
  };
  size: {
    size: {
      en: string;
      ko: string;
    };
  };
}

export interface Order {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: string;
  paymentStatus: PaymentStatus
  orderItems: OrderItem[];
  payments: Payment[]; // Payment 타입 배열로 수정
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderItemRequest {
  productId: string;
  sizeId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  name: string;
  phone: string;
  address: string;
  orderItems: OrderItemRequest[];
  usePoint: number;
}

export interface OrderItemResponse {
  id: string;
  price: number;
  quantity: number;
  isReviewed: boolean;
  productId: string;
  product: {
    name: string;
    image?: string;
    reviews: {
      id: string;
      rating: number;
      content: string;
      createdAt: string;
    }[];
  };
  size: {
    size: {
      en: string;
      ko: string;
    };
  };
}

export interface OrderItemInfo {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  product: CartProduct | ProductInfoData;
  checked?: boolean;
}
