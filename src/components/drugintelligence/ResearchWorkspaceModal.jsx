import { useState, useEffect } from 'react'
import { Bookmark, FileText, Trash2, Plus, X, ArrowUpRight, Check } from 'lucide-react'
import {
  getFavorites,
  toggleFavorite,
  getDrugNotes,
  addDrugNote,
  deleteDrugNote,
} from '../../services/drugIntelligenceService.js'

export default function ResearchWorkspaceModal({ drug, onSelectDrug, onClose }) {
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'favorites'
  const [notes, setNotes] = useState([])
  const [newNoteText, setNewNoteText] = useState('')
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    if (drug?.id) {
      setNotes(getDrugNotes(drug.id))
    }
    setFavorites(getFavorites())
  }, [drug])

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNoteText.trim() || !drug?.id) return
    const added = addDrugNote(drug.id, newNoteText)
    if (added) {
      setNotes([added, ...notes])
      setNewNoteText('')
    }
  }

  const handleDeleteNote = (noteId) => {
    if (!drug?.id) return
    deleteDrugNote(drug.id, noteId)
    setNotes(notes.filter((n) => n.id !== noteId))
  }

  const handleRemoveFavorite = (favDrug) => {
    toggleFavorite(favDrug)
    setFavorites(getFavorites())
  }

  return (
    <div className="intel-modal-backdrop" onClick={onClose}>
      <div className="intel-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="intel-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
              Research Workspace & Laboratory Notebook
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.4rem' }}>
          <button
            className={`intel-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileText size={15} /> Notes on {drug?.name?.split(' ')[0] || 'Drug'} ({notes.length})
          </button>
          <button
            className={`intel-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Bookmark size={15} /> Bookmarked Drugs ({favorites.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'notes' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Add note form */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                rows={3}
                placeholder={`Record personal experimental notes, assay observations, or synthesis hypotheses for ${drug?.name || 'this drug'}...`}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(71, 85, 105, 0.6)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <button
                type="submit"
                className="action-btn-pill primary"
                disabled={!newNoteText.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                <Plus size={15} /> Add Notebook Entry
              </button>
            </form>

            {/* Notes list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto' }}>
              {notes.length > 0 ? (
                notes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid rgba(51, 65, 85, 0.4)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {n.text}
                      </p>
                      <small style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>
                        Logged by {n.author} · {new Date(n.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      title="Delete note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No research notes recorded yet for this compound.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '380px', overflowY: 'auto' }}>
            {favorites.length > 0 ? (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(51, 65, 85, 0.4)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{fav.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {fav.class} · {fav.formula || ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="action-btn-pill"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      onClick={() => {
                        onSelectDrug(fav.id)
                        onClose()
                      }}
                    >
                      Load <ArrowUpRight size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(fav)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      title="Remove bookmark"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No compounds bookmarked yet. Click "Bookmark" in the drug banner to pin compounds to your workspace.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
