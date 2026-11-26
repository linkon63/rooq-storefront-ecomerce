"use client";

import { useEffect, useState } from "react";
import { whenPageSettled } from "@/lib/storefront/when-settled";

/** False until the first input (or a quiet spell after load). */
export function usePageSettled(): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => whenPageSettled(() => setSettled(true)), []);
  return settled;
}
