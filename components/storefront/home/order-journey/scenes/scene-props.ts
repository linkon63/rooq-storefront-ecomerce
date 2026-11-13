/**
 * Props every journey scene takes. `wide` lays the scene out as a full-bleed
 * backdrop; `onAction` runs when the scene's hotspot is clicked.
 */
export type SceneProps = { animate: boolean; wide: boolean; onAction: () => void };
