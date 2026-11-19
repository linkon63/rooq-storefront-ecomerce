"use client";

import { useState } from "react";

/**
 * One split-flap card. When the value changes, the old top half folds down
 * over the middle and the new bottom half lands under it, like a station
 * board. Reduced motion: the value just changes (the flaps are hidden by CSS).
 */
export function FlipCard({ value }: { value: string }) {
  const [state, setState] = useState({ current: value, previous: value, turn: 0 });
  if (state.current !== value) setState({ current: value, previous: state.current, turn: state.turn + 1 });
  const { current, previous, turn } = state;

  return (
    <span aria-hidden className="flip-card">
      <span className="flip-half flip-bottom">
        <span>{current}</span>
      </span>
      {turn > 0 ? (
        <span className="flip-half flip-bottom flip-prev">
          <span>{previous}</span>
        </span>
      ) : null}
      <span className="flip-half flip-top">
        <span>{current}</span>
      </span>
      {turn > 0 ? (
        <>
          <span key={`top-${turn}`} className="flip-half flip-top flip-flap-top">
            <span>{previous}</span>
          </span>
          <span key={`bottom-${turn}`} className="flip-half flip-bottom flip-flap-bottom">
            <span>{current}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}
