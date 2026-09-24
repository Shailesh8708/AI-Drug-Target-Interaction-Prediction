import { useEffect, useRef } from 'react'
import { useBipasha } from './BipashaContext'
import BipashaOrb from './BipashaOrb'
import BipashaPanel from './BipashaPanel'
import BipashaLoading from './BipashaLoading'

export default function BipashaAgent() {
  const { isOpen, setIsOpen, toggleOpen, activeLoadingAction } = useBipasha()
  const agentRef = useRef(null)

  // Keyboard navigation & accessibility controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape closes the panel
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
      // Alt + B toggles Bipasha Mam
      if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        toggleOpen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen, toggleOpen])

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        agentRef.current &&
        !agentRef.current.contains(e.target) &&
        !activeLoadingAction
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen, activeLoadingAction])

  return (
    <div
      ref={agentRef}
      className={`bipasha-agent-root ${isOpen ? 'agent-expanded' : 'agent-collapsed'}`}
      aria-live="polite"
    >
      {/* Floating 3D AI Orb at Bottom-Right */}
      <BipashaOrb />

      {/* Expandable Glassmorphic Agent Panel */}
      <BipashaPanel />

      {/* Cinematic Staged Loading Overlay */}
      <BipashaLoading />
    </div>
  )
}
