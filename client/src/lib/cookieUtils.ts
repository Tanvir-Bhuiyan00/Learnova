"use server";

import { cookies } from "next/headers";

// Cookies must only be marked Secure when the app is served over HTTPS.
// Setting Secure over plain HTTP (e.g. the IP-only dev/prod site) makes the
// browser silently drop the cookie, which breaks login/refresh — mirror the
// middleware's isSecureContext logic.
const isSecureContext =
  process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith("https://") ?? false;

export const setCookie = async (
  name: string,
  value: string,
  maxAgeInSeconds: number,
) => {
  const cookieStore = await cookies();

  cookieStore.set(name, value, {
    httpOnly: true,
    secure: isSecureContext,
    sameSite: isSecureContext ? "strict" : "lax",
    path: "/",
    maxAge: maxAgeInSeconds,
  });
};

export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
};

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(name);
};
