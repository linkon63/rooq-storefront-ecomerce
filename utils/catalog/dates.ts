import { NEW_ARRIVAL_DAYS } from "@/lib/constants/catalog";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the "new arrivals" window. */
export function newArrivalsSince(now: Date, days: number = NEW_ARRIVAL_DAYS): Date {
  return new Date(now.getTime() - days * DAY_MS);
}

export function isNewArrival(publishedAt: Date | null, now: Date, days: number = NEW_ARRIVAL_DAYS): boolean {
  return !!publishedAt && publishedAt.getTime() >= newArrivalsSince(now, days).getTime();
}

/** Collection visibility window (open ends allowed). */
export function isWithinWindow(startsAt: Date | null, endsAt: Date | null, now: Date): boolean {
  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
}
