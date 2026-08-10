import type { Metadata } from "next";

import LegalPage, { LegalList, type LegalSection } from "@/components/storefront/legal/LegalPage";
import LegalContactCard, {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/components/storefront/legal/LegalContactCard";

export const metadata: Metadata = {
  title: "Terms & Conditions | Organishi",
  description:
    "The terms that apply when you order organic food from Organishi — ordering, cash on delivery, delivery timelines, cancellation, returns and refunds across Bangladesh.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    heading: "Agreement to these terms",
    body: (
      <>
        <p>
          These Terms &amp; Conditions govern your use of organishi.com and every order you
          place with Organishi, whether through our website, over the phone, on WhatsApp, or
          through our Facebook page. Placing an order means you have read and accepted these
          terms.
        </p>
        <p>
          We may update these terms from time to time. The version published on this page at
          the moment you place your order is the version that applies to that order.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    heading: "Who can order",
    body: (
      <>
        <p>
          You must be at least 18 years old and able to enter into a binding contract to order
          from us. You must give a real name, a working Bangladeshi mobile number and a complete
          delivery address. Orders with incomplete or clearly false contact details will be
          cancelled without notice.
        </p>
        <p>
          If you create an account, you are responsible for keeping your password confidential
          and for everything done through your account.
        </p>
      </>
    ),
  },
  {
    id: "products",
    heading: "Products, prices and availability",
    body: (
      <>
        <LegalList
          items={[
            "All prices are in Bangladeshi Taka (৳) and include applicable VAT unless stated otherwise on the product page.",
            "Prices, discounts and delivery charges may change at any time, but the price shown at the moment you place your order is the price you pay for that order.",
            "Our products are natural and farm-sourced. Colour, aroma, thickness and sediment vary between batches and seasons — cold-pressed mustard oil settles, pure ghee grains in winter, and raw honey crystallises. These are signs of authenticity, not defects.",
            "Photographs are indicative. Packaging design and label may differ slightly from the images shown.",
            "Net weight and volume are as printed on the pack. Small variations within the tolerance allowed by BSTI packaging rules are normal.",
            "Stock is limited. If an item sells out after you order it, we will call you to offer a substitute, a partial delivery, or a full cancellation.",
          ]}
        />
        <p>
          Nothing on this website is medical advice. Our products are food, not medicine, and
          are not intended to diagnose, treat or cure any condition. If you have an allergy or a
          medical condition, read the ingredient list and consult your doctor before use.
        </p>
      </>
    ),
  },
  {
    id: "ordering",
    heading: "Placing an order",
    body: (
      <>
        <p>
          When you complete checkout you will see an order confirmation on screen and receive an
          SMS or email. That confirmation acknowledges your request — it does not by itself
          create a contract.
        </p>
        <p>
          <strong>The contract is formed only when we confirm your order.</strong> For cash on
          delivery orders, our team will call or WhatsApp you on the number you provided to
          verify the address and confirm the order before dispatch. If we cannot reach you after
          three attempts within 48 hours, the order may be cancelled.
        </p>
        <p>
          We reserve the right to refuse or cancel any order — including a confirmed one — where
          there is an obvious pricing error, a stock shortage, a suspected fraudulent order, or
          a history of refused COD parcels from the same number or address. If you have already
          paid in that case, you get a full refund.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    heading: "Payment and cash on delivery",
    body: (
      <>
        <p>We accept:</p>
        <LegalList
          items={[
            <>
              <strong>Cash on delivery (COD)</strong> — pay the delivery rider in cash when the
              parcel reaches you. This is available across Bangladesh.
            </>,
            <>
              <strong>Mobile financial services</strong> — bKash, Nagad and Rocket for advance
              payment.
            </>,
            <>
              <strong>Cards and bank transfer</strong> — where offered at checkout.
            </>,
          ]}
        />
        <p>
          For COD orders, please keep the exact amount ready. The rider collects the full order
          total including delivery charge. You may open the parcel and check that the products,
          quantity and seals are correct before paying — but you may not use or consume a
          product and then refuse payment.
        </p>
        <p>
          <strong>High-value or bulk orders</strong> may require a partial advance payment. Our
          team will tell you at the confirmation call if this applies.
        </p>
        <p>
          Organishi staff will never ask you for a bKash/Nagad PIN, an OTP or a
          &ldquo;verification code&rdquo;. Send advance payments only to the numbers shown at
          checkout or confirmed by our team on {SUPPORT_PHONE}.
        </p>
      </>
    ),
  },
  {
    id: "delivery",
    heading: "Delivery",
    body: (
      <>
        <LegalList
          items={[
            "Inside Dhaka: usually delivered within 1–3 working days of order confirmation.",
            "Outside Dhaka: usually delivered within 3–7 working days through our courier partners.",
            "The delivery charge that applies to your order is shown at checkout before you confirm.",
            "Delivery is made to the address you gave. Please make sure someone is available on the given mobile number to receive the parcel.",
            "Our couriers deliver to the gate or the ground floor in most areas. Delivery to an upper floor depends on the rider.",
          ]}
        />
        <p>
          Timelines are estimates, not guarantees. Delivery may be delayed by weather, floods,
          hartals or blockades, road closures, courier backlogs, Eid and other public holidays,
          or events outside our reasonable control. We will keep you informed if your parcel is
          delayed.
        </p>
        <p>
          If the rider cannot reach you or you are unavailable, the courier will normally
          reattempt delivery once. After a failed second attempt, the parcel is returned to us
          and the order is cancelled.
        </p>
      </>
    ),
  },
  {
    id: "refused-orders",
    heading: "Refused and repeatedly cancelled COD orders",
    body: (
      <>
        <p>
          Cash on delivery works on trust. Every refused parcel costs us the two-way courier
          charge and takes stock away from another customer. If a customer repeatedly places COD
          orders and refuses them at the door without a genuine reason, we may:
        </p>
        <LegalList
          items={[
            "Require full advance payment on future orders from that number or address, or",
            "Decline to accept further orders from that customer.",
          ]}
        />
        <p>
          If you change your mind, that is completely fine — just call or WhatsApp us on{" "}
          {SUPPORT_PHONE} before dispatch and we will cancel it free of charge.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    heading: "Cancelling an order",
    body: (
      <>
        <p>
          You may cancel any order free of charge before it is handed to the courier. Call or
          WhatsApp {SUPPORT_PHONE}, or email {SUPPORT_EMAIL} with your order number.
        </p>
        <p>
          Once the parcel has been dispatched it cannot be cancelled online. You may still
          refuse it at the door, but please tell us first so we can stop it in transit.
        </p>
      </>
    ),
  },
  {
    id: "returns",
    heading: "Returns, replacements and refunds",
    body: (
      <>
        <p>
          We replace or refund any product that arrives wrong, damaged, leaking, broken-sealed,
          or past its best-before date. Report it to us{" "}
          <strong>within 48 hours of delivery</strong> with your order number and clear photos
          of the product and the packaging. We will arrange a free replacement or a full refund
          including delivery charge.
        </p>
        <p>
          <strong>What we cannot take back:</strong> because these are food items, we cannot
          accept the return of a product whose seal has been opened, unless the complaint is
          about quality, contamination or a manufacturing defect. We also cannot accept returns
          reported after 48 hours, or products damaged by how they were stored after delivery.
        </p>
        <p>
          Approved refunds are issued to your bKash, Nagad or bank account within 7–10 working
          days of the returned item reaching us or the complaint being accepted. Refunds on
          advance card payments follow the bank&rsquo;s own timeline.
        </p>
      </>
    ),
  },
  {
    id: "coupons",
    heading: "Coupons, campaigns and offers",
    body: (
      <>
        <LegalList
          items={[
            "One coupon per order unless the campaign says otherwise, and coupons cannot be combined with other offers.",
            "Coupons have no cash value and cannot be exchanged for cash or transferred.",
            "Campaign prices apply only while the campaign runs and only while stock lasts.",
            "We may withdraw or amend any offer at any time, and may cancel orders placed using a coupon obtained by abuse, bulk-generation or error.",
          ]}
        />
      </>
    ),
  },
  {
    id: "reviews",
    heading: "Reviews and content you post",
    body: (
      <>
        <p>
          Reviews are welcome — good and bad. By posting a review, comment or photo you confirm
          it is your own honest experience and you grant us a free, non-exclusive licence to
          display and reuse it in our marketing.
        </p>
        <p>
          We moderate submissions and may remove content that is abusive, defamatory, off-topic,
          contains someone else&rsquo;s personal details, or is a fake or paid review.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    body: (
      <p>
        The Organishi name, logo, product photography, packaging design, copy and website design
        belong to Organishi and are protected by Bangladeshi and international copyright and
        trademark law. You may not copy, reproduce or use them for commercial purposes without
        our written permission.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <>
        <p>
          We stand fully behind the quality and purity of what we sell, and nothing in these
          terms limits your rights under the Consumer Rights Protection Act, 2009 or any other
          law that cannot be excluded by agreement.
        </p>
        <p>
          Beyond that, our total liability for any order is limited to the amount you paid for
          that order. We are not liable for indirect or consequential losses, or for delays and
          failures caused by events outside our reasonable control — including natural
          disasters, floods, strikes, hartals, epidemics, government restrictions, courier
          failures, and internet or power outages.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    heading: "Governing law and disputes",
    body: (
      <>
        <p>
          These terms are governed by the laws of the People&rsquo;s Republic of Bangladesh. Any
          dispute is subject to the exclusive jurisdiction of the courts of Dhaka.
        </p>
        <p>
          Before going further, please give us a chance to fix it. Most complaints are resolved
          the same day by a phone call to {SUPPORT_PHONE}.
        </p>
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="10 August 2026"
      intro="Plain terms for a simple promise: you order, we confirm by phone, the rider brings it to your door, and you pay only after you have seen it. This page sets out the details — how orders are confirmed, what delivery costs, and exactly when you can send something back."
      sections={SECTIONS}
      footer={
        <LegalContactCard
          heading="Need help with an order?"
          intro="Our customer care team answers Saturday to Thursday, 10:00 AM – 8:00 PM. Keep your order number handy and we will sort it out on the call."
        />
      }
    />
  );
}
