import React from 'react'

/**
 * ============================================================================
 * FINTECH BACKGROUND DECOR (Elite Vector Assets)
 * ============================================================================
 * High-fidelity, institutional vector assets inspired by Stripe, Linear,
 * Mercury, Bloomberg, and TradingView.
 *
 * Palette:
 * - Emerald Accents: #10b981, #059669, #34d399, #047857
 * - Subtle Slate/Silver Lines: rgba(148, 163, 184, 0.15) / rgba(16, 185, 129, 0.12)
 * - Deep Emerald / White Glass: crisp, pure vector geometry with zero unbranded clutter.
 */

export interface FintechDecorProps {
  className?: string
  opacity?: number
}

/**
 * ----------------------------------------------------------------------------
 * 1. FintechStatsCorner
 * ----------------------------------------------------------------------------
 * Replaces the arbitrary top-right red blob.
 * Displays a floating, high-tech fintech statistics & market growth graph
 * featuring smooth cubic trendlines, area gradients, TradingView-style
 * candlesticks, precision data grids, and floating metric badges.
 */
export const FintechStatsCorner: React.FC<FintechDecorProps> = ({
  className = '',
  opacity = 1,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 560 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_20px_40px_rgba(16,185,129,0.08)]"
      >
        <defs>
          {/* Ambient Corner Glow */}
          <radialGradient
            id="stats-glow-core"
            cx="80%"
            cy="20%"
            r="70%"
            fx="85%"
            fy="15%"
          >
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
            <stop offset="40%" stopColor="#34d399" stopOpacity="0.09" />
            <stop offset="75%" stopColor="#059669" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>

          {/* Area Fill Gradient */}
          <linearGradient id="stats-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#059669" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
          </linearGradient>

          {/* Primary Trend Stroke Gradient */}
          <linearGradient id="stats-trend-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="85%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          {/* Secondary Trend Stroke Gradient */}
          <linearGradient id="stats-bench-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
          </linearGradient>

          {/* Glass Card Gradient */}
          <linearGradient id="stats-glass-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.85" />
          </linearGradient>

          {/* Micro Grid Pattern */}
          <pattern
            id="stats-grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#10b981"
              strokeWidth="0.75"
              strokeOpacity="0.10"
              strokeDasharray="2 3"
            />
          </pattern>
        </defs>

        {/* Ambient Radial Radiance */}
        <circle cx="420" cy="140" r="260" fill="url(#stats-glow-core)" />

        {/* Chart Frame / Coordinates Canvas */}
        <g transform="translate(100, 75)">
          {/* Micro Grid Backdrop */}
          <rect
            x="20"
            y="20"
            width="420"
            height="260"
            rx="16"
            fill="url(#stats-grid-pattern)"
            stroke="#10b981"
            strokeWidth="1"
            strokeOpacity="0.12"
          />

          {/* Horizontal Level Guides & Metric Labels */}
          <g stroke="#94a3b8" strokeOpacity="0.18" strokeDasharray="4 4" strokeWidth="1">
            <line x1="20" y1="60" x2="440" y2="60" />
            <line x1="20" y1="120" x2="440" y2="120" />
            <line x1="20" y1="180" x2="440" y2="180" />
            <line x1="20" y1="240" x2="440" y2="240" />
          </g>

          {/* Y-Axis Financial Tickers */}
          <g fontSize="9" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fill="#059669" opacity="0.8">
            <text x="446" y="63">+34.8%</text>
            <text x="446" y="123">+22.4%</text>
            <text x="446" y="183">+11.0%</text>
            <text x="446" y="243">0.0%</text>
          </g>

          {/* Bottom Volume Histogram Bars */}
          <g fill="#10b981" opacity="0.15">
            <rect x="50" y="255" width="8" height="15" rx="1.5" />
            <rect x="75" y="245" width="8" height="25" rx="1.5" />
            <rect x="100" y="250" width="8" height="20" rx="1.5" />
            <rect x="125" y="235" width="8" height="35" rx="1.5" />
            <rect x="150" y="240" width="8" height="30" rx="1.5" />
            <rect x="175" y="220" width="8" height="50" rx="1.5" />
            <rect x="200" y="230" width="8" height="40" rx="1.5" />
            <rect x="225" y="210" width="8" height="60" rx="1.5" opacity="0.25" />
            <rect x="250" y="215" width="8" height="55" rx="1.5" opacity="0.25" />
            <rect x="275" y="195" width="8" height="75" rx="1.5" opacity="0.3" />
            <rect x="300" y="185" width="8" height="85" rx="1.5" opacity="0.3" />
            <rect x="325" y="200" width="8" height="70" rx="1.5" opacity="0.25" />
            <rect x="350" y="175" width="8" height="95" rx="1.5" opacity="0.35" />
            <rect x="375" y="160" width="8" height="110" rx="1.5" opacity="0.4" />
            <rect x="400" y="150" width="8" height="120" rx="1.5" opacity="0.45" />
          </g>

          {/* TradingView-Style Candlestick Cluster (Bullish Surge) */}
          <g transform="translate(180, 75)" opacity="0.85">
            {/* Candle 1 (Bullish) */}
            <line x1="20" y1="90" x2="20" y2="135" stroke="#10b981" strokeWidth="1.2" />
            <rect x="16" y="100" width="8" height="24" rx="1" fill="#10b981" />

            {/* Candle 2 (Short Retest) */}
            <line x1="38" y1="85" x2="38" y2="125" stroke="#059669" strokeWidth="1.2" />
            <rect x="34" y="95" width="8" height="18" rx="1" fill="#059669" />

            {/* Candle 3 (Surge) */}
            <line x1="56" y1="65" x2="56" y2="115" stroke="#10b981" strokeWidth="1.2" />
            <rect x="52" y="75" width="8" height="30" rx="1" fill="#10b981" />

            {/* Candle 4 (Consolidation) */}
            <line x1="74" y1="55" x2="74" y2="95" stroke="#34d399" strokeWidth="1.2" />
            <rect x="70" y="65" width="8" height="20" rx="1" fill="#34d399" />

            {/* Candle 5 (Breakout) */}
            <line x1="92" y1="35" x2="92" y2="85" stroke="#10b981" strokeWidth="1.2" />
            <rect x="88" y="45" width="8" height="32" rx="1" fill="#10b981" />
          </g>

          {/* Area Chart Gradient Fill */}
          <path
            d="M 20 230 
               C 60 225, 110 215, 150 185 
               C 190 155, 230 170, 270 130 
               C 310 90, 360 95, 410 45 
               C 425 35, 435 32, 440 30 
               L 440 280 L 20 280 Z"
            fill="url(#stats-area-fill)"
          />

          {/* Secondary Dashed Trendline (Market Index) */}
          <path
            d="M 20 240 
               C 70 238, 120 230, 170 205 
               C 220 180, 270 185, 320 155 
               C 370 125, 410 110, 440 85"
            fill="none"
            stroke="url(#stats-bench-stroke)"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />

          {/* Primary Trend Curve (Portfolio Growth) */}
          <path
            d="M 20 230 
               C 60 225, 110 215, 150 185 
               C 190 155, 230 170, 270 130 
               C 310 90, 360 95, 410 45 
               C 425 35, 435 32, 440 30"
            fill="none"
            stroke="url(#stats-trend-stroke)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Milestone Inflection Nodes */}
          {/* Node 1 */}
          <circle cx="150" cy="185" r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="150" cy="185" r="8" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />

          {/* Node 2 */}
          <circle cx="270" cy="130" r="4.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
          <circle cx="270" cy="130" r="9" fill="none" stroke="#059669" strokeWidth="1" strokeOpacity="0.35" />

          {/* Apex Node with Pulsing Glow Halo */}
          <circle cx="410" cy="45" r="14" fill="#10b981" fillOpacity="0.15" />
          <circle cx="410" cy="45" r="5.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
        </g>

        {/* Floating Glass Metric Badge 1: Performance Pill (+28.4% ARR) */}
        <g transform="translate(310, 28)" className="sw-float">
          {/* Frosted Glass Shadow & Container */}
          <rect
            x="0"
            y="0"
            width="170"
            height="46"
            rx="23"
            fill="url(#stats-glass-bg)"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            filter="drop-shadow(0 12px 24px rgba(15,23,42,0.08))"
          />

          {/* Emerald Upward Trend Icon Badge */}
          <circle cx="24" cy="23" r="14" fill="#10b981" fillOpacity="0.12" />
          <path
            d="M 19 27 L 29 17 M 23 17 L 29 17 L 29 23"
            fill="none"
            stroke="#059669"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Metric Texts */}
          <text x="46" y="20" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600" fill="#64748b">
            CROISSANCE NETTE
          </text>
          <text x="46" y="34" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#047857">
            +28.4% <tspan fontSize="10" fontWeight="600" fill="#10b981">ARR</tspan>
          </text>
        </g>

        {/* Floating Glass Metric Badge 2: Alpha Index & Status */}
        <g transform="translate(180, 410)" className="sw-float-2">
          <rect
            x="0"
            y="0"
            width="180"
            height="42"
            rx="12"
            fill="url(#stats-glass-bg)"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeOpacity="0.25"
            filter="drop-shadow(0 10px 20px rgba(15,23,42,0.06))"
          />

          {/* Pulsing Green Status Dot */}
          <circle cx="20" cy="21" r="5" fill="#10b981" fillOpacity="0.25" />
          <circle cx="20" cy="21" r="2.5" fill="#10b981" />

          {/* Ticker Info */}
          <text x="34" y="19" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" fill="#0f172a" letterSpacing="0.04em">
            FLUX DE MARCHÉ EN DIRECT
          </text>
          <text x="34" y="32" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="600" fill="#059669">
            ALPHA INDEX: 99.82
          </text>
        </g>
      </svg>
    </div>
  )
}

/**
 * ----------------------------------------------------------------------------
 * 2. FintechCashFlowCorner
 * ----------------------------------------------------------------------------
 * Replaces the arbitrary bottom-left yellow circle.
 * Displays dynamic currency streamlines, multi-ribbon capital flows,
 * minted Euro & Dollar tokens (€, $, ↗), cryptographic ledger nodes,
 * and guilloché interference bands.
 */
export const FintechCashFlowCorner: React.FC<FintechDecorProps> = ({
  className = '',
  opacity = 1,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 540 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_20px_45px_rgba(16,185,129,0.10)]"
      >
        <defs>
          {/* Ambient Corner Glow */}
          <radialGradient
            id="flow-glow-core"
            cx="20%"
            cy="80%"
            r="65%"
            fx="15%"
            fy="85%"
          >
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
            <stop offset="40%" stopColor="#34d399" stopOpacity="0.10" />
            <stop offset="75%" stopColor="#047857" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </radialGradient>

          {/* Cash Streamline Gradient 1 */}
          <linearGradient id="stream-grad-1" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#047857" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#10b981" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#34d399" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </linearGradient>

          {/* Cash Streamline Gradient 2 */}
          <linearGradient id="stream-grad-2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.05" />
          </linearGradient>

          {/* Minted Coin Metallic Gradient */}
          <radialGradient id="euro-coin-metal" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#d1fae5" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>

          <radialGradient id="dollar-coin-metal" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="75%" stopColor="#059669" />
            <stop offset="100%" stopColor="#022c22" />
          </radialGradient>

          {/* Glass Card Gradient */}
          <linearGradient id="flow-glass-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* Ambient Radial Radiance */}
        <circle cx="140" cy="400" r="260" fill="url(#flow-glow-core)" />

        {/* Concentric Liquidity Radar Arcs */}
        <g stroke="#10b981" strokeOpacity="0.12" fill="none">
          <circle cx="40" cy="460" r="100" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="40" cy="460" r="180" strokeWidth="1.2" strokeDasharray="6 6" />
          <circle cx="40" cy="460" r="270" strokeWidth="0.8" />
          <circle cx="40" cy="460" r="360" strokeWidth="1" strokeDasharray="4 8" />
        </g>

        {/* Guilloché Mathematical Ribbon Waveforms */}
        <g stroke="#10b981" strokeOpacity="0.15" fill="none" strokeWidth="0.85">
          <path d="M 0 470 C 90 430, 160 390, 210 330 C 260 270, 310 230, 420 190 C 470 170, 500 160, 540 155" />
          <path d="M 0 450 C 100 420, 175 375, 225 315 C 275 255, 325 215, 435 175 C 485 155, 510 145, 540 140" strokeOpacity="0.18" />
          <path d="M 0 430 C 110 410, 190 360, 240 300 C 290 240, 340 200, 450 160 C 495 140, 515 130, 540 125" strokeOpacity="0.14" />
          <path d="M 0 410 C 120 400, 205 345, 255 285 C 305 225, 355 185, 465 145 C 500 125, 515 115, 540 110" strokeOpacity="0.10" />
        </g>

        {/* Main Capital Flow Streamlines */}
        <g fill="none">
          {/* Deep Underlying Glow Stream */}
          <path
            d="M -20 500 
               C 80 440, 160 380, 220 300 
               C 280 220, 340 180, 460 120 
               C 490 105, 510 95, 550 90"
            stroke="#10b981"
            strokeWidth="10"
            strokeOpacity="0.06"
            strokeLinecap="round"
          />

          {/* Primary Streamline */}
          <path
            d="M -20 500 
               C 80 440, 160 380, 220 300 
               C 280 220, 340 180, 460 120 
               C 490 105, 510 95, 550 90"
            stroke="url(#stream-grad-1)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Secondary Braided Streamline */}
          <path
            d="M -10 470 
               C 90 420, 140 350, 250 290 
               C 330 245, 380 190, 510 150"
            stroke="url(#stream-grad-2)"
            strokeWidth="2.2"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />

          {/* Accelerated Counter-Flow */}
          <path
            d="M 10 520 
               C 120 450, 190 400, 270 340 
               C 350 280, 410 230, 520 200"
            stroke="#059669"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
        </g>

        {/* Flow Particles Along Trajectory */}
        <circle cx="110" cy="410" r="3.5" fill="#10b981" opacity="0.8" />
        <circle cx="110" cy="410" r="7" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3" />

        <circle cx="260" cy="250" r="4.5" fill="#34d399" opacity="0.9" />
        <circle cx="260" cy="250" r="9" fill="none" stroke="#34d399" strokeWidth="1.2" opacity="0.4" />

        <circle cx="440" cy="135" r="3.5" fill="#10b981" opacity="0.75" />

        {/* Currency Node 1: Minted Euro Token (€) */}
        <g transform="translate(80, 160)" className="sw-float">
          {/* Token Outer Glow */}
          <circle cx="32" cy="32" r="38" fill="#10b981" fillOpacity="0.14" />

          {/* Coin Base with Metallic Rim */}
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="url(#euro-coin-metal)"
            stroke="#047857"
            strokeWidth="2"
            filter="drop-shadow(0 10px 18px rgba(6,78,59,0.25))"
          />

          {/* Inner Minting Fluted Border */}
          <circle
            cx="32"
            cy="32"
            r="24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.75"
          />

          {/* Embossed Euro Symbol */}
          <text
            x="32"
            y="41"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="26"
            fontWeight="900"
            fill="#ffffff"
            textAnchor="middle"
            filter="drop-shadow(0 1px 2px rgba(4,120,87,0.8))"
          >
            €
          </text>
        </g>

        {/* Currency Node 2: Minted Dollar Token ($) */}
        <g transform="translate(230, 250)" className="sw-float-2">
          {/* Token Outer Ring */}
          <circle cx="24" cy="24" r="28" fill="#34d399" fillOpacity="0.14" />

          <circle
            cx="24"
            cy="24"
            r="22"
            fill="url(#dollar-coin-metal)"
            stroke="#065f46"
            strokeWidth="1.8"
            filter="drop-shadow(0 8px 16px rgba(15,23,42,0.18))"
          />

          <circle
            cx="24"
            cy="24"
            r="17"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.6"
          />

          <text
            x="24"
            y="31"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="20"
            fontWeight="800"
            fill="#ffffff"
            textAnchor="middle"
            filter="drop-shadow(0 1px 2px rgba(6,78,59,0.8))"
          >
            $
          </text>
        </g>

        {/* Floating Ledger Block 1: Instant Settlement Badge */}
        <g transform="translate(30, 260)" className="sw-float-3">
          <rect
            x="0"
            y="0"
            width="170"
            height="52"
            rx="14"
            fill="url(#flow-glass-card)"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeOpacity="0.30"
            filter="drop-shadow(0 12px 24px rgba(15,23,42,0.08))"
          />

          {/* Status Checkmark Pill */}
          <circle cx="22" cy="26" r="11" fill="#10b981" />
          <path
            d="M 18 26 L 21 29 L 26 23"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Settlement Details */}
          <text x="39" y="21" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" fill="#64748b" letterSpacing="0.04em">
            VIREMENT INSTANTANÉ
          </text>
          <text x="39" y="37" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="800" fill="#047857">
            +€ 4 850.00
          </text>
        </g>

        {/* Floating Ledger Block 2: Cryptographic Security Node */}
        <g transform="translate(130, 390)" className="sw-float">
          <rect
            x="0"
            y="0"
            width="160"
            height="40"
            rx="10"
            fill="url(#flow-glass-card)"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeOpacity="0.25"
            filter="drop-shadow(0 8px 16px rgba(15,23,42,0.05))"
          />

          {/* Cipher Lock Indicator */}
          <circle cx="18" cy="20" r="4" fill="#059669" />

          <text x="29" y="18" fontFamily="Inter, sans-serif" fontSize="8.5" fontWeight="700" fill="#0f172a">
            LEDGER CRYPTOGRAPHIQUE
          </text>
          <text x="29" y="29" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="600" fill="#059669">
            TX · 0x88F...4B
          </text>
        </g>
      </svg>
    </div>
  )
}

/**
 * ----------------------------------------------------------------------------
 * 3. FintechBankPattern
 * ----------------------------------------------------------------------------
 * Replaces the plain rotated squares/diamonds inside the green left section.
 * Renders an intricate banknote guilloché watermark, concentric security rings,
 * compass dial graduations, and fine lathe security mesh.
 * Calibrated with a subtle center vignette so the card mascot remains the star.
 */
export const FintechBankPattern: React.FC<FintechDecorProps> = ({
  className = '',
  opacity = 1,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          {/* Banknote Lathe Grid Pattern */}
          <pattern
            id="bank-security-mesh"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <path
              d="M 0 16 C 8 8, 24 24, 32 16 M 16 0 C 8 8, 24 24, 16 32"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.6"
              strokeOpacity="0.08"
            />
          </pattern>

          {/* Micro Guilloché Wave Band Pattern */}
          <pattern
            id="bank-guilloche-band"
            width="80"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 20 C 20 5, 60 35, 80 20 C 60 5, 20 35, 0 20 Z"
              fill="none"
              stroke="#34d399"
              strokeWidth="0.75"
              strokeOpacity="0.14"
            />
          </pattern>

          {/* Radial Mask to preserve high contrast for center mascot */}
          <radialGradient id="bank-center-mask" cx="50%" cy="54%" r="48%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </radialGradient>

          <mask id="bank-watermark-mask">
            <rect width="600" height="800" fill="url(#bank-center-mask)" />
          </mask>
        </defs>

        {/* Global Security Mesh Background Layer */}
        <rect width="600" height="800" fill="url(#bank-security-mesh)" />

        {/* Watermark Group masked for mascot clarity */}
        <g mask="url(#bank-watermark-mask)">
          {/* Top-Right Banknote Rosette & Concentric Vault Rings */}
          <g transform="translate(520, 80)">
            {/* Concentric Vault Rings */}
            <circle cx="0" cy="0" r="140" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="3 4" />
            <circle cx="0" cy="0" r="115" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.22" />
            <circle cx="0" cy="0" r="90" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="6 4" />
            <circle cx="0" cy="0" r="65" stroke="#34d399" strokeWidth="1" strokeOpacity="0.2" />

            {/* Guilloché Hypocycloid Petals (12-Fold Symmetry) */}
            <g stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.16">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <path
                  key={`rosette-tr-${deg}`}
                  d="M 0 0 C 40 -80, 80 -40, 0 -115 C -80 -40, -40 -80, 0 0"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Radial Dial Graduation Ticks */}
            <g stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25">
              {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map(
                (deg) => (
                  <line
                    key={`dial-tr-${deg}`}
                    x1="115"
                    y1="0"
                    x2={deg % 45 === 0 ? '128' : '121'}
                    y2="0"
                    transform={`rotate(${deg})`}
                  />
                )
              )}
            </g>
          </g>

          {/* Bottom-Left Banknote Rosette & Concentric Vault Rings */}
          <g transform="translate(60, 720)">
            <circle cx="0" cy="0" r="160" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.12" strokeDasharray="4 6" />
            <circle cx="0" cy="0" r="130" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.20" />
            <circle cx="0" cy="0" r="100" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.14" strokeDasharray="2 3" />
            <circle cx="0" cy="0" r="70" stroke="#34d399" strokeWidth="0.9" strokeOpacity="0.18" />

            {/* Guilloché Hypocycloid Petals */}
            <g stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.14">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <path
                  key={`rosette-bl-${deg}`}
                  d="M 0 0 C 35 -70, 70 -35, 0 -100 C -70 -35, -35 -70, 0 0"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Dial Ticks */}
            <g stroke="#ffffff" strokeWidth="1" strokeOpacity="0.22">
              {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map(
                (deg) => (
                  <line
                    key={`dial-bl-${deg}`}
                    x1="130"
                    y1="0"
                    x2={deg % 45 === 0 ? '142' : '136'}
                    y2="0"
                    transform={`rotate(${deg})`}
                  />
                )
              )}
            </g>
          </g>

          {/* Central Fine Security Waves (Curving behind and around the Mascot) */}
          <g fill="none" stroke="#ffffff" strokeWidth="0.75">
            <path
              d="M -50 200 C 120 240, 240 180, 380 220 C 500 260, 580 230, 650 250"
              strokeOpacity="0.12"
            />
            <path
              d="M -50 220 C 130 260, 250 200, 390 240 C 510 280, 590 250, 650 270"
              strokeOpacity="0.16"
              stroke="#34d399"
            />
            <path
              d="M -50 240 C 140 280, 260 220, 400 260 C 520 300, 600 270, 650 290"
              strokeOpacity="0.10"
            />

            <path
              d="M -50 560 C 120 520, 240 580, 380 540 C 500 500, 580 530, 650 510"
              strokeOpacity="0.12"
            />
            <path
              d="M -50 580 C 130 540, 250 600, 390 560 C 510 520, 590 550, 650 530"
              strokeOpacity="0.16"
              stroke="#34d399"
            />
            <path
              d="M -50 600 C 140 560, 260 620, 400 580 C 520 540, 600 570, 650 550"
              strokeOpacity="0.10"
            />
          </g>

          {/* Microtext Security Ribbons (Bank Grade) */}
          <g
            fontFamily="JetBrains Mono, monospace"
            fontSize="6.5"
            letterSpacing="0.25em"
            fill="#ffffff"
            fillOpacity="0.22"
          >
            <text x="30" y="38">
              VAULTIS SECURE PRIVATE BANKING • INSTITUTIONAL GRADE LEDGER • AES-256
            </text>
            <text x="30" y="780">
              ZERO-KNOWLEDGE VERIFIED • EU CENTRAL COMPLIANCE • SOC2 TYPE II CERTIFIED
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}

export default {
  FintechStatsCorner,
  FintechCashFlowCorner,
  FintechBankPattern,
}
