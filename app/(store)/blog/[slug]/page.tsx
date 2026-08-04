import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";

import PostMeta from "@/components/storefront/blog/PostMeta";
import { BLOG_POSTS, getPost, sortedPosts } from "@/data/blog-posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return { title: "Article not found | Organishi" };

  return {
    title: `${post.title} | Organishi`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const more = sortedPosts()
    .filter((entry) => entry.slug !== post.slug)
    .slice(0, 3);

  return (
    <main>
      {/* ── Article banner ──────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image src={post.cover} alt="" fill sizes="100vw" priority className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[#1f2a17]/70" />

        <div className="mx-auto max-w-[900px] px-4 py-16 text-center md:px-8 lg:py-20">
          <span className="inline-flex rounded-full bg-[#4a9e2f] px-3 py-1 text-[12px] text-white">
            {post.category}
          </span>
          <h1 className="font-display mt-4 text-[26px] leading-tight text-white md:text-[40px]">
            {post.title}
          </h1>
          <PostMeta post={post} tone="light" className="mt-5 justify-center" />
        </div>
      </section>

      {/* ── Article body ────────────────────────────────────────────────── */}
      <article className="mx-auto max-w-[820px] px-4 py-14 md:px-8 lg:py-20">
        <p className="font-display text-[19px] leading-relaxed text-[#1f2a17]">{post.excerpt}</p>

        <div className="mt-8 space-y-6">
          {post.body.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={index}
                  className="font-display pt-2 text-[22px] leading-tight text-[#1f2a17] md:text-[26px]"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={index} className="space-y-2.5">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-gray-600">
                      <span className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full bg-[#4a9e2f]" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.type === "quote") {
              return (
                <blockquote
                  key={index}
                  className="font-display border-l-[3px] border-[#4a9e2f] bg-[#f4f7ee] px-6 py-5 text-[18px] leading-relaxed text-[#1f2a17]"
                >
                  {block.text}
                </blockquote>
              );
            }

            return (
              <p key={index} className="text-[15px] leading-relaxed text-gray-600">
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-8">
          <Link
            href="/blog"
            className="font-display inline-flex items-center gap-2 text-[15px] text-[#4a9e2f]"
          >
            <PiArrowLeft size={17} />
            Back to all articles
          </Link>
          <Link
            href="/shop"
            className="font-display rounded-full bg-[#4a9e2f] px-7 py-2.5 text-[15px] text-white transition-colors hover:bg-[#3d8626]"
          >
            Shop The Range
          </Link>
        </div>
      </article>

      {/* ── More reading ────────────────────────────────────────────────── */}
      <section className="bg-[#f4f7ee] py-14 lg:py-20">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <h2 className="font-display text-[24px] leading-tight text-[#1f2a17] md:text-[30px]">
            More Reading
          </h2>

          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((entry) => (
              <article key={entry.slug} className="group flex flex-col">
                <Link
                  href={`/blog/${entry.slug}`}
                  className="relative aspect-[16/10] overflow-hidden rounded-lg"
                >
                  <Image
                    src={entry.cover}
                    alt={entry.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                <PostMeta post={entry} className="pt-4" />
                <h3 className="font-display mt-2.5 text-[20px] leading-tight text-[#1f2a17] transition-colors group-hover:text-[#4a9e2f]">
                  <Link href={`/blog/${entry.slug}`}>{entry.title}</Link>
                </h3>
                <Link
                  href={`/blog/${entry.slug}`}
                  className="font-display mt-3 inline-flex items-center gap-2 text-[14px] text-[#4a9e2f]"
                >
                  Read More
                  <PiArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
