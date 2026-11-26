/** schema.org store and website records for the home page. */
export function siteJsonLd(siteUrl: string, description: string, alternateName: string[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ClothingStore",
        "@id": `${siteUrl}/#store`,
        name: "Rooq",
        alternateName,
        url: siteUrl,
        logo: `${siteUrl}/icons/icon-512.png`,
        image: `${siteUrl}/icons/icon-512.png`,
        description,
        areaServed: { "@type": "Country", name: "Bangladesh" },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Rooq",
        alternateName,
        url: siteUrl,
        inLanguage: ["en", "bn"],
        publisher: { "@id": `${siteUrl}/#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/shop?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
