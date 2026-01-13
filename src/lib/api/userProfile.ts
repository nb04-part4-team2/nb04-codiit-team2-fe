import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { FavoriteStores } from "@/types/store";
import { AxiosError } from "axios";

interface EditProfileParams {
  currentPassword: string;
  nickname?: string;
  newPassword?: string;
  imageUrl?: string | null;
}

export const editUserProfile = async ({
  currentPassword,
  nickname,
  newPassword,
  imageUrl,
}: EditProfileParams) => {
  const axiosInstance = getAxiosInstance();

  const payload: { [key: string]: string } = {
    currentPassword,
  };

  if (nickname && nickname.trim() !== "") {
    payload.name = nickname.trim();
  }

  if (newPassword && newPassword.trim() !== "") {
    payload.password = newPassword.trim();
  }

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }
  try {
    const { data } = await axiosInstance.patch("/users/me", payload);
    return data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("프로필 수정 실패 (editUserProfile catch block):", error.response?.data || error.message); // Modified log
    throw err;
  }
};

export const getFavoriteStore = async (): Promise<FavoriteStores[]> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/users/me/likes`);
  return response.data;
};
