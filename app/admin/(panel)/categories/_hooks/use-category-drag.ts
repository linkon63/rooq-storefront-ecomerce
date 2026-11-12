"use client";

import { useState, type DragEvent } from "react";
import type { Category } from "@/types/admin/catalog";
import { containsId, findNode, insertNode, removeNode, type DropMode } from "@/utils/admin/category-tree";

/** Drag-and-drop reordering: drop before/after a row, or onto its middle to nest it. */
export function useCategoryDrag(categories: Category[], onReorder: (tree: Category[]) => void) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; mode: DropMode } | null>(null);

  function start(event: DragEvent, id: string) {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id); // Firefox needs data for a drag to start.
  }

  function over(event: DragEvent, targetId: string) {
    const dragged = draggingId ? findNode(categories, draggingId) : null;
    if (!draggingId || draggingId === targetId || (dragged && containsId(dragged, targetId))) {
      setDropTarget(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    setDropTarget({ id: targetId, mode: ratio < 0.3 ? "before" : ratio > 0.7 ? "after" : "inside" });
  }

  function end() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function drop(event: DragEvent, targetId: string) {
    event.preventDefault();
    const dragId = draggingId;
    const mode: DropMode = dropTarget?.id === targetId ? dropTarget.mode : "after";
    end();
    if (!dragId || dragId === targetId) return;
    const { tree, node } = removeNode(categories, dragId);
    if (!node || containsId(node, targetId)) return;
    onReorder(insertNode(tree, node, targetId, mode));
  }

  const indicatorFor = (id: string): DropMode | null => (dropTarget?.id === id ? dropTarget.mode : null);

  return { draggingId, indicatorFor, start, over, end, drop };
}
