"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICart,
  ICartItem,
  IAddToCartPayload,
  IApplyCouponPayload,
} from "@/types/cart.types";

export const getCart = async () => {
  try {
    const cart = await httpClient.get<ICart>("/carts");
    return cart;
  } catch (error) {
    console.log("Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (payload: IAddToCartPayload) => {
  try {
    const cartItem = await httpClient.post<ICartItem>("/carts/items", payload);
    return cartItem;
  } catch (error) {
    console.log("Error adding to cart:", error);
    throw error;
  }
};

export const removeFromCart = async (courseId: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/carts/items/${courseId}`,
    );
    return result;
  } catch (error) {
    console.log("Error removing from cart:", error);
    throw error;
  }
};

export const applyCoupon = async (payload: IApplyCouponPayload) => {
  try {
    const result = await httpClient.post<ICart>("/carts/coupon", payload);
    return result;
  } catch (error) {
    console.log("Error applying coupon:", error);
    throw error;
  }
};

export const removeCoupon = async () => {
  try {
    const result = await httpClient.delete<{ message: string }>("/carts/coupon");
    return result;
  } catch (error) {
    console.log("Error removing coupon:", error);
    throw error;
  }
};
