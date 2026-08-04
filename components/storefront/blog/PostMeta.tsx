import { PiCalendarBlank, PiClock, PiUser } from "react-icons/pi";

import { formatPostDate } from "@/data/blog-posts";

interface PostMetaProps {
  post: { publishedAt: string; readMinutes: number; author?: string };
  /** Set on dark banners, where the muted grey would disappear. */
  tone?: "default" | "light";
  className?: string;
}

export default function PostMeta({ post, tone = "default", className = "" }: PostMetaProps) {
  const text = tone === "light" ? "text-white/80" : "text-gray-500";
  const icon = tone === "light" ? "text-[#8fd06b]" : "text-[#4a9e2f]";

  return (
    <p className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] ${text} ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <PiCalendarBlank size={15} className={icon} />
        {formatPostDate(post.publishedAt)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <PiClock size={15} className={icon} />
        {post.readMinutes} min read
      </span>
      {post.author && (
        <span className="inline-flex items-center gap-1.5">
          <PiUser size={15} className={icon} />
          {post.author}
        </span>
      )}
    </p>
  );
}
