"use client";

import type { ReactNode } from "react";
import { useDraggableFloat } from "@/hooks/use-draggable-float";

export function DraggableFloat({ className, children }: { className: string; children: ReactNode }) {
  const handlers = useDraggableFloat();
  return (
    <div {...handlers} className={className}>
      {children}
    </div>
  );
}
