import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper functions for common Redis operations
export const cacheHelpers = {
  // Cache user session data
  async cacheUserSession(userId: string, data: any, ttl: number = 3600) {
    await redis.set(`user:session:${userId}`, JSON.stringify(data), { ex: ttl });
  },

  async getUserSession(userId: string) {
    const data = await redis.get(`user:session:${userId}`);
    return data ? JSON.parse(data as string) : null;
  },

  // Cache user credit balance for faster access
  async cacheUserBalance(userId: string, balance: number, ttl: number = 300) {
    await redis.set(`user:balance:${userId}`, balance, { ex: ttl });
  },

  async getUserBalance(userId: string): Promise<number | null> {
    const balance = await redis.get(`user:balance:${userId}`);
    return balance !== null ? Number(balance) : null;
  },

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    return current <= limit;
  },

  // Cache optimization results
  async cacheOptimization(optimizationId: string, data: any, ttl: number = 3600) {
    await redis.set(`optimization:${optimizationId}`, JSON.stringify(data), { ex: ttl });
  },

  async getOptimization(optimizationId: string) {
    const data = await redis.get(`optimization:${optimizationId}`);
    return data ? JSON.parse(data as string) : null;
  },

  // Queue for background jobs
  async queueJob(jobType: string, jobData: any) {
    await redis.lpush(`queue:${jobType}`, JSON.stringify(jobData));
  },

  async dequeueJob(jobType: string) {
    const job = await redis.rpop(`queue:${jobType}`);
    return job ? JSON.parse(job as string) : null;
  },
};



