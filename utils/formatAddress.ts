import { AddressItem } from "@/types/address";
import { District, Division } from "@/types/location";
import locations from "@/data/locations.json";

const { divisions, districts } = locations as {
  divisions: Division[];
  districts: District[];
};

export const divisionName = (id: string) =>
  divisions.find((division) => division.id === id)?.name || "";

export const districtName = (id: string) =>
  districts.find((district) => district.id === id)?.name || "";

export const formatAddress = (item: AddressItem) => {
  const parts = [
    item.area,
    districtName(item.districtId),
    divisionName(item.divisionId),
    item.postcode,
    item.country,
  ].filter(Boolean);
  return parts.join(", ");
};