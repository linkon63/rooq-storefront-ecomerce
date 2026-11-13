import gsap from "gsap";
import { FELL, LOOM, PASSES, SHUTTLE } from "./loom-geometry";
import { WEAVER_PIVOTS } from "./weaver-figure";

/** Weaving each message, from the first weft to the finished cloth: "ROOQ" (5 s), then the thank-you (4 s). */
export const WEAVE_SECONDS: readonly number[] = [5, 4];
/** How long a finished message stays on the loom. */
export const HOLD_SECONDS = 2;
/** Fade between one finished message and the next. */
const SWAP_SECONDS = 0.3;
/** One shuttle pass split into the throw and the beat; the passes exactly fill the message's weave time. */
function passTiming(weaveSeconds: number) {
  const pass = weaveSeconds / PASSES;
  const beat = pass * 0.32;
  return { beat, throw: pass - beat };
}

const RISE = FELL.end - FELL.start;

/** Clip rect and fell group for a given share (0–1) of the cloth woven. */
export function clothAt(progress: number) {
  const y = FELL.start + RISE * progress;
  return { clip: { attr: { y, height: LOOM.breastBeam - y } }, fell: { y: RISE * progress } };
}

type Targets = {
  clip: Element[];
  fell: Element[];
  beater: Element[];
  shuttle: Element[];
  arm: Element[];
  treadle: Element[];
  heddles: Element[];
  cloth: Element[];
  messages: Element[];
  sharees: Element[];
};

/**
 * The weaving loop: for each message (each on its own sharee) the shuttle crosses, the reed beats and
 * the cloth (with the message in it) gains a step on every beat, so it is
 * woven in its WEAVE_SECONDS; it holds HOLD_SECONDS, fades, and the next message
 * starts on a fresh cloth. Weaving starts on the first frame.
 */
export function weaveTimeline(t: Targets): gsap.core.Timeline {
  const master = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
  let pass = 0;

  const beat = (step: number, open: boolean, beatSeconds: number) => {
    const woven = clothAt(step / PASSES);
    return gsap
      .timeline()
      .set(t.clip, woven.clip)
      .set(t.fell, woven.fell)
      .to(t.beater, { y: 16, duration: beatSeconds * 0.35, ease: "power2.in" })
      .to(t.arm, { rotation: -7, svgOrigin: WEAVER_PIVOTS.shoulder, duration: beatSeconds * 0.35, ease: "power2.in" }, "<")
      .to([t.beater, t.arm], { y: 0, rotation: 0, duration: beatSeconds * 0.65, ease: "power2.out" })
      .to(t.heddles[0] ?? [], { y: open ? -9 : 0, duration: beatSeconds }, 0)
      .to(t.heddles[1] ?? [], { y: open ? 9 : 0, duration: beatSeconds }, 0)
      .to(t.treadle, { rotation: open ? 4 : 0, svgOrigin: WEAVER_PIVOTS.treadle, duration: beatSeconds }, 0);
  };

  t.messages.forEach((_, index) => {
    const start = clothAt(0);
    const timing = passTiming(WEAVE_SECONDS[index] ?? WEAVE_SECONDS[0] ?? 4);
    master
      .set(t.clip, start.clip)
      .set(t.fell, start.fell)
      .set([t.messages, t.sharees], { autoAlpha: (i: number) => (i % t.messages.length === index ? 1 : 0) })
      .set(t.cloth, { opacity: 1 });
    for (let step = 1; step <= PASSES; step += 1) {
      const outward = pass % 2 === 0;
      master.to(t.shuttle, { x: outward ? SHUTTLE.travel : 0, duration: timing.throw }).add(beat(step, outward, timing.beat));
      pass += 1;
    }
    master.to({}, { duration: HOLD_SECONDS }).to(t.cloth, { opacity: 0, duration: SWAP_SECONDS, ease: "power1.in" });
  });

  return master;
}
