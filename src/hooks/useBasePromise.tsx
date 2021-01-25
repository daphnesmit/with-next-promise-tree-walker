import { useCallback } from 'react';
import { isSSR } from '../utils/isSSR';

import { usePromiseCacheSubscription } from './usePromiseCacheSubscription';

export type UsePromiseOptions = {
  ssr?: boolean
  skip?: boolean
}

export type UsePromiseCallback<T> = (data?: T, error?: Error) => void

function useBasePromise<T>(
  id: string,
  fetcher: Promise<T>,
  options?: UsePromiseOptions,
  callback?: UsePromiseCallback<T>,
) {
  const { addPromise, isSsrInitialized, addResultToCache } = usePromiseCacheSubscription<T>();

  const getPromiseSuccess = useCallback((data: T) => {
    addResultToCache(id, data);

    if (!isSSR && callback) {
      callback(data, undefined);
    }

    return data;
  }, [addResultToCache, callback, id]);

  const getPromiseError = useCallback((error: Error) => {
    addResultToCache(id, undefined);

    if (!isSSR && callback) {
      callback(undefined, error);
    } else {
      // throw an error during SSR
      throw error;
    }
    return error;
  }, [addResultToCache, callback, id]);

  const getPromise = useCallback((promise: Promise<T>) => {
    return promise
      .then(getPromiseSuccess)
      .catch(getPromiseError);
  }, [getPromiseError, getPromiseSuccess]);

  const fetchDataSSR = useCallback(() => {
    addPromise(id, getPromise(fetcher));
  }, [addPromise, fetcher, getPromise, id]);

  const fetchDataClient = useCallback(() => {
    getPromise(fetcher);
  }, [fetcher, getPromise]);

  const fetchData = useCallback(() => {
    if (options?.skip) return;

    if (isSSR && isSsrInitialized && options?.ssr) {
      fetchDataSSR();
    }

    if (!isSSR && !options?.ssr) {
      fetchDataClient();
    }
  }, [isSsrInitialized, options, fetchDataSSR, fetchDataClient]);

  return fetchData;
}
export { useBasePromise };
