/** Pivots the scene rotates around (shoulder for the arm, heel for the treadle). */
export const WEAVER_PIVOTS = { shoulder: "890 196", treadle: "870 386" } as const;

/**
 * Illustrated clipart-style Bangladeshi weaver seated on a wooden bench,
 * facing the loom: dark hair in a low khopa bun with gajra, red bindi,
 * magenta blouse, draped tant sharee with zari border and pallu, bangles on
 * her wrist (`data-weaver-arm`) working the beater, and her foot pressing the
 * treadle (`data-treadle`).
 */
export function WeaverFigure() {
  return (
    <g>
      {/* Subtle ground shadow */}
      <ellipse cx={928} cy={394} rx={82} ry={5} fill="#0e221e" opacity={0.45} />

      {/* Wooden bench */}
      <g>
        <rect x={874} y={322} width={11} height={70} rx={2} fill="#6E4B2A" />
        <rect x={980} y={322} width={11} height={70} rx={2} fill="#6E4B2A" />
        <rect x={885} y={348} width={95} height={7} rx={2} fill="#5C3D21" />
        <rect x={860} y={310} width={144} height={13} rx={4} fill="#9C6F44" />
        <rect x={862} y={311} width={140} height={4} rx={2} fill="#B8895A" opacity={0.65} />
      </g>

      {/* Wooden treadle under her foot */}
      <g data-treadle>
        <line x1={784} y1={394} x2={870} y2={386} stroke="#8C6239" strokeWidth={8} strokeLinecap="round" />
        <line x1={785} y1={392.5} x2={869} y2={384.5} stroke="#B8895A" strokeWidth={2} strokeLinecap="round" />
      </g>

      {/* Far leg (tucked slightly back) */}
      <path
        d="M892 314 Q868 324 858 356 L854 382 L866 384 L874 352 Q884 330 906 320 Z"
        fill="#B8764E"
      />
      <path d="M854 380 Q842 380 839 385 Q842 389 858 388 L866 384 Z" fill="#B8764E" />

      {/* Near leg reaching the treadle */}
      <path
        d="M876 306 Q846 312 838 342 L833 379 L847 380 L854 344 Q862 324 888 318 Z"
        fill="#D99B72"
      />
      {/* Foot resting on treadle + gold anklet */}
      <path d="M833 378 Q818 380 814 385 Q818 390 838 389 L847 384 L847 378 Z" fill="#D99B72" />
      <path d="M833 376 Q840 379 847 377" stroke="#E5B96B" strokeWidth={1.8} fill="none" />

      {/* Sharee skirt drape over lap and knees */}
      <path
        d="M874 248 Q848 278 836 302 Q830 322 854 326 L984 320 Q982 278 942 248 Z"
        fill="#F4E6D0"
      />
      {/* Soft sharee pleat shadows */}
      <path d="M862 272 Q854 298 852 322" stroke="#D8C2A0" strokeWidth={2} fill="none" />
      <path d="M884 268 Q878 296 878 322" stroke="#D8C2A0" strokeWidth={2} fill="none" />
      <path d="M908 268 Q906 296 908 320" stroke="#D8C2A0" strokeWidth={1.8} fill="none" />
      {/* Crimson & gold zari paar (lower border) */}
      <path d="M837 316 Q910 324 983 313 L984 321 Q910 331 840 324 Z" fill="#9B1A41" />
      <path d="M838 315 Q910 323 983 312" stroke="#D4AF6A" strokeWidth={1.8} fill="none" />
      <path d="M840 323 Q910 330 984 320" stroke="#D4AF6A" strokeWidth={1.5} fill="none" />

      {/* Far arm (slightly behind torso, reaching toward loom) */}
      <path
        d="M882 200 Q860 222 832 232 L828 242 Q860 236 888 214 Z"
        fill="#C27E54"
      />

      {/* Torso & fitted crimson blouse */}
      <path
        d="M886 182 Q870 212 874 252 L936 254 Q944 214 918 182 Q902 177 886 182 Z"
        fill="#9B1A41"
      />
      {/* Blouse shading */}
      <path d="M916 184 Q936 214 930 253 L936 254 Q944 214 918 182 Z" fill="#7D1434" />
      {/* Gold neckline & waist trim */}
      <path d="M888 184 Q900 192 914 185" stroke="#D4AF6A" strokeWidth={1.8} fill="none" />
      <path d="M874 249 Q905 253 935 251" stroke="#D4AF6A" strokeWidth={2} fill="none" />

      {/* Draped sharee pallu (anchal) across chest, over shoulder, cascading behind */}
      <path
        d="M876 244 Q892 212 912 182 Q948 198 952 254 Q962 292 998 312 L982 318 Q934 296 928 246 Q924 212 894 202 Q886 224 878 250 Z"
        fill="#F4E6D0"
      />
      {/* Crimson & gold border along the pallu */}
      <path
        d="M912 182 Q948 198 952 254 Q962 292 998 312 L991 315 Q954 294 944 254 Q940 204 906 188 Z"
        fill="#9B1A41"
      />
      <path
        d="M906 188 Q940 204 944 254 Q954 294 991 315"
        stroke="#D4AF6A"
        strokeWidth={1.6}
        fill="none"
      />
      {/* Zari stripes on pallu end */}
      <line x1={968} y1={296} x2={982} y2={288} stroke="#D4AF6A" strokeWidth={2} />
      <line x1={975} y1={303} x2={989} y2={295} stroke="#9B1A41" strokeWidth={2.2} />
      <line x1={981} y1={309} x2={994} y2={302} stroke="#D4AF6A" strokeWidth={1.8} />

      {/* Neck */}
      <path d="M895 168 L909 170 L910 186 Q900 190 892 184 Z" fill="#C9885E" />

      {/* Head (left-facing profile) */}
      <path
        d="M883 146 Q880 153 877 159 Q875 162 880 163 Q879 167 882 170 Q886 175 896 175 Q912 174 917 159 Q920 142 904 136 Q888 134 883 146 Z"
        fill="#D99B72"
      />
      {/* Facial details: eyebrow, eye, red bindi, subtle lip */}
      <path d="M882 151 Q886 149 890 151" stroke="#241B17" strokeWidth={1.3} strokeLinecap="round" fill="none" />
      <ellipse cx={886} cy={154.5} rx={2.1} ry={1.4} fill="#241B17" />
      <circle cx={881.5} cy={149.5} r={1.6} fill="#9B1A41" />
      <path d="M880 166 Q883 167.5 886 166" stroke="#A6534C" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      {/* Ear & small gold jhumka earring */}
      <ellipse cx={902} cy={159} rx={3.2} ry={4.6} fill="#C9885E" />
      <circle cx={902} cy={165} r={2.2} fill="#E5B96B" />
      <path d="M899.5 168 L904.5 168 L903.5 172 L900.5 172 Z" fill="#D4AF6A" />

      {/* Hair & low khopa bun with white/gold gajra */}
      <path
        d="M882 146 Q886 131 904 132 Q920 135 921 153 Q920 165 911 169 Q906 162 905 154 Q898 145 882 146 Z"
        fill="#1E1B18"
      />
      {/* Soft hair sheen */}
      <path d="M892 137 Q906 135 914 145" stroke="#3E3631" strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* Khopa bun */}
      <circle cx={925} cy={154} r={11.5} fill="#1E1B18" />
      {/* Gajra (white floral garland around bun) */}
      <path
        d="M916 144 Q913 154 918 164"
        stroke="#FFFFFF"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray="1 4.5"
        fill="none"
      />
      <path d="M917 145 Q914 154 919 163" stroke="#E5B96B" strokeWidth={1.2} fill="none" />

      {/* Near arm working the beater (rotates around shoulder pivot 890, 196) */}
      <g data-weaver-arm>
        {/* Blouse short sleeve with gold zari edge */}
        <path
          d="M894 188 Q882 192 874 206 L886 218 Q898 210 904 198 Q904 188 894 188 Z"
          fill="#9B1A41"
        />
        <path d="M874 206 L886 218" stroke="#D4AF6A" strokeWidth={2.2} strokeLinecap="round" />

        {/* Upper arm & forearm */}
        <path
          d="M876 208 L852 228 L809 221 L808 231 L854 240 Q860 240 865 235 L885 217 Z"
          fill="#D99B72"
        />

        {/* Stacked crimson & gold bangles (churi) */}
        <line x1={821} y1={222} x2={820} y2={233} stroke="#E5B96B" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={825} y1={223} x2={824} y2={234} stroke="#9B1A41" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={829} y1={224} x2={828} y2={235} stroke="#E5B96B" strokeWidth={2} strokeLinecap="round" />

        {/* Hand & fingers gripping the beater */}
        <path
          d="M810 221 Q801 220 798 225 Q798 231 804 233 L812 232 Z"
          fill="#D99B72"
        />
        <path d="M806 221 Q802 217 799 220" stroke="#C27E54" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}
