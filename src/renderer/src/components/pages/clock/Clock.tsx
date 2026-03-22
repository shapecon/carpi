import { useEffect, useState } from 'react'
import { useRoundLayoutMetrics } from '@renderer/hooks'

const CX = 100
const CY = 100
const R = 78 // face radius

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

function getAngles() {
  const now = new Date()
  const ms = now.getMilliseconds()
  const s = now.getSeconds() + ms / 1000
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60
  return {
    min: (m / 60) * 360,
    hr: (h / 12) * 360
  }
}

// Porsche-style flat tapered hand via rotated polygon
function Hand({
  angle,
  tipLen,
  backLen,
  halfW
}: {
  angle: number
  tipLen: number
  backLen: number
  halfW: number
}) {
  // Shape in local coords (y-up), then rotate around CX,CY
  // Points: tip → right shoulder → back-right → back-left → left shoulder
  const pts = [
    [0, -tipLen],
    [halfW * 0.55, -tipLen * 0.28],
    [halfW, backLen * 0.5],
    [halfW * 0.7, backLen],
    [-halfW * 0.7, backLen],
    [-halfW, backLen * 0.5],
    [-halfW * 0.55, -tipLen * 0.28]
  ]
    .map(([x, y]) => `${CX + x},${CY + y}`)
    .join(' ')

  return <polygon points={pts} fill="#e01a10" transform={`rotate(${angle}, ${CX}, ${CY})`} />
}

export const Clock = () => {
  const [angles, setAngles] = useState(getAngles)
  const { isRoundDisplay } = useRoundLayoutMetrics()

  useEffect(() => {
    const id = setInterval(() => setAngles(getAngles()), 100)
    return () => clearInterval(id)
  }, [])

  const svgSize = isRoundDisplay ? '86%' : '84%'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000'
      }}
    >
      <svg
        viewBox="0 0 200 200"
        style={{ width: svgSize, height: svgSize }}
        aria-label="Analog clock"
      >
        <defs>
          {/* Bezel: charcoal with subtle edge lightening */}
          <radialGradient id="bezel" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="60%" stopColor="#1e1e1e" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>

          {/* Face: deep matte black */}
          <radialGradient id="face" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#161616" />
            <stop offset="100%" stopColor="#020202" />
          </radialGradient>

          {/* Center cap: brushed aluminium */}
          <radialGradient id="cap" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="45%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#666" />
          </radialGradient>

          {/* Stud: decorative rivet */}
          <radialGradient id="stud" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#444" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
        </defs>

        {/* ── Outer bezel ── */}
        <circle cx={CX} cy={CY} r={R + 16} fill="url(#bezel)" />
        {/* Highlight ring on top of bezel */}
        <circle cx={CX} cy={CY} r={R + 15.5} fill="none" stroke="#505050" strokeWidth={0.5} />
        {/* Inner bezel separator */}
        <circle cx={CX} cy={CY} r={R + 1} fill="none" stroke="#404040" strokeWidth={0.8} />

        {/* ── Clock face ── */}
        <circle cx={CX} cy={CY} r={R} fill="url(#face)" />

        {/* ── Minute markers (thin lines, 60 total) ── */}
        {Array.from({ length: 60 }, (_, i) => {
          if (i % 5 === 0) return null
          const angle = (i / 60) * 360
          const outer = polar(angle, R - 1)
          const inner = polar(angle, R - 6)
          return (
            <line
              key={i}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="#aaaaaa"
              strokeWidth={0.6}
              strokeLinecap="butt"
            />
          )
        })}

        {/* ── Hour baton markers ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 360
          const isQuarter = i % 3 === 0
          const outerR = R - 1
          const innerR = isQuarter ? R - 14 : R - 10
          const outer = polar(angle, outerR)
          const inner = polar(angle, innerR)
          return (
            <line
              key={i}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="#ffffff"
              strokeWidth={isQuarter ? 3.2 : 1.8}
              strokeLinecap="butt"
            />
          )
        })}

        {/* ── Numerals 12 / 3 / 6 / 9 ── */}
        {(
          [
            { label: '12', angle: 0, r: R - 22 },
            { label: '3', angle: 90, r: R - 22 },
            { label: '6', angle: 180, r: R - 22 },
            { label: '9', angle: 270, r: R - 22 }
          ] as const
        ).map(({ label, angle, r }) => {
          const p = polar(angle, r)
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={label === '12' ? 10 : 11}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              fontWeight="400"
            >
              {label}
            </text>
          )
        })}

        {/* ── Hour hand (red, short & wide) ── */}
        <Hand angle={angles.hr} tipLen={46} backLen={12} halfW={3.8} />

        {/* ── Minute hand (red, long & thinner) ── */}
        <Hand angle={angles.min} tipLen={66} backLen={11} halfW={2.6} />

        {/* ── Center cap (aluminium) ── */}
        <circle cx={CX} cy={CY} r={7.5} fill="url(#cap)" />
        <circle cx={CX} cy={CY} r={7.5} fill="none" stroke="#888" strokeWidth={0.5} />
        <circle cx={CX} cy={CY} r={2.2} fill="#777" />
      </svg>
    </div>
  )
}
