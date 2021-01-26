import { useContext } from 'react';

import { PromiseCache } from '../data/PromiseCache';

export const usePromiseCache = (): PromiseCache | null => {
  const context = useContext(PromiseCache.getContext());
  return context;
};
