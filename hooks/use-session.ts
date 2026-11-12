"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  authOpened,
  selectSessionStatus,
  selectShopper,
  type AuthView,
} from "@/lib/store/slices/session-slice";
import { signOut } from "@/lib/store/slices/session-thunks";

/** The shopper, whether the session check has finished, and the sign-in sheet. */
export function useSession() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectShopper);
  const status = useAppSelector(selectSessionStatus);
  const openAuth = useCallback((view?: AuthView) => dispatch(authOpened(view)), [dispatch]);
  const logOut = useCallback(() => dispatch(signOut()), [dispatch]);
  return { user, status, isSignedIn: status === "signedIn", openAuth, logOut };
}
