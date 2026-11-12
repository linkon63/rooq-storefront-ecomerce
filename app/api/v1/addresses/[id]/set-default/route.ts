import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import * as addresses from "@/lib/server/address/service";

/** PATCH /api/v1/addresses/:id/set-default */
export const PATCH = route<{ id: string }>(
  withAuth((_request, { params, user }) => addresses.setDefaultAddress(parseParams(params, idParam).id, user.id)),
);
