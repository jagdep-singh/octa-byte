interface CacheEntry<n> {
    data : n;
    timestamp: number;
}

class MemoryCache{

    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL: number;

    constructor(defaultTTL: number = 60000){
        this.defaultTTL = defaultTTL;
    }

    set<T>(key: string, data: T, ttl?: number): void{
        this.cache.set(key, 
            {
                data,
                timestamp: Date.now()
            }
        );
    }

    get<T>(key: string , ttl?: number): T | null{

        const entry = this.cache.get(key);

        if(!entry){
            return null;
        }

        const efectiveTTL = ttl || this.defaultTTL;
        const age = Date.now() - entry.timestamp;

        if(age > efectiveTTL){
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    has(key: string): boolean{
        return this.cache.has(key);
    }

    clear(): void{
        this.cache.clear();
    }
}

export const quoteCache = new MemoryCache(15000); // 15sec
export const fundamentalsCache = new MemoryCache(300000); // 5min