import { useState, useMemo } from 'react'
import { FlaskConical, Filter, ExternalLink, ArrowUpDown } from 'lucide-react'

export default function BioactivityIntelligencePanel({ drug }) {
  const bioactivityRecords = drug?.bioactivityRecords || []

  const [targetFilter, setTargetFilter] = useState('ALL')
  const [activityTypeFilter, setActivityTypeFilter] = useState('ALL')
  const [organismFilter, setOrganismFilter] = useState('ALL')

  // Extract unique options
  const targetOptions = useMemo(() => {
    const set = new Set(bioactivityRecords.map((r) => r.target).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [bioactivityRecords])

  const activityTypeOptions = useMemo(() => {
    const set = new Set(bioactivityRecords.map((r) => r.type).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [bioactivityRecords])

  const organismOptions = useMemo(() => {
    const set = new Set(bioactivityRecords.map((r) => r.organism).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [bioactivityRecords])

  // Filtered records
  const filteredRecords = useMemo(() => {
    return bioactivityRecords.filter((r) => {
      if (targetFilter !== 'ALL' && r.target !== targetFilter) return false
      if (activityTypeFilter !== 'ALL' && r.type !== activityTypeFilter) return false
      if (organismFilter !== 'ALL' && r.organism !== organismFilter) return false
      return true
    })
  }, [bioactivityRecords, targetFilter, activityTypeFilter, organismFilter])

  return (
    <div className="structure-panel-box">
      <div className="panel-subheading">
        <h3>
          <FlaskConical size={17} color="#10b981" />
          Bioactivity Intelligence Matrix
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {filteredRecords.length} / {bioactivityRecords.length} Assays Documented
        </span>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <Filter size={13} />
          <span>Filters:</span>
        </div>

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}
        >
          {targetOptions.map((opt) => (
            <option key={opt} value={opt}>
              Target: {opt}
            </option>
          ))}
        </select>

        <select
          value={activityTypeFilter}
          onChange={(e) => setActivityTypeFilter(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}
        >
          {activityTypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              Type: {opt}
            </option>
          ))}
        </select>

        <select
          value={organismFilter}
          onChange={(e) => setOrganismFilter(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}
        >
          {organismOptions.map((opt) => (
            <option key={opt} value={opt}>
              Organism: {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Bioactivity Table */}
      <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
        <table className="coverage-matrix-table">
          <thead>
            <tr>
              <th>Target Name</th>
              <th>Organism</th>
              <th>Assay Type</th>
              <th>Metric</th>
              <th>Potency / Value</th>
              <th>Confidence / Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r, i) => {
                const isHighPotency =
                  r.unit === 'nM' && Number(r.value) < 100
                return (
                  <tr key={i}>
                    <td>
                      <strong style={{ color: '#38bdf8' }}>{r.target}</strong>
                    </td>
                    <td>{r.organism || 'Homo sapiens'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{r.assay || 'Binding affinity'}</td>
                    <td>
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isHighPotency ? '#10b981' : '#f1f5f9',
                        }}
                      >
                        {r.value} {r.unit}
                      </span>
                    </td>
                    <td>
                      <span className="evidence-badge curated">
                        {r.source || 'ChEMBL Curated'}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>
                  No bioactivity assays match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
