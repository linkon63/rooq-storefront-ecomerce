"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { validateNewsletterForm } from "@/utils/validateNewsletterForm";

/**
 * Four backdrops that cross-fade behind the sign-up form. The first one ships
 * with the design so the section paints instantly; the rest come from Unsplash,
 * whose host is already allow-listed in next.config.ts.
 */
const BACKGROUNDS = [
  "/images/home/newsletter-bg.png",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=900&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=900&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=1920&h=900&fit=crop&auto=format&q=80",
];

/** How long each backdrop holds before the next one fades in. */
const ROTATE_MS = 5000;

export default function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setSlide((current) => (current + 1) % BACKGROUNDS.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = validateNewsletterForm(email);
    if (!validation.success) {
      toast.error(validation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/resend/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message ?? "You are on the list — thank you!");
        setEmail("");
      } else {
        toast.info(data.message ?? "We could not sign you up right now.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      {BACKGROUNDS.map((background, index) => (
        <Image
          key={background}
          src={background}
          alt=""
          fill
          // Only the first backdrop is worth blocking paint for.
          priority={index === 0}
          sizes="100vw"
          className={`-z-10 object-cover transition-opacity duration-1000 ${
            index === slide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-[#1f2a17]/50" />

      <div className="mx-auto max-w-[1600px] px-4 py-20 text-center md:px-8 lg:py-28">
        <h2 className="font-display text-[28px] leading-tight text-white md:text-[40px]">
          Get Latest Updates & Big Deals
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[14px] text-white/85">
          Sign up to your newsletters for all the latest update and our exclusive promotion.
        </p>

        <form onSubmit={onSubmit} className="mt-7 flex justify-center" noValidate>
          <div className="flex w-full max-w-[520px] items-center rounded-full border border-white/40 bg-white/10 p-1 backdrop-blur-sm">
            <label htmlFor="newsletter-email" className="sr-only">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="h-11 min-w-0 flex-1 bg-transparent px-5 text-[14px] text-white outline-none placeholder:text-white/70"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-display h-11 shrink-0 rounded-full bg-[#4a9e2f] px-6 text-[15px] text-white transition-colors hover:bg-[#3d8626] disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Subscribe Now"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
