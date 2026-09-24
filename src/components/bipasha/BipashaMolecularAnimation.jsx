import { useId } from 'react'

/**
 * BipashaMolecularAnimation.jsx
 *
 * Implements domain-specific scientific loading animations:
 * - DTI: Drug molecule -> Target protein -> Interaction network -> Analysis interface
 * - Molecule Lab: Atoms connect -> Molecule forms -> Structure stabilizes -> Lab opens
 * - Medicine Kit: Capsule particles -> Medical inventory grid -> Medicine dashboard
 * - Analytics: Data particles -> Charts form -> Dashboard loads
 * - AI Assistant: Neural network nodes -> Connections activate -> AI interface opens
 * - Drug Analysis: Chemotype scan -> ADMET radar -> Compound profile
 * - Target Analysis: Target sequence -> Binding pocket radar -> 3D pocket topology
 * - Expiry Monitor: Chronological radar scan -> Alert thresholds -> Safety watchlist
 * - Schedule: Circadian wave -> Reminder points -> Timetable
 * - Research Hub: Knowledge graph -> Citations -> Methodology matrix
 */

export default function BipashaMolecularAnimation({ animationType, progress }) {
  const gradientPrefix = useId()

  switch (animationType) {
    case 'dti':
      return <DtiAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'molecules':
      return <MoleculesAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'drugs':
      return <DrugsAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'targets':
      return <TargetsAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'medicines':
      return <MedicinesAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'expiry':
      return <ExpiryAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'schedule':
      return <ScheduleAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'assistant':
      return <AssistantAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'analytics':
      return <AnalyticsAnimation progress={progress} gradientPrefix={gradientPrefix} />
    case 'research':
    default:
      return <ResearchAnimation progress={progress} gradientPrefix={gradientPrefix} />
  }
}

/* 1. DTI Animation: Drug Molecule -> Target Protein -> Interaction Network -> Analysis Interface */
function DtiAnimation({ progress, gradientPrefix }) {
  // Phase 1 (0-30%): Drug ligand coordinates
  // Phase 2 (30-65%): Target protein pocket approaches
  // Phase 3 (65-100%): Dynamic binding interactions form with glowing affinity bonds
  const bondAlpha = Math.min(1, Math.max(0, (progress - 25) / 45))
  const affinityActive = progress > 70

  return (
    <div className="domain-anim dti-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        <defs>
          <linearGradient id={`${gradientPrefix}-ligand`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id={`${gradientPrefix}-target`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id={`${gradientPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Target Protein Cavity (Right side) */}
        <g className="target-protein-group" style={{ transform: `translateX(${(100 - progress) * 0.25}px)` }}>
          <path
            d="M 210,35 Q 265,30 280,75 T 260,135 Q 210,145 195,105 T 210,35 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="url(#${gradientPrefix}-target)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="protein-pocket-contour"
          />
          {/* Target residue nodes */}
          <circle cx="210" cy="45" r="4.5" fill="#38bdf8" filter={`url(#${gradientPrefix}-glow)`} />
          <text x="220" y="48" fill="#94a3b8" fontSize="8" fontFamily="monospace">Tyr104</text>
          <circle cx="255" cy="80" r="5" fill="#6366f1" filter={`url(#${gradientPrefix}-glow)`} />
          <text x="265" y="83" fill="#94a3b8" fontSize="8" fontFamily="monospace">Asp182</text>
          <circle cx="215" cy="120" r="4.5" fill="#818cf8" filter={`url(#${gradientPrefix}-glow)`} />
          <text x="225" y="123" fill="#94a3b8" fontSize="8" fontFamily="monospace">Lys72</text>
        </g>

        {/* Drug Ligand (Left side) */}
        <g className="drug-ligand-group" style={{ transform: `translateX(${progress * 0.35}px)` }}>
          {/* Benzene core */}
          <polygon
            points="70,75 88,64 106,75 106,97 88,108 70,97"
            fill="rgba(52, 211, 153, 0.12)"
            stroke="url(#${gradientPrefix}-ligand)"
            strokeWidth="2"
          />
          {/* Ligand side chains */}
          <line x1="106" y1="75" x2="135" y2="60" stroke="#34d399" strokeWidth="2" />
          <circle cx="135" cy="60" r="5" fill="#10b981" filter={`url(#${gradientPrefix}-glow)`} />
          <line x1="106" y1="97" x2="135" y2="112" stroke="#34d399" strokeWidth="2" />
          <circle cx="135" cy="112" r="5" fill="#10b981" filter={`url(#${gradientPrefix}-glow)`} />
          <line x1="70" y1="75" x2="48" y2="62" stroke="#34d399" strokeWidth="2" />
          <circle cx="48" cy="62" r="4" fill="#6ee7b7" />
          <text x="65" y="132" fill="#6ee7b7" fontSize="9" fontFamily="monospace">LIGAND // SMILES</text>
        </g>

        {/* Interaction Network Bonds (forming dynamically) */}
        {bondAlpha > 0 && (
          <g className="interaction-bonds" opacity={bondAlpha}>
            {/* Hydrogen bond 1 */}
            <line
              x1="135"
              y1="60"
              x2="210"
              y2="45"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="pulse-bond"
            />
            <text x="165" y="47" fill="#fbbf24" fontSize="8" fontFamily="monospace">H-Bond</text>

            {/* Electrostatic bond 2 */}
            <line
              x1="135"
              y1="112"
              x2="215"
              y2="120"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="pulse-bond"
            />
            <text x="160" y="125" fill="#34d399" fontSize="8" fontFamily="monospace">Salt Bridge</text>

            {/* Pi-stacking bond 3 */}
            <line
              x1="106"
              y1="86"
              x2="255"
              y2="80"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="2 4"
            />
          </g>
        )}

        {/* Affinity HUD Overlay */}
        {affinityActive && (
          <g className="affinity-score-badge" style={{ animation: 'fadeScaleIn 0.3s ease-out forwards' }}>
            <rect x="110" y="145" width="100" height="24" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#10b981" strokeWidth="1" />
            <text x="160" y="161" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              pKd ≈ 7.82 ± 0.3
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

/* 2. Molecule Lab Animation: Atoms Connect -> Molecule Forms -> Structure Stabilizes */
function MoleculesAnimation({ progress, gradientPrefix }) {
  const rotationAngle = (progress * 3.6) % 360
  const stabilized = progress > 75

  return (
    <div className="domain-anim molecules-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        <defs>
          <radialGradient id={`${gradientPrefix}-carbon`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <radialGradient id={`${gradientPrefix}-oxygen`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#b91c1c" />
          </radialGradient>
          <radialGradient id={`${gradientPrefix}-nitrogen`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <radialGradient id={`${gradientPrefix}-hydrogen`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
        </defs>

        {/* Coordinate Grid Planes */}
        <g stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1">
          <line x1="20" y1="90" x2="300" y2="90" />
          <line x1="160" y1="15" x2="160" y2="165" />
          <ellipse cx="160" cy="90" rx="90" ry="40" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
        </g>

        {/* 3D Rotating Molecular Complex */}
        <g transform={`translate(160, 90) rotate(${rotationAngle * 0.4})`}>
          {/* Bonds */}
          <line x1="-50" y1="-25" x2="0" y2="-45" stroke="#94a3b8" strokeWidth="4" />
          <line x1="0" y1="-45" x2="50" y2="-25" stroke="#94a3b8" strokeWidth="4" />
          <line x1="50" y1="-25" x2="50" y2="30" stroke="#94a3b8" strokeWidth="4" />
          <line x1="50" y1="30" x2="0" y2="50" stroke="#94a3b8" strokeWidth="4" />
          <line x1="0" y1="50" x2="-50" y2="30" stroke="#94a3b8" strokeWidth="4" />
          <line x1="-50" y1="30" x2="-50" y2="-25" stroke="#94a3b8" strokeWidth="4" />

          {/* Double bond representation */}
          <line x1="-43" y1="-20" x2="-3" y2="-38" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="43" y1="25" x2="3" y2="42" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />

          {/* Functional groups */}
          <line x1="50" y1="-25" x2="85" y2="-45" stroke="#94a3b8" strokeWidth="3" />
          <line x1="85" y1="-45" x2="115" y2="-40" stroke="#94a3b8" strokeWidth="3" />

          {/* Atoms */}
          <circle cx="-50" cy="-25" r="9" fill={`url(#${gradientPrefix}-carbon)`} />
          <circle cx="0" cy="-45" r="9" fill={`url(#${gradientPrefix}-nitrogen)`} />
          <circle cx="50" cy="-25" r="9" fill={`url(#${gradientPrefix}-carbon)`} />
          <circle cx="50" cy="30" r="9" fill={`url(#${gradientPrefix}-carbon)`} />
          <circle cx="0" cy="50" r="9" fill={`url(#${gradientPrefix}-carbon)`} />
          <circle cx="-50" cy="30" r="9" fill={`url(#${gradientPrefix}-carbon)`} />
          <circle cx="85" cy="-45" r="10" fill={`url(#${gradientPrefix}-oxygen)`} />
          <circle cx="115" cy="-40" r="6" fill={`url(#${gradientPrefix}-hydrogen)`} />
        </g>

        {/* Molecular Descriptors Ribbon */}
        {stabilized && (
          <g className="descriptor-tags">
            <rect x="25" y="20" width="75" height="20" rx="3" fill="rgba(15,23,42,0.8)" stroke="#38bdf8" strokeWidth="0.8" />
            <text x="62" y="34" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">MW: 180.16</text>
            <rect x="220" y="20" width="75" height="20" rx="3" fill="rgba(15,23,42,0.8)" stroke="#10b981" strokeWidth="0.8" />
            <text x="257" y="34" fill="#34d399" fontSize="9" fontFamily="monospace" textAnchor="middle">LogP: 1.31</text>
          </g>
        )}
      </svg>
    </div>
  )
}

/* 3. Drug Analysis Animation: Chemotype Scan -> ADMET Radar -> Bioactivity */
function DrugsAnimation({ progress, gradientPrefix }) {
  const scanY = 30 + ((progress * 1.2) % 120)

  return (
    <div className="domain-anim drugs-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Hexagonal ADMET Radar Spider Chart */}
        <g transform="translate(160, 90)">
          {/* Radar background webs */}
          {[60, 45, 30, 15].map((r, i) => (
            <polygon
              key={i}
              points={Array.from({ length: 6 }, (_, idx) => {
                const a = (idx * 60 * Math.PI) / 180
                return `${r * Math.cos(a)},${r * Math.sin(a)}`
              }).join(' ')}
              fill="none"
              stroke="rgba(52, 211, 153, 0.18)"
              strokeWidth="1"
            />
          ))}

          {/* Dynamic ADMET Polygon */}
          <polygon
            points={`
              ${(35 + (progress % 15)) * Math.cos(0)},${(35 + (progress % 15)) * Math.sin(0)}
              ${48 * Math.cos(Math.PI / 3)},${48 * Math.sin(Math.PI / 3)}
              ${42 * Math.cos((2 * Math.PI) / 3)},${42 * Math.sin((2 * Math.PI) / 3)}
              ${(52 - (progress % 10)) * Math.cos(Math.PI)},${(52 - (progress % 10)) * Math.sin(Math.PI)}
              ${38 * Math.cos((4 * Math.PI) / 3)},${38 * Math.sin((4 * Math.PI) / 3)}
              ${50 * Math.cos((5 * Math.PI) / 3)},${50 * Math.sin((5 * Math.PI) / 3)}
            `}
            fill="rgba(16, 185, 129, 0.25)"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Axis Labels */}
          <text x="68" y="4" fill="#94a3b8" fontSize="8" fontFamily="monospace">SOLUBILITY</text>
          <text x="24" y="60" fill="#94a3b8" fontSize="8" fontFamily="monospace">BBB PERM</text>
          <text x="-70" y="60" fill="#94a3b8" fontSize="8" fontFamily="monospace">CYP INHIB</text>
          <text x="-95" y="4" fill="#94a3b8" fontSize="8" fontFamily="monospace">hERG</text>
          <text x="-75" y="-50" fill="#94a3b8" fontSize="8" fontFamily="monospace">ABSORPTION</text>
          <text x="25" y="-50" fill="#94a3b8" fontSize="8" fontFamily="monospace">CLEARANCE</text>
        </g>

        {/* Laser Scanning Beam */}
        <line x1="30" y1={scanY} x2="290" y2={scanY} stroke="#34d399" strokeWidth="1.5" opacity="0.75" />
      </svg>
    </div>
  )
}

/* 4. Target Analysis Animation: Alpha-helix ribbon + Binding pocket radar */
function TargetsAnimation({ progress, gradientPrefix }) {
  const sweepAngle = (progress * 5.4) % 360

  return (
    <div className="domain-anim targets-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Ribbon protein alpha-helix approximation */}
        <path
          d="M 40,90 Q 70,30 100,90 T 160,90 T 220,90 T 280,90"
          fill="none"
          stroke="rgba(99, 102, 241, 0.4)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 40,90 Q 70,30 100,90 T 160,90 T 220,90 T 280,90"
          fill="none"
          stroke="#818cf8"
          strokeWidth="2"
        />

        {/* Active Binding Pocket Target (Center) */}
        <g transform="translate(160, 90)">
          <circle cx="0" cy="0" r="38" fill="rgba(99, 102, 241, 0.08)" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="0" cy="0" r="22" fill="none" stroke="#a5b4fc" strokeWidth="1" />
          <circle cx="0" cy="0" r="6" fill="#4f46e5" />

          {/* Radar sweep beam */}
          <line
            x1="0"
            y1="0"
            x2={38 * Math.cos((sweepAngle * Math.PI) / 180)}
            y2={38 * Math.sin((sweepAngle * Math.PI) / 180)}
            stroke="#c7d2fe"
            strokeWidth="2"
          />
        </g>

        <text x="160" y="155" fill="#a5b4fc" fontSize="9" fontFamily="monospace" textAnchor="middle">
          TARGET POCKET VOLUME // 842 Å³
        </text>
      </svg>
    </div>
  )
}

/* 5. Medicine Kit Animation: Capsule particles -> Medical inventory grid */
function MedicinesAnimation({ progress, gradientPrefix }) {
  return (
    <div className="domain-anim medicines-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        <defs>
          <linearGradient id={`${gradientPrefix}-cap`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* Medical Cabinet Grid Slots */}
        <g stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1">
          {[40, 105, 170, 235].map((x) =>
            [40, 95].map((y) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="50" height="42" rx="4" fill="rgba(255,255,255,0.03)" />
            ))
          )}
        </g>

        {/* Animated Capsule Particles Floating & Docking */}
        <g transform="translate(65, 61) rotate(-25)">
          <rect x="-18" y="-9" width="36" height="18" rx="9" fill={`url(#${gradientPrefix}-cap)`} stroke="#059669" strokeWidth="1" />
        </g>
        <g transform="translate(130, 61) rotate(15)">
          <rect x="-18" y="-9" width="36" height="18" rx="9" fill={`url(#${gradientPrefix}-cap)`} stroke="#059669" strokeWidth="1" />
        </g>
        <g transform="translate(195, 61) rotate(-10)">
          <rect x="-18" y="-9" width="36" height="18" rx="9" fill={`url(#${gradientPrefix}-cap)`} stroke="#059669" strokeWidth="1" />
        </g>

        {/* Inventory Barcode Scan Line */}
        <line x1="30" y1="150" x2="290" y2="150" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" />
        <text x="160" y="165" fill="#6ee7b7" fontSize="9" fontFamily="monospace" textAnchor="middle">
          CABINET SYNC: 18 MEDICINES CATALOGED
        </text>
      </svg>
    </div>
  )
}

/* 6. Expiry Monitor Animation: Chronological Radar Scan -> Safety Watchlist */
function ExpiryAnimation({ progress, gradientPrefix }) {
  const radarRotation = (progress * 4.2) % 360

  return (
    <div className="domain-anim expiry-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Radar Ring */}
        <g transform="translate(160, 85)">
          <circle cx="0" cy="0" r="58" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r="22" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" strokeWidth="1" />

          {/* Sweeping Hand */}
          <line
            x1="0"
            y1="0"
            x2={58 * Math.cos((radarRotation * Math.PI) / 180)}
            y2={58 * Math.sin((radarRotation * Math.PI) / 180)}
            stroke="#fbbf24"
            strokeWidth="2"
          />

          {/* Alert Pips */}
          <circle cx="28" cy="-25" r="4.5" fill="#ef4444" className="pulse-alert" />
          <circle cx="-32" cy="18" r="4" fill="#f59e0b" />
          <circle cx="15" cy="42" r="3.5" fill="#10b981" />
        </g>

        <text x="160" y="162" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">
          SHELF-LIFE AUDIT // 3 ITEMS ON WATCHLIST
        </text>
      </svg>
    </div>
  )
}

/* 7. Schedule Animation: Circadian Routine Wave */
function ScheduleAnimation({ progress, gradientPrefix }) {
  return (
    <div className="domain-anim schedule-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Circadian Rhythm Sinusoidal Wave */}
        <path
          d="M 30,90 Q 75,30 120,90 T 210,90 T 290,90"
          fill="none"
          stroke="rgba(236, 72, 153, 0.35)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 30,90 Q 75,30 120,90 T 210,90 T 290,90"
          fill="none"
          stroke="#f472b6"
          strokeWidth="2"
        />

        {/* Timetable Station Nodes */}
        <g transform="translate(75, 55)">
          <circle cx="0" cy="0" r="7" fill="#ec4899" />
          <text x="0" y="18" fill="#f472b6" fontSize="8" fontFamily="monospace" textAnchor="middle">08:00 AM</text>
        </g>
        <g transform="translate(165, 125)">
          <circle cx="0" cy="0" r="7" fill="#f472b6" />
          <text x="0" y="18" fill="#f472b6" fontSize="8" fontFamily="monospace" textAnchor="middle">02:00 PM</text>
        </g>
        <g transform="translate(255, 55)">
          <circle cx="0" cy="0" r="7" fill="#db2777" />
          <text x="0" y="18" fill="#f472b6" fontSize="8" fontFamily="monospace" textAnchor="middle">08:00 PM</text>
        </g>

        <text x="160" y="165" fill="#fbcfe8" fontSize="9" fontFamily="monospace" textAnchor="middle">
          ROUTINE SYNCHRONIZATION: TIMETABLE ACTIVE
        </text>
      </svg>
    </div>
  )
}

/* 8. AI Assistant Animation: Neural Network Nodes Firing */
function AssistantAnimation({ progress, gradientPrefix }) {
  return (
    <div className="domain-anim assistant-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Neural Layer Synapses */}
        <g stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1.2">
          {/* Input to Hidden 1 */}
          <line x1="60" y1="45" x2="135" y2="35" />
          <line x1="60" y1="45" x2="135" y2="70" />
          <line x1="60" y1="90" x2="135" y2="70" />
          <line x1="60" y1="90" x2="135" y2="105" />
          <line x1="60" y1="135" x2="135" y2="105" />
          <line x1="60" y1="135" x2="135" y2="140" />

          {/* Hidden 1 to Hidden 2 */}
          <line x1="135" y1="35" x2="205" y2="55" />
          <line x1="135" y1="70" x2="205" y2="55" />
          <line x1="135" y1="70" x2="205" y2="115" />
          <line x1="135" y1="105" x2="205" y2="115" />
          <line x1="135" y1="140" x2="205" y2="115" />

          {/* Hidden 2 to Output */}
          <line x1="205" y1="55" x2="270" y2="85" />
          <line x1="205" y1="115" x2="270" y2="85" />
        </g>

        {/* Input Nodes */}
        <circle cx="60" cy="45" r="5" fill="#22d3ee" />
        <circle cx="60" cy="90" r="5" fill="#22d3ee" />
        <circle cx="60" cy="135" r="5" fill="#22d3ee" />

        {/* Hidden Layer 1 */}
        <circle cx="135" cy="35" r="6" fill="#06b6d4" />
        <circle cx="135" cy="70" r="6" fill="#0891b2" />
        <circle cx="135" cy="105" r="6" fill="#06b6d4" />
        <circle cx="135" cy="140" r="6" fill="#0891b2" />

        {/* Hidden Layer 2 */}
        <circle cx="205" cy="55" r="6.5" fill="#0284c7" />
        <circle cx="205" cy="115" r="6.5" fill="#0284c7" />

        {/* Output Node (Bipasha Core) */}
        <circle cx="270" cy="85" r="9" fill="#10b981" />
        <circle cx="270" cy="85" r="14" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />

        <text x="160" y="165" fill="#67e8f9" fontSize="9" fontFamily="monospace" textAnchor="middle">
          NEURAL REASONING ENGINE // BIO-KNOWLEDGE GRAPH ONLINE
        </text>
      </svg>
    </div>
  )
}

/* 9. Analytics Animation: Data Scatter Plot -> Regression Curve */
function AnalyticsAnimation({ progress, gradientPrefix }) {
  const points = [
    { x: 50, y: 130 }, { x: 80, y: 115 }, { x: 110, y: 100 },
    { x: 140, y: 88 }, { x: 170, y: 68 }, { x: 200, y: 55 },
    { x: 230, y: 45 }, { x: 260, y: 35 },
  ]

  return (
    <div className="domain-anim analytics-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Grid lines */}
        <g stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1">
          <line x1="40" y1="25" x2="40" y2="140" />
          <line x1="40" y1="140" x2="280" y2="140" />
          <line x1="40" y1="80" x2="280" y2="80" strokeDasharray="2 2" />
        </g>

        {/* Regression Curve */}
        <path
          d="M 40,135 C 100,120 180,60 270,30"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.5"
        />

        {/* Scatter Points */}
        {points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#3b82f6" />
        ))}

        <text x="160" y="162" fill="#93c5fd" fontSize="9" fontFamily="monospace" textAnchor="middle">
          ROC-AUC BENCHMARK: 0.892 · PRECISION-RECALL OPTIMIZED
        </text>
      </svg>
    </div>
  )
}

/* 10. Research Hub Animation: Knowledge Graph & Literature Nodes */
function ResearchAnimation({ progress, gradientPrefix }) {
  return (
    <div className="domain-anim research-anim">
      <svg viewBox="0 0 320 180" className="domain-svg" aria-hidden="true">
        {/* Knowledge Mesh Lines */}
        <g stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.2">
          <line x1="80" y1="85" x2="160" y2="50" />
          <line x1="80" y1="85" x2="160" y2="120" />
          <line x1="160" y1="50" x2="240" y2="85" />
          <line x1="160" y1="120" x2="240" y2="85" />
          <line x1="160" y1="50" x2="160" y2="120" strokeDasharray="3 3" />
        </g>

        {/* Nodes with Badges */}
        <g transform="translate(80, 85)">
          <circle cx="0" cy="0" r="14" fill="#a855f7" />
          <text x="0" y="4" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">PDB</text>
        </g>
        <g transform="translate(160, 50)">
          <circle cx="0" cy="0" r="16" fill="#9333ea" />
          <text x="0" y="4" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ChEMBL</text>
        </g>
        <g transform="translate(160, 120)">
          <circle cx="0" cy="0" r="15" fill="#7e22ce" />
          <text x="0" y="4" fill="#fff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SwissADME</text>
        </g>
        <g transform="translate(240, 85)">
          <circle cx="0" cy="0" r="14" fill="#a855f7" />
          <text x="0" y="4" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">GROMACS</text>
        </g>

        <text x="160" y="162" fill="#d8b4fe" fontSize="9" fontFamily="monospace" textAnchor="middle">
          METHODOLOGY MATRIX // REPRODUCIBLE REPOSITORY
        </text>
      </svg>
    </div>
  )
}
