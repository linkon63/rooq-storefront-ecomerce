"use client";

type Option = { value: string; label: string; count: number };

type FacetChecklistProps = {
  name: string;
  options: Option[];
  selected: readonly string[];
  onToggle: (value: string) => void;
};

/** Checkbox list with disjunctive counts; options with no matches stay visible but muted. */
export function FacetChecklist({ name, options, selected, onToggle }: FacetChecklistProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {options.map((option) => {
        const checked = selected.includes(option.value);
        const id = `facet-${name}-${option.value}`;
        return (
          <li key={option.value}>
            <label htmlFor={id} className={`flex min-h-10 items-center gap-3 rounded px-1 text-sm hover:bg-selvedge/60 ${option.count === 0 && !checked ? "text-stone" : ""}`}>
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option.value)}
                className="size-4 shrink-0 accent-[var(--color-ink)]"
              />
              <span className="flex-1">{option.label}</span>
              <span className="text-xs text-stone tabular-nums">{option.count}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
