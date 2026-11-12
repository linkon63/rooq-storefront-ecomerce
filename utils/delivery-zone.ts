import type { DeliveryZone } from "@/types/storefront/ui";

/** Rooq ships within Bangladesh only, so the country is never a choice. */
export const COUNTRY = "Bangladesh";

/** Every district the checkout will ship to, Dhaka first. */
export const BANGLADESH_DISTRICTS = [
  "Dhaka", "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar",
  "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
  "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna",
  "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura",
  "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail",
  "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
  "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon",
];

/**
 * The districts that ring Dhaka and take the "Near Dhaka" rate rather than the
 * full outside-Dhaka one.
 *
 * This is the only copy of the list: checkout uses it to pick the delivery zone it
 * sends with the order, and the order API prices that zone with the Admin →
 * Settings delivery rates.
 */
export const NEAR_DHAKA_DISTRICTS = [
  "Gazipur",
  "Manikganj",
  "Munshiganj",
  "Narayanganj",
  "Narsingdi",
];

const NEAR_DHAKA_LOOKUP = new Set(NEAR_DHAKA_DISTRICTS.map((name) => name.toLowerCase()));

/**
 * Areas that sit inside Dhaka district but outside the city proper, so they are
 * delivered at the Near Dhaka rate rather than the inside-city one. Picking
 * Dhaka as the district is therefore not enough on its own to decide the rate —
 * Savar and Keraniganj are Dhaka district, but they are not Dhaka city.
 *
 * Checkout uses this list to pick the zone; the order API prices the zone it is
 * sent with the Admin → Settings delivery rates.
 */
export const NEAR_DHAKA_AREAS = [
  "Ashulia",
  "Dhamrai",
  "Dohar",
  "Keraniganj",
  "Nawabganj",
  "Savar",
];

const NEAR_DHAKA_AREA_LOOKUP = new Set(NEAR_DHAKA_AREAS.map((name) => name.toLowerCase()));

/**
 * Areas inside Dhaka city. Shown as a dropdown once Dhaka is the district, so a
 * shopper picks a known area instead of typing a spelling the rider has to guess.
 */
export const DHAKA_AREAS = [
  "Adabar", "Aftabnagar", "Agargaon", "Airport", "Ashulia", "Azimpur", "Badda", "Banani",
  "Banasree", "Bangshal", "Baridhara", "Bashundhara R/A", "Cantonment", "Chawkbazar",
  "Dakshinkhan", "Demra", "Dhamrai", "Dhanmondi", "Dohar", "Elephant Road", "Farmgate",
  "Gendaria", "Green Road", "Gulshan", "Hazaribagh", "Jatrabari", "Kadamtoli", "Kafrul",
  "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet", "Lalbagh", "Lalmatia",
  "Malibagh", "Mirpur", "Mohakhali", "Mohammadpur", "Motijheel", "Mugda", "Nawabganj",
  "New Market", "Nikunja", "Pallabi", "Paltan", "Panthapath", "Ramna", "Rampura",
  "Sabujbagh", "Savar", "Shahbagh", "Shahjahanpur", "Shantinagar", "Shyamoli", "Shyampur",
  "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Vatara", "Wari", "Zigatola",
];

/** True when the district's City field should offer the Dhaka area list. */
export function isDhakaDistrict(district?: string | null): boolean {
  return (district ?? "").trim().toLowerCase() === "dhaka";
}

/**
 * Which delivery rate an address falls under, from its district and area.
 *
 * The area matters because Dhaka district reaches well past Dhaka city: Savar
 * and Keraniganj are both "Dhaka" on the district line but are delivered at the
 * Near Dhaka rate, so district alone would undercharge them.
 *
 * The checkout shows the resulting charge but never lets the shopper edit it.
 * This is only the preview — the API runs the same rules over the address it is
 * sent and prices the order from the shop's own settings, so the two agree
 * without the browser ever being trusted with the amount.
 */
export function resolveDeliveryZone(
  district?: string | null,
  area?: string | null,
): DeliveryZone {
  const districtKey = (district ?? "").trim().toLowerCase();
  const areaKey = (area ?? "").trim().toLowerCase();

  if (NEAR_DHAKA_LOOKUP.has(districtKey)) return "near_city";
  if (districtKey === "dhaka") {
    return NEAR_DHAKA_AREA_LOOKUP.has(areaKey) ? "near_city" : "inside";
  }
  if (!districtKey) return "inside";
  return "outside";
}

/** How each zone is named to the shopper. */
export const ZONE_LABELS: Record<DeliveryZone, string> = {
  inside: "Inside Dhaka",
  near_city: "Near Dhaka",
  outside: "Outside Dhaka",
};
