"use client";

const LABELS = ["Poor", "Fair", "Good", "Very good", "Love it"];

/** Five-star radio group. */
export function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Rating</legend>
      <div className="flex items-center gap-1">
        {LABELS.map((label, index) => {
          const star = index + 1;
          return (
            <label key={label} className="cursor-pointer p-1" title={label}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {star} star, {label}
              </span>
              <svg
                width="28"
                height="28"
                viewBox="0 0 20 20"
                aria-hidden
                className={`rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-dye ${star <= value ? "text-ink" : "text-line"}`}
              >
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" fill="currentColor" />
              </svg>
            </label>
          );
        })}
        {value > 0 ? <span className="ml-2 text-sm text-stone">{LABELS[value - 1]}</span> : null}
      </div>
    </fieldset>
  );
}
