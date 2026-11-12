"use client";

import { BANGLADESH_DISTRICTS, DHAKA_AREAS, isDhakaDistrict } from "@/utils/delivery-zone";
import type { ShippingAddressInput } from "@/types/storefront/commerce";
import { TextField } from "../shared/text-field";

type Props = {
  value: ShippingAddressInput;
  onChange: (next: ShippingAddressInput) => void;
  withEmail: boolean;
};

const selectClass = "h-12 w-full rounded border border-line bg-paper px-3 text-base";

/** Name, phone, district and area (which set the delivery zone), and the street address. */
export function AddressFields({ value, onChange, withEmail }: Props) {
  const set = (key: keyof ShippingAddressInput) => (event: { target: { value: string } }) =>
    onChange({ ...value, [key]: event.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField id="ship-name" label="Full name" required autoComplete="name" value={value.fullName} onChange={set("fullName")} />
      <TextField id="ship-phone" label="Mobile number" type="tel" required inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={value.phone} onChange={set("phone")} />
      {withEmail ? (
        <TextField
          id="ship-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          hint="For your receipt and delivery updates."
          value={value.email ?? ""}
          onChange={set("email")}
          className="sm:col-span-2"
        />
      ) : null}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ship-city" className="text-sm font-semibold">
          District
        </label>
        <select id="ship-city" required autoComplete="address-level1" value={value.city} onChange={set("city")} className={selectClass}>
          <option value="">Choose a district</option>
          {BANGLADESH_DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ship-area" className="text-sm font-semibold">
          Area <span className="font-normal text-stone">(optional)</span>
        </label>
        <input
          id="ship-area"
          list={isDhakaDistrict(value.city) ? "dhaka-areas" : undefined}
          autoComplete="address-level2"
          value={value.state ?? ""}
          onChange={set("state")}
          className={selectClass}
        />
        <datalist id="dhaka-areas">
          {DHAKA_AREAS.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
      </div>
      <TextField
        id="ship-line1"
        label="Street address"
        required
        autoComplete="address-line1"
        placeholder="House, road, block"
        value={value.addressLine1}
        onChange={set("addressLine1")}
        className="sm:col-span-2"
      />
      <TextField id="ship-line2" label="Apartment, floor, landmark" autoComplete="address-line2" value={value.addressLine2 ?? ""} onChange={set("addressLine2")} />
      <TextField id="ship-postcode" label="Postcode" inputMode="numeric" autoComplete="postal-code" value={value.postalCode ?? ""} onChange={set("postalCode")} />
    </div>
  );
}
