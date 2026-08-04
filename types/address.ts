export type AddressItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  divisionId: string;
  districtId: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
  postcode: string;
  country: string;
};

export type AddressFormState = Omit<AddressItem, "id">;

export type ProfileDefaults = {
  firstName: string;
  lastName: string;
  phone: string;
};

export type StatusState = {
  type: "success" | "error";
  message: string;
};

export type GuestFormState = {
  name: string;
  phone: string;
  address: string;
  state: string | null;
  city: string | null;
  postcode: string | null;
};

export type ApiAddressField = string | number | boolean;

export type ApiAddressData = Record<string, ApiAddressField>;

export type ApiAddressResponse = {
  data?: {
    addresses?: ApiAddressData[];
    mailing_address?: ApiAddressData;
  };
  addresses?: ApiAddressData[];
  mailing_address?: ApiAddressData;
};
