import type { Swatch } from "./colour-switcher";

type ColourSwatchProps = {
  swatch: Swatch;
  selected: boolean;
  tabId: string;
  panelId: string;
  onPick: (button: HTMLButtonElement) => void;
};

/** A dye drop with its name; the chosen one gets a stitched ring. */
export function ColourSwatch({ swatch, selected, tabId, panelId, onPick }: ColourSwatchProps) {
  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={(event) => onPick(event.currentTarget)}
      className="group flex min-h-11 flex-col items-center gap-1.5 rounded-sm px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <span
        className={`grid size-11 place-items-center rounded-full border-2 border-dashed transition-[border-color,transform] duration-300 group-hover:scale-105 motion-reduce:transition-none ${
          selected ? "border-ink" : "border-transparent"
        }`}
      >
        <span className="size-8 rounded-full shadow-[inset_0_-3px_6px_rgb(0_0_0/0.18)]" style={{ backgroundColor: swatch.hex }} />
      </span>
      <span className={`type-meta ${selected ? "text-ink" : "text-stone"}`}>{swatch.name}</span>
    </button>
  );
}
