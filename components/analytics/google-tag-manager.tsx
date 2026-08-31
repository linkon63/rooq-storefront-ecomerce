import Script from "next/script";

/**
 * Google Tag Manager container, wired to the storefront only.
 *
 * The raw snippet the marketing team hands over is plain `<head>`/`<body>` HTML.
 * App Router pages have no hand-written document to paste it into, so the
 * loader half goes through `next/script` — which keeps it out of the critical
 * path and guarantees it runs once per session rather than on every client-side
 * navigation — and the `<noscript>` half stays literal, since it must be markup
 * the browser sees with JavaScript switched off.
 *
 * The container ID lives in the environment rather than inline so local and
 * preview builds stay out of the production analytics: with
 * NEXT_PUBLIC_GTM_ID unset both halves render nothing.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Belongs as close to the top of `<body>` as the tree allows — GTM measures
 * page timings from when this executes.
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

export function GoogleTagManagerScript() {
  if (!GTM_ID) return null;

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}
