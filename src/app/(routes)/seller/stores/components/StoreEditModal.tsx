import { editStore } from "@/lib/api/store";
import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import StoreForm from "./StoreForm";

interface StoreEditModalProps {
  onClose: () => void;
  store: {
    id: string;
    name: string;
    address: string;
    detailAddress?: string;
    phone: string;
    content: string;
    imageUrl?: string;
  };
}

export default function StoreEditModal({ onClose, store }: StoreEditModalProps) {
  const toaster = useToaster();

  const queryClient = useQueryClient();

  const handleEdit = async (data: StoreCreateForm) => {
    try {
      await editStore(store.id, data);
      await queryClient.invalidateQueries({ queryKey: ["myStore"] });
      toaster("info", "스토어 정보를 수정했습니다");
      onClose();
    } catch (error) {
      toaster("warn", "스토어 수정 실패: " + error);
    }
  };

  // 객체 참조를 고정하여 자식 컴포넌트의 useEffect가 불필요하게 실행되는 것을 방지
  const memoizedDefaultValues = useMemo(
    () => ({
      storeName: store.name,
      address: {
        basic: store.address,
        detail: store.detailAddress ?? "",
      },
      phoneNumber: store.phone,
      description: store.content,
      image: store.imageUrl,
    }),
    [store]
  ); // store 데이터가 바뀔 때만 객체 새로 생성

  return (
    <StoreForm
      mode="edit"
      onClose={onClose}
      onSubmit={handleEdit}
      defaultValues={memoizedDefaultValues}
    />
  );
}
