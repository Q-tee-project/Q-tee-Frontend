const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  STATIC: 5 * 60 * 1000,
  DYNAMIC: 1 * 60 * 1000,
  USER_DATA: 30 * 1000, 
};

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
};

export const setCachedData = <T>(key: string, data: T, ttl: number = CACHE_TTL.DYNAMIC): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};
export const createCacheKey = (prefix: string, ...params: any[]): string => {
  return `${prefix}:${params.join(':')}`;
};


export const preloadStaticData = async (): Promise<void> => {
  try {
    const staticDataKey = createCacheKey('static', 'config');
    const cachedStaticData = getCachedData(staticDataKey);
    
    if (!cachedStaticData) {
      const staticData = {
        studentColors: ['#22c55e', '#a855f7', '#eab308'],
        defaultTab: '클래스 관리',
        chartColors: ['#9674CF', '#18BBCB'],
      };
      
      setCachedData(staticDataKey, staticData, CACHE_TTL.STATIC);
    }
  } catch (error) {
  }
};
 export const preloadUserData = async (userId: string): Promise<void> => {
  try {
    const userDataKey = createCacheKey('user', userId);
    const cachedUserData = getCachedData(userDataKey);
    
    if (!cachedUserData) {
      const userData = {
        preferences: {
          defaultTab: '클래스 관리',
          theme: 'light',
        },
        lastVisited: Date.now(),
      };
      
      setCachedData(userDataKey, userData, CACHE_TTL.USER_DATA);
    }
  } catch (error) {
  }
};

export const clearExpiredCache = (): void => {
  const now = Date.now();
  for (const [key, cached] of cache.entries()) {
    if (now - cached.timestamp > cached.ttl) {
      cache.delete(key);
    }
  }
};

export const clearCache = (key: string): void => {
  cache.delete(key);
};

export const clearAllCache = (): void => {
  cache.clear();
};

if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, 5 * 60 * 1000);
}
