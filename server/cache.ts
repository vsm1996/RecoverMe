import { createHash } from 'crypto';

// Simple in-memory cache with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  expiry: number; // Timestamp when this entry should expire
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // in milliseconds

  constructor(defaultTTL: number = 24 * 60 * 60 * 1000) { // Default TTL: 24 hours
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  // Generate a hash as cache key from the request data
  private generateKey(data: any): string {
    return createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  // Get cached response if available and not expired
  get<T>(data: any): T | null {
    const key = this.generateKey(data);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    console.log('Cache hit for:', key);
    return entry.data as T;
  }

  // Store response in cache with optional custom TTL
  set<T>(data: any, response: T, ttl: number = this.defaultTTL): void {
    const key = this.generateKey(data);
    
    this.cache.set(key, {
      data: response,
      expiry: Date.now() + ttl
    });
    
    console.log('Cached response for:', key);
  }

  // Clear expired entries (can be called periodically)
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats(): { size: number } {
    return {
      size: this.cache.size
    };
  }
}

// TTL values for different types of requests
export const CACHE_TTL = {
  RECOMMENDATION: 12 * 60 * 60 * 1000, // 12 hours
  RECOVERY_RECOMMENDATION: 12 * 60 * 60 * 1000, // 12 hours
  RECOVERY_PLAN: 24 * 60 * 60 * 1000,  // 24 hours
  MOVEMENT_ANALYSIS: 7 * 24 * 60 * 60 * 1000, // 7 days
  FEEDBACK_ANALYSIS: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Create and export singleton instance
export const apiCache = new ApiCache();

// Auto-cleanup every hour
setInterval(() => {
  apiCache.clearExpired();
}, 60 * 60 * 1000);