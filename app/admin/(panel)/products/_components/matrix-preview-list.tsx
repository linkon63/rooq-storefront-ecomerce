import type { AdminColor, AdminSize, MatrixPreview } from "@/types/catalog-admin";

const REASON = { exists: "already exists", sku_taken: "SKU already used" } as const;

export function MatrixPreviewList({ preview, colors, sizes }: { preview: MatrixPreview; colors: AdminColor[]; sizes: AdminSize[] }) {
  const color = new Map(colors.map((c) => [c.id, c.name]));
  const size = new Map(sizes.map((s) => [s.id, s.label]));
  return (
    <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
      <p className="font-semibold text-slate-800">{preview.planned.length} new variants</p>
      {preview.planned.length ? (
        <ul className="flex flex-wrap gap-2">
          {preview.planned.map((item) => (
            <li key={item.sku} className="rounded bg-white px-2 py-1 font-mono text-xs ring-1 ring-slate-200">{item.sku}</li>
          ))}
        </ul>
      ) : null}
      {preview.skipped.length ? (
        <p className="text-slate-600">
          Skipped: {preview.skipped.map((s) => `${color.get(s.colorId) ?? "?"} / ${size.get(s.sizeId) ?? "?"} (${REASON[s.reason]})`).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
