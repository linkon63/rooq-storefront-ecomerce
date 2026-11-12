import type { StorePolicy } from "@/types/storefront/content";
import { looksLikeHtml, sanitizePolicyHtml } from "@/utils/storefront/sanitize-html";
import { EmptyState } from "../shared/empty-state";

/** A policy from Admin → Settings → Policy (HTML or plain text), or a pointer to Contact when it is not written yet. */
export function PolicyArticle({ policy, fallbackTitle }: { policy: StorePolicy | null; fallbackTitle: string }) {
  return (
    <article className="page-gutter max-w-4xl pt-8 md:pt-12">
      <h1 className="mb-8 font-display font-expanded text-[clamp(2rem,7vw,3.25rem)] font-extrabold leading-none">{policy?.title ?? fallbackTitle}</h1>
      {policy ? (
        looksLikeHtml(policy.content) ? (
          <div
            className="flex max-w-[70ch] flex-col gap-4 leading-relaxed [&_a]:underline [&_h2]:mt-6 [&_h2]:font-wide [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: sanitizePolicyHtml(policy.content) }}
          />
        ) : (
          <p className="max-w-[70ch] whitespace-pre-line leading-relaxed">{policy.content}</p>
        )
      ) : (
        <EmptyState title="This page is being written" body="Questions in the meantime? Our team will answer." action={{ label: "Contact us", href: "/contact" }} />
      )}
    </article>
  );
}
