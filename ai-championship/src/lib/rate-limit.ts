/**
 * Rate Limiting Middleware
 * Prevents API abuse with in-memory rate limiting
 */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs?: number;
  max?: number;
}

export function rateLimit(config: RateLimitConfig = {}) {
  const windowMs = config.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = config.max || 100; // 100 requests per window

  return async (identifier: string): Promise<{ success: boolean; remaining: number }> => {
    const now = Date.now();
    const key = identifier;

    // Clean up expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    // Initialize or get current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    store[key].count++;

    const remaining = Math.max(0, max - store[key].count);
    const success = store[key].count <= max;

    return { success, remaining };
  };
}

// API-specific rate limiters
export const apiRateLimit = rateLimit({ windowMs: 60000, max: 60 }); // 60 req/min
export const authRateLimit = rateLimit({ windowMs: 900000, max: 5 }); // 5 req/15min
export const stripeRateLimit = rateLimit({ windowMs: 60000, max: 10 }); // 10 req/min
