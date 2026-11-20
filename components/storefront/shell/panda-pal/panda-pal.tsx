"use client";

import "./panda-pal.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiMoon, FiPhone, FiShoppingBag, FiX } from "react-icons/fi";
import type { Locale } from "@/lib/i18n/locales";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount, selectCartHydrated } from "@/lib/store/slices/cart-slice";
import { selectAuthOpen } from "@/lib/store/slices/session-slice";
import {
  selectIsMobileNavOpen,
  selectIsSearchOpen,
  selectIsWhatsappHighlighted,
  setCartDrawerOpen,
} from "@/lib/store/slices/ui-slice";
import { PANDA_COPY } from "./panda-copy";
import {
  PANDA_ADD_BUTTON_SELECTOR,
  PANDA_CUE_EVENT,
  takePendingPandaCue,
  type PandaCueDetail,
} from "./panda-events";
import { PandaBasket, PandaFigure, type PandaMood } from "./panda-figure";

/* ---- Tuning: how often Tulo may speak. Keep him a helper, not a nag. ---- */
const SECOND = 1000;
const GREET_AFTER = 5 * SECOND;
const IDLE_PLAY_AFTER = 35 * SECOND;
const CHECKOUT_HELP_AFTER = 60 * SECOND;
const BAG_REMIND_AFTER = 90 * SECOND;
const LOW_STOCK_AFTER = 15 * SECOND;
const PRODUCT_HELP_AFTER = 40 * SECOND;
/** Minimum quiet time between unprompted nudges, and how many per visit. */
const NUDGE_GAP = 75 * SECOND;
const MAX_NUDGES_PER_VISIT = 5;
/** "Need help?" bubbles skip the nudge budget but not this gap. */
const HELP_GAP = 2 * 60 * SECOND;
const SAY_FOR = 2 * SECOND;
const HELP_SAY_FOR = 4 * SECOND;
const SHORT_SAY_FOR = 2 * SECOND;
const DANCE_FOR = 4 * SECOND;
const PEEK_EVERY_MIN = 45 * SECOND;
const PEEK_EVERY_MAX = 90 * SECOND;
const SLEEP_FOR = 24 * 60 * 60 * SECOND;
const RAGE_CLICKS = 3;
const RAGE_WINDOW = 800;

const KEY = {
  seen: "rooq:panda:seen",
  sleepUntil: "rooq:panda:sleep-until",
  nudges: "rooq:panda:nudges",
  greeted: "rooq:panda:greeted",
  bag: "rooq:panda:bag-reminded",
  exit: "rooq:panda:exit",
  thanks: "rooq:panda:thanks",
} as const;

type Pose = "away" | "peek" | "out" | "sleep";
/** user = he was tapped or direct add-to-bag interaction; help = trouble spotted; nudge = unprompted sales talk; event = reaction to what just happened. */
type SayKind = "user" | "help" | "nudge" | "event";
type BubbleAction =
  | { type: "link"; label: string; href: string }
  | { type: "whatsapp"; label: string; href: string }
  | { type: "bag"; label: string }
  | { type: "sleep"; label: string };
type Bubble = { id: number; text: string; actions: BubbleAction[]; showPhone: boolean };
type SayOptions = { actions?: BubbleAction[]; showPhone?: boolean; mood?: PandaMood; ms?: number; hop?: boolean };

/** Same hotline, call link and WhatsApp link as the header's top bar (see the store layout). */
export type PandaPalProps = { locale: Locale; phone: string; telHref: string; whatsappHref: string };

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}
const read = (kind: "local" | "session", key: string) => store(kind)?.getItem(key) ?? null;
const write = (kind: "local" | "session", key: string, value: string) => {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    /* private mode: Tulo just forgets */
  }
};
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Tulo, the virtual panda. He hides in a woven basket in the bottom-left
 * corner, peeks out now and then, plays when tapped, cheers when the shopper
 * hovers "Add to bag", dances when an item is added to the bag, nudges gently
 * towards buying (low stock, a waiting bag) and, when a shopper seems stuck
 * (rage clicks, an error page, a long pause at checkout), offers the shop's
 * phone number and WhatsApp.
 */
export function PandaPal({ locale, phone, telHref, whatsappHref }: PandaPalProps) {
  const t = PANDA_COPY[locale] ?? PANDA_COPY.en;
  const uid = useId().replace(/:/g, "");
  const pathname = usePathname() ?? "/";
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const cartHydrated = useAppSelector(selectCartHydrated);
  const threadFinished = useAppSelector(selectIsWhatsappHighlighted);
  const overlayOpen = useAppSelector(
    (state) => selectIsSearchOpen(state) || selectAuthOpen(state) || selectIsMobileNavOpen(state),
  );

  const [pose, setPose] = useState<Pose>("away");
  const [mood, setMood] = useState<PandaMood>("idle");
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [hop, setHop] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; dx: number }[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const moodTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const prevCartCount = useRef<number | null>(null);
  /** Latest values for timers and listeners, so they never read stale state. */
  const live = useRef({
    pose: "away" as Pose,
    bubble: null as Bubble | null,
    asleep: false,
    blocked: false,
    hovering: false,
    cartCount: 0,
    pathname: "/",
    page: new Set<string>(),
    lastActivity: 0,
    lastNudge: 0,
    lastHelp: 0,
    lastCartChange: 0,
    nextPeek: 0,
    dancingUntil: 0,
    lastDanceAt: 0,
    taps: 0,
  });

  useEffect(() => {
    live.current.pose = pose;
    live.current.blocked = overlayOpen;
    live.current.cartCount = cartCount;
  });

  const contact = useMemo(() => ({ tel: telHref, wa: whatsappHref }), [telHref, whatsappHref]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  const spawnHearts = useCallback(
    (count = 1) => {
      for (let i = 0; i < count; i += 1) {
        later(() => {
          const id = Date.now() + Math.random();
          const dx = Math.round(randomBetween(-20, 20));
          setHearts((list) => [...list.slice(-7), { id, dx }]);
          later(() => setHearts((list) => list.filter((h) => h.id !== id)), 1200);
        }, i * 130);
      }
    },
    [later],
  );

  const rest = useCallback(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(moodTimer.current);
    const l = live.current;
    l.bubble = null;
    setBubble(null);
    setMood(l.asleep ? "sleep" : "idle");
    setPose(l.asleep ? "sleep" : "peek");
  }, []);

  const armHide = useCallback(
    (ms: number) => {
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        if (!live.current.hovering) rest();
      }, ms);
    },
    [rest],
  );

  const say = useCallback(
    (kind: SayKind, text: string, opts: SayOptions = {}) => {
      const l = live.current;
      const now = Date.now();
      if (kind !== "user") {
        if (l.blocked || l.asleep) return false;
        if (kind === "nudge") {
          const used = Number(read("session", KEY.nudges) ?? 0);
          if (l.bubble || now - l.lastNudge < NUDGE_GAP || used >= MAX_NUDGES_PER_VISIT) return false;
          write("session", KEY.nudges, String(used + 1));
          l.lastNudge = now;
        }
        if (kind === "help") {
          if (now - l.lastHelp < HELP_GAP) return false;
          l.lastHelp = now;
        }
      }
      const next: Bubble = { id: now, text, actions: opts.actions ?? [], showPhone: Boolean(opts.showPhone) };
      l.bubble = next;
      l.nextPeek = now + randomBetween(PEEK_EVERY_MIN, PEEK_EVERY_MAX);
      setBubble(next);
      setPose("out");
      const nextMood = opts.mood ?? "talk";
      setMood(nextMood);
      if (opts.hop) setHop((h) => h + 1);
      clearTimeout(moodTimer.current);
      if (nextMood === "dance") {
        moodTimer.current = setTimeout(() => setMood("idle"), DANCE_FOR);
      } else if (nextMood === "talk" || nextMood === "happy") {
        moodTimer.current = setTimeout(() => setMood("idle"), SAY_FOR);
      }
      armHide(opts.ms ?? (kind === "help" ? HELP_SAY_FOR : SAY_FOR));
      return true;
    },
    [armHide],
  );

  /* ---- Ready-made action sets ---- */
  const helpActions = useCallback(
    (): BubbleAction[] => (contact.wa ? [{ type: "whatsapp", label: t.actions.whatsapp, href: contact.wa }] : []),
    [contact.wa, t],
  );
  const newInAction = useCallback((): BubbleAction => ({ type: "link", label: t.actions.newIn, href: "/new" }), [t]);
  const menuActions = useCallback((): BubbleAction[] => {
    const l = live.current;
    const shop: BubbleAction =
      l.cartCount > 0
        ? { type: "bag", label: t.actions.openBag }
        : l.pathname.startsWith("/sale")
          ? newInAction()
          : { type: "link", label: t.actions.sale, href: "/sale" };
    return [...helpActions(), shop, { type: "sleep", label: t.actions.sleep }];
  }, [helpActions, newInAction, t]);

  /* ---- Cheer on hover over Add-to-bag, dance on click / bag addition ---- */
  const cheerHover = useCallback(() => {
    const l = live.current;
    if (Date.now() < l.dancingUntil) return;
    l.asleep = false;
    spawnHearts(2);
    say("user", t.hoverAdd, { mood: "happy", hop: true, ms: SHORT_SAY_FOR });
  }, [say, spawnHearts, t]);

  const celebrateAdd = useCallback(() => {
    const l = live.current;
    const now = Date.now();
    if (now - l.lastDanceAt < 450) return;
    l.lastDanceAt = now;
    l.dancingUntil = now + DANCE_FOR;
    l.asleep = false;
    spawnHearts(6);
    say("user", t.added, {
      mood: "dance",
      hop: true,
      ms: DANCE_FOR,
      actions: [{ type: "bag", label: t.actions.openBag }],
    });
  }, [say, spawnHearts, t]);

  const handleCue = useCallback(
    (cue: PandaCueDetail) => {
      const l = live.current;
      if (cue.kind === "added") {
        celebrateAdd();
      } else if (cue.kind === "add-hover") {
        cheerHover();
      } else if (cue.kind === "error") {
        later(() => say("help", t.error, { actions: helpActions(), showPhone: true }), 1200);
      } else if (!l.page.has("empty")) {
        l.page.add("empty");
        later(() => say("nudge", t.empty, { actions: [newInAction()] }), 1200);
      }
    },
    [celebrateAdd, cheerHover, helpActions, later, newInAction, say, t],
  );

  /* ---- Arrival: slide the basket in, greet once per visit ---- */
  useEffect(() => {
    const l = live.current;
    const now = Date.now();
    l.lastActivity = now;
    l.lastCartChange = now;
    l.nextPeek = now + randomBetween(PEEK_EVERY_MIN, PEEK_EVERY_MAX);
    l.asleep = Number(read("local", KEY.sleepUntil) ?? 0) > now;

    later(() => {
      setPose(l.asleep ? "sleep" : "peek");
      setMood(l.asleep ? "sleep" : "idle");
    }, 300);

    later(() => {
      if (read("session", KEY.greeted) || l.pathname.startsWith("/checkout")) return;
      const firstEver = !read("local", KEY.seen);
      if (say("nudge", firstEver ? t.greetFirst : t.greetBack, { mood: "happy", hop: true, actions: [newInAction()] })) {
        write("session", KEY.greeted, "1");
        write("local", KEY.seen, "1");
      }
    }, GREET_AFTER);

    const pending = takePendingPandaCue(window.location.pathname);
    if (pending) handleCue(pending);

    const all = timers.current;
    return () => {
      all.forEach(clearTimeout);
      all.clear();
      clearTimeout(hideTimer.current);
      clearTimeout(moodTimer.current);
    };
    // Mount only: the greeting and first pose happen once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Per page: product nudges, order thanks ---- */
  useEffect(() => {
    const l = live.current;
    l.pathname = pathname;
    l.page = new Set();
    l.lastActivity = Date.now();
    const local: ReturnType<typeof setTimeout>[] = [];

    if (pathname.startsWith("/product/")) {
      local.push(
        setTimeout(() => {
          const node = document.querySelector<HTMLElement>("[data-panda-low-stock]");
          const left = Number(node?.dataset.pandaLowStock ?? 0);
          if (left > 0) say("nudge", t.lowStock(left));
        }, LOW_STOCK_AFTER),
        setTimeout(() => say("nudge", t.productHelp, { actions: helpActions(), showPhone: true }), PRODUCT_HELP_AFTER),
      );
    }
    if (pathname.startsWith("/confirmation") && !read("session", KEY.thanks)) {
      local.push(
        setTimeout(() => {
          if (say("event", t.thanks, { mood: "happy", hop: true })) write("session", KEY.thanks, "1");
        }, 1500),
      );
    }
    return () => local.forEach(clearTimeout);
  }, [pathname, say, helpActions, t]);

  /* ---- Something landed in the bag: happy dance ---- */
  useEffect(() => {
    if (!cartHydrated) return;
    const prev = prevCartCount.current;
    prevCartCount.current = cartCount;
    if (prev === null || prev === cartCount) return;
    live.current.lastCartChange = Date.now();
    if (cartCount > prev) celebrateAdd();
  }, [cartCount, cartHydrated, celebrateAdd]);

  /* ---- The home page's thread has been sewn all the way to Tulo ---- */
  useEffect(() => {
    const l = live.current;
    if (!threadFinished || l.page.has("stitch")) return;
    l.page.add("stitch");
    say("event", t.stitchEnd, { actions: helpActions(), showPhone: true, mood: "happy", hop: true });
  }, [threadFinished, say, helpActions, t]);

  /* ---- Watching the shopper: hover/click on Add-to-bag, rage clicks, exit intent, page cues ---- */
  useEffect(() => {
    const l = live.current;
    const mark = () => {
      l.lastActivity = Date.now();
    };
    let clicks: { x: number; y: number; at: number }[] = [];
    let hoveredAddBtn: Element | null = null;

    const isUsableButton = (el: Element | null): el is HTMLElement => {
      if (!el) return false;
      if ((el as HTMLButtonElement).disabled) return false;
      if (el.getAttribute("aria-disabled") === "true") return false;
      return true;
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const btn = (event.target as Element | null)?.closest?.(PANDA_ADD_BUTTON_SELECTOR) ?? null;
      if (btn === hoveredAddBtn) return;
      hoveredAddBtn = btn;
      if (isUsableButton(btn)) cheerHover();
    };

    const onFocusIn = (event: FocusEvent) => {
      const btn = (event.target as Element | null)?.closest?.(PANDA_ADD_BUTTON_SELECTOR) ?? null;
      if (btn && btn !== hoveredAddBtn && isUsableButton(btn)) {
        hoveredAddBtn = btn;
        cheerHover();
      }
    };

    const onClick = (event: MouseEvent) => {
      mark();
      if (rootRef.current?.contains(event.target as Node)) return;
      const addBtn = (event.target as Element | null)?.closest?.(PANDA_ADD_BUTTON_SELECTOR) ?? null;
      if (isUsableButton(addBtn)) {
        celebrateAdd();
        return;
      }
      const now = Date.now();
      clicks = clicks.filter(
        (c) => now - c.at < RAGE_WINDOW && Math.hypot(c.x - event.clientX, c.y - event.clientY) < 40,
      );
      clicks.push({ x: event.clientX, y: event.clientY, at: now });
      if (clicks.length >= RAGE_CLICKS) {
        clicks = [];
        say("help", t.rage, { actions: helpActions(), showPhone: true });
      }
    };
    const onLeave = (event: MouseEvent) => {
      if (event.relatedTarget || event.clientY > 0 || read("session", KEY.exit)) return;
      if (l.cartCount === 0 && !l.pathname.startsWith("/checkout")) return;
      if (say("help", t.exit, { actions: helpActions(), showPhone: true })) write("session", KEY.exit, "1");
    };
    const onCue = (event: Event) => {
      const detail = (event as CustomEvent<PandaCueDetail>).detail;
      if (detail) handleCue(detail);
    };

    window.addEventListener("pointerdown", mark, { passive: true });
    window.addEventListener("keydown", mark);
    window.addEventListener("scroll", mark, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseout", onLeave);
    window.addEventListener(PANDA_CUE_EVENT, onCue);
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
      window.removeEventListener("scroll", mark);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener(PANDA_CUE_EVENT, onCue);
    };
  }, [celebrateAdd, cheerHover, handleCue, helpActions, say, t]);

  /* ---- The heartbeat: idle play, bag reminder, checkout help, random peeks ---- */
  useEffect(() => {
    const tick = () => {
      const l = live.current;
      const now = Date.now();
      if (l.blocked || l.asleep || document.hidden) return;
      const idle = now - l.lastActivity;

      if (l.pathname.startsWith("/checkout")) {
        if (idle > CHECKOUT_HELP_AFTER && !l.page.has("checkout-help")) {
          l.page.add("checkout-help");
          say("help", t.checkoutHelp, { actions: helpActions(), showPhone: true });
        }
        return;
      }
      if (idle > IDLE_PLAY_AFTER && !l.page.has("idle")) {
        if (say("nudge", t.idlePlay, { mood: "play", actions: [newInAction()] })) l.page.add("idle");
      }
      if (
        l.cartCount > 0 &&
        !l.pathname.startsWith("/cart") &&
        now - l.lastCartChange > BAG_REMIND_AFTER &&
        !read("session", KEY.bag)
      ) {
        if (say("nudge", t.bagWaiting(l.cartCount), { actions: [{ type: "bag", label: t.actions.openBag }] })) {
          write("session", KEY.bag, "1");
        }
      }
      if (l.pose === "peek" && !l.bubble && now > l.nextPeek) {
        l.nextPeek = now + randomBetween(PEEK_EVERY_MIN, PEEK_EVERY_MAX);
        setPose("out");
        setMood("look");
        later(() => {
          if (live.current.bubble || live.current.asleep) return;
          setPose("peek");
          setMood("idle");
        }, 2800);
      }
    };
    const id = setInterval(tick, 4 * SECOND);
    return () => clearInterval(id);
  }, [helpActions, later, newInAction, say, t]);

  /* ---- Eyes follow the pointer (written straight to the SVG, no re-render) ---- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const update = () => {
      frame = 0;
      const pupils = pupilsRef.current;
      const svg = pupils?.ownerSVGElement;
      if (!pupils || !svg) return;
      const box = svg.getBoundingClientRect();
      const dx = x - (box.left + box.width / 2);
      const dy = y - (box.top + box.height * 0.42);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / 240) * 1.8;
      pupils.setAttribute("transform", `translate(${((dx / distance) * reach).toFixed(2)} ${((dy / distance) * reach).toFixed(2)})`);
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      live.current.lastActivity = Date.now();
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* ---- Playing with Tulo ---- */
  const onTap = useCallback(() => {
    const l = live.current;
    spawnHearts(1);

    if (l.asleep) {
      l.asleep = false;
      write("local", KEY.sleepUntil, "0");
      say("user", t.awake, { actions: menuActions(), showPhone: true, mood: "happy", hop: true });
      return;
    }
    if (!l.bubble) {
      say("user", t.menu, { actions: menuActions(), showPhone: true, mood: "happy", hop: true });
      return;
    }
    l.taps += 1;
    if (l.taps % 5 === 0) say("user", t.tickle, { mood: "happy", hop: true, ms: SHORT_SAY_FOR });
    else setHop((h) => h + 1);
  }, [menuActions, say, spawnHearts, t]);

  const goToSleep = useCallback(() => {
    const l = live.current;
    l.asleep = true;
    write("local", KEY.sleepUntil, String(Date.now() + SLEEP_FOR));
    say("user", t.sleepAck, { mood: "sleep", ms: SHORT_SAY_FOR });
  }, [say, t]);

  const runAction = useCallback(
    (action: BubbleAction) => {
      if (action.type === "bag") {
        rest();
        dispatch(setCartDrawerOpen(true));
      } else if (action.type === "sleep") {
        goToSleep();
      } else {
        rest();
      }
    },
    [dispatch, goToSleep, rest],
  );

  /* Off screen while search/auth/mobile-nav is open; at checkout he only comes out to help. */
  const onCheckout = pathname.startsWith("/checkout");
  const shown: Pose = overlayOpen ? "away" : onCheckout && pose === "peek" ? "away" : pose;
  const visibleBubble = shown === "away" ? null : bubble;
  const chip =
    "pointer-events-auto inline-flex h-5.5 items-center gap-1 rounded-full px-2 text-[10px] font-semibold leading-none transition-colors";

  return (
    <div
      ref={rootRef}
      data-pose={shown}
      className="panda-pal pointer-events-none relative w-14 origin-bottom-right"
    >
      <p className="sr-only" aria-live="polite">
        {visibleBubble?.text ?? ""}
      </p>

      {visibleBubble ? (
        <div
          key={visibleBubble.id}
          className="panda-bubble pointer-events-auto absolute bottom-8 right-[62px] w-[min(196px,calc(100vw-80px))] rounded-xl border border-line bg-chalk px-2.5 py-2 pr-6 text-ink shadow-sheet"
          onPointerEnter={() => {
            live.current.hovering = true;
          }}
          onPointerLeave={() => {
            live.current.hovering = false;
            armHide(SAY_FOR);
          }}
        >
          <span aria-hidden className="absolute -right-[5px] bottom-3 size-2 rotate-45 border-r border-t border-line bg-chalk" />
          <button
            type="button"
            onClick={rest}
            aria-label={t.actions.close}
            className="absolute right-1 top-1 grid size-4 place-items-center rounded-full text-stone transition-colors hover:bg-selvedge"
          >
            <FiX aria-hidden className="size-2.5" />
          </button>
          <p className="text-[10px] font-medium leading-[1.45] tracking-[0.01em] text-ink antialiased">
            <span className="font-bold text-dye-deep">{t.name}: </span>
            {visibleBubble.text}
          </p>

          {visibleBubble.showPhone && contact.tel ? (
            <a
              href={contact.tel}
              onClick={rest}
              className="mt-1.5 flex items-center gap-1 rounded-md bg-selvedge/60 px-2 py-1 text-[10px] font-semibold leading-none text-ink transition-colors hover:bg-selvedge"
            >
              <FiPhone aria-hidden className="size-2.5 shrink-0" />
              <span className="sr-only">{t.actions.callUs}: </span>
              <span dir="ltr">{phone}</span>
            </a>
          ) : null}

          {visibleBubble.actions.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {visibleBubble.actions.map((action) =>
                action.type === "link" ? (
                  <Link key={action.label} href={action.href} onClick={rest} className={`${chip} bg-ink text-chalk hover:bg-ink/85`}>
                    {action.label}
                  </Link>
                ) : action.type === "whatsapp" ? (
                  <a
                    key={action.label}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={rest}
                    className={`${chip} bg-[#25D366] text-white hover:bg-[#1ebe5a]`}
                  >
                    <FaWhatsapp aria-hidden className="size-2.5" />
                    {action.label}
                  </a>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => runAction(action)}
                    className={
                      action.type === "bag"
                        ? `${chip} bg-dye text-chalk hover:bg-dye-deep`
                        : `${chip} border border-line text-stone hover:bg-selvedge`
                    }
                  >
                    {action.type === "bag" ? (
                      <FiShoppingBag aria-hidden className="size-2.5" />
                    ) : (
                      <FiMoon aria-hidden className="size-2.5" />
                    )}
                    {action.label}
                  </button>
                ),
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        data-panda-pal=""
        className="panda-stage relative h-[92px] w-14 overflow-hidden"
        inert={shown === "away"}
      >
        <div className="panda-body absolute bottom-[4px] left-[4px] w-[48px]">
          <div key={hop} className={hop ? "panda-hop" : undefined}>
            <button
              type="button"
              onClick={onTap}
              aria-label={shown === "sleep" ? t.sleepingLabel : t.label}
              className="pointer-events-auto block w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <PandaFigure mood={mood} uid={uid} pupilsRef={pupilsRef} />
            </button>
          </div>
        </div>

        {hearts.map((heart) => (
          <span
            key={heart.id}
            aria-hidden
            className="panda-heart pointer-events-none absolute bottom-[54px] left-[23px] text-dye"
            style={{ "--panda-dx": `${heart.dx}px` } as React.CSSProperties}
          >
            <svg viewBox="0 0 16 14" className="size-2.5" fill="currentColor">
              <path d="M8 13.5 1.6 7.4A3.9 3.9 0 0 1 8 2.6a3.9 3.9 0 0 1 6.4 4.8Z" />
            </svg>
          </span>
        ))}

        {shown === "sleep" ? (
          <span aria-hidden className="pointer-events-none absolute bottom-[35px] right-0.5 flex gap-0.5 font-semibold text-stone">
            <span className="panda-z text-[8px]">z</span>
            <span className="panda-z text-[9px]">z</span>
          </span>
        ) : null}

        <div aria-hidden className="pointer-events-auto absolute inset-x-0 bottom-0 cursor-pointer" onClick={onTap}>
          <PandaBasket />
        </div>
      </div>
    </div>
  );
}
