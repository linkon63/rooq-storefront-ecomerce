/**
 * The storefront FAQ. Answers quote the live phone, e-mail and delivery
 * charges from Admin → Settings, so they are built per request rather than
 * written out as constants.
 */
export type Faq = { question: string; answer: string };

export function buildFaqs({
  phone,
  email,
  insideCharge,
  outsideCharge,
}: {
  phone: string;
  email: string;
  insideCharge: string;
  outsideCharge: string;
}): Faq[] {
  return [
    {
      question: "DO YOU HAVE CASH ON DELIVERY?",
      answer:
        "Yes — cash on delivery is available in all 64 districts of Bangladesh. You pay the rider in cash only after the parcel reaches your hand. You are welcome to open the box at the door and check that the products, quantity and seals are correct before paying. Please keep the exact amount ready, as riders often carry no change.",
    },
    {
      question: "HOW LONG DOES DELIVERY TAKE?",
      answer:
        "Inside Dhaka, orders usually arrive within 1–3 working days of confirmation. Outside Dhaka, our courier partners — Steadfast, Pathao, RedX and Sundarban — normally deliver within 3–7 working days. During Ramadan, Eid, floods or hartals, courier networks slow down and we will call you if your parcel is running late.",
    },
    {
      question: "HOW MUCH IS THE DELIVERY CHARGE?",
      answer: `The delivery charge is ${insideCharge} inside Dhaka and ${outsideCharge} outside Dhaka. It is added to your order total at checkout and shown before you confirm, so there are no surprises when the rider arrives. The COD amount collected at your door is the product total plus that delivery charge — nothing else.`,
    },
    {
      question: "WILL SOMEONE CALL ME BEFORE DELIVERY?",
      answer:
        "Yes. For every cash on delivery order our team calls or WhatsApps the number you gave us to confirm your address and the order before we dispatch it. The delivery rider will also call you on the day of delivery, usually from their own mobile number. Please note that we will never ask you for a bKash PIN, an OTP or any verification code over the phone.",
    },
    {
      question: "CAN I PAY WITH bKASH, NAGAD OR ROCKET?",
      answer: `You can. Advance payment through bKash, Nagad or Rocket is available at checkout, and cards are supported where shown. Only send advance payment to the numbers displayed at checkout or confirmed by our team on ${phone}. For large or bulk orders we may ask for a partial advance before dispatch.`,
    },
    {
      question: "WHERE DO YOUR PRODUCTS COME FROM?",
      answer:
        "Everything we sell is sourced directly from farming families and small producers across Bangladesh — mustard from the fields of Faridpur and Rajshahi, ghee from dairy households, honey from Sundarban and mustard-flower hives, coconut oil from the coastal belt. We buy from the growers ourselves, which is why there is no middleman price on our shelf and why we can tell you exactly where a batch came from.",
    },
    {
      question: "HOW DO I KNOW THE MUSTARD OIL AND GHEE ARE NOT ADULTERATED?",
      answer:
        "Adulteration is the honest worry every Bangladeshi shopper has, and we treat it that way. Every batch is lab-tested for purity before it is bottled, sealed at our own facility, and marked with a batch and best-before date. Real cold-pressed mustard oil has a sharp pungency that catches your nose, leaves a natural sediment at the bottom, and never looks glass-clear. Pure ghee grains and hardens in winter. If anything ever seems off, send us a photo and we will replace it.",
    },
    {
      question: "WHY HAS MY HONEY CRYSTALLISED AND MY GHEE GONE HARD?",
      answer:
        "Both are proof that the product is real, not a fault. Raw, unprocessed honey naturally crystallises in cooler weather — place the jar in warm water and it will loosen again. Pure ghee sets solid in winter and turns liquid in Dhaka summer heat. Only processed, additive-heavy versions stay identical all year round.",
    },
    {
      question: "WHAT IF THE PRODUCT ARRIVES DAMAGED OR WRONG?",
      answer:
        "Tell us within 48 hours of delivery with your order number and a clear photo of the product and the packaging. If the item is wrong, damaged, leaking, broken-sealed or past its best-before date, we replace it free of charge or refund you in full, including the delivery charge. Because these are food items, we cannot accept the return of an opened seal unless the complaint is about quality.",
    },
    {
      question: "CAN I CANCEL OR CHANGE MY ORDER?",
      answer: `Yes, free of charge, any time before the parcel is handed to the courier — just call or WhatsApp ${phone} with your order number. Once it has been dispatched we cannot cancel it online, though you can still refuse it at the door. Please let us know first so we can stop it in transit rather than pay the two-way courier charge.`,
    },
    {
      question: "DO YOU DELIVER OUTSIDE DHAKA AND OUTSIDE BANGLADESH?",
      answer: `We deliver to every district in Bangladesh, from Panchagarh to Teknaf, through our courier partners. International shipping is arranged case by case for bulk and gift orders — email ${email} with the destination country and quantity and we will quote you the freight cost. Customs duties in the destination country are the buyer’s responsibility.`,
    },
    {
      question: "DO YOU TAKE CORPORATE, WHOLESALE OR EID GIFT ORDERS?",
      answer: `We do, and it is a large part of what we ship. We supply offices, resellers and corporate Eid and Puja hampers with custom packaging and branded gift boxes. Wholesale pricing starts at bulk quantities and includes an invoice with your company details. Call ${phone} or use the form above with your quantity and delivery date and our team will get back to you within one working day.`,
    },
  ];
}
