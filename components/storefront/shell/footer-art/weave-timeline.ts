import gsap from "gsap";
import { FELL, LOOM, PASSES, SHUTTLE } from "./loom-geometry";
import { WEAVER_PIVOTS } from "./weaver-figure";

/** Weaving one message, from the first weft to the finished cloth. */
export const WEAVE_SECONDS = 4;
/** How long a finished message stays on the loom. */
export const HOLD_SECONDS = 2;
/** Fade between one finished message and the next. */
const SWAP_SECONDS = 0.3;
/** One shuttle pass and its beat; the passes exactly fill WEAVE_SECONDS. */
const PASS_SECONDS = WEAVE_SECONDS / PASSES;
const BEAT_SECONDS = PASS_SECONDS * 0.32;
const THROW_SECONDS = PASS_SECONDS - BEAT_SECONDS;

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
};

/**
 * The weaving loop: for each message the shuttle crosses, the reed beats and
 * the cloth (with the message in it) gains a step on every beat, so it is
 * woven in WEAVE_SECONDS; it holds HOLD_SECONDS, fades, and the next message
 * starts on a fresh cloth. Weaving starts on the first frame.
 */
export function weaveTimeline(t: Targets): gsap.core.Timeline {
  const master = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
  let pass = 0;

  const beat = (step: number, open: boolean) => {
    const woven = clothAt(step / PASSES);
    return gsap
      .timeline()
      .set(t.clip, woven.clip)
      .set(t.fell, woven.fell)
      .to(t.beater, { y: 16, duration: BEAT_SECONDS * 0.35, ease: "power2.in" })
      .to(t.arm, { rotation: -7, svgOrigin: WEAVER_PIVOTS.shoulder, duration: BEAT_SECONDS * 0.35, ease: "power2.in" }, "<")
      .to([t.beater, t.arm], { y: 0, rotation: 0, duration: BEAT_SECONDS * 0.65, ease: "power2.out" })
      .to(t.heddles[0] ?? [], { y: open ? -9 : 0, duration: BEAT_SECONDS }, 0)
      .to(t.heddles[1] ?? [], { y: open ? 9 : 0, duration: BEAT_SECONDS }, 0)
      .to(t.treadle, { rotation: open ? 4 : 0, svgOrigin: WEAVER_PIVOTS.treadle, duration: BEAT_SECONDS }, 0);
  };

  t.messages.forEach((_, index) => {
    const start = clothAt(0);
    master
      .set(t.clip, start.clip)
      .set(t.fell, start.fell)
      .set(t.messages, { autoAlpha: (i: number) => (i === index ? 1 : 0) })
      .set(t.cloth, { opacity: 1 });
    for (let step = 1; step <= PASSES; step += 1) {
      const outward = pass % 2 === 0;
      master.to(t.shuttle, { x: outward ? SHUTTLE.travel : 0, duration: THROW_SECONDS }).add(beat(step, outward));
      pass += 1;
    }
    master.to({}, { duration: HOLD_SECONDS }).to(t.cloth, { opacity: 0, duration: SWAP_SECONDS, ease: "power1.in" });
  });

  return master;
}
