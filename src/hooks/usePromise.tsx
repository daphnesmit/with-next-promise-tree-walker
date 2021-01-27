import { useCallback, useRef } from 'react';
import { fetcherFn } from '../types';

import { State } from './reducer';
import { useBasePromise, UsePromiseOptions } from './useBasePromise';
import { usePromiseResultCache } from './usePromiseResultCache';
interface IUsePromiseAsync<T> extends State<T> {
  run: () => void
}

function usePromise<T>(id: string, fetcher: fetcherFn<T>, options?: UsePromiseOptions): IUsePromiseAsync<T> {
  const hasFetched = useRef(false);
  const { state, setState } = usePromiseResultCache<T>(id);
  const fetchData = useBasePromise<T>(id, fetcher, options, setState);

  const run = useCallback(() => {
    fetchData({ ssr: false });
  }, [fetchData]);

  // If data is cached return data
  if (state.data) {
    return { ...state, run };
  }

  // No cache found, fetch data once
  if (!hasFetched.current && !options?.skip) fetchData();
  hasFetched.current = true;

  return { ...state, run };
}

export { usePromise };
