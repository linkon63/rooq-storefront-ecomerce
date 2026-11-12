import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { updateSectionSchema } from "@/lib/server/sections/schemas";
import { deleteSection, getSection, updateSection } from "@/lib/server/sections/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] } as const;

/** GET /api/v1/sections/:id — public. */
export const GET = route<{ id: string }>((_request, { params }) => getSection(parseParams(params, idParam).id));

/** PATCH /api/v1/sections/:id — admin. */
export const PATCH = route<{ id: string }>(
  withAuth(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return updateSection(id, await parseBody(request, updateSectionSchema));
  }, staff),
);

/** DELETE /api/v1/sections/:id — admin; refused while campaigns still use it. */
export const DELETE = route<{ id: string }>(
  withAuth((_request, { params }) => deleteSection(parseParams(params, idParam).id), staff),
);
