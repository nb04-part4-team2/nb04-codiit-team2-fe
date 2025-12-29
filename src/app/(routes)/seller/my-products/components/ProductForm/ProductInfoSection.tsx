"use client";

import { uploadImageToS3 } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import Image from "next/image";
import { useState } from "react";
import { Control, FieldErrors, useController } from "react-hook-form";

const CATEGORIES = ["TOP", "BOTTOM", "DRESS", "OUTER", "SKIRT", "SHOES", "ACC"];

export function ProductInfoSection({
  control,
  errors,
}: {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}) {
  const { field: nameField } = useController({ name: "name", control });
  const { field: imageField } = useController({ name: "image", control });
  const { field: priceField } = useController({ name: "price", control });
  const { field: categoryField } = useController({ name: "category", control });

  const [isUploading, setIsUploading] = useState(false);
  const toaster = useToaster();
  const currentImageUrl = imageField.value;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const response = await uploadImageToS3(file);
        imageField.onChange(response.url);
        toaster("info", "이미지를 업로드했습니다.");
      } catch (error) {
        toaster("warn", "이미지 업로드에 실패했습니다.");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <section className="mb-[60px]">
      <h3 className="text-xl font-extrabold">상품정보</h3>
      <div className="bg-black01 mt-[10px] h-px w-full" />
      <div className="mt-[30px] flex flex-col gap-[30px]">
        <div className="flex items-center">
          <label
            htmlFor="product-name"
            className="text-black01 w-[117px] font-bold"
          >
            상품명
          </label>
          <>
            <input
              id="product-name"
              type="text"
              {...nameField}
              className="border-gray03 h-[45px] w-[390px] rounded-md border bg-white px-5 focus:outline-none"
            />
            {errors.name?.message && <p className="ml-3 text-sm text-red-500">{errors.name.message}</p>}
          </>
        </div>
        <div className="flex">
          <label
            htmlFor="product-image"
            className="text-black01 w-[117px] font-bold"
          >
            상품 이미지
          </label>
          <div>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => document.getElementById("product-image")?.click()}
              className="bg-gray05 relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-md p-[100px]"
              disabled={isUploading}
            >
              {isUploading ? (
                <div>Uploading...</div>
              ) : currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt="선택된 상품 이미지"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Image
                    src="/icon/gallery.svg"
                    alt="스토어 이미지 첨부"
                    width={40}
                    height={40}
                  />
                </div>
              )}
            </button>
          </div>
          {typeof errors.image?.message === "string" && (
            <p className="ml-3 text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>
        <div className="flex items-center">
          <label
            htmlFor="product-price"
            className="text-black01 w-[117px] font-bold"
          >
            판매가
          </label>
          <>
            <input
              id="product-price"
              type="text"
              value={
                priceField.value === undefined ? "" : priceField.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(e) => {
                const numericValue = e.target.value.replace(/,/g, "");
                if (/^\d*$/.test(numericValue)) {
                  if (numericValue === "") {
                    priceField.onChange(undefined);
                  } else {
                    priceField.onChange(Number(numericValue));
                  }
                }
              }}
              className="border-gray03 h-[45px] w-[390px] rounded-md border bg-white px-5 focus:outline-none"
            />
            {errors.price?.message && <p className="ml-3 text-sm text-red-500">{errors.price.message}</p>}
          </>
        </div>
        <div className="flex items-center">
          <label className="w-[117px]">카테고리</label>
          <select
            {...categoryField}
            className="border-gray03 h-[45px] w-[390px] rounded-md border bg-white px-5 focus:outline-none"
          >
            <option value="">카테고리를 선택하세요</option>
            {CATEGORIES.map((c) => (
              <option
                key={c}
                value={c}
              >
                {c}
              </option>
            ))}
          </select>
          {errors.category?.message && <p className="ml-3 text-sm text-red-500">{errors.category.message}</p>}
        </div>
      </div>
    </section>
  );
}
