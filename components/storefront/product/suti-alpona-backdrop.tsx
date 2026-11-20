/**
 * Rich Bangladeshi saree (Taant / Jamdani / Alpona) backdrop for the product details page:
 * - Repeating Jamdani floral-diamond lattice across the saree body (jomi)
 * - Traditional temple-tooth + kalka + lata-pata paar along left & right edges
 * - Woven anchal bands across section transitions
 * - Padma (lotus) & kalka Alpona mandalas positioned down the saree
 */
export function SutiAlponaBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ color: "var(--saree-thread, var(--color-gold))" }}
    >
      {/* Subtle all-over Dhakai Jamdani diamond & phool (flower) lattice on the saree jomi */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.13]" preserveAspectRatio="none">
        <defs>
          <pattern id="jamdani-jomi" width="96" height="96" patternUnits="userSpaceOnUse">
            {/* Subtle diagonal Jamdani diamond grid */}
            <path d="M48 0 L96 48 L48 96 L0 48 Z" fill="none" stroke="currentColor" strokeWidth="0.65" strokeDasharray="2 4" />
            {/* Center 4-petal Jamdani phool */}
            <path
              d="M48 39 C51 43, 51 45, 48 48 C45 45, 45 43, 48 39 Z M48 57 C51 53, 51 51, 48 48 C45 51, 45 53, 48 57 Z M39 48 C43 45, 45 45, 48 48 C45 51, 43 51, 39 48 Z M57 48 C53 45, 51 45, 48 48 C51 51, 53 51, 57 48 Z"
              fill="currentColor"
              fillOpacity="0.45"
            />
            <circle cx="48" cy="48" r="1.6" fill="currentColor" fillOpacity="0.45" />
            {/* Corner kalka-dot */}
            <circle cx="0" cy="0" r="1.5" fill="currentColor" />
            <circle cx="96" cy="0" r="1.5" fill="currentColor" />
            <circle cx="0" cy="96" r="1.5" fill="currentColor" />
            <circle cx="96" cy="96" r="1.5" fill="currentColor" />
          </pattern>

          {/* Traditional Bangladeshi temple (mandir) + kalka + lata-pata paar border */}
          <pattern id="bangladeshi-paar" width="56" height="140" patternUnits="userSpaceOnUse">
            {/* Temple tooth edge */}
            <path
              d="M0 0 L10 10 L0 20 L10 30 L0 40 L10 50 L0 60 L10 70 L0 80 L10 90 L0 100 L10 110 L0 120 L10 130 L0 140"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            {/* Fine vertical selvedge thread */}
            <line x1="15" y1="0" x2="15" y2="140" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
            {/* Lata-pata vine */}
            <path
              d="M26 0 C40 23, 40 47, 26 70 C12 93, 12 117, 26 140"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            {/* Kalka (paisley) motif */}
            <path
              d="M32 28 C44 22, 50 32, 42 42 C36 46, 30 40, 32 28 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.05"
            />
            <circle cx="38" cy="34" r="1.6" fill="currentColor" fillOpacity="0.45" />
            <path
              d="M24 98 C36 92, 42 102, 34 112 C28 116, 22 110, 24 98 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.05"
            />
            <circle cx="30" cy="104" r="1.6" fill="currentColor" fillOpacity="0.45" />
            {/* Alpona dots */}
            <circle cx="44" cy="14" r="1.4" fill="currentColor" />
            <circle cx="46" cy="70" r="2" fill="currentColor" fillOpacity="0.4" />
            <circle cx="44" cy="126" r="1.4" fill="currentColor" />
          </pattern>

          {/* Horizontal woven anchal / Jamdani band */}
          <pattern id="anchal-band" width="72" height="36" patternUnits="userSpaceOnUse">
            <line x1="0" y1="3" x2="72" y2="3" stroke="currentColor" strokeWidth="0.9" />
            <line x1="0" y1="33" x2="72" y2="33" stroke="currentColor" strokeWidth="0.9" />
            <path d="M0 18 L18 7 L36 18 L54 7 L72 18 L54 29 L36 18 L18 29 Z" fill="none" stroke="currentColor" strokeWidth="0.95" />
            <circle cx="18" cy="18" r="2" fill="currentColor" fillOpacity="0.45" />
            <circle cx="54" cy="18" r="2" fill="currentColor" fillOpacity="0.45" />
            <circle cx="36" cy="7" r="1.2" fill="currentColor" />
            <circle cx="36" cy="29" r="1.2" fill="currentColor" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#jamdani-jomi)" />
      </svg>

      {/* Left & Right Bangladeshi Paar (Temple + Kalka + Lata-Pata) */}
      <svg className="absolute inset-y-0 left-2 hidden h-full w-14 opacity-[0.14] sm:block lg:left-4" preserveAspectRatio="none">
        <rect width="100%" height="100%" fill="url(#bangladeshi-paar)" />
      </svg>
      <svg className="absolute inset-y-0 right-2 hidden h-full w-14 -scale-x-100 opacity-[0.14] sm:block lg:right-4" preserveAspectRatio="none">
        <rect width="100%" height="100%" fill="url(#bangladeshi-paar)" />
      </svg>

      {/* Horizontal Jamdani Anchal strips separating saree sections */}
      <svg className="absolute inset-x-0 top-[36%] h-9 w-full opacity-[0.16]" preserveAspectRatio="none">
        <rect width="100%" height="100%" fill="url(#anchal-band)" />
      </svg>
      <svg className="absolute inset-x-0 top-[72%] h-9 w-full opacity-[0.11]" preserveAspectRatio="none">
        <rect width="100%" height="100%" fill="url(#anchal-band)" />
      </svg>

      {/* Top-left subtle Kalka-Padma Alpona corner */}
      <AlponaMandala className="-left-36 -top-20 size-[300px] opacity-[0.08] sm:size-[360px] lg:-left-28 lg:size-[420px]" />

      {/* Top-right Padma (lotus) & Kalka Alpona mandala behind the upper product showcase */}
      <AlponaMandala className="-right-28 top-6 size-[360px] opacity-[0.1] sm:size-[460px] lg:-right-20 lg:size-[540px]" />

      {/* Mid-left Alpona mandala along the saree body */}
      <AlponaMandala className="-left-32 top-[40%] size-[340px] opacity-[0.09] sm:size-[440px] lg:-left-24 lg:size-[500px]" />

      {/* Mid-right smaller Kalka-Alpona accent */}
      <AlponaMandala className="-right-24 top-[58%] size-[260px] opacity-[0.08] sm:size-[320px]" />

      {/* Lower-left & Lower-right Alpona medallions near reviews & related rails */}
      <AlponaMandala className="-left-28 bottom-16 size-[280px] opacity-[0.14] sm:size-[340px]" />
      <AlponaMandala className="-right-28 bottom-20 size-[320px] opacity-[0.15] sm:size-[400px] lg:-right-20 lg:size-[460px]" />
    </div>
  );
}

function AlponaMandala({ className }: { className: string }) {
  const petals8 = Array.from({ length: 8 }, (_, i) => i * 45);
  const petals12 = Array.from({ length: 12 }, (_, i) => i * 30);
  const petals16 = Array.from({ length: 16 }, (_, i) => i * 22.5);

  return (
    <svg viewBox="0 0 400 400" fill="none" className={`absolute ${className}`}>
      {/* Outer dotted alpona halo */}
      <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" />
      <circle cx="200" cy="200" r="176" stroke="currentColor" strokeWidth="1.15" />

      {/* 16 outer scalloped lotus petals + tip dots */}
      {petals16.map((deg) => (
        <g key={`o-${deg}`} transform={`rotate(${deg} 200 200)`}>
          <path
            d="M200 26 C212 45, 214 66, 200 84 C186 66, 188 45, 200 26 Z"
            stroke="currentColor"
            strokeWidth="1.1"
          />
          <circle cx="200" cy="17" r="2.3" fill="currentColor" />
        </g>
      ))}

      {/* Middle rings */}
      <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="200" cy="200" r="112" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 5" />

      {/* 12 inner kalka / lotus petals */}
      {petals12.map((deg) => (
        <g key={`i-${deg}`} transform={`rotate(${deg} 200 200)`}>
          <path
            d="M200 90 C215 112, 213 138, 200 156 C187 138, 185 112, 200 90 Z"
            stroke="currentColor"
            strokeWidth="1.15"
          />
          <circle cx="200" cy="124" r="2" fill="currentColor" />
        </g>
      ))}

      {/* 8 innermost traditional alpona buds */}
      {petals8.map((deg) => (
        <g key={`c-${deg}`} transform={`rotate(${deg} 200 200)`}>
          <path
            d="M200 158 C206 168, 206 176, 200 183 C194 176, 194 168, 200 158 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
      ))}

      {/* Center lotus core */}
      <circle cx="200" cy="200" r="44" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="200" cy="200" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      <circle cx="200" cy="200" r="6.5" fill="currentColor" />
    </svg>
  );
}
