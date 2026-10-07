import type { ComputeEngine, compile } from '@cortex-js/compute-engine';
import { useSyncExternalStore } from 'react';

/** The compute engine is large, so it is loaded on first use and shared by every node. */
export interface Engine {
  ce: ComputeEngine;
  compile: typeof compile;
}

let engine: Engine | undefined;
let loading: Promise<Engine> | undefined;

export function loadEngine(): Promise<Engine> {
  loading ??= import('@cortex-js/compute-engine').then((m) => {
    engine = { ce: new m.ComputeEngine(), compile: m.compile };
    return engine;
  });
  return loading;
}

function subscribe(onReady: () => void) {
  let active = true;
  void loadEngine().then(() => active && onReady());
  return () => {
    active = false;
  };
}

/** The shared engine, or `undefined` while it is still loading. */
export const useEngine = (): Engine | undefined => useSyncExternalStore(subscribe, () => engine);
