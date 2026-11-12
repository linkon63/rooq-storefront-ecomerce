/** Error banner for a report or dashboard that failed to load. */
export function ReportError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 font-black text-rose-700" role="alert">
      {message}
    </div>
  );
}
