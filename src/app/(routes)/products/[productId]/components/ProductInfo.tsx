"use client";

import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import Divder from "@/components/divider/Divder";
import OptionSelect from "@/components/select/OptionSelect";
import { getCart, patchCart, postCart } from "@/lib/api/cart";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/stores/userStore";
import { ProductInfoData } from "@/types/Product";
import { CartEdit, CartEditSize } from "@/types/cart";
import { OrderItemInfo } from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductContent from "./ProductContent";
import ProductOptions from "./ProductOptions";
import Stars from "./Stars";

interface ProductInfoProps {
  productId: string;
  data: ProductInfoData;
}

const ProductInfo = ({ productId, data }: ProductInfoProps) => {
  const [options, setOptions] = useState<CartEditSize[]>([]);
  const { user } = useUserStore();
  const [image, setImage] = useState<string>(data.image);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const setSelectedItems = useOrderStore((state) => state.setSelectedItems);
  const router = useRouter();
  const toaster = useToaster();

  const { data: cartData } = useQuery({
    queryKey: ["cartData", productId],
    queryFn: () => getCart(),
    enabled: user !== null && user.type === "BUYER",
    select: (cart): CartEditSize[] => {
      return cart.items
        .filter((i) => i.productId === productId)
        .map((i) => ({ sizeId: i.sizeId, quantity: i.quantity }));
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { mutate: editCart, isPending } = useMutation({
    mutationFn: (body: CartEdit) => patchCart(body),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["cartData", productId] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setSelectedItems(response.map((item) => ({ ...item, product: data as ProductInfoData })));
      setOptions([]);
      setIsModalOpen(true);
    },
    onError: async (error: unknown, variables: CartEdit) => {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        try {
          await postCart();
          editCart(variables);
        } catch (postError) {
          if (axios.isAxiosError(postError)) {
            toaster("warn", postError.response?.data.message);
          }
        }
      } else if (axios.isAxiosError(error)) {
        toaster("warn", error.response?.data.message);
      }
    },
  });

  const totalCount = options.reduce((acc, cur) => acc + cur.quantity, 0);

  const handleSelect = (value: number) => {
    if (options.some((option) => option.sizeId === value)) {
      toaster("warn", "이미 선택한 옵션입니다.");
      return;
    }
    setOptions((prev) => [...prev, { sizeId: value, quantity: 1 }]);
  };

  const addCart = () => {
    if (options.length === 0) {
      toaster("warn", "옵션을 선택해 주세요.");
      return;
    }
    if (!user) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    if (user.type === "SELLER") {
      toaster("warn", "바이어로 로그인해 주세요.");
      return;
    }

    const grouped: { [key: number]: CartEditSize } = {};
    const itemsToGroup = cartData ? [...options, ...cartData] : options;

    itemsToGroup.forEach(({ sizeId, quantity }) => {
      grouped[sizeId] = { sizeId, quantity: (grouped[sizeId]?.quantity || 0) + quantity };
    });

    const newSizes = options.map((opt) => {
      const existingItem = cartData?.find((item) => item.sizeId === opt.sizeId);
      return {
        sizeId: opt.sizeId,
        quantity: opt.quantity + (existingItem?.quantity || 0),
      };
    });

    const existingSizes =
      cartData
        ?.filter((item) => !options.some((opt) => opt.sizeId === item.sizeId))
        .map((item) => ({ sizeId: item.sizeId, quantity: item.quantity })) || [];

    editCart({ productId, sizes: [...newSizes, ...existingSizes] });
  };

  const orderProduct = () => {
    if (options.length === 0) {
      toaster("warn", "옵션을 선택해 주세요.");
      return;
    }
    if (!user) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    if (user.type === "SELLER") {
      toaster("warn", "바이어로 로그인해 주세요.");
      return;
    }

    const orderItems: OrderItemInfo[] = options.map((opt) => {
      const tempItemId = `${productId}-${opt.sizeId}`;
      return {
        id: tempItemId,
        productId: productId,
        sizeId: opt.sizeId,
        quantity: opt.quantity,
        product: data,
      };
    });

    setSelectedItems(orderItems);
    router.push("/buyer/order");
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="relative size-182.5">
          {data.image && (
            <Image
              className="rounded-xl object-cover"
              src={image}
              alt="image"
              priority
              fill
              unoptimized
              onError={() => setImage("/icon/image_fail.svg")}
            />
          )}
        </div>
        <div className="w-182.5">
          <Link
            className="text-gray01 mb-2.5 flex w-fit items-center gap-2.5 text-lg leading-none"
            href={`/stores/${data.storeId}`}
          >
            {data.storeName}
            <Image
              src="/icon/arrowRight.svg"
              alt="icon"
              width={22}
              height={22}
            />
          </Link>
          <h2 className="mb-5 text-[1.75rem] leading-10.5 font-bold">{data.name}</h2>
          <div className="mb-7.5 flex items-center gap-2.5">
            <Stars
              rating={data.reviewsRating}
              size="medium"
            />
            <p className="leading-none underline decoration-1">리뷰 {data.reviewsCount}개</p>
          </div>
          <Divder className="my-7.5" />
          <div className="text-gray01 text-lg">
            <div className="flex">
              <p>판매가</p>
              <p className="text-black01 ml-22.5 font-extrabold">{Math.floor(data.discountPrice).toLocaleString()}원</p>
              {data.price > data.discountPrice && (
                <p className="ml-2 font-bold line-through">{data.price.toLocaleString()}원</p>
              )}
            </div>
            <OptionSelect
              options={data.stocks}
              onSelect={handleSelect}
            >
              <div className="my-5 flex cursor-pointer justify-between py-5">
                <p>사이즈</p>
                <Image
                  src="/icon/arrowBottom.svg"
                  alt="icon"
                  width={24}
                  height={24}
                />
              </div>
            </OptionSelect>
          </div>
          <Divder className="mb-7.5" />
          <div className="min-h-36.25 space-y-2.5">
            {options.map((option) => (
              <ProductOptions
                key={option.sizeId}
                price={Math.floor(data.discountPrice)}
                option={option}
                setOptions={setOptions}
                stock={data.stocks}
              />
            ))}
          </div>
          <Divder className="my-7.5" />
          <div>
            <div className="my-7.5 flex items-center justify-between">
              <p className="text-black01 text-lg leading-none font-extrabold">총 주문 금액</p>
              <p className="text-black01 text-4xl leading-10.5 font-extrabold">
                {(data.discountPrice !== undefined && Math.floor(data.discountPrice) * totalCount).toLocaleString()}원
              </p>
            </div>
            <div className="flex justify-between gap-5">
              <Button
                className="h-21.25 w-88.75"
                variant="secondary"
                label="장바구니 담기"
                size="large"
                color="white"
                onClick={addCart}
                disabled={isPending}
              />
              <Button
                className="h-21.25 w-88.75"
                label="구매하기"
                size="large"
                variant="secondary"
                onClick={orderProduct}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </div>
      <Divder className="my-20" />
      <h2 className="text-black01 text-[1.75rem] leading-none font-extrabold">상품 상세 정보</h2>
      <div className="mt-10">
        <ProductContent content={data.content} />
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="flex h-fit w-130 flex-col gap-10">
            <div className="space-y-2 text-xl">
              <p className="">상품이 담겼습니다.</p>
              <p>장바구니로 이동하시겠습니까?</p>
            </div>
            <div className="flex gap-5">
              <Button
                className="h-15 w-full"
                variant="secondary"
                label="취소"
                size="large"
                color="white"
                onClick={() => setIsModalOpen(false)}
              />
              <Button
                className="h-15 w-full"
                label="이동하기"
                size="large"
                variant="secondary"
                onClick={() => router.push("/buyer/shopping")}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductInfo;
