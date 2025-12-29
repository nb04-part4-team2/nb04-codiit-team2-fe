import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { MyProductsResponse } from "@/types/sellerProduct";
import { Store, StoreDetailResponse } from "@/types/store";
import axios from "axios";
import { getAxiosInstance } from "./axiosInstance";

interface StorePayload {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  image?: string | null;
}

// 스토어 등록
export async function createStore(data: StoreCreateForm): Promise<StoreDetailResponse> {
  const axiosInstance = getAxiosInstance();
  const payload: StorePayload = {
    name: data.storeName,
    address: data.address.basic,
    detailAddress: data.address.detail ?? "",
    phoneNumber: data.phoneNumber,
    content: data.description,
    image: data.image,
  };
  const res = await axiosInstance.post("/stores", payload);
  return res.data;
}

// 내 스토어 조회
export const getMyStore = async (): Promise<StoreDetailResponse | null> => {
  const axiosInstance = getAxiosInstance();
  try {
    const response = await axiosInstance.get("/stores/detail/my");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // 스토어 없음 404 에러
    }
    throw error; // 그 외 에러
  }
};

// 스토어 수정
export async function editStore(storeId: string, data: StoreCreateForm): Promise<StoreDetailResponse> {
  const axiosInstance = getAxiosInstance();
  const payload: StorePayload = {
    name: data.storeName,
    address: data.address.basic,
    detailAddress: data.address.detail ?? "",
    phoneNumber: data.phoneNumber,
    content: data.description,
    image: data.image,
  };
  const response = await axiosInstance.patch(`/stores/${storeId}`, payload);
  return response.data;
}

// 스토어 상세 조회
export const getStoreDetail = async (storesId: string): Promise<Store> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/stores/${storesId}`);
  return response.data;
};

// 관심 스토어 등록
export const postFavoriteStore = async (storeId: string) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post(`/stores/${storeId}/favorite`);
  return response.data;
};

// 관심 스토어 삭제
export const deleteFavoriteStore = async (storeId: string) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.delete(`/stores/${storeId}/favorite`);
  return response.data;
};

// 내 스토어 등록 상품 조회
export const getMyProduct = async (page: number, pageSize: number): Promise<MyProductsResponse> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get("/stores/detail/my/product", {
    params: {
      page,
      pageSize,
    },
  });
  return response.data;
};
