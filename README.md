# with-next-promise-tree-walker
SSR data fetching using on component level without having to (pre)fetch in getInitialProps

[![CI Status](https://github.com/daphnesmit/with-next-promise-tree-walker/workflows/CI/badge.svg)](https://github.com/daphnesmit/with-next-promise-tree-walker/actions)
[![npm version](https://badge.fury.io/js/with-next-promise-tree-walker.svg)](https://badge.fury.io/js/with-next-promise-tree-walker)

## What is it?
This package consists of a `getPromiseDataFromTree` method, a `PromiseCache` class and a `usePromise` hook.
With this package you can achieve SSR data fetching on component level without having to (pre)fetch in getInitialProps.

This function walks down the entire React tree and executes every required promise it encounters (including nested promises).

When the Promise resolves, you're ready to render your React tree and return it, along with the current state of the cache.

__Sidenote!__
This library walks down the entire React tree on SSR.
It'll run renderToStaticMarkup from ReactDOMServer. Note that this is the React SSR API and means that it does a full server-render of the whole React tree.

Note that renderToStaticMarkup is a synchronous run to completion method, meaning that it can't await promises as of right now (Suspense might solve this).

In practice though you have usePromise components deeply nested in the React tree. React can't await those as said, so this is worked around by throwing a promise every time a query is found.

When the promise is thrown that is awaited and then the rendering starts again, from the beginning of the tree.

This means that if you have nested queries you cause a lot of full server-renders.

This solution might cause you a performance overhead.
But try it out and see if it is a bottleneck for you!

## Usage
See the `example` folder for a full fletched example on how to use this.

Start of by creating a custom Higher Order Component that uses PromiseCache and the getPromiseDataFromTree method:

```jsx
import { NextPage, NextPageContext } from 'next';
import App, { AppContext, AppInitialProps } from 'next/app';
import Head from 'next/head';
import React, { useMemo } from 'react';
import { InitialCache, PromiseCache } from 'with-next-promise-tree-walker';

type WithPromisesContext = AppContext & NextPageContext;

export interface IWithPromiseCacheSSRProps {
  promises?: PromiseCache
  initialCache?: InitialCache
}

function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Unknown';
}

export default function WithPromiseCacheSSR<T>(PageComponent: NextPage<any> | typeof App) {
  const PromiseCacheContext = PromiseCache.getContext();

  function WithPromises({ initialCache, promises, ...props }: IWithPromiseCacheSSRProps) {
    const _promises = useMemo<PromiseCache>(() => promises || new PromiseCache({ isSSR: false }), [promises]);

    if (initialCache && Object.keys(initialCache).length) {
      _promises.setInitialCacheResult(initialCache);
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

    // Head side effect therefore need to be cleared manually
    Head.rewind();
    
    return {
      ...pageProps,
      initialCache: promises.getInitialCacheResult(),
    };
  };

  return WithPromises;
}
```

In your Custom _app.tsx add the HOC around your app:

```jsx
import { WithPromiseCacheSSR } from '../hocs'

function MyApp({ Component, pageProps }: AppProps)  {
  return <Component {...pageProps} />
}

export default WithPromiseCacheSSR(MyApp)
```

In your component/page you need to use the `usePromise()` hook. This example uses Typescript.

```jsx
import { usePromise } from  'with-next-promise-tree-walker'

interface VercelRepo {
  name: string
  description: string
  subscribers_count: number
  stargazers_count: number
  forks_count: number
}
const fetcher = (url: string) => fetch(url).then(res => res.json());

const SomePage: React.FC = () => {
  const { isLoading, data, error } = usePromise<VercelRepo>('repos/vercel/swr', fetcher('https://api.github.com/repos/vercel/swr'), { ssr: true, skip: false });
  
  if (error) return <div>An error has occurred</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No results found.</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{" "}
      <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
};
```

## Authors
Made by [Daphne Smit](https://github.com/daphnesmit)

## Prior Art
The approach of doing an initial "data fetching pass" is inspired by:

- [`react-ssr-prepass`](https://github.com/FormidableLabs/react-ssr-prepass)
- [`react-apollo`'s `getDataFromTree`](https://github.com/apollographql/react-apollo/blob/master/src/getDataFromTree.ts)

## Production Build

Run `npm run build` to build a file for production and emit the types

## Development Build
Run `npm run dev` to build a file for development

## Contributing
You are free to contribute to this project!
Please use a conventional commit and make pull requests to the develop branch (pre-release branch).