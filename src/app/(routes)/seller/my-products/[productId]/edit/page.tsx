"use client";

import { getProductDetail, updateProduct } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { transformToFormValues } from "@/utils/productDetailToFormValues";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import ProductForm from "../../components/ProductForm";

export default function ProductEditPage() {
  const { productId } = useParams() as { productId: string };
  const router = useRouter();
  const toaster = useToaster();
  const queryClient = useQueryClient();

  const { data: productData, isLoading } = useQuery({
    queryKey: ["productDetail", productId],
    queryFn: () => getProductDetail(productId),
    enabled: !!productId,
    select: (data) => transformToFormValues(data),
  });

  const mutation = useMutation({
    mutationFn: (data: ProductFormValues) => updateProduct(productId, data),
    onSuccess: () => {
      toaster("info", "상품을 수정했습니다");
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      router.push("/seller/my-products");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toaster("warn", "상품 수정 실패: " + error.message);
      } else {
        toaster("warn", "상품 수정 실패: 알 수 없는 에러");
      }
    },
  });

  // 데이터 참조값 고정 (메모이제이션)
  const memoizedInitialValues = useMemo(() => {
    if (!productData) return undefined;
    return productData;
  }, [productData]);

  const handleUpdate = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  // 로딩 중일 때는 폼을 렌더링하지 않음 (방어 로직)
  if (isLoading) {
    return <div className="mx-auto mt-[60px] w-[1520px] text-center">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="mx-auto mt-[60px] mb-[120px] flex w-[1520px] flex-col">
      <div className="mb-10 text-[28px] font-extrabold">상품 수정</div>
      <ProductForm
        mode="edit"
        initialValues={memoizedInitialValues}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
