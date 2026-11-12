"use client";

import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";
import { useAppDispatch } from "@/lib/store/hooks";
import { posActions } from "@/lib/store/slices/pos-slice";
import type { ProductCard } from "@/utils/mappers/product-card";
import { PageHeader } from "../../_components/admin-shell";
import { PosProductGrid } from "./_components/pos-product-grid";
import { PosReceipt } from "./_components/pos-receipt";
import { PosTicket } from "./_components/pos-ticket";
import { PosVariantPicker } from "./_components/pos-variant-picker";
import { usePosCheckout } from "./_hooks/use-pos-checkout";

export default function PosPage() {
  const { symbol } = useCurrency();
  const dispatch = useAppDispatch();
  const [picking, setPicking] = useState<ProductCard | null>(null);
  const { checkout, isSubmitting, completed, dismissReceipt } = usePosCheckout();

  return (
    <>
      <PageHeader title="POS" description="Ring up in-store sales by size and colour. Stock is taken immediately and the sale is recorded as paid." />
      {completed ? <PosReceipt onDone={dismissReceipt} order={completed} symbol={symbol} /> : null}
      <section className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <PosProductGrid onPick={setPicking} symbol={symbol} />
        <PosTicket isSubmitting={isSubmitting} onCheckout={checkout} symbol={symbol} />
      </section>
      {picking ? (
        <PosVariantPicker
          onAdd={(line) => {
            dispatch(posActions.addLine(line));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
          product={picking}
          symbol={symbol}
        />
      ) : null}
    </>
  );
}
