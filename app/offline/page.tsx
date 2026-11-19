import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/** Shown by the service worker when a page cannot be reached. */
export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-extrabold">You are offline</h1>
        <p className="mt-3 text-ink/70">Check your internet connection and try again. Your bag and wishlist are saved on this device.</p>
      </div>
    </main>
  );
}
