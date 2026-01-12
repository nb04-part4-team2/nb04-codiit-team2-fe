"use client";

import MyPageMenu from "@/components/MyPageMenu";
import Tab from "@/components/Tab";
import InterestStore from "@/components/buyer/InterestStore";
import MypageItemCard from "@/components/item/MypageItemCard";
import MypageHeader from "@/components/mypage/MypageHeader";
import { menuItems } from "@/data/buyerMenuItems";
import useIntersectionObserver from "@/hooks/useIntersection";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { Order, OrdersResponse } from "@/types/order";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ORDER_TABS = [
  { key: "CompletedPayment", label: "최근 주문 내역" },
  { key: "WaitingPayment", label: "결제 대기" },
];

export default function MyPage() {
  const axiosInstance = getAxiosInstance();
  const [selectedMenu, setSelectedMenu] = useState("mypage");
  const [selectedTab, setSelectedTab] = useState("CompletedPayment");
  const router = useRouter();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["mypage-orders", selectedTab],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosInstance.get<OrdersResponse>("/orders", {
        params: {
          status: selectedTab,
          limit: 10,
          page: pageParam,
        },
      });
      return {
        orders: data.data,
        nextPage: pageParam < data.meta.totalPages ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const { setTarget } = useIntersectionObserver({
    hasNextPage,
    fetchNextPage,
  });

  const allOrders = data?.pages.flatMap((page) => page.orders) ?? [];
  const visibleOrders = allOrders.filter((order) => order.orderItems.some((item) => item.product));

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1520px] gap-10 pt-[3.75rem]">
        <MyPageMenu
          items={menuItems}
          selectedId={selectedMenu}
          onSelect={(id, path) => {
            setSelectedMenu(id);
            router.push(path);
          }}
          className="h-[280px] w-[218px] flex-shrink-0"
        />
        <div className="flex flex-1 flex-col gap-5">
          <MypageHeader />
          <div className="flex w-full flex-col gap-15">
            <div className="w-full">
              <Tab
                tabs={ORDER_TABS}
                value={selectedTab}
                onChange={setSelectedTab}
              />
              {isLoading ? (
                <div className="flex justify-center py-8">로딩 중...</div>
              ) : visibleOrders.length === 0 ? (
                <div className="flex justify-center py-8 text-gray-500">
                  {selectedTab === "WaitingPayment" ? "결제 대기 중인 주문이 없습니다." : "주문 내역이 없습니다."}
                </div>
              ) : (
                <div className="h-[600px] overflow-y-auto px-5">
                  {visibleOrders.map((order: Order) => (
                    <MypageItemCard
                      key={order.id}
                      order={order}
                    />
                  ))}
                  {hasNextPage && (
                    <div
                      ref={setTarget}
                      className="flex h-20 items-center justify-center"
                    >
                      {isFetchingNextPage && "로딩 중..."}
                    </div>
                  )}
                </div>
              )}
            </div>
            <InterestStore />
          </div>
        </div>
      </div>
    </div>
  );
}
