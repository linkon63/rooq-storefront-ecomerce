/** "1.3 MB" / "820 KB" — rounded up so a file just over a limit never reads as exactly the limit. */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(Math.ceil((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}
