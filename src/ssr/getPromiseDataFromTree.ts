/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';

import { PromiseCache } from '../data/PromiseCache';

type PromisesDataFromTreeContext = { promises: PromiseCache };

export function getPromiseDataFromTree(
  tree: React.ReactNode,
  context: PromisesDataFromTreeContext,
) {
  return getMarkupFromTree({
    tree,
    context,
    // If you need to configure this renderFunction, call getMarkupFromTree
    // directly instead of getDataFromTree.
    renderFunction: require('react-dom/server').renderToStaticMarkup,
  });
}

export type GetMarkupFromTreeOptions = {
  tree: React.ReactNode;
  context: PromisesDataFromTreeContext;
  renderFunction?: (tree: React.ReactNode) => string | PromiseLike<string>;
};

export function getMarkupFromTree(
  {
    tree,
    context,
    // The rendering function is configurable! We use renderToStaticMarkup as
    // the default, because it's a little less expensive than renderToString,
    // and legacy usage of getDataFromTree ignores the return value anyway.
    renderFunction = require('react-dom/server').renderToStaticMarkup,
  }: GetMarkupFromTreeOptions): Promise<string> {
  function process(): Promise<string> {
    const { promises } = context;

    return new Promise<string>(resolve => {
      resolve(renderFunction(tree));
    }).then(html => promises.hasPromises()
      ? promises.consumeAndAwaitPromises().then(process)
      : html,
    );
  }

  return Promise.resolve().then(process);
}
