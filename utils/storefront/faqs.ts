import type { StoreSettings } from "@/types/storefront/content";
import type { Locale } from "@/lib/i18n/locales";
import { formatMoney } from "./money";

export type FaqCategory = "delivery" | "orders" | "sizing" | "craft";

export type Faq = {
  question: string;
  answer: string;
  category: FaqCategory;
};

/** Help answers that quote the live delivery charges and return window from Settings. */
export function buildFaqs(settings: StoreSettings, locale: Locale = "en"): Faq[] {
  return locale === "bn" ? buildFaqsBn(settings) : buildFaqsEn(settings);
}

function buildFaqsEn(settings: StoreSettings): Faq[] {
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

function buildFaqsBn(settings: StoreSettings): Faq[] {
  const { delivery, currency } = settings;
  const money = (amount: number) => (amount > 0 ? formatMoney(amount, currency) : "ফ্রি");
  const threshold = delivery.freeShippingThreshold;
  return [
    {
      category: "delivery",
      question: "ডেলিভারি চার্জ কত এবং কতদিনে পৌঁছায়?",
      answer: `ঢাকা সিটির ভেতরে ডেলিভারি ${money(delivery.inside)}, ঢাকার আশেপাশে ${money(delivery.nearCity)} এবং বাংলাদেশের বাকি অংশে ${money(delivery.outside)}।${
        threshold ? ` ${formatMoney(threshold, currency)} এর বেশি অর্ডারে ডেলিভারি ফ্রি।` : ""
      } ঢাকার অর্ডার সাধারণত ১ থেকে ৩ কর্মদিবসে, দেশের অন্য জায়গায় ৩ থেকে ৭ দিনে পৌঁছায়।`,
    },
    {
      category: "delivery",
      question: "পার্সেল হাতে পেয়ে কি টাকা দিতে পারি?",
      answer: "হ্যাঁ। সব অর্ডারই ক্যাশ অন ডেলিভারি। রাইডারকে টাকা দেওয়ার আগে দরজাতেই পার্সেল খুলে পণ্য দেখে নিতে পারবেন।",
    },
    {
      category: "orders",
      question: "রিটার্ন ও এক্সচেঞ্জ কীভাবে কাজ করে?",
      answer: `ডেলিভারির পর ${delivery.returnWindowDays} দিন সময় পাবেন। আপনার অ্যাকাউন্টে অর্ডারটি খুলে Return or exchange বেছে নিন, পণ্য নির্বাচন করুন এবং কারণ জানান। এক্সচেঞ্জে একই পোশাকের অন্য সাইজ বা রং নেওয়া যায়। পণ্য অব্যবহৃত ও ট্যাগসহ থাকতে হবে।`,
    },
    {
      category: "orders",
      question: "অর্ডার বদলানো বা বাতিল করা যায়?",
      answer: "অর্ডার প্যাক হওয়ার আগ পর্যন্ত আপনার অ্যাকাউন্ট থেকে বাতিল করতে পারবেন। এরপর সাইজ বদলাতে চাইলে ডেলিভারির পর এক্সচেঞ্জের অনুরোধ করুন।",
    },
    {
      category: "orders",
      question: "আমার সাইজটি স্টকে নেই। আবার কি আসবে?",
      answer: "প্রায়ই আসে। প্রোডাক্ট পেজে স্টকআউট সাইজটি বেছে Notify me এর নিচে আপনার ইমেইল দিন। সাইজটি ফিরে এলে আমরা একবার ইমেইল করব।",
    },
    {
      category: "sizing",
      question: "আমার সাইজ কীভাবে বুঝব?",
      answer:
        "প্রতিটি প্রোডাক্ট পেজে সাইজের পাশে একটি সাইজ গাইড আছে, যেখানে শরীরের মাপ সেন্টিমিটার ও ইঞ্চিতে দেওয়া। রিভিউ থেকেও জানতে পারবেন পোশাকটি ছোট, ঠিক মাপের নাকি বড় হয়, আর মডেলের উচ্চতা ও সাইজ Details এ লেখা আছে।",
    },
    {
      category: "sizing",
      question: "শাড়ির সাথে কি ব্লাউজ পিস থাকে?",
      answer:
        "আমাদের অনেক তাঁতের শাড়ির সাথেই ম্যাচিং সেলাইবিহীন ব্লাউজ পিস থাকে, আবার কিছু ঐতিহ্যবাহী বুননে থাকে না। শাড়ির দৈর্ঘ্য ও ব্লাউজ পিস আছে কিনা জানতে প্রতিটি প্রোডাক্ট পেজের Details অংশ দেখুন।",
    },
    {
      category: "craft",
      question: "আপনাদের তাঁতের শাড়ি কি আসলেই হ্যান্ডলুম?",
      answer:
        "হ্যাঁ। আমাদের শাড়িগুলো পাওয়ারলুমে নয়, টাঙ্গাইল ও শান্তিপুরের তাঁতি পরিবারের ঐতিহ্যবাহী হাতে চালানো তাঁতে বোনা। বুননে সামান্য স্বাভাবিক তারতম্য হাতের কাজেরই চিহ্ন।",
    },
    {
      category: "craft",
      question: "পোশাক কীভাবে ধোব?",
      answer: "প্রতিটি পোশাকের যত্নের নিয়ম প্রোডাক্ট পেজের Care অংশে এবং ভেতরে সেলাই করা লেবেলে আছে। নিশ্চিত না হলে ঠান্ডা পানিতে, উল্টো করে ধুয়ে সমতলে শুকান।",
    },
  ];
}
