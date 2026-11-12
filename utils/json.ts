/**
 * Round-trips a value through JSON so a service result has exactly the shape
 * the HTTP route would have answered (Dates → ISO strings, Decimals → their
 * JSON form, undefined keys dropped). Pure; throws only on cycles.
 */
export function toPlainJson<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}
