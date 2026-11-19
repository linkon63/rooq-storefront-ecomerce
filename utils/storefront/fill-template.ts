/**
 * Splits "{n} orders" into ["", value-of-n, " orders"], so callers can put
 * React nodes (an animated number) where the placeholders are. Unknown
 * placeholders are kept as text.
 */
export function fillTemplate<T>(template: string, values: Record<string, T>): (string | T)[] {
  return template
    .split(/(\{\w+\})/)
    .filter((part) => part !== "")
    .map((part) => {
      const key = /^\{(\w+)\}$/.exec(part)?.[1];
      return key !== undefined && key in values ? values[key] : part;
    });
}

/** BCP 47 tag for number formatting in each storefront language (Bengali digits for bn). */
export function numberLocale(locale: "en" | "bn"): string {
  return locale === "bn" ? "bn-BD" : "en-BD";
}
