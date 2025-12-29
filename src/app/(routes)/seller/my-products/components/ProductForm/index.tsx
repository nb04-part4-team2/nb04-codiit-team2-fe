"use client";

import Button from "@/components/button/Button";
import { ProductFormValues, productFormSchema } from "@/lib/schemas/productForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ProductDetailSection } from "./ProductDetailSection";
import { ProductDiscountSection } from "./ProductDiscountSection";
import { ProductInfoSection } from "./ProductInfoSection";
import { ProductStockSection } from "./ProductStockSection";

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (data: ProductFormValues) => void;
  mode: "create" | "edit";
}
// 수정, 삭제 랜더링을 initialValues의 유무가 아닌 mode로 판단
export default function ProductForm({ mode, initialValues, onSubmit }: ProductFormProps) {
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ProductInfoSection
        control={control}
        errors={errors}
      />
      <ProductStockSection
        control={control}
        errors={errors}
      />
      <ProductDiscountSection
        control={control}
        errors={errors}
      />
      <ProductDetailSection
        control={control}
        errors={errors}
      />
      <div className="mt-[126px] flex justify-center">
        <Button
          type="submit"
          label={mode === "edit" ? "수정하기" : "등록하기"}
          className="h-[65px] w-[500px] text-lg"
          variant="primary"
          size="large"
        />
      </div>
    </form>
  );
}
