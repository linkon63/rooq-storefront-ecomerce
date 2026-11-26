import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import { SareeStage } from "./saree-stage";

/**
 * "Six yards, unfolded": a folded tant saree (three.js) opens out as the
 * section scrolls into view, showing its paar, buti and aanchal. The copy
 * sends shoppers to the sarees. Large screens only (three.js never loads on phones).
 */
export async function SareeUnfold() {
  const { t } = await getMessages();
  const copy = t.home.craft;
  return (
    <section aria-labelledby="saree-unfold-title" className="hidden overflow-hidden bg-ink text-chalk lg:block">
      <div className="page-gutter grid items-center gap-6 py-12 lg:grid-cols-[1fr_1.7fr] lg:gap-10 lg:py-20">
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <h2 id="saree-unfold-title" className="type-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95]">
            {copy.unfoldTitle}
          </h2>
          <p className="type-lead max-w-[40ch] text-chalk/80">{copy.unfoldLead}</p>
          <Link
            href="/shop?category=women-sarees"
            className="type-label inline-flex h-12 w-fit items-center bg-dye px-7 text-chalk transition-colors duration-300 hover:bg-dye-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
          >
            {copy.unfoldCta}
          </Link>
        </div>
        <SareeStage label={copy.unfoldAria} className="order-1 lg:order-2" />
      </div>
    </section>
  );
}
