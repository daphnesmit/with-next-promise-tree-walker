import { NextPage, NextPageContext } from 'next';
import App, { AppContext, AppInitialProps } from 'next/app';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { InitialCacheResult, PromiseCache } from 'with-next-promise-tree-walker';

type WithPromisesContext = AppContext & NextPageContext;

export interface IWithPromiseCacheSSRProps {
  promises?: PromiseCache
  initialCacheResult?: InitialCacheResult
}

function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Unknown';
}

export { getDisplayName };

export default function WithPromiseCacheSSR<T>(PageComponent: NextPage<any> | typeof App) {
  const PromiseCacheContext = PromiseCache.getContext();

  function WithPromises({ initialCacheResult, promises, ...props }: IWithPromiseCacheSSRProps) {
    const _promises = useMemo<PromiseCache>(() => promises || new PromiseCache({ isSSR: false }), [promises]);

    if (initialCacheResult && Object.keys(initialCacheResult).length) {
      _promises.setInitialCacheResult(initialCacheResult);
    }

    return (
      <PromiseCacheContext.Provider value={_promises}>
        <PageComponent {...props} />
      </PromiseCacheContext.Provider>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    WithPromises.displayName = `WithPromises(${getDisplayName(PageComponent)})`;
  }

  WithPromises.getInitialProps = async (ctx: WithPromisesContext) => {
    const { AppTree } = ctx;
    const isInAppContext = Boolean(ctx.ctx);

    let pageProps = {};
    if (PageComponent.getInitialProps) {
      pageProps = { ...pageProps, ...(await PageComponent.getInitialProps(ctx)) };
    }

    if (typeof window !== 'undefined') {
      return pageProps;
    }

    if (ctx.res && (ctx.res.headersSent || ctx.res.writableEnded)) {
      return pageProps;
    }

    const promises = new PromiseCache({ isSSR: true });

    try {
      const { getPromiseDataFromTree } = await import('with-next-promise-tree-walker');
      // Since AppComponents and PageComponents have different context types
      // we need to modify their props a little.
      let props;
      if (isInAppContext) {
        props = { ...pageProps, promises };
      } else {
        props = { pageProps: { ...pageProps, promises } };
      }
      await getPromiseDataFromTree(<AppTree {...props as AppInitialProps} />, { promises });
    } catch (error) {
      promises.seal();
      console.error('Error while running `getPromiseDataFromTree`', error);
    }

    // head side effect therefore need to be cleared manually
    Head.rewind();

    return {
      ...pageProps,
      initialCacheResult: promises.getInitialCacheResult(),
    };
  };

  return WithPromises;
}
