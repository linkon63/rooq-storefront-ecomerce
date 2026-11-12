"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { authClosed, authViewChanged, selectAuthView } from "@/lib/store/slices/session-slice";
import { Modal } from "../shared/modal";
import { ForgotForm } from "./forgot-form";
import { GoogleButton } from "./google-button";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const TITLES = { login: "Sign in", register: "Create an account", forgot: "Reset your password" } as const;

/** Sign-in / sign-up sheet. Google loads only here, and only when a client id is configured. */
export function AuthSheet() {
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectAuthView);
  const close = () => dispatch(authClosed());

  return (
    <Modal open onOpenChange={(open) => (open ? null : close())} title={TITLES[view]} placement="right">
      <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
        {view === "login" ? <LoginForm /> : null}
        {view === "register" ? <RegisterForm /> : null}
        {view === "forgot" ? <ForgotForm /> : null}

        {view !== "forgot" && GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleButton />
          </GoogleOAuthProvider>
        ) : null}

        <p className="border-t border-selvedge pt-5 text-sm">
          {view === "login" ? (
            <>
              New to Rooq?{" "}
              <button type="button" className="font-semibold underline underline-offset-4" onClick={() => dispatch(authViewChanged("register"))}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="font-semibold underline underline-offset-4" onClick={() => dispatch(authViewChanged("login"))}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </Modal>
  );
}
