"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch } from "@/lib/store/hooks";
import { signInWithGoogle } from "@/lib/store/slices/session-thunks";
import { errorText } from "@/utils/api-error";

export function GoogleButton() {
  const dispatch = useAppDispatch();
  const login = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        await dispatch(signInWithGoogle(access_token));
        toast.success(SUCCESS_MESSAGES.storefront.signedIn);
      } catch (caught) {
        toast.error(errorText(caught, ERROR_MESSAGES.storefront.googleFailed));
      }
    },
    onError: () => toast.error(ERROR_MESSAGES.storefront.googleFailed),
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="inline-flex h-12 items-center justify-center gap-2 rounded border border-line bg-paper text-sm font-semibold hover:border-ink"
    >
      <FcGoogle aria-hidden className="size-5" />
      Continue with Google
    </button>
  );
}
