"use client";

import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";

/** Mobile menu "Sign out" row; renders nothing for guests. */
export function MobileSignOut({ label, onDone }: { label: string; onDone: () => void }) {
  const { isSignedIn, logOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  if (!isSignedIn) return null;

  const signOut = async () => {
    onDone();
    await logOut();
    toast(SUCCESS_MESSAGES.storefront.signedOut);
    if (pathname.startsWith("/profile") || pathname.startsWith("/checkout")) router.push("/");
  };

  return (
    <li>
      <button type="button" onClick={() => void signOut()} className="block w-full py-2 text-left font-semibold text-dye-deep">
        {label}
      </button>
    </li>
  );
}
