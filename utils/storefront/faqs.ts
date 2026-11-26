import type { StoreSettings } from "@/types/storefront/content";
import { formatMoney } from "./money";

export type FaqCategory = "delivery" | "orders" | "sizing" | "craft";

export type Faq = {
  question: string;
  answer: string;
  category: FaqCategory;
};

/** Help answers that quote the live delivery charges and return window from Settings. */
export function buildFaqs(settings: StoreSettings): Faq[] {
  const { delivery, currency } = settings;
  const money = (amount: number) => (amount > 0 ? formatMoney(amount, currency) : "free");
  const threshold = delivery.freeShippingThreshold;
  return [
    {
      category: "delivery",
      question: "How much is delivery and how long does it take?",
      answer: `Delivery is ${money(delivery.inside)} inside Dhaka city, ${money(delivery.nearCity)} near Dhaka and ${money(delivery.outside)} across the rest of Bangladesh.${
        threshold ? ` Orders over ${formatMoney(threshold, currency)} ship free.` : ""
      } Dhaka orders usually arrive in 1 to 3 working days, the rest of the country in 3 to 7.`,
    },
    {
      category: "delivery",
      question: "Can I pay when the parcel arrives?",
      answer: "Yes. Every order is cash on delivery. You can open the parcel and check the items at the door before you pay the rider.",
    },
    {
      category: "orders",
      question: "How do returns and exchanges work?",
      answer: `You have ${delivery.returnWindowDays} days from delivery. Open the order in your account, choose Return or exchange, pick the items and tell us why. Exchanges let you choose another size or colour of the same piece. Items must be unworn with their tags on.`,
    },
    {
      category: "orders",
      question: "Can I change or cancel my order?",
      answer: "You can cancel from your account until the order is packed. To change a size after that, wait for delivery and request an exchange.",
    },
    {
      category: "orders",
      question: "A size I want is sold out. Will it come back?",
      answer: "Often, yes. Choose the sold-out size on the product page and leave your email under Notify me. We email you once when it is back.",
    },
    {
      category: "sizing",
      question: "How do I find my size?",
      answer:
        "Every product page has a Size guide next to the sizes, with body measurements in centimetres and inches. Reviews also tell you whether a piece runs small, true to size or large, and the model's height and size are listed under Details.",
    },
    {
      category: "sizing",
      question: "Do sarees come with a blouse piece?",
      answer:
        "Many of our tant sarees include a matching unstitched blouse piece, while some traditional weaves do not. Check the Details section on each product page for exact saree length and whether a blouse piece is included.",
    },
    {
      category: "craft",
      question: "Are your tant sarees genuinely handloom?",
      answer:
        "Yes. Our sarees are woven on traditional handlooms by weaving families in Tangail and Shantipur, not on power mills. Slight irregularities in weave or slub are the natural mark of a hand-thrown shuttle.",
    },
    {
      category: "craft",
      question: "How should I wash my clothes?",
      answer: "Care instructions for each piece are on its product page under Care, and on the label sewn inside. When in doubt, wash cold, inside out, and dry flat.",
    },
  ];
}
