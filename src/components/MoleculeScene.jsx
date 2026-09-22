import { useEffect, useRef } from 'react'

const nodes = [
  [56, 35, 'node-coral'], [30, 49, 'node-blue'], [72, 58, 'node-green'], [47, 70, 'node-orange'], [84, 30, 'node-blue'], [18, 22, 'node-green'], [61, 84, 'node-coral'], [93, 73, 'node-green'],
]
const bonds = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [2, 7], [3, 6], [4, 7], [5, 0]]
const particles = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61 + 8) % 100}%`,
  delay: `${(index % 7) * -0.7}s`,
  size: `${index % 3 === 0 ? 3 : 2}px`,
}))

export default function MoleculeScene() {
  const ref = useRef(null)
  useEffect(() => {
    const element = ref.current
    let frame
    let angle = 0
    let pointerX = 0
    let pointerY = 0
    const handlePointerMove = (event) => {
      const bounds = element.getBoundingClientRect()
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      element.style.setProperty('--pointer-x', `${pointerX}`)
      element.style.setProperty('--pointer-y', `${pointerY}`)
    }
    const resetPointer = () => {
      element.style.setProperty('--pointer-x', '0')
      element.style.setProperty('--pointer-y', '0')
    }
    const tick = () => {
      angle += 0.0018
      element.style.setProperty('--drift', `${Math.sin(angle) * 3}px`)
      element.style.setProperty('--orbit-angle', `${angle * 14}deg`)
      frame = requestAnimationFrame(tick)
    }
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerleave', resetPointer)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerleave', resetPointer)
    }
  }, [])
  return <div className="molecule-scene" ref={ref} aria-label="Decorative molecular network visualization" role="img">
    <div className="scene-grid" />
    <div className="scene-glow" />
    <div className="scene-ring ring-one" />
    <div className="scene-ring ring-two" />
    <div className="scene-ring ring-three" />
    <div className="scan-beam" />
    <div className="particle-field" aria-hidden="true">{particles.map((particle, index) => <span key={index} style={{ '--particle-left': particle.left, '--particle-top': particle.top, '--particle-delay': particle.delay, '--particle-size': particle.size }} />)}</div>
    <div className="molecule-core" aria-hidden="true"><span className="core-shell shell-a" /><span className="core-shell shell-b" /><span className="core-spark" /></div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{bonds.map(([from, to]) => <line key={`${from}-${to}`} x1={nodes[from][0]} y1={nodes[from][1]} x2={nodes[to][0]} y2={nodes[to][1]} />)}{nodes.map(([x, y, tone], index) => <g key={`${x}-${y}`} className={tone}><circle className="bond-node" cx={x} cy={y} r={index % 3 === 0 ? 2.3 : 1.6} /><circle className="node-halo" cx={x} cy={y} r="5" /></g>)}</svg>
    <span className="scene-label label-top">MOLECULAR<br /><strong>NETWORK</strong></span><span className="scene-label label-bottom">LIVE CANVAS <i /></span><span className="scene-readout readout-top">ROTATION <strong>14.8°</strong></span><span className="scene-readout readout-bottom">NODES <strong>08</strong></span>
  </div>
}
