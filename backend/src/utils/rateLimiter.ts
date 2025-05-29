import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

// In-memory rate limiter (fallback)
const rateLimiterMemory = new RateLimiterMemory({
  keyValueOrFunction: (req: Request) => req.ip,
  points: parseInt(process.env.API_RATE_LIMIT || '100'), // Number of requests
  duration: 60, // Per 60 seconds
});

// Redis rate limiter (if Redis is available)
let rateLimiterRedis: RateLimiterRedis | null = null;

if (process.env.REDIS_URL) {
  try {
    rateLimiterRedis = new RateLimiterRedis({
      storeClient: require('redis').createClient({ url: process.env.REDIS_URL }),
      keyValueOrFunction: (req: Request) => req.ip,
      points: parseInt(process.env.API_RATE_LIMIT || '100'),
      duration: 60,
    });
  } catch (error) {
    console.warn('Redis rate limiter not available, using memory limiter');
  }
}

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limiter = rateLimiterRedis || rateLimiterMemory;
    await limiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: secs,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
};

// Special rate limiter for analysis endpoints (more restrictive)
const analysisRateLimiter = new RateLimiterMemory({
  keyValueOrFunction: (req: Request) => req.ip,
  points: 5, // Only 5 analysis requests
  duration: 300, // Per 5 minutes
});

export const analysisRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await analysisRateLimiter.consume(req.ip);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Analysis rate limit exceeded. Please wait before analyzing another repository.',
        code: 'ANALYSIS_RATE_LIMIT_EXCEEDED',
        retryAfter: secs,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}; 