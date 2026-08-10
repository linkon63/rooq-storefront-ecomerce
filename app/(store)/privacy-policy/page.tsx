import type { Metadata } from "next";

import LegalPage, { LegalList, type LegalSection } from "@/components/storefront/legal/LegalPage";
import LegalContactCard, {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/components/storefront/legal/LegalContactCard";

export const metadata: Metadata = {
  title: "Privacy Policy | Organishi",
  description:
    "How Organishi collects, uses and protects your personal information when you order organic food with cash on delivery anywhere in Bangladesh.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "introduction",
    heading: "Who we are",
    body: (
      <>
        <p>
          Organishi is a Bangladeshi organic food brand. We sell cold-pressed mustard oil,
          virgin coconut oil, hand-churned ghee, raw honey, spices and organic snacks sourced
          directly from farming families, and we deliver them to customers in all 64 districts
          of Bangladesh — mostly on a cash on delivery (COD) basis.
        </p>
        <p>
          This Privacy Policy explains what personal information we collect when you browse
          organishi.com, place an order, call us or message us on WhatsApp, Facebook or
          Messenger; why we collect it; who we share it with; and what control you have over
          it. By using our website or placing an order with us, you agree to the practices
          described here.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    heading: "Information we collect",
    body: (
      <>
        <p>We only ask for what we need to get your parcel to your door. That includes:</p>
        <LegalList
          items={[
            <>
              <strong>Identity and contact details</strong> — your full name, mobile number
              (and an alternate number if you give one), and email address.
            </>,
            <>
              <strong>Delivery address</strong> — house or holding number, road, area/thana,
              district and postcode, plus any landmark note you add to help the delivery rider
              find you.
            </>,
            <>
              <strong>Order information</strong> — the products you bought, quantity, price,
              delivery charge, coupon codes used, order date and delivery status.
            </>,
            <>
              <strong>Payment information</strong> — for cash on delivery we record only the
              amount collected by the rider. If you pay in advance through bKash, Nagad, Rocket
              or a card, we store the transaction ID and the last few digits or the sending
              wallet number sent to us by the payment provider. <strong>We never see or store
              your full card number, PIN, OTP or mobile wallet password.</strong>
            </>,
            <>
              <strong>Account details</strong> — if you create an account, your login email and
              a securely hashed password, your saved addresses and your wishlist.
            </>,
            <>
              <strong>Messages you send us</strong> — enquiries, complaints, review text and
              chat history from WhatsApp, Messenger or our contact form.
            </>,
            <>
              <strong>Technical and usage data</strong> — IP address, device and browser type,
              pages viewed, and how you arrived on our site. This is collected automatically
              through cookies and analytics tools.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use your information",
    body: (
      <>
        <LegalList
          items={[
            "To process, pack and deliver your order, and to hand the correct delivery details to our courier partner.",
            "To confirm your order — for cash on delivery orders our team will call or SMS you before dispatch to verify the address and confirm you still want the parcel.",
            "To collect payment, issue an invoice, and process refunds, exchanges or returns.",
            "To answer your questions and resolve complaints about a product or delivery.",
            "To detect and prevent fraudulent or repeatedly refused COD orders, which cost our farmers and couriers real money.",
            "To improve our products, packaging, pricing and website based on what customers actually buy and search for.",
            "To send you order updates by SMS or email. These are service messages and are sent to every customer.",
            "To send you offers, new arrivals and seasonal campaigns — only if you subscribed to our newsletter or agreed to receive marketing. You can opt out at any time.",
            "To meet our legal, tax and accounting obligations under Bangladeshi law.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cash-on-delivery",
    heading: "Cash on delivery and courier partners",
    body: (
      <>
        <p>
          Cash on delivery is how most of our customers pay, and it is the one part of the
          order where your details necessarily leave our hands. To deliver your parcel we share
          your <strong>name, mobile number, full delivery address and the amount to be
          collected</strong> with our courier partners — such as Steadfast, Pathao, RedX,
          Sundarban Courier or our own delivery riders inside Dhaka.
        </p>
        <p>
          Couriers receive only what is printed on the parcel label and needed to complete the
          delivery. They are not permitted to use your details for their own marketing. We do
          not share your email address, order history or payment records with them.
        </p>
        <p>
          Please note that the rider may call you from their own number to arrange delivery.
          Organishi will never ask you for an OTP, a bKash PIN or a &ldquo;refund code&rdquo;
          over the phone. If anyone does, hang up and call us on {SUPPORT_PHONE}.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "Who else we share information with",
    body: (
      <>
        <p>We do not sell your personal information. We share it only with:</p>
        <LegalList
          items={[
            <>
              <strong>Payment providers</strong> — bKash, Nagad, Rocket and card gateways, so
              that advance payments and refunds can be processed.
            </>,
            <>
              <strong>SMS and email service providers</strong> — to send you order confirmations
              and delivery updates.
            </>,
            <>
              <strong>Analytics and advertising platforms</strong> — such as Google Analytics
              and Meta (Facebook) Pixel, which receive anonymised or pseudonymised usage data
              about how our website is used.
            </>,
            <>
              <strong>Our hosting and IT providers</strong> — who store our website and database
              on our behalf under confidentiality obligations.
            </>,
            <>
              <strong>Government authorities</strong> — where we are required to disclose
              information by law, a court order, or a lawful request from a regulator such as
              the National Board of Revenue or the Directorate of National Consumer Rights
              Protection.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: (
      <>
        <p>
          Cookies are small files stored by your browser. We use them to keep the items in your
          cart while you shop, to keep you signed in, to remember your preferences, and to
          understand which products and pages people find useful.
        </p>
        <p>
          You can block or delete cookies from your browser settings. If you block essential
          cookies, the cart and checkout will not work correctly.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "How we protect your information",
    body: (
      <>
        <p>
          Our website runs over an encrypted HTTPS connection. Passwords are stored as one-way
          hashes and cannot be read by our staff. Access to customer records is limited to the
          team members who need it to fulfil orders and answer support requests.
        </p>
        <p>
          No system is perfectly secure, and we cannot guarantee absolute security. If a breach
          ever affects your personal information, we will inform affected customers as quickly
          as we reasonably can and tell you what steps to take.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep your information",
    body: (
      <>
        <p>
          We keep order and invoice records for as long as required by Bangladeshi tax and
          accounting rules — currently at least five years from the end of the relevant
          financial year. Account details are kept while your account is open. Marketing
          contact details are kept until you unsubscribe. After that, information is deleted or
          anonymised.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    heading: "Your choices and rights",
    body: (
      <>
        <LegalList
          items={[
            "Ask us for a copy of the personal information we hold about you.",
            "Ask us to correct anything that is wrong — a misspelt name, an old address or a changed mobile number.",
            "Ask us to delete your account and personal information, except records we must keep for tax and legal reasons.",
            "Unsubscribe from marketing SMS and emails at any time using the opt-out link, by replying STOP, or by calling us.",
            "Object to your information being used for marketing profiling.",
          ]}
        />
        <p>
          To exercise any of these, write to {SUPPORT_EMAIL} or call {SUPPORT_PHONE} from the
          mobile number linked to your orders. We will respond within 10 working days.
        </p>
      </>
    ),
  },
  {
    id: "children",
    heading: "Children",
    body: (
      <p>
        Our website is not intended for children under 18. We do not knowingly collect personal
        information from children. If you believe a child has given us their details, contact us
        and we will remove the record.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this Privacy Policy as our business, our courier partners or the law
        changes. The revised version will be posted on this page with a new &ldquo;last
        updated&rdquo; date. If the change is significant, we will announce it on our homepage
        or notify registered customers by email.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="10 August 2026"
      intro="Your name, your mobile number and your address are what make cash on delivery work. We treat them as carefully as we treat the food we send you. This page explains exactly what we collect, why, and who ever gets to see it."
      sections={SECTIONS}
      footer={
        <LegalContactCard
          heading="Contact us about privacy"
          intro="Questions about this policy, or about the information we hold on you? Our customer care team answers Saturday to Thursday, 10:00 AM – 8:00 PM."
        />
      }
    />
  );
}
