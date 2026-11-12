"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore, type RootState } from "./store";

type StoreProviderProps = {
  children: ReactNode;
  /** Server-fetched state to hydrate with (e.g. currency from settings). */
  preloadedState?: Partial<RootState>;
};

/** Creates the Redux store once per mount (per request on the server). */
export function StoreProvider({ children, preloadedState }: StoreProviderProps) {
  const [store] = useState<AppStore>(() => makeStore(preloadedState));
  return <Provider store={store}>{children}</Provider>;
}
