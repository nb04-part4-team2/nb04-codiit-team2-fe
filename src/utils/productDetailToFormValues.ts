import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { CategoryType, ProductInfoData } from "@/types/Product";

export function transformToFormValues(data: ProductInfoData): ProductFormValues {
  // swagger 문서와 프론트에서 실제 사용하는 변수의 타입 불일치 문제 때문에 추가된 부분
  // swagger 문서에서는 상품 조회 결과 카테고리를 배열로 표기해두었는데 정작 프론트에서는 객체로 사용
  // 그래서 배열이면 0번째 인덱스 값을 사용하면 객체가 오면 그대로 쓰도록 추가
  let categoryName = '';
  if (Array.isArray(data.category) && data.category.length > 0) {
    // 배열로 올 경우 첫 번째 요소 사용
    categoryName = data.category[0].name;
  } else if (data.category && typeof data.category === 'object' && 'name' in data.category) {
    // 단일 객체로 올 경우 바로 사용
    categoryName = data.category.name as unknown as CategoryType;
  }

  const formatDateTimeLocal = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return {
    name: data.name,
    image: data.image ?? null,
    price: data.price,
    category: categoryName.toUpperCase() as CategoryType,
    sizes: data.stocks.map((s) => s.size.name.toUpperCase()),
    stocks: data.stocks.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.size.name.toUpperCase()] = curr.quantity;
      return acc;
    }, {}),

    discount: {
      enabled: data.discountRate > 0,
      value: data.discountRate > 0 ? data.discountRate : null,
      periodEnabled: !!(data.discountStartTime && data.discountEndTime),
      periodStart: formatDateTimeLocal(data.discountStartTime),
      periodEnd: formatDateTimeLocal(data.discountEndTime),
    },
    detail: data.content,
  };
}
