import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { removeBackInStock } from "@/lib/server/catalog/back-in-stock/service";

export const DELETE = route<{ id: string }>(
  withAuth<{ id: string }>((_request, { params }) => removeBackInStock(parseParams(params, idParam).id), STAFF_ONLY),
);
