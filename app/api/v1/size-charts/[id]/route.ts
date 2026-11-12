import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, isStaffUser } from "@/lib/server/catalog/access";
import { sizeChartUpdateSchema } from "@/lib/server/catalog/size-charts/schemas";
import { getSizeChart, removeSizeChart, updateSizeChart } from "@/lib/server/catalog/size-charts/service";

type Params = { id: string };

/** GET /api/v1/size-charts/:id — public (active charts); staff also see inactive ones + categories. */
export const GET = route<Params>(
  withAuth<Params>((_request, { params, user }) => getSizeChart(parseParams(params, idParam).id, isStaffUser(user)), { public: true }),
);

/** PATCH — `rows` replaces every row; `categoryIds` sets which categories default to this chart. */
export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params }) => updateSizeChart(parseParams(params, idParam).id, await parseBody(request, sizeChartUpdateSchema)),
    STAFF_ONLY,
  ),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeSizeChart(parseParams(params, idParam).id), STAFF_ONLY));
