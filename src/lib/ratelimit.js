import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 60 seconds mein 5 requests ki ijazat
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
});