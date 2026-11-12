import { route } from "@/lib/server/http";
import { STORE_NAME } from "@/lib/constants/store";

/**
 * GET /api/v1 — liveness probe (the old AppController root answered
 * "Hello World!"). Kept public and cheap: it never touches the database.
 */
export const GET = route(() => ({ status: "ok", service: `${STORE_NAME} API`, time: new Date().toISOString() }));
