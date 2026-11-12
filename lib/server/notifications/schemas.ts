import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;
const NOTIFICATION_TYPES = ["ORDER", "RETURN", "STOCK", "REVIEW", "PROMO", "SYSTEM"] as const;

/** POST /notifications — CreateNotificationDto (+ type / link). */
export const createNotificationSchema = z.strictObject({
  userId: z.uuid({ error: v.invalidUuid("userId") }),
  title: z.string({ error: v.required("title") }).trim().min(1, v.required("title")),
  message: z.string({ error: v.required("message") }).trim().min(1, v.required("message")),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  link: z.string().trim().nullish(),
});

export type CreateNotificationInput = z.output<typeof createNotificationSchema>;
