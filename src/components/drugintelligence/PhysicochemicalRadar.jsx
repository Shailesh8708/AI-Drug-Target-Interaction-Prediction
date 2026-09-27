import { useMemo } from 'react'

export default function PhysicochemicalRadar({ drug }) {
  const radarData = useMemo(() => {
    if (!drug) return []

    // Normalize metrics between 0 and 1
    // LogP: optimal 0 to 3 -> range -2 to 6
    const logP = drug.logP ?? 1.5
    const normLogP = Math.max(0.1, Math.min(1, (logP + 2) / 8))

    // Polarity: TPSA 20 to 130
    const tpsa = drug.tpsa ?? 60
    const normTPSA = Math.max(0.1, Math.min(1, tpsa / 150))

    // Solubility: LogS -6 to 0
    const logS = -3.5
    const normSol = Math.max(0.1, Math.min(1, (logS + 6) / 6))

    // Size: MW 100 to 600
    const mw = drug.mw ?? 300
    const normSize = Math.max(0.1, Math.min(1, mw / 600))

    // Flexibility: Rotatable bonds 0 to 12
    const rot = drug.rotatableBonds ?? 3
    const normFlex = Math.max(0.1, Math.min(1, rot / 12))

    // H-Bonding: (HBD+HBA) 0 to 15
    const hb = (drug.hbd ?? 1) + (drug.hba ?? 3)
    const normHB = Math.max(0.1, Math.min(1, hb / 15))

    // Saturation / Complexity: Rings + Carbons
    const rings = drug.aromaticRings ?? 1
    const normSat = Math.max(0.1, Math.min(1, (rings + 1) / 5))

    return [
      { label: 'Lipophilicity', value: normLogP, raw: `${logP.toFixed(1)} LogP` },
      { label: 'Polarity', value: normTPSA, raw: `${tpsa} Å²` },
      { label: 'Solubility', value: normSol, raw: `${drug.solubility || '-3.2 LogS'}` },
      { label: 'Molecular Size', value: normSize, raw: `${mw.toFixed(0)} Da` },
      { label: 'Flexibility', value: normFlex, raw: `${rot} RotBonds` },
      { label: 'H-Bonding', value: normHB, raw: `${hb} Donors/Acc` },
      { label: 'Aromaticity', value: normSat, raw: `${rings} Rings` },
    ]
  }, [drug])

  // Center & Radius for 300x300 viewBox
  const cx = 150
  const cy = 150
  const r = 95

  const totalAxes = radarData.length
  const angleStep = (Math.PI * 2) / totalAxes

  // Web rings at 0.25, 0.5, 0.75, 1.0
  const levels = [0.25, 0.5, 0.75, 1.0]

  // Compute Drug Polygon Points
  const polygonPoints = radarData
    .map((item, i) => {
      const angle = i * angleStep - Math.PI / 2
      const pointR = r * item.value
      const x = cx + pointR * Math.cos(angle)
      const y = cy + pointR * Math.sin(angle)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  // Ideal Bioavailability Range polygon (0.35 to 0.75)
  const idealPoints = radarData
    .map((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      const pointR = r * 0.6
      const x = cx + pointR * Math.cos(angle)
      const y = cy + pointR * Math.sin(angle)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="structure-panel-box" style={{ alignItems: 'center' }}>
      <div className="panel-subheading" style={{ width: '100%' }}>
        <h3>Physicochemical Radar</h3>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Optimal Bioavailability Envelope</span>
      </div>

      <div className="physchem-radar-wrap">
        <svg className="radar-chart-svg" viewBox="0 0 300 300">
          {/* Circular/Polygon Web Levels */}
          {levels.map((lvl) => {
            const levelPoints = radarData
              .map((_, i) => {
                const angle = i * angleStep - Math.PI / 2
                const pointR = r * lvl
                const x = cx + pointR * Math.cos(angle)
                const y = cy + pointR * Math.sin(angle)
                return `${x},${y}`
              })
              .join(' ')

            return (
              <polygon
                key={`lvl-${lvl}`}
                points={levelPoints}
                fill="none"
                stroke="rgba(51, 65, 85, 0.4)"
                strokeWidth={1}
                strokeDasharray={lvl === 1.0 ? 'none' : '3,3'}
              />
            )
          })}

          {/* Spoke Axes */}
          {radarData.map((item, i) => {
            const angle = i * angleStep - Math.PI / 2
            const x = cx + r * Math.cos(angle)
            const y = cy + r * Math.sin(angle)

            // Label coordinate
            const labelR = r + 24
            const lx = cx + labelR * Math.cos(angle)
            const ly = cy + labelR * Math.sin(angle)

            return (
              <g key={`axis-${i}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="rgba(71, 85, 105, 0.4)"
                  strokeWidth={1}
                />
                <text
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                  fontWeight="600"
                >
                  {item.label}
                </text>
              </g>
            )
          })}

          {/* Ideal Bioavailability Corridor */}
          <polygon
            points={idealPoints}
            fill="rgba(56, 189, 248, 0.05)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />

          {/* Actual Drug Radar Area */}
          <polygon
            points={polygonPoints}
            fill="rgba(16, 185, 129, 0.25)"
            stroke="#10b981"
            strokeWidth={2}
          />

          {/* Vertex dots */}
          {radarData.map((item, i) => {
            const angle = i * angleStep - Math.PI / 2
            const pointR = r * item.value
            const x = cx + pointR * Math.cos(angle)
            const y = cy + pointR * Math.sin(angle)

            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={3.5}
                fill="#10b981"
                stroke="#0f172a"
                strokeWidth={1.5}
              />
            )
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '11px', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
          <span>Compound Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', border: '1px dashed #38bdf8', borderRadius: '2px' }} />
          <span>Optimal Drug Space</span>
        </div>
      </div>
    </div>
  )
}
