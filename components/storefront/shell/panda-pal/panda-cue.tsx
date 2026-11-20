"use client";

import { useEffect } from "react";
import { pandaCue, type PandaCueKind } from "./panda-events";

/** Renders nothing; tells the panda this page is empty or broken, once, when it mounts. */
export function PandaCue({ kind }: { kind: PandaCueKind }) {
  useEffect(() => {
    pandaCue(kind);
  }, [kind]);
  return null;
}

