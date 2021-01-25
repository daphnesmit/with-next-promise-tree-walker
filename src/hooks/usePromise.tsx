import { useRef } from 'react';

import { State } from './reducer';
import { useBasePromise, UsePromiseOptions } from './useBasePromise';
import { usePromiseResultCache } from './usePromiseResultCache';

function usePromise<T>(id: string, fetcher: Promise<T>, options?: UsePromiseOptions): State<T> {
  const hasFetched = useRef(false);
  const { state, setState } = usePromiseResultCache<T>(id);
  const fetchData = useBasePromise<T>(id, fetcher, options, setState);

  // If data is cached return data
  if (state.data) {
    return state;
  }

  // No cache found, fetch data once
  if (!hasFetched.current) fetchData();
  hasFetched.current = true;

  return state;
}

export { usePromise };
