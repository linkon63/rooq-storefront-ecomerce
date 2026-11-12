"use client";

import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { closeSizeGuide, selectSizeGuideProductId } from "@/lib/store/slices/ui-slice";
import type { SizeChart } from "@/types/storefront/catalog";
import { Modal } from "../shared/modal";
import { SizeChartTable } from "./size-chart-table";

type SizeGuideDialogProps = {
  productId: string;
  chart: SizeChart | null;
  modelInfo: string | null;
  selectedSizeId: string | null;
};

/** Size guide modal for the product page; opened from the size picker via the ui slice. */
export function SizeGuideDialog({ productId, chart, modelInfo, selectedSizeId }: SizeGuideDialogProps) {
  const dispatch = useAppDispatch();
  const openFor = useAppSelector(selectSizeGuideProductId);
  const open = openFor === productId;

  return (
    <Modal open={open} onOpenChange={(next) => (next ? null : dispatch(closeSizeGuide()))} title="Size guide">
      <div className="flex flex-col gap-6 px-4 py-5 md:px-6">
        {chart ? (
          <>
            <SizeChartTable chart={chart} highlightSizeId={selectedSizeId} />
            {chart.howToMeasure ? (
              <section>
                <h3 className="mb-1.5 text-sm font-semibold">How to measure</h3>
                <p className="whitespace-pre-line text-sm text-stone">{chart.howToMeasure}</p>
              </section>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-stone">{ERROR_MESSAGES.sizeChart.noChart}</p>
        )}
        {modelInfo ? <p className="text-sm">{modelInfo}</p> : null}
      </div>
    </Modal>
  );
}
