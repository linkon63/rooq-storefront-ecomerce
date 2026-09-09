import type { Metadata } from "next";

import LegalPage, { LegalList, type LegalSection } from "@/components/storefront/legal/LegalPage";
import LegalContactCard, {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/components/storefront/legal/LegalContactCard";

export const metadata: Metadata = {
  title: "Terms & Conditions | Organishi",
  description:
    "Terms and conditions, delivery, refund, return, and cancellation policies for Organishi orders.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "terms-and-conditions",
    heading: "Terms and Conditions",
    body: (
      <>
        <p>
          By accessing or using our website, customers agree to comply with these Terms &amp; Conditions.
        </p>
      </>
    ),
  },
  {
    id: "delivery-policy",
    heading: "Delivery Policy",
    body: (
      <>
        <LegalList
          items={[
            "Delivered product must be checked in front of deliveryman, any issue should be informed through delivery man.",
            "Parcel will be delivered within 2-3 working days (Inside Dhaka), 3-5 working days (Outside Dhaka) after confirming.",
            "Parcel can be delayed because of traffic, weather, holidays, courier related issue etc.",
            "Please ensure that your delivery address and contact number are accurate. If delivery fails due to an incorrect or incomplete address or phone number provided by the customer, an additional delivery charge may apply for re-delivery or delivery to the corrected address.",
            "Cancellation, adding new product, adding or deducting quantity should be done before dispatch.",
            "For delivery there will be 3 attempts; if customer doesn’t respond, the parcel will be returned.",
          ]}
        />
      </>
    ),
  },
  {
    id: "refund-policy",
    heading: "Refund Policy",
    body: (
      <>
        <LegalList
          items={[
            "In case of Damage, defective, leaking, wrong product, or expired item, customer can demand for refund.",
            "If any product becomes unavailable after payment has been received, the full amount paid for that product will be refunded to the customer.",
            "Damage or wrong product should be complained within 24 hours with Order ID and picture/video proof.",
            "Verification: All refund or replacement requests are subject to company verification and approval.",
            "Refunds or returns are generally not accepted for food products that have been opened, used, or partially consumed, unless the product is defective, damaged, expired, or incorrectly delivered.",
            "Change of Mind: Refunds will not be provided solely due to a change of mind, dissatisfaction with the taste, or because the customer no longer requires the product.",
            "If a specific product in an order is eligible for a refund, only the verified value of that product will be refunded.",
            "If a product is delivered incorrectly, damaged, defective, or expired due to an error on the company’s part, the applicable delivery charge will be refunded or a free replacement will be provided.",
            "Each refund request will be reviewed and decided on a case-by-case basis after assessing the product’s condition and the available supporting evidence.",
          ]}
        />
      </>
    ),
  },
  {
    id: "return-policy",
    heading: "Return Policy",
    body: (
      <>
        <LegalList
          items={[
            "Customer must contact Customer Support within the specified return period and provide the Order ID and reason for return.",
            "Our team will review the return request, product condition, and supporting evidence before approving the return.",
            "Depending on the case, the product may be collected by our delivery team or returned by the customer as instructed.",
            "The returned product will be inspected to confirm that it meets the applicable return conditions.",
            "A return may be rejected if the product has been used, damaged due to improper handling or storage, or does not meet the return conditions.",
            "If a return or re-delivery is required due to an incorrect address, incorrect phone number, or customer unavailability, applicable additional delivery or return charges may apply.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cancellation-policy",
    heading: "Cancellation Policy",
    body: (
      <>
        <LegalList
          items={[
            "Once an order has been confirmed and processing has started, cancellation may not always be possible.",
            "Cancellation requests received before dispatch may be accepted, subject to order status.",
            "Repeated cancellations or refusal to receive confirmed orders may affect the availability of COD or other payment options for future orders.",
            "We reserve the right to cancel an order due to product unavailability, payment verification issues, inaccurate delivery information, or other operational reasons. Customers will be notified where applicable.",
            "A cancellation is considered successful only after confirmation from our customer support team or through an official cancellation notification.",
          ]}
        />
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="09 September 2026"
      intro="These Terms & Conditions outline the rules, delivery guidelines, refund terms, return requirements, and cancellation policies governing your orders with Organishi."
      sections={SECTIONS}
      footer={
        <LegalContactCard
          heading="Need help with an order?"
          intro="Our customer care team is available to assist you with any questions regarding delivery, returns, refunds, or cancellations."
        />
      }
    />
  );
}
