/** Pivots the scene rotates around (the charkha hub for the wheel, his shoulder for the arm). */
export const SPINNER_PIVOTS = { wheel: "888 296", shoulder: "972 206" } as const;

const WHEEL = { cx: 888, cy: 296, r: 50 } as const;
const SPOKES: readonly number[] = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

/**
 * Illustrated clipart-style Bangladeshi artisan seated on a woven cane mora at
 * the right of the loom, facing left: white cotton panjabi/kurta, crimson
 * checked gamchha over his shoulder, deep-green checked lungi, turning a wooden
 * charkha (`data-charkha-wheel`) with his arm (`data-spinner-arm`).
 */
export function SpinnerFigure() {
  return (
    <g>
      {/* Subtle ground shadows */}
      <ellipse cx={888} cy={395} rx={52} ry={4.5} fill="#0e221e" opacity={0.45} />
      <ellipse cx={984} cy={393} rx={56} ry={5} fill="#0e221e" opacity={0.45} />

      {/* Wooden Charkha: frame, spindle, yarn and spinning wheel */}
      <g>
        <g stroke="#8C6239" strokeWidth={6} strokeLinecap="round">
          <line x1={WHEEL.cx} y1={WHEEL.cy} x2={864} y2={388} />
          <line x1={WHEEL.cx} y1={WHEEL.cy} x2={912} y2={388} />
        </g>
        <rect x={844} y={385} width={88} height={9} rx={4} fill="#9C6F44" />
        <rect x={846} y={386} width={84} height={3} rx={1.5} fill="#B8895A" opacity={0.65} />
        {/* Spindle & wound cotton yarn */}
        <line x1={816} y1={378} x2={850} y2={372} stroke="#B8895A" strokeWidth={3.5} strokeLinecap="round" />
        <ellipse cx={832} cy={375} rx={10} ry={6.5} fill="#F4E6D0" />
        <path d="M826 372 Q832 376 838 372" stroke="#D8C2A0" strokeWidth={1.2} fill="none" />
        {/* Drive cord from wheel to spindle */}
        <path d={`M${WHEEL.cx} ${WHEEL.cy + WHEEL.r} L832 372`} stroke="#F4E6D0" strokeWidth={1.3} opacity={0.8} fill="none" />

        {/* Spinning wheel */}
        <g data-charkha-wheel>
          <circle cx={WHEEL.cx} cy={WHEEL.cy} r={WHEEL.r} fill="none" stroke="#A87B4F" strokeWidth={5} />
          <circle cx={WHEEL.cx} cy={WHEEL.cy} r={WHEEL.r - 3.5} fill="none" stroke="#D4AF6A" strokeWidth={1.4} />
          <g stroke="#B8895A" strokeWidth={2.4}>
            {SPOKES.map((angle) => (
              <line
                key={angle}
                x1={WHEEL.cx}
                y1={WHEEL.cy}
                x2={WHEEL.cx + Math.cos(angle) * (WHEEL.r - 2)}
                y2={WHEEL.cy + Math.sin(angle) * (WHEEL.r - 2)}
              />
            ))}
          </g>
          <circle cx={WHEEL.cx} cy={WHEEL.cy} r={8.5} fill="#8C6239" />
          <circle cx={WHEEL.cx} cy={WHEEL.cy} r={4.5} fill="#E5B96B" />
        </g>
      </g>

      {/* Woven cane mora (traditional hourglass stool) */}
      <g>
        <path d="M966 334 L1026 334 L1014 362 L1026 390 L966 390 L978 362 Z" fill="#C49A62" />
        {/* Woven cane criss-cross lines */}
        <g stroke="#8C6239" strokeWidth={1.4} opacity={0.7}>
          <line x1={972} y1={336} x2={1018} y2={388} />
          <line x1={1020} y1={336} x2={974} y2={388} />
          <line x1={986} y1={336} x2={1022} y2={376} />
          <line x1={1006} y1={336} x2={970} y2={376} />
        </g>
        <rect x={964} y={331} width={64} height={6} rx={3} fill="#D8B37C" />
        <rect x={964} y={386} width={64} height={5} rx={2.5} fill="#9C6F44" />
      </g>

      {/* Far leg */}
      <path
        d="M976 322 Q956 328 948 354 L944 382 L956 383 L962 356 Q970 336 988 330 Z"
        fill="#B5744B"
      />
      <path d="M944 381 Q932 382 929 386 Q932 390 948 389 L956 385 Z" fill="#B5744B" />

      {/* Near leg reaching forward, foot flat on the ground */}
      <path
        d="M962 316 Q938 320 931 348 L927 382 L941 383 L947 350 Q954 330 976 326 Z"
        fill="#CE8E64"
      />
      <path d="M927 381 Q912 382 908 387 Q912 392 933 391 L941 386 L941 381 Z" fill="#CE8E64" />

      {/* Checked lungi */}
      <path
        d="M956 292 L1016 296 L1020 338 L940 335 Q924 322 938 304 Z"
        fill="#244942"
      />
      {/* Lungi plaid check pattern */}
      <g stroke="#9B1A41" strokeWidth={2.2} opacity={0.85}>
        <line x1={938} y1={310} x2={1016} y2={314} />
        <line x1={938} y1={325} x2={1018} y2={329} />
        <line x1={966} y1={294} x2={962} y2={336} />
        <line x1={994} y1={295} x2={992} y2={337} />
      </g>
      <g stroke="#D4AF6A" strokeWidth={1.1} opacity={0.75}>
        <line x1={938} y1={318} x2={1017} y2={322} />
        <line x1={980} y1={294} x2={977} y2={336} />
      </g>
      <path d="M940 335 L1020 338" stroke="#D4AF6A" strokeWidth={1.8} />

      {/* Far arm (resting gently near his lap/thread) */}
      <path
        d="M960 206 Q940 236 924 268 L934 274 Q950 246 968 218 Z"
        fill="#B5744B"
      />

      {/* White cotton kurta / panjabi */}
      <path
        d="M962 184 Q942 228 948 296 L1016 299 Q1022 232 996 184 Q978 178 962 184 Z"
        fill="#F4E6D0"
      />
      {/* Kurta shading & soft fabric folds */}
      <path d="M994 185 Q1016 232 1010 298 L1016 299 Q1022 232 996 184 Z" fill="#DFCAA8" />
      <path d="M962 238 Q958 266 960 295" stroke="#DFCAA8" strokeWidth={1.8} fill="none" />
      {/* Mandarin collar & placket */}
      <path d="M966 182 Q978 190 992 184" stroke="#C8B08E" strokeWidth={2.5} fill="none" />
      <line x1={967} y1={188} x2={963} y2={216} stroke="#C8B08E" strokeWidth={1.6} />

      {/* Crimson checked gamchha draped over his shoulder */}
      <path
        d="M988 184 Q1014 208 1010 264 L995 264 Q998 216 976 190 Z"
        fill="#9B1A41"
      />
      <g stroke="#F4E6D0" strokeWidth={1.2} opacity={0.75}>
        <line x1={984} y1={202} x2={1004} y2={200} />
        <line x1={991} y1={220} x2={1009} y2={219} />
        <line x1={995} y1={238} x2={1010} y2={238} />
        <line x1={996} y1={254} x2={1010} y2={254} />
      </g>
      <path d="M988 184 Q1014 208 1010 264" stroke="#D4AF6A" strokeWidth={1.4} fill="none" />
      {/* Gamchha fringe */}
      <g stroke="#F4E6D0" strokeWidth={1.2}>
        <line x1={997} y1={264} x2={996} y2={271} />
        <line x1={1001} y1={264} x2={1001} y2={272} />
        <line x1={1005} y1={264} x2={1006} y2={271} />
        <line x1={1009} y1={264} x2={1010} y2={270} />
      </g>

      {/* Neck */}
      <path d="M976 170 L990 172 L991 186 Q981 190 973 184 Z" fill="#B8764E" />

      {/* Head (left-facing profile) */}
      <path
        d="M966 146 Q963 153 960 159 Q958 162 963 163 Q962 168 966 172 Q971 176 981 175 Q996 174 1001 159 Q1003 142 988 136 Q971 134 966 146 Z"
        fill="#CE8E64"
      />
      {/* Facial details: eyebrow, focused eye, neat moustache, ear */}
      <path d="M965 151 Q969 149 974 151" stroke="#1E1B18" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <ellipse cx={969.5} cy={154.5} rx={2.1} ry={1.4} fill="#1E1B18" />
      {/* Moustache */}
      <path d="M961 164.5 Q966 163 971 165.5 Q966 167 961 165.5 Z" fill="#1E1B18" />
      {/* Ear */}
      <ellipse cx={986} cy={159} rx={3.2} ry={4.6} fill="#B8764E" />

      {/* Short dark wavy hair */}
      <path
        d="M965 147 Q966 132 985 132 Q1002 135 1003 153 Q1001 162 994 166 Q990 159 989 152 Q982 146 972 147 Z"
        fill="#1E1B18"
      />
      <path d="M974 137 Q988 135 996 144" stroke="#3E3631" strokeWidth={2} strokeLinecap="round" fill="none" />

      {/* Near arm turning the charkha wheel (rotates around shoulder pivot 972, 206) */}
      <g data-spinner-arm>
        {/* Rolled-up kurta sleeve */}
        <path
          d="M978 194 Q964 198 952 216 L964 227 Q978 218 986 204 Q986 194 978 194 Z"
          fill="#F4E6D0"
        />
        <path d="M952 216 L964 227" stroke="#DFCAA8" strokeWidth={3} strokeLinecap="round" />

        {/* Forearm reaching down to the wheel */}
        <path
          d="M954 218 L930 248 L894 287 L902 294 L940 256 L963 227 Z"
          fill="#CE8E64"
        />

        {/* Hand gripping the charkha handle */}
        <path
          d="M895 286 Q888 288 887 294 Q889 299 896 298 L903 293 Z"
          fill="#CE8E64"
        />
        <circle cx={894} cy={292} r={2.5} fill="#E5B96B" />
      </g>
    </g>
  );
}
