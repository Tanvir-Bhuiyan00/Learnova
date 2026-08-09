import { Redis } from "@upstash/redis";
import { envVars } from "../config/env";

const REDIS_URL = envVars.REDIS_URL || "";

const parseRedisUrl = (url: string): { url: string; token: string } => {
  const parsed = new URL(url);
  return {
    url: `https://${parsed.hostname}`,
    token: decodeURIComponent(parsed.password || parsed.username),
  };
};

export const redis: Redis | null = REDIS_URL
  ? new Redis(parseRedisUrl(REDIS_URL))
  : null;

export const RAG_CACHE_TTL_SECONDS = 1800;
