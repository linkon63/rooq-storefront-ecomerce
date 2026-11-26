"use client";

import { getImageProps, type ImageProps } from "next/image";

/** 1×1 transparent GIF: what a screen that hides the photo "downloads". */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * An above-the-fold photo that only some screens show (hero on desktop vs
 * phone): loaded eagerly with high priority there, never fetched where the
 * `hiddenOn` media query matches.
 */
export function ScreenImage({ hiddenOn, ...props }: ImageProps & { hiddenOn?: string }) {
  const { props: image } = getImageProps({ ...props, loading: "eager", fetchPriority: "high" });
  return (
    <picture>
      {hiddenOn ? <source media={hiddenOn} srcSet={BLANK} /> : null}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt arrives with the getImageProps props */}
      <img {...image} />
    </picture>
  );
}
