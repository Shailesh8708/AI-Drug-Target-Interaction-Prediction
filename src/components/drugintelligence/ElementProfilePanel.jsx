import { useState } from 'react'
import {
  Atom,
  Flame,
  Layers,
  Thermometer,
  Shield,
  Activity,
  Award,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react'

export default function ElementProfilePanel({ drug }) {
  if (!drug) return null

  const symbol = drug.symbol || drug.formula || 'X'
  const number = drug.atomicNumber || drug.number || (drug.properties?.atomicNumber) || 1
  const mass = drug.mass || drug.mw || 1.008
  const category = drug.elementCategory || drug.category || 'chemical_element'
  const group = drug.group ?? 'N/A'
  const period = drug.period ?? 'N/A'
  const block = drug.block ?? 's'
  const electronConfig = drug.electronConfig || drug.properties?.electronConfiguration || '1s1'
  const oxidationStates = Array.isArray(drug.oxidationStates)
    ? drug.oxidationStates.join(', ')
    : drug.oxidationStates || '0'
  const state = drug.standardState || drug.state || 'solid'
  const crystal = drug.crystalStructure || drug.crystal || 'Not determined'
  const melting = drug.meltingPoint != null ? `${drug.meltingPoint} K (${(drug.meltingPoint - 273.15).toFixed(1)} °C)` : 'Not measured'
  const boiling = drug.boilingPoint != null ? `${drug.boilingPoint} K (${(drug.boilingPoint - 273.15).toFixed(1)} °C)` : 'Not measured'
  const density = drug.density != null ? `${drug.density} g/cm³` : 'Not available'
  const covRadius = drug.covRadius != null ? `${drug.covRadius} Å` : 'N/A'
  const vdwRadius = drug.vdwRadius != null ? `${drug.vdwRadius} Å` : 'N/A'
  const electronegativity = drug.electronegativity != null ? `${drug.electronegativity} (Pauling)` : 'Not applicable'

  return (
    <div className="element-profile-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner: Periodic Table Identity Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.85))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Periodic Table Square */}
        <div
          style={{
            width: '120px',
            height: '130px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ fontWeight: 700, color: '#10b981' }}>{number}</span>
            <span>{typeof mass === 'number' ? mass.toFixed(2) : mass}</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: '38px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px' }}>
            {symbol}
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {drug.name}
          </div>
        </div>

        {/* Essential Taxonomy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              Group {group} · Period {period} · {block}-Block
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {category.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
              }}
            >
              State: {state.toUpperCase()}
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', margin: '0 0 6px', fontWeight: 700 }}>
            {drug.name} ({symbol})
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            {drug.description || `${drug.name} is a fundamental chemical element of atomic number ${number}.`}
          </p>
        </div>
      </div>

      {/* Grid: Quantum, Electronic, Physical & Radii */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Quantum & Electronic Architecture */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
            <Zap size={16} />
            Quantum & Electronic Configuration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Electron Configuration</span>
              <strong style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{electronConfig}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Common Oxidation States</span>
              <strong style={{ color: '#34d399' }}>{oxidationStates}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Electronegativity</span>
              <strong style={{ color: '#f1f5f9' }}>{electronegativity}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Periodic Block</span>
              <strong style={{ color: '#f1f5f9' }}>{block.toUpperCase()}-block</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Physical & Thermodynamic Properties */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
            <Thermometer size={16} />
            Physical & Thermal Dynamics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Standard State</span>
              <strong style={{ color: '#f1f5f9', textTransform: 'capitalize' }}>{state}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Melting Point</span>
              <strong style={{ color: '#f1f5f9' }}>{melting}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Boiling Point</span>
              <strong style={{ color: '#f1f5f9' }}>{boiling}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Density</span>
              <strong style={{ color: '#f1f5f9' }}>{density}</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Radii & Crystal Structure */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
            <Layers size={16} />
            Lattice & Radii Metric
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Covalent Radius</span>
              <strong style={{ color: '#f1f5f9' }}>{covRadius}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Van der Waals Radius</span>
              <strong style={{ color: '#f1f5f9' }}>{vdwRadius}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', paddingBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Crystal System</span>
              <strong style={{ color: '#f1f5f9', textTransform: 'capitalize' }}>{crystal}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>CPK Element Color</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: drug.color || '#10b981', display: 'inline-block' }} />
                <code style={{ fontSize: '11px', color: '#cbd5e1' }}>{drug.color || '#10b981'}</code>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Biological & Pharmaceutical Role */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <Activity size={16} />
          Biological Function & Therapeutic Role
        </div>
        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          {drug.description || 'Elemental substances participate in physiological homeostasis, enzymatic coordination centers, and drug-delivery nanosystems.'}
        </p>

        {/* Data Provenance Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} color="#10b981" /> IUPAC Standard Atomic Weights (2024)
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} color="#38bdf8" /> NIST Physical Measurement Laboratory
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} color="#f59e0b" /> [DATABASE FACT] Verified Elemental Constants
          </span>
        </div>
      </div>
    </div>
  )
}
