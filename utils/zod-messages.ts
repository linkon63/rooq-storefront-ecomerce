import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/** The subset of a zod issue we read — keeps this file free of zod imports. */
export type ValidationIssue = {
  code: string;
  path: PropertyKey[];
  message: string;
  keys?: string[];
};

function pathLabel(path: PropertyKey[]): string {
  return path.map((part) => String(part)).join(".");
}

/**
 * Zod issues → Nest ValidationPipe-style message array:
 *   ["email must be an email", "property foo should not exist"].
 */
export function formatZodIssues(issues: readonly ValidationIssue[]): string[] {
  const messages: string[] = [];
  for (const issue of issues) {
    if (issue.code === "unrecognized_keys" && issue.keys?.length) {
      const prefix = issue.path.length ? `${pathLabel(issue.path)}.` : "";
      for (const key of issue.keys) messages.push(ERROR_MESSAGES.validation.unknownField(`${prefix}${key}`));
      continue;
    }
    const label = pathLabel(issue.path);
    messages.push(label ? `${label}: ${issue.message}` : issue.message);
  }
  return messages.length ? messages : [ERROR_MESSAGES.validation.failed];
}
