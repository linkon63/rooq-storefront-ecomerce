import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { sizeChartCreateSchema } from "@/lib/server/catalog/size-charts/schemas";
import { createSizeChart, listSizeCharts } from "@/lib/server/catalog/size-charts/service";

/** GET /api/v1/size-charts — every chart with its categories (admin). */
export const GET = route(withAuth(() => listSizeCharts(), STAFF_ONLY));

export const POST = route(
  withAuth(async (request) => created(await createSizeChart(await parseBody(request, sizeChartCreateSchema))), STAFF_ONLY),
);
