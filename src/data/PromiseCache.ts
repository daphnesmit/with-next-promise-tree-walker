import React, { Context } from 'react';

export interface InitialCacheResult {
  [key: string]: any
}

interface PromiseCacheOptions {
  isSSR?: boolean
}
export class PromiseCache {
  private isSsrInitialized = false;
  private cachedResults = new Map<string, any>();
  private promises = new Map<string, Promise<any>>();

  private static context: Context<PromiseCache | null>;

  constructor({ isSSR }: PromiseCacheOptions) {
    this.isSsrInitialized = !!isSSR;
  }

  public static getContext() {
    if (!PromiseCache.context) {
      PromiseCache.context = React.createContext<PromiseCache | null>(null);
    }
    return PromiseCache.context;
  }

  public addPromise(id: string, promise: Promise<any>) {
    if (!this.promises.has(id)) {
      this.promises.set(id, promise);
    }
  }

  public getPromise(id: string): Promise<any> | undefined {
    if (this.promises.has(id)) {
      return this.promises.get(id);
    }
  }

  public getIsSsrInitialized(): boolean {
    return this.isSsrInitialized;
  }

  public hasPromises() {
    return this.promises.size > 0;
  }

  public consumeAndAwaitPromises() {
    return Promise.all(this.promises.values()).then(() => {
      this.promises.clear();
    });
  }

  public addResultToCache(id: string, data: any) {
    if (!this.cachedResults.has(id)) {
      this.cachedResults.set(id, data);
    }
  }

  public getResultFromCache<T>(id: string): T | undefined {
    if (this.cachedResults.has(id)) {
      return this.cachedResults.get(id);
    }
  }

  public setInitialCacheResultResult(state: InitialCacheResult) {
    for (const key in state) {
      this.cachedResults.set(key, state[key]);
    }
  }

  public getInitialCacheResultResult() {
    const cache: InitialCacheResult = {};
    this.cachedResults.forEach((value, key) => {
      cache[key] = value;
    });
    return cache;
  }

  public hasCache() {
    return this.cachedResults.size > 0;
  }

  public seal(): void {
    this.cachedResults.clear();
    this.promises.clear();
  }
}
