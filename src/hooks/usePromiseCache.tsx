import { useContext } from 'react';

import { PromiseCache } from '../data/PromiseCache';

export const usePromiseCache = (): PromiseCache => {
  const context = useContext(PromiseCache.getContext());
  if (context === null) {
    throw new Error('usePromiseCache must be used within a PromiseCacheProvider');
  }

  return context;
};
