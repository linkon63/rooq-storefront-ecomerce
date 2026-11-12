import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { getProductSizeChart } from "@/lib/server/catalog/products/detail";

/** GET /api/v1/products/:id/size-chart — product → category → parent chart, or null. */
export const GET = route<{ id: string }>(async (_request, { params }) => {
  const chart = await getProductSizeChart(parseParams(params, idParam).id);
  return Response.json(chart);
});
