"use client";

import MyPageMenu from "@/components/MyPageMenu";
import ProfileButton from "@/components/button/ProfileButton";
import ProfileInput from "@/components/input/ProfileInput";
import { menuItems } from "@/data/buyerMenuItems";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { uploadImageToS3 } from "@/lib/api/products";
import { editUserProfile } from "@/lib/api/userProfile";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { User } from "@/types/User";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditProfilePage() {
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("editProfile");
  const [passwordError, setPasswordError] = useState("");
  const toaster = useToaster();
  const router = useRouter();
  const axiosInstance = getAxiosInstance();
  const setUser = useUserStore((state) => state.setUser);

  const { data: user, refetch } = useQuery({
    queryKey: ["User"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/users/me");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: editUserProfile,
    onSuccess: async () => {
      const { data: latestUser } = await refetch(); // 최신 유저 데이터 받아오고
      if (latestUser) {
        setUser(latestUser); // zustand 상태 업데이트
      }
      toaster("info", "프로필 수정 성공");

      // 인풋창 상태 전부 초기화
      setNickname("");
      setImageUrl(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    },
    onError: (error: AxiosError) => {
      console.error("mutation 에러 발생:", error.response?.data || error.message);
      toaster("warn", "수정에 실패했습니다.");
    },
  });

  const handleEditImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const response = await uploadImageToS3(file);
          setImageUrl(response.url);
          toaster("info", "이미지를 업로드했습니다.");
        } catch (error) {
          toaster("warn", "이미지 업로드에 실패했습니다.");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const isValid = currentPassword.trim() !== "";

  if (!user) return null;

  const profileImgSrc = imageUrl || user.image || "/images/profile-buyer.png";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1520px] gap-10 pt-[3.75rem]">
        {/* 사이드 메뉴 */}
        <MyPageMenu
          items={menuItems}
          selectedId={selectedMenu}
          onSelect={(id, path) => {
            setSelectedMenu(id);
            router.push(path);
          }}
          className="h-[280px] w-[218px] flex-shrink-0"
        />

        {/* 본문 */}
        <div className="flex flex-col">
          <span className="text-black01 mb-6 text-[1.75rem] font-extrabold">내 정보 수정</span>

          {/* 프로필 이미지 */}
          <div className="relative mb-6 h-24 w-24">
            <Image
              src={profileImgSrc}
              alt={user.name}
              fill // fill을 사용하면 부모 크기에 맞게 채워집니다
              className="h-24 w-24 rounded-full object-cover"
            />
            <div className="absolute right-0 bottom-0">
              <button
                onClick={handleEditImage}
                disabled={isUploading}
                className="border-gray03 absolute right-0 bottom-0 flex h-[35px] w-[35px] items-center justify-center rounded-full border bg-white"
              >
                {isUploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                ) : (
                  <Image
                    src="/icon/edit.svg"
                    alt="Edit"
                    width={24}
                    height={24}
                  />
                )}
              </button>
            </div>
          </div>

          {/* 인풋 영역 */}
          <div className="flex flex-col gap-4">
            <ProfileInput
              label="이메일"
              value={user.email}
              onChange={() => {}}
              readOnly
            />
            <ProfileInput
              label="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={user.name}
            />
            <ProfileInput
              label="현재 비밀번호"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
            />
            <ProfileInput
              label="새 비밀번호 입력"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (newPassword && e.target.value !== newPassword) {
                  setPasswordError("비밀번호가 일치하지 않습니다.");
                } else {
                  setPasswordError("");
                }
              }}
              placeholder="변경할 비밀번호 입력"
            />
            <ProfileInput
              label="새 비밀번호 확인"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (confirmPassword && e.target.value !== confirmPassword) {
                  setPasswordError("비밀번호가 일치하지 않습니다.");
                } else {
                  setPasswordError("");
                }
              }}
              placeholder="변경할 비밀번호 확인"
            />
          </div>

          {/* 버튼 */}
          <div className="mt-6">
            <ProfileButton
              label="수정하기"
              onClick={() => {
                if (newPassword && newPassword !== confirmPassword) {
                  alert("새 비밀번호가 일치하지 않습니다.");
                  return;
                }

                updateMutation.mutate({
                  currentPassword,
                  nickname: nickname.trim() || undefined,
                  newPassword: newPassword.trim() || undefined,
                  imageUrl: imageUrl,
                });
              }}
              disabled={!isValid || !!passwordError || isUploading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
