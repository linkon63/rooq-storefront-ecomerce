"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import UnitForm from "../../_components/unit-form";
import { apiRequest, type Unit } from "../../../../../../lib/admin-api";

export default function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [unit, setUnit] = useState<Unit | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Unit>(`/units/${id}`)
      .then(setUnit)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load unit"),
      );
  }, [id]);

  if (error) {
    return (
      <div className="pt-6">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
        <Link
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          href="/admin/units"
        >
          Back to unit of measurement list
        </Link>
      </div>
    );
  }

  if (!unit) {
    return <p className="pt-10 text-sm font-medium text-slate-500">Loading unit...</p>;
  }

  // Keyed so the form remounts with the loaded unit as its initial state
  // instead of holding the empty defaults it mounted with.
  return <UnitForm key={unit.id} unit={unit} />;
}
