"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IWishlistItem,
  IAddWishlistItemPayload,
} from "@/types/wishlist.types";

export const getWishlist = async () => {
  try {
    const items = await httpClient.get<IWishlistItem[]>("/wishlists");
    return items;
  } catch (error) {
    console.log("Error fetching wishlist:", error);
    throw error;
  }
};

export const addToWishlist = async (payload: IAddWishlistItemPayload) => {
  try {
    const item = await httpClient.post<IWishlistItem>("/wishlists", payload);
    return item;
  } catch (error) {
    console.log("Error adding to wishlist:", error);
    throw error;
  }
};

export const removeFromWishlist = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/wishlists/${id}`);
    return result;
  } catch (error) {
    console.log("Error removing from wishlist:", error);
    throw error;
  }
};
