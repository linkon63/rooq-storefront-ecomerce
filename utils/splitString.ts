export const splitName = (value: string) => {
  const nameParts = value.trim().split(" ");
  const [first, ...rest] = nameParts;
  return { 
    firstName: first || "", 
    lastName: rest.join(" ") 
  };
};

export const splitAddress = (value: string) => {
  const trimmedAddress = value.trim();

  const addressDetailsParts = trimmedAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (addressDetailsParts.length <= 1) {
    return {
      area: "",
      addressLine: trimmedAddress,
    };
  }

  return {
    area: addressDetailsParts[0] || "",
    addressLine: addressDetailsParts.slice(1).join(", "),
  };
};
