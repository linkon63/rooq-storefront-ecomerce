import { configureStore } from "@reduxjs/toolkit";
import { rootReducer, type RootState } from "./root-reducer";

/**
 * App Router pattern: one store per request on the server and one per
 * browser tab, created by <StoreProvider>. Never export a module-level store
 * instance — it would leak state between requests.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type { RootState };
