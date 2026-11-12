/** Row from `prisma.address` (all scalar columns). */
export type AddressRow = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AddressResponse = Omit<AddressRow, "state" | "postalCode"> & { state: string; postalCode: string };

/** The old AddressResponseDto: state / postalCode were never null. */
export function toAddressResponse(row: AddressRow): AddressResponse {
  return { ...row, state: row.state ?? "", postalCode: row.postalCode ?? "" };
}
