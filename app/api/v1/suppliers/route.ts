import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { createSupplier, listSuppliers, supplierCreateSchema } from "@/lib/server/catalog/suppliers/service";

/** Suppliers are staff-only (the whole old controller was @Roles('admin','superadmin')). */
export const GET = route(withAuth(() => listSuppliers(), STAFF_ONLY));

export const POST = route(withAuth(async (request) => created(await createSupplier(await parseBody(request, supplierCreateSchema))), STAFF_ONLY));
