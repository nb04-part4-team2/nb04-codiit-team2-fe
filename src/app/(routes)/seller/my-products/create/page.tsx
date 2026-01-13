"use client";

import { createProduct } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CategoryType } from "../../../../../types/Product.js";
import ProductForm from "../components/ProductForm";

export default function ProductCreatePage() {
  const toaster = useToaster();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 객체 리터럴 {}을 직접 넘기면 리렌더링 시 참조가 변하므로 useMemo를 쓰는 것이 좋음
  const emptyInitialValues = useMemo(
    () => ({
      name: "",
      image: null,
      price: undefined as unknown as number, // 스키마에 맞게 설정
      category: undefined as unknown as CategoryType,
      sizes: [],
      stocks: {},
      discount: {
        enabled: false,
        value: null,
        periodEnabled: false,
        periodStart: null,
        periodEnd: null,
      },
      detail: "",
    }),
    []
  );

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toaster("info", "상품을 등록했습니다");
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      router.push("/seller/my-products");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toaster("warn", "상품 등록 실패: " + error.message);
      } else {
        toaster("warn", "상품 등록 실패: 알 수 없는 에러");
      }
    },
  });

  const handleCreate = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto mt-[60px] mb-[120px] flex w-[1520px] flex-col">
      <div className="mb-10 text-[28px] font-extrabold">상품 등록</div>
      <ProductForm
        mode="create"
        initialValues={emptyInitialValues}
        onSubmit={handleCreate}
      />
    </div>
  );
}
