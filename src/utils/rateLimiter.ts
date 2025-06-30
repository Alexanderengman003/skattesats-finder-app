
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    // If no entry exists or the window has expired, create/reset
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // If under the limit, increment and allow
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Over the limit, deny
    return false;
  }

  getRemainingRequests(key: string, config: RateLimitConfig): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() >= entry.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    return entry ? entry.resetTime : Date.now();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  clicks: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 clicks per minute
  pageViews: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 page views per minute
  formData: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 form submissions per minute
};

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);
