import type { Metadata } from "next";

import LegalPage, { LegalList, type LegalSection } from "@/components/storefront/legal/LegalPage";
import LegalContactCard, {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/components/storefront/legal/LegalContactCard";

export const metadata: Metadata = {
  title: "Privacy Policy | Organishi",
  description:
    "How Organishi collects, uses, and protects customer information when you order organic products.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "information-collection",
    heading: "Information We Collect",
    body: (
      <>
        <p>
          We may collect information such as customer name, phone number, email address, delivery
          address, and order-related information when an order is placed.
        </p>
      </>
    ),
  },
  {
    id: "payment-information",
    heading: "Payment Information & Security",
    body: (
      <>
        <p>
          Payment information is processed through applicable payment service providers. We do not
          unnecessarily store sensitive payment details such as card passwords or PINs.
        </p>
      </>
    ),
  },
  {
    id: "use-of-information",
    heading: "How We Use Customer Information",
    body: (
      <>
        <p>
          Customer information is only used for placing orders, confirming payment, providing customer
          service, and sharing important product-related updates.
        </p>
      </>
    ),
  },
  {
    id: "data-protection",
    heading: "Data Protection & Security Measures",
    body: (
      <>
        <p>
          We take reasonable technical and organizational measures to protect customer information
          from unauthorized access, misuse, loss, or disclosure.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="09 September 2026"
      intro="Your privacy is important to us. This Privacy Policy outlines how Organishi collects, uses, and safeguards customer information when placing orders or interacting with our services."
      sections={SECTIONS}
      footer={
        <LegalContactCard
          heading="Contact us about privacy"
          intro="Questions about this policy or about the information we hold? Our customer care team is available to assist you."
        />
      }
    />
  );
}
