/** Browser capability checks for optional effects. Call only after mount. */

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/** three.js r163+ renders with WebGL 2 only. */
export function canRunWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Data saver on, or a small device: skip the 3D scene and keep the static art. */
export function prefersLowPower(): boolean {
  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return true;
  return typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4;
}
