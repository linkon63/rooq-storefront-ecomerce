"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { Messages } from "@/lib/i18n/messages";

const item = "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-selvedge";

/** Signed-in account icon: a small menu with the account page and sign out. Esc or an outside click closes it. */
export function AccountMenu({ t, buttonClassName }: { t: Messages["header"]; buttonClassName: string }) {
  const { user, logOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    await logOut();
    toast(SUCCESS_MESSAGES.storefront.signedOut);
    if (pathname.startsWith("/profile") || pathname.startsWith("/checkout")) router.push("/");
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        className={buttonClassName}
        aria-label={t.account}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <FiUser aria-hidden className="size-5" />
      </button>
      {open ? (
        <div id={menuId} role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded border border-line bg-paper py-1 shadow-sheet">
          {user?.name ? <p className="truncate border-b border-selvedge px-4 py-2.5 text-xs text-stone">{user.name}</p> : null}
          <Link href="/profile" role="menuitem" className={item} onClick={() => setOpen(false)}>
            <FiUser aria-hidden className="size-4" />
            {t.myAccount}
          </Link>
          <button type="button" role="menuitem" className={`${item} text-dye-deep`} onClick={() => void signOut()}>
            <FiLogOut aria-hidden className="size-4" />
            {t.signOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}
