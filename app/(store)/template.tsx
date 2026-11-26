/** Re-mounts on navigation so phones get a short fade between screens. */
export default function StoreTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="page-enter">{children}</div>;
}
