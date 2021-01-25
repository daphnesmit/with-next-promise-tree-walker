import { PromiseCache } from '../data/PromiseCache';
import { usePromiseCache } from './usePromiseCache';

interface IUsePromiseCacheSubscription<T> {
  addPromise: PromiseCache['addPromise']
  addResultToCache: PromiseCache['addResultToCache']
  cachedData?: T
  isSsrInitialized: boolean;
}

function usePromiseCacheSubscription<T>(): IUsePromiseCacheSubscription<T> {
  const PromiseCache = usePromiseCache();

  const isSsrInitialized = PromiseCache.getIsSsrInitialized();
  const addPromise = (id: string, data: Promise<any>) => PromiseCache.addPromise(id, data);
  const addResultToCache = (id: string, data: any) => PromiseCache.addResultToCache(id, data);

  return {
    addPromise,
    addResultToCache,
    isSsrInitialized,
  };
}

export { usePromiseCacheSubscription };
