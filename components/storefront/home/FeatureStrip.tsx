import { PiFarm, PiLeaf, PiSealCheck, PiSparkle } from "react-icons/pi";

const FEATURES = [
  {
    icon: PiFarm,
    title: "Farm Fresh Selection",
    body: "Our products come directly from local farms, bringing you authentic taste.",
  },
  {
    icon: PiSealCheck,
    title: "Hygiene Assured",
    body: "Every cook upholds strict hygiene standards for safe, clean meals.",
  },
  {
    icon: PiSparkle,
    title: "Affordable & Fresh",
    body: "Freshly prepared, high-quality meals designated for discerning tastes.",
  },
  {
    icon: PiLeaf,
    title: "Pure & Natural Ingredients",
    body: "Free from artificial colors, preservatives, and additives — only the goodness nature intended.",
  },
];

export default function FeatureStrip() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <div className="grid gap-8 rounded-2xl border border-gray-100 px-6 py-9 shadow-[0_1px_20px_rgba(31,42,23,0.05)] sm:grid-cols-2 md:px-10 lg:grid-cols-4 lg:gap-6">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col items-center px-2 text-center">
            <Icon size={34} className="text-[#1f2a17]" />
            <h3 className="font-display mt-3 text-[19px] leading-tight text-[#1f2a17]">{title}</h3>
            <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-gray-500">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
