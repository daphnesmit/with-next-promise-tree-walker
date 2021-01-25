import { useCallback, useMemo, useReducer } from 'react';

import { createReducer, getInitialState, State } from './reducer';
import { usePromiseCache } from './usePromiseCache';

interface IUsePromiseResultCache<T> {
  cachedData?: T
  state: State<T>
  setState: (data?: T, error?: Error) => void
  setData: (data: T) => void
  setError: (error: Error) => void
}

function usePromiseResultCache<T>(key: string): IUsePromiseResultCache<T> {
  const PromiseCache = usePromiseCache();

  const reducer = useMemo(() => createReducer<T>(), []);
  const cachedData = useMemo(() => PromiseCache.getResultFromCache<T>(key), [PromiseCache, key]);
  const initialState = useMemo(() => getInitialState(cachedData), [cachedData]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const setData = useCallback((data?: T) => {
    dispatch({ type: 'SET_DATA', data });
  }, []);

  const setError = useCallback((error: Error) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  const setState = useCallback((data?:T, error?: Error) => {
    if (data) setData(data);
    if (error) setError(error);
  }, [setData, setError]);

  return {
    cachedData,
    state,
    setState,
    setData,
    setError,
  };
}

export { usePromiseResultCache };
