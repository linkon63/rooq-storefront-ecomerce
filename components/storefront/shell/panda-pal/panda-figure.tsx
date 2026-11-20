import type { Ref } from "react";

export type PandaMood = "idle" | "talk" | "happy" | "sleep" | "look" | "play";

const FUR = "#24211f";
const FUR_SOFT = "#4a423c";
const RIM = "#e7ddd0";

/**
 * Tulo, drawn in SVG: a panda in a red-check gamchha holding a spool of
 * golden tant thread. `mood` swaps the eyes and mouth and picks which CSS
 * loop plays (see panda-pal.css). `pupilsRef` lets the parent make the eyes
 * follow the pointer without re-rendering.
 */
export function PandaFigure({
  mood,
  uid,
  pupilsRef,
}: {
  mood: PandaMood;
  uid: string;
  pupilsRef?: Ref<SVGGElement>;
}) {
  const check = `${uid}-gamchha`;
  const eyesOpen = mood !== "happy" && mood !== "sleep";
  const mouthOpen = mood === "talk" || mood === "happy";

  return (
    <svg aria-hidden viewBox="0 0 120 132" className={`panda-figure panda-mood-${mood} block h-auto w-full`}>
      <defs>
        <pattern id={check} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="var(--color-dye)" />
          <rect y="3" width="8" height="2" fill="#fff" opacity="0.75" />
          <rect x="3" width="2" height="8" fill="#fff" opacity="0.55" />
        </pattern>
      </defs>

      <g className="panda-breathe">
        {/* Body and feet */}
        <ellipse cx="60" cy="110" rx="34" ry="24" fill="#fff" stroke={RIM} strokeWidth="1.5" />
        <ellipse cx="42" cy="128" rx="11" ry="6" fill={FUR} />
        <ellipse cx="78" cy="128" rx="11" ry="6" fill={FUR} />

        {/* Gamchha round the neck, knot hanging on one side */}
        <path d="M24 84 Q60 100 96 84 L95 95 Q60 110 25 95 Z" fill={`url(#${check})`} stroke="var(--color-dye-deep)" strokeWidth="1" />
        <path d="M30 94 L24 114 L31 116 L37 96 Z" fill={`url(#${check})`} stroke="var(--color-dye-deep)" strokeWidth="1" />

        {/* Left arm */}
        <ellipse cx="32" cy="108" rx="9" ry="14" transform="rotate(18 32 108)" fill={FUR} />

        {/* Thread spool in the right paw */}
        <g className="panda-spool">
          <path d="M106 104 q10 8 4 18 q-3 6 6 8" fill="none" stroke="var(--color-gold)" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="92" y="93" width="16" height="3.5" rx="1.5" fill="var(--color-ink)" />
          <rect x="94" y="96.5" width="12" height="13" fill="var(--color-gold)" />
          <path d="M94 100h12M94 103.5h12M94 107h12" stroke="#7a6748" strokeWidth="0.7" />
          <rect x="92" y="109.5" width="16" height="3.5" rx="1.5" fill="var(--color-ink)" />
        </g>
        <ellipse cx="88" cy="107" rx="8" ry="12" transform="rotate(-30 88 107)" fill={FUR} />

        {/* Head */}
        <g className="panda-head">
          <circle cx="30" cy="26" r="15" fill={FUR} />
          <circle cx="30" cy="27" r="7" fill={FUR_SOFT} />
          <circle cx="90" cy="26" r="15" fill={FUR} />
          <circle cx="90" cy="27" r="7" fill={FUR_SOFT} />
          <ellipse cx="60" cy="56" rx="40" ry="36" fill="#fff" stroke={RIM} strokeWidth="1.5" />
          <ellipse cx="43" cy="56" rx="11" ry="14" transform="rotate(-28 43 56)" fill={FUR} />
          <ellipse cx="77" cy="56" rx="11" ry="14" transform="rotate(28 77 56)" fill={FUR} />

          {eyesOpen ? (
            <g className="panda-eyes">
              <circle cx="45" cy="55" r="5.2" fill="#fff" />
              <circle cx="75" cy="55" r="5.2" fill="#fff" />
              <g ref={pupilsRef}>
                <circle cx="45.5" cy="55.5" r="3" fill={FUR} />
                <circle cx="75.5" cy="55.5" r="3" fill={FUR} />
                <circle cx="46.6" cy="54.2" r="1.1" fill="#fff" />
                <circle cx="76.6" cy="54.2" r="1.1" fill="#fff" />
              </g>
            </g>
          ) : mood === "happy" ? (
            <path d="M39.5 57 Q45 50 50.5 57 M69.5 57 Q75 50 80.5 57" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M39.5 54 Q45 59 50.5 54 M69.5 54 Q75 59 80.5 54" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          )}

          <circle cx="33" cy="71" r="6" fill="var(--color-dye)" opacity="0.2" />
          <circle cx="87" cy="71" r="6" fill="var(--color-dye)" opacity="0.2" />
          <ellipse cx="60" cy="67" rx="5" ry="3.6" fill={FUR} />
          {mouthOpen ? (
            <ellipse className="panda-mouth" cx="60" cy="76" rx="4" ry="4" fill="var(--color-dye-deep)" />
          ) : (
            <path
              d="M60 70.5v3.5M60 74c-1.5 3-5.5 3.5-7.5 1.5M60 74c1.5 3 5.5 3.5 7.5 1.5"
              stroke={FUR}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      </g>
    </svg>
  );
}

/** The woven bamboo basket (tukri) Tulo hides in, with a tant border band. Drawn in front of him. */
export function PandaBasket() {
  return (
    <svg aria-hidden viewBox="0 0 96 44" className="block h-auto w-full">
      <path d="M5 8 H91 L84 41 Q48 45 12 41 Z" fill="#c9a77a" />
      <path
        d="M8 22 H88 M10 30 H86 M11.5 37 H84.5"
        stroke="#a8825a"
        strokeWidth="1.2"
        strokeDasharray="5 3"
      />
      <path d="M20 9 L22 41 M36 9 L37 43 M52 9 L51 43 M68 9 L66 42 M82 9 L78 41" stroke="#a8825a" strokeWidth="0.8" opacity="0.7" />
      <path d="M7 13 H89 L88 18 H8 Z" fill="var(--color-dye)" />
      <path d="M8 15.5 l3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2 3 2 3 -2" fill="none" stroke="var(--color-selvedge)" strokeWidth="0.8" />
      <rect x="0" y="3" width="96" height="8" rx="4" fill="#a8825a" />
      <rect x="2" y="4.5" width="92" height="2" rx="1" fill="#c9a77a" opacity="0.7" />
    </svg>
  );
}

