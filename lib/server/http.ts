import "server-only";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { CATALOG_CACHE_TAG } from "@/lib/constants/storefront";
import { isCatalogWrite } from "@/utils/cache-scope";
import { describePrismaKnownError } from "@/utils/prisma-error";
import { formatZodIssues } from "@/utils/zod-messages";
import { buildPaginationMeta, type PaginationMeta } from "@/utils/pagination";
import { HttpError } from "./http-error";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type RouteParams = Record<string, string | string[] | undefined>;

/** What Next 16 passes as the 2nd argument of a route handler. */
export type NextRouteContext<P extends RouteParams> = { params: Promise<P> };

/** What our handlers receive: params already awaited. */
export type HandlerContext<P extends RouteParams> = { params: P };

/** A handler may return a Response, or plain data (sent as 200 JSON). */
export type HandlerResult = Response | object | string | number | boolean | null | undefined;

export type Handler<P extends RouteParams = RouteParams, C extends object = object> = (
  request: NextRequest,
  context: HandlerContext<P> & C,
) => Promise<HandlerResult> | HandlerResult;

export type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  reference?: string;
};

// ----------------------------------------------------------------------
// Response helpers
// ----------------------------------------------------------------------

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data as unknown, { status: 200, ...init });
}

/** 201 — what Nest answered for every POST (no @HttpCode was used anywhere). */
export function created<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data as unknown, { status: 201, ...init });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** `{ data, meta: { page, limit, total, totalPages } }` — the list envelope the UI reads. */
export function paginated<T>(
  data: T[],
  params: { page: number; limit: number; total: number },
): NextResponse<{ data: T[]; meta: PaginationMeta }> {
  return NextResponse.json({ data, meta: buildPaginationMeta(params) });
}

// ----------------------------------------------------------------------
// Error mapping (port of the old AllExceptionsFilter)
// ----------------------------------------------------------------------

function referenceId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function errorJson(body: ErrorBody): NextResponse<ErrorBody> {
  return NextResponse.json(body, { status: body.statusCode });
}

export function toErrorResponse(error: unknown, request: NextRequest): NextResponse<ErrorBody> {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const status = (code: number) => ERROR_MESSAGES.httpStatus[code] ?? ERROR_MESSAGES.httpStatus[500];

  if (error instanceof HttpError) {
    return errorJson({ statusCode: error.status, message: error.messages, error: error.error, path });
  }

  if (error instanceof ZodError) {
    return errorJson({ statusCode: 400, message: formatZodIssues(error.issues), error: status(400), path });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const described = describePrismaKnownError(
      { code: error.code, meta: error.meta as Record<string, unknown> | undefined },
      request.method,
      request.nextUrl.pathname,
    );
    console.warn(`${request.method} ${path} → ${described.status} ${described.message}`);
    return errorJson({ statusCode: described.status, message: described.message, error: described.error, path });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.warn(`${request.method} ${path} → 400 ${error.message}`);
    return errorJson({ statusCode: 400, message: ERROR_MESSAGES.database.validation, error: status(400), path });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(`${request.method} ${path} → 503`, error);
    return errorJson({ statusCode: 503, message: ERROR_MESSAGES.database.unreachable, error: status(503), path });
  }

  const reference = referenceId();
  console.error(`${request.method} ${path} → 500 [ref ${reference}]`, error);
  return errorJson({
    statusCode: 500,
    message: ERROR_MESSAGES.common.internal(reference),
    error: status(500),
    path,
    reference,
  });
}

function toResponse(result: HandlerResult): Response {
  if (result instanceof Response) return result;
  if (result === undefined) return new NextResponse(null, { status: 200 });
  return NextResponse.json(result);
}

// ----------------------------------------------------------------------
// route() — wrap every exported route handler with it
// ----------------------------------------------------------------------

/**
 * Wraps a handler: awaits Next 16's params promise, turns thrown HttpError /
 * ZodError / Prisma errors into the `{ statusCode, message, error, path }`
 * body, and serialises plain return values as JSON.
 *
 *   export const GET = route(async (req, { params }) => service.get(params.id));
 *   export const POST = route(withAuth(async (req, { user }) => ..., { roles: ["admin"] }));
 */
export function route<P extends RouteParams = RouteParams>(handler: Handler<P>) {
  return async function routeHandler(
    request: NextRequest,
    context: NextRouteContext<P>,
  ): Promise<Response> {
    try {
      const params = ((await context?.params) ?? {}) as P;
      const response = toResponse(await handler(request, { params }));
      // Catalogue writes (stock, prices, products, settings…) mark the storefront's cached reads stale.
      if (response.ok && isCatalogWrite(request.method, request.nextUrl.pathname)) revalidateTag(CATALOG_CACHE_TAG, "max");
      return response;
    } catch (error) {
      return toErrorResponse(error, request);
    }
  };
}
