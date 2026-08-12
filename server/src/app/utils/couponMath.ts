interface CouponConfig {
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

export interface CartSource {
  price: number;
  discountPrice: number | null;
}

export function calculateCartTotals(
  courses: CartSource[],
  coupon: CouponConfig | null,
): { subtotal: number; discount: number; total: number } {
  const subtotal = courses.reduce((sum, course) => {
    return sum + (course.discountPrice ?? course.price);
  }, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  return {
    subtotal,
    discount: Math.round(discount * 100) / 100,
    total: Math.max(0, subtotal - discount),
  };
}

export function calculateItemDiscount(
  itemPrice: number,
  subtotal: number,
  totalDiscount: number,
): number {
  if (subtotal === 0 || totalDiscount === 0) return 0;
  const ratio = itemPrice / subtotal;
  return Math.round(ratio * totalDiscount * 100) / 100;
}