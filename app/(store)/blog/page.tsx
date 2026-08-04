import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";

import NewsletterCta from "@/components/storefront/home/NewsletterCta";
import PostMeta from "@/components/storefront/blog/PostMeta";
import { sortedPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog | Organishi",
  description:
    "Buying guides and kitchen notes on cold pressed oils, hand-churned ghee, raw honey and organic snacks — from the people who source them.",
};

export default function BlogPage() {
  const posts = sortedPosts();
  const [featured, ...rest] = posts;

  return (
    <main>
      {/* ── Page banner ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/home/newsletter-bg.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#1f2a17]/60" />

        <div className="mx-auto max-w-[1600px] px-4 py-16 text-center md:px-8 lg:py-20">
          <h1 className="font-display text-[30px] leading-tight text-white md:text-[44px]">
            Our Blog
          </h1>
          <p className="mt-3 text-[14px] text-white/80">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="px-2">/</span>
            <span className="text-[#8fd06b]">Blog</span>
          </p>
        </div>
      </section>

      {/* ── Featured ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-4 py-14 md:px-8 lg:py-20">
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14"
        >
          <div className="relative aspect-[848/500] overflow-hidden rounded-lg">
            <Image
              src={featured.cover}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div>
            <span className="inline-flex rounded-full bg-[#f4f7ee] px-3 py-1 text-[12px] text-[#4a9e2f]">
              {featured.category}
            </span>
            <h2 className="font-display mt-4 text-[26px] leading-tight text-[#1f2a17] transition-colors group-hover:text-[#4a9e2f] md:text-[36px]">
              {featured.title}
            </h2>
            <PostMeta post={featured} className="mt-4" />
            <p className="mt-4 text-[15px] leading-relaxed text-gray-600">{featured.excerpt}</p>
            <span className="font-display mt-6 inline-flex items-center gap-2 text-[15px] text-[#4a9e2f]">
              Read Article
              <PiArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-4 pb-14 md:px-8 lg:pb-20">
        <h2 className="font-display text-[24px] leading-tight text-[#1f2a17] md:text-[30px]">
          Latest Reading
        </h2>

        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <article key={post.slug} className="group flex flex-col">
              <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-[16/10] overflow-hidden rounded-lg"
              >
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[12px] text-[#4a9e2f]">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col pt-4">
                <PostMeta post={post} />
                <h3 className="font-display mt-2.5 text-[20px] leading-tight text-[#1f2a17] transition-colors group-hover:text-[#4a9e2f]">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-gray-600">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-display mt-4 inline-flex items-center gap-2 text-[14px] text-[#4a9e2f]"
                >
                  Read More
                  <PiArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <NewsletterCta />
    </main>
  );
}
