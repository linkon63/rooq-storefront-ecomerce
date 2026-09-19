"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main className="min-h-screen bg-brand-mist flex items-center justify-center">
      <p className="text-[#1f2a17] font-gotham text-sm font-semibold animate-pulse">
        Redirecting to Organishi Home...
      </p>
    </main>
  );
}
