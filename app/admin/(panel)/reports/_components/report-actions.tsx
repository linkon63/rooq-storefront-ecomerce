import type { ReportEndpoint } from "@/types/reports";
import { ReportDownloadMenu } from "./report-download-menu";
import { ReportRangePicker } from "./report-range-picker";

/** PageHeader action slot for a report: download + date range. */
export function ReportActions({ endpoint }: { endpoint: ReportEndpoint }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ReportDownloadMenu endpoint={endpoint} />
      <ReportRangePicker />
    </div>
  );
}
