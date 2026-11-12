import type { ThunkAction, UnknownAction } from "@reduxjs/toolkit";
import type { RootState } from "../root-reducer";

/** A plain async thunk; resolves with whatever the thunk returns. */
export type AppThunk<R = Promise<void>> = ThunkAction<R, RootState, unknown, UnknownAction>;
