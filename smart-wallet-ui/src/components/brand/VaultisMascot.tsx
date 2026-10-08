interface VaultisMascotProps {
  className?: string
  greeting?: string
}

export default function VaultisMascot({ className = '', greeting = 'Bonjour !' }: VaultisMascotProps) {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {greeting && (
        <div className="mascot-speech-bubble absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-emerald-200 text-xs font-semibold shadow-xl border border-emerald-500/30 whitespace-nowrap backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{greeting}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-emerald-500/30" />
        </div>
      )}

      <svg
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[420px] h-auto drop-shadow-xl overflow-visible"
        aria-label="Mascotte Vaultis"
      >
        <style>
          {`
            @keyframes waveHello {
              0%, 100% {
                transform: rotate(0deg);
              }
              20% {
                transform: rotate(18deg);
              }
              40% {
                transform: rotate(-10deg);
              }
              60% {
                transform: rotate(16deg);
              }
              80% {
                transform: rotate(-4deg);
              }
            }

            @keyframes showLines {
              0%, 100% {
                opacity: 0.2;
                transform: scale(0.92);
              }
              50% {
                opacity: 1;
                transform: scale(1.06);
              }
            }

            @keyframes lookAround {
              0%, 20% {
                transform: translate(0px, 0px);
              }
              30%, 50% {
                transform: translate(6px, 1px);
              }
              60%, 80% {
                transform: translate(-5px, -1px);
              }
              90%, 100% {
                transform: translate(0px, 0px);
              }
            }

            @keyframes openMouth {
              0%, 100% {
                transform: scaleY(1);
              }
              50% {
                transform: scaleY(1.18) scaleX(1.05);
              }
            }

            @keyframes openEyes {
              0%, 45%, 55%, 100% {
                transform: scaleY(1);
              }
              50% {
                transform: scaleY(0.08);
              }
            }

            @keyframes floatMascot {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-5px);
              }
            }

            .mascot-waving-arm {
              transform-origin: 418px 235px;
              animation: waveHello 2.4s ease-in-out infinite;
            }

            .mascot-wave-lines {
              transform-origin: 530px 150px;
              animation: showLines 1.2s ease-in-out infinite;
            }

            .mascot-pupils {
              animation: lookAround 4.8s ease-in-out infinite;
            }

            .mascot-mouth {
              transform-origin: 300px 250px;
              animation: openMouth 2.8s ease-in-out infinite;
            }

            .mascot-eyes {
              transform-origin: 300px 214px;
              animation: openEyes 4s ease-in-out infinite;
            }
          `}
        </style>

        <defs>
          {/* Card Body Gold Gradients */}
          <linearGradient id="vaultisGold" x1="160" y1="130" x2="440" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="28%" stopColor="#FDD835" />
            <stop offset="68%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="goldGloss" x1="160" y1="130" x2="380" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="45%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#C57C00" />
          </linearGradient>

          <linearGradient id="leatherBoot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8D4925" />
            <stop offset="50%" stopColor="#6C3413" />
            <stop offset="100%" stopColor="#4A2108" />
          </linearGradient>

          <linearGradient id="shadowFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(8, 28, 18, 0.55)" />
            <stop offset="100%" stopColor="rgba(8, 28, 18, 0)" />
          </linearGradient>

          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>

        {/* 1. FLOOR CONTACT SHADOW */}
        <ellipse cx="300" cy="452" rx="135" ry="17" fill="url(#shadowFloor)" filter="url(#softBlur)" />
        <ellipse cx="250" cy="448" rx="34" ry="8" fill="rgba(6, 22, 14, 0.45)" filter="url(#softBlur)" />
        <ellipse cx="350" cy="448" rx="34" ry="8" fill="rgba(6, 22, 14, 0.45)" filter="url(#softBlur)" />

        {/* 2. CARTOON LEGS */}
        {/* Left Leg */}
        <path
          d="M 252 330 C 252 355 248 385 246 414"
          stroke="#0F172A"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Right Leg */}
        <path
          d="M 348 330 C 348 355 352 385 354 414"
          stroke="#0F172A"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* 3. SHOES WITH LACES (Brown Sneakers) */}
        {/* Left Shoe */}
        <g id="left-shoe">
          {/* White Sock Collar */}
          <rect x="235" y="408" width="22" height="7" rx="3.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Main Leather Shoe */}
          <path
            d="M 235 415 C 220 419 210 427 210 435 C 210 442 225 444 265 444 C 274 444 278 438 274 429 C 270 420 255 415 245 415 Z"
            fill="url(#leatherBoot)"
          />
          {/* White Sole */}
          <path
            d="M 208 438 C 208 444 225 446 266 446 C 276 446 278 441 276 438 Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          {/* White Toe Cap */}
          <path
            d="M 210 434 C 210 429 218 426 226 426 C 227 435 224 440 213 440 Z"
            fill="#F1F5F9"
          />
          {/* Laces */}
          <line x1="235" y1="422" x2="246" y2="424" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="237" y1="427" x2="248" y2="429" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="240" y1="432" x2="251" y2="434" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Right Shoe */}
        <g id="right-shoe">
          {/* White Sock Collar */}
          <rect x="343" y="408" width="22" height="7" rx="3.5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Main Leather Shoe */}
          <path
            d="M 365 415 C 380 419 390 427 390 435 C 390 442 375 444 335 444 C 326 444 322 438 326 429 C 330 420 345 415 355 415 Z"
            fill="url(#leatherBoot)"
          />
          {/* White Sole */}
          <path
            d="M 392 438 C 392 444 375 446 334 446 C 324 446 322 441 324 438 Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          {/* White Toe Cap */}
          <path
            d="M 390 434 C 390 429 382 426 374 426 C 373 435 376 440 387 440 Z"
            fill="#F1F5F9"
          />
          {/* Laces */}
          <line x1="365" y1="422" x2="354" y2="424" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="363" y1="427" x2="352" y2="429" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="360" y1="432" x2="349" y2="434" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* 4. LEFT ARM ON HIP WITH MOTION TRAILS */}
        <g id="left-arm-hip">
          {/* Motion trails near elbow */}
          <path
            d="M 124 238 C 118 248 118 262 126 272"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 112 244 C 106 252 106 260 114 268"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Arm bent at elbow */}
          <path
            d="M 172 232 C 145 238 128 250 134 268 C 140 282 158 280 174 274"
            stroke="#B45309"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 172 232 C 145 238 128 250 134 268 C 140 282 158 280 174 274"
            stroke="#F59E0B"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Hand on hip */}
          <ellipse cx="174" cy="272" rx="10" ry="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M 166 268 C 168 274 172 278 178 278" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* 5. GOLDEN CARD BODY */}
        <g id="golden-card-body">
          {/* Bevel Shadow */}
          <rect
            x="168"
            y="142"
            width="264"
            height="192"
            rx="26"
            fill="#92400E"
          />

          {/* Main Metallic Card Rect */}
          <rect
            x="170"
            y="140"
            width="260"
            height="188"
            rx="24"
            fill="url(#vaultisGold)"
            stroke="#F59E0B"
            strokeWidth="3.5"
          />

          {/* Inner Gloss Rim */}
          <rect
            x="174"
            y="144"
            width="252"
            height="180"
            rx="20"
            fill="url(#goldGloss)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.8"
          />

          {/* EMV Microchip */}
          <g id="emv-chip" transform="translate(192, 196)">
            {/* Chip Base */}
            <rect x="0" y="0" width="46" height="38" rx="7" fill="url(#chipGrad)" stroke="#92400E" strokeWidth="1.6" />
            {/* Circuit Lines */}
            <path
              d="M 15 0 V 38 M 31 0 V 38 M 0 19 H 46 M 15 12 H 31 M 15 26 H 31"
              stroke="#78350F"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Center Chip Contact Pad */}
            <rect x="18" y="14" width="10" height="10" rx="2" fill="#FFE082" stroke="#78350F" strokeWidth="1" />
          </g>

          {/* Contactless Waves */}
          <g transform="translate(244, 206)" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8">
            <path d="M 0 4 C 3 9 3 13 0 18" />
            <path d="M 5 0 C 10 8 10 18 5 26" />
            <path d="M 10 -4 C 17 6 17 26 10 34" />
          </g>

          {/* Mastercard Intersecting Circles */}
          <g id="mastercard" transform="translate(372, 288)">
            <circle cx="12" cy="14" r="15" fill="#EB001B" fillOpacity="0.88" />
            <circle cx="28" cy="14" r="15" fill="#F79E1B" fillOpacity="0.88" />
          </g>

          {/* Vaultis Cloud branding text on card */}
          <text x="398" y="172" textAnchor="end" fill="#78350F" fontSize="12" fontWeight="800" letterSpacing="1.8">
            VAULTIS
          </text>
          <text x="398" y="183" textAnchor="end" fill="#92400E" fontSize="8" fontWeight="700" letterSpacing="1">
            ELITE
          </text>

          {/* Card Number Emboss */}
          <text x="194" y="274" fill="#78350F" fontSize="12" fontWeight="700" letterSpacing="3">
            •••• 8820
          </text>
        </g>

        {/* 6. CARTOON FACE */}
        <g id="cartoon-face">
          {/* Eyebrows */}
          <path
            d="M 258 186 Q 274 176 288 185"
            stroke="#451A03"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 312 185 Q 326 176 342 186"
            stroke="#451A03"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Big White Cartoon Eyes with openEyes animation */}
          <g className="mascot-eyes">
            {/* Left Eye */}
            <ellipse cx="274" cy="214" rx="20" ry="26" fill="#FFFFFF" stroke="#451A03" strokeWidth="3" />
            {/* Right Eye */}
            <ellipse cx="326" cy="214" rx="20" ry="26" fill="#FFFFFF" stroke="#451A03" strokeWidth="3" />

            {/* Animated Pupils with lookAround animation */}
            <g className="mascot-pupils">
              {/* Left Pupil */}
              <ellipse cx="278" cy="216" rx="10" ry="13" fill="#0F172A" />
              <circle cx="282" cy="211" r="4" fill="#FFFFFF" />
              <circle cx="275" cy="222" r="1.8" fill="#FFFFFF" />

              {/* Right Pupil */}
              <ellipse cx="330" cy="216" rx="10" ry="13" fill="#0F172A" />
              <circle cx="334" cy="211" r="4" fill="#FFFFFF" />
              <circle cx="327" cy="222" r="1.8" fill="#FFFFFF" />
            </g>
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="248" cy="238" rx="10" ry="7" fill="#F43F5E" opacity="0.38" />
          <ellipse cx="352" cy="238" rx="10" ry="7" fill="#F43F5E" opacity="0.38" />

          {/* Smiling Mouth with openMouth animation */}
          <g className="mascot-mouth">
            {/* Mouth cavity */}
            <path
              d="M 274 246 C 274 246 284 274 300 274 C 316 274 326 246 326 246 Z"
              fill="#451A03"
            />
            {/* Tongue */}
            <path
              d="M 288 266 C 293 258 307 258 312 266 C 307 274 293 274 288 266 Z"
              fill="#FB7185"
            />
            {/* Top Teeth Row */}
            <path
              d="M 278 246 C 286 253 314 253 322 246 L 319 250 C 310 256 290 256 281 250 Z"
              fill="#FFFFFF"
            />
            {/* Main Lip Outline with Smiling Dimples */}
            <path
              d="M 270 244 Q 300 276 330 244"
              stroke="#451A03"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Corner Dimples */}
            <path d="M 268 241 C 270 246 273 246 273 246" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 332 241 C 330 246 327 246 327 246" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* 7. ANIMATED RIGHT ARM WAVING HELLO */}
        <g className="mascot-waving-arm">
          {/* Wave Motion Lines near the hand */}
          <g className="mascot-wave-lines">
            <path
              d="M 520 134 C 536 148 536 168 520 182"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 534 126 C 554 148 554 174 534 196"
              stroke="#FBBF24"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 548 120 C 572 148 572 182 548 210"
              stroke="#FDE68A"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Arm Beam */}
          <path
            d="M 426 234 C 452 230 472 208 486 182"
            stroke="#B45309"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 426 234 C 452 230 472 208 486 182"
            stroke="#F59E0B"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />

          {/* White Cartoon Glove Wrist Cuff */}
          <g transform="translate(480, 172) rotate(-28)">
            <rect x="-8" y="-6" width="16" height="10" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          </g>

          {/* Open Hand Waving (5 cartoon fingers) */}
          <g id="open-waving-hand" transform="translate(488, 164) rotate(-15)">
            {/* Palm */}
            <ellipse cx="6" cy="6" rx="14" ry="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.8" />

            {/* Thumb */}
            <path
              d="M -6 1 C -12 -5 -7 -14 0 -10 C 3 -8 4 -4 3 2"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Index Finger */}
            <path
              d="M -1 -7 C 0 -17 8 -19 11 -11 C 12 -5 9 -1 7 1"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Middle Finger */}
            <path
              d="M 8 -6 C 11 -19 20 -18 21 -9 C 21 -3 18 1 15 4"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Ring Finger */}
            <path
              d="M 16 -1 C 21 -12 28 -10 27 -2 C 26 3 22 7 19 8"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Pinky Finger */}
            <path
              d="M 20 7 C 26 0 31 4 29 11 C 27 16 23 16 18 14"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Palm crease detail */}
            <path d="M 1 4 C 4 8 10 9 14 6" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  )
}
