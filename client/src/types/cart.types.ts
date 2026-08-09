export interface ICart {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  couponId?: string | null;
}

export interface ICartItem {
  id: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  cartId: string;
  courseId: string;
}

export interface IAddToCartPayload {
  courseId: string;
}

export interface IApplyCouponPayload {
  code: string;
}
