import { cache } from "react";
import { getUserInfo } from "@/services/auth.services";

export const getCurrentUser = cache(async () => {
  return getUserInfo();
});
