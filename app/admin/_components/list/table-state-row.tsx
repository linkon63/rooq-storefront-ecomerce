/** A full-width message row (loading / empty) inside an admin table body. */
export function TableStateRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td className="px-5 py-8 text-center text-sm font-medium text-slate-500" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}
