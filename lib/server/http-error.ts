import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/**
 * An error that already knows its HTTP status and user-facing message.
 * `message` may be an array (validation), mirroring Nest's ValidationPipe.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly messages: string | string[];
  readonly error: string;

  constructor(status: number, message: string | string[], error?: string) {
    super(Array.isArray(message) ? message.join(", ") : message);
    this.name = "HttpError";
    this.status = status;
    this.messages = message;
    this.error = error ?? ERROR_MESSAGES.httpStatus[status] ?? ERROR_MESSAGES.httpStatus[500];
  }
}

export const badRequest = (message: string | string[] = ERROR_MESSAGES.common.badRequest) =>
  new HttpError(400, message);
export const unauthorized = (message: string = ERROR_MESSAGES.auth.unauthorized) =>
  new HttpError(401, message);
export const forbidden = (message: string = ERROR_MESSAGES.common.forbidden) =>
  new HttpError(403, message);
export const notFound = (message: string = ERROR_MESSAGES.common.notFound) =>
  new HttpError(404, message);
export const conflict = (message: string = ERROR_MESSAGES.common.conflict) =>
  new HttpError(409, message);
export const payloadTooLarge = (message: string = ERROR_MESSAGES.common.payloadTooLarge) =>
  new HttpError(413, message);
export const unsupportedMediaType = (message: string) => new HttpError(415, message);
export const serviceUnavailable = (message: string = ERROR_MESSAGES.common.serviceUnavailable) =>
  new HttpError(503, message);
