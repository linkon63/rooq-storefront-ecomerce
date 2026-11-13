import type { StorePolicy } from "@/types/storefront/content";

/** Static cookie policy page content (HTML, sanitised on render). */
export const COOKIE_POLICY: StorePolicy = {
  key: "cookie",
  title: "Cookie policy",
  content: `
<p>Rooq uses a small number of cookies so the store works and stays secure.</p>
<h2>Essential cookies</h2>
<p>These keep you signed in, remember your cart and wishlist, and protect checkout. The store cannot work without them.</p>
<h2>Preference cookies</h2>
<p>These remember choices such as your currency so you do not have to set them again.</p>
<h2>Managing cookies</h2>
<p>You can block or delete cookies in your browser settings. Doing so may stop sign-in and the cart from working.</p>
<h2>Questions</h2>
<p>Contact us from the Contact page and we will help.</p>`,
};
