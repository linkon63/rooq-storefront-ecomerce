import { created, route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, isStaffUser } from "@/lib/server/catalog/access";
import { variantCreateSchema } from "@/lib/server/catalog/variants/schemas";
import { createVariant, listVariants } from "@/lib/server/catalog/variants/service";

type Params = { id: string };

/** GET /api/v1/products/:id/variants — public view; staff get VariantAdmin rows incl. archived ones. */
export const GET = route<Params>(
  withAuth<Params>((_request, { params, user }) => listVariants(parseParams(params, idParam).id, isStaffUser(user)), { public: true }),
);

export const POST = route<Params>(
  withAuth<Params>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    return created(await createVariant(id, await parseBody(request, variantCreateSchema), user.id));
  }, STAFF_ONLY),
);
