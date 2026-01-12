// src/types/portone.d.ts

interface Iamport {
  init: (apiKey: string) => void;
  request_pay: (
    params: {
      pg?: string;
      pay_method: string;
      merchant_uid: string;
      name: string;
      amount: number;
      buyer_email?: string;
      buyer_name?: string;
      buyer_tel?: string;
      buyer_addr?: string;
      buyer_postcode?: string;
      m_redirect_url?: string; // 모바일 결제 후 리디렉션될 URL
    },
    callback: (response: IamportResponse) => void,
  ) => void;
}

interface IamportResponse {
  success: boolean;
  imp_uid: string | null;
  merchant_uid: string;
  error_msg: string | null;
}

declare global {
  interface Window {
    IMP?: Iamport;
  }
}

export {};
