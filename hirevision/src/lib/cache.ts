const cache = new Map<string, { data: any; timestamp: number }>();

export const cacheManager = {
  set: (key: string, data: any, ttl: number = 300000) => {
    cache.set(key, { data, timestamp: Date.now() + ttl });
  },

  get: <T>(key: string): T | null => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.timestamp) {
      cache.delete(key);
      return null;
    }
    
    return item.data as T;
  },

  delete: (key: string) => {
    cache.delete(key);
  },

  clear: () => {
    cache.clear();
  },

  has: (key: string): boolean => {
    const item = cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.timestamp) {
      cache.delete(key);
      return false;
    }
    
    return true;
  },
};

