import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

const CHAIN_COLORS = ['#ef7869', '#55a9bd', '#397654', '#d68b38', '#8f75b5', '#bd6388']

export default function ProteinWebGLViewer({ protein, representation, selectedResidue, onResidueSelect, visibleChains }) {
  const hostRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneStateRef = useRef(null)
  const [webglError, setWebglError] = useState('')

  useEffect(() => {
    const host = hostRef.current
    if (!host || !protein.atoms.length) return undefined
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      setWebglError('WebGL is unavailable in this browser. The structure cannot be rendered with the GPU viewer.')
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x0d1d1a, 1)
    host.replaceChildren(renderer.domElement)
    renderer.domElement.className = 'protein-webgl-canvas'
    renderer.domElement.setAttribute('aria-label', 'Interactive WebGL protein structure viewer')
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000)
    const group = new THREE.Group()
    scene.add(group)
    const visibleAtoms = protein.atoms.filter((atom) => visibleChains.has(atom.chainId))
    if (!visibleAtoms.length) { renderer.dispose(); return undefined }
    const center = visibleAtoms.reduce((sum, atom) => ({ x: sum.x + atom.x, y: sum.y + atom.y, z: sum.z + atom.z }), { x: 0, y: 0, z: 0 })
    center.x /= visibleAtoms.length; center.y /= visibleAtoms.length; center.z /= visibleAtoms.length
    const positions = visibleAtoms.map((atom) => new THREE.Vector3(atom.x - center.x, atom.y - center.y, atom.z - center.z))
    const radius = Math.max(...positions.map((point) => point.length()), 12)
    const chainIndex = new Map(protein.chains.map((chain, index) => [chain.id, index]))
    const colors = []
    positions.forEach((_, index) => {
      const atom = visibleAtoms[index]
      const color = new THREE.Color(atom.record === 'HETATM' ? '#efaf65' : CHAIN_COLORS[chainIndex.get(atom.chainId) % CHAIN_COLORS.length])
      if (selectedResidue && atom.residueId === selectedResidue) color.set('#ffffff')
      colors.push(color.r, color.g, color.b)
    })
    const pointGeometry = new THREE.BufferGeometry()
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions.flatMap((point) => [point.x, point.y, point.z]), 3))
    pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    const pointMaterial = new THREE.PointsMaterial({ size: representation === 'ball-stick' ? 0.8 : representation === 'surface' ? 1.8 : 0.42, vertexColors: true, transparent: representation === 'surface', opacity: representation === 'surface' ? 0.18 : 0.95, sizeAttenuation: true })
    const points = new THREE.Points(pointGeometry, pointMaterial)
    group.add(points)

    if (representation === 'cartoon' || representation === 'backbone') {
      protein.chains.forEach((chain, index) => {
        if (!visibleChains.has(chain.id)) return
        const chainAtoms = visibleAtoms.filter((atom) => atom.chainId === chain.id)
        const residues = [...new Map(chainAtoms.map((atom) => [atom.residueId, atom])).values()]
        const lineGeometry = new THREE.BufferGeometry()
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(residues.flatMap((atom) => [atom.x - center.x, atom.y - center.y, atom.z - center.z]), 3))
        const lineMaterial = new THREE.LineBasicMaterial({ color: CHAIN_COLORS[index % CHAIN_COLORS.length], transparent: true, opacity: representation === 'cartoon' ? 0.9 : 0.7, linewidth: representation === 'cartoon' ? 4 : 1 })
        group.add(new THREE.Line(lineGeometry, lineMaterial))
      })
    }

    const resize = () => { const width = host.clientWidth || 640; const height = host.clientHeight || 420; renderer.setSize(width, height, false); camera.aspect = width / height; camera.fov = 45; camera.position.set(0, 0, radius * 2.25); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix() }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points.threshold = Math.max(radius / 45, 0.5)
    const pointer = new THREE.Vector2()
    let animationFrame = 0
    let dragging = false
    let previous = { x: 0, y: 0 }
    const handlePointerDown = (event) => { dragging = true; previous = { x: event.clientX, y: event.clientY }; renderer.domElement.setPointerCapture?.(event.pointerId) }
    const handlePointerMove = (event) => { if (!dragging) return; group.rotation.y += (event.clientX - previous.x) * 0.008; group.rotation.x += (event.clientY - previous.y) * 0.008; previous = { x: event.clientX, y: event.clientY } }
    const handlePointerUp = () => { dragging = false }
    const handleWheel = (event) => { event.preventDefault(); camera.position.z = Math.min(radius * 6, Math.max(radius * 0.65, camera.position.z + event.deltaY * radius * 0.0015)) }
    const handleClick = (event) => { if (Math.abs(event.clientX - previous.x) > 4 || Math.abs(event.clientY - previous.y) > 4) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObject(points)[0]; if (hit && visibleAtoms[hit.index]) onResidueSelect(visibleAtoms[hit.index].residueId) }
    renderer.domElement.addEventListener('pointerdown', handlePointerDown); renderer.domElement.addEventListener('pointermove', handlePointerMove); renderer.domElement.addEventListener('pointerup', handlePointerUp); renderer.domElement.addEventListener('pointerleave', handlePointerUp); renderer.domElement.addEventListener('wheel', handleWheel, { passive: false }); renderer.domElement.addEventListener('click', handleClick)
    const animate = () => { renderer.render(scene, camera); animationFrame = requestAnimationFrame(animate) }
    animate()
    sceneStateRef.current = { group, camera, radius }
    return () => { cancelAnimationFrame(animationFrame); resizeObserver.disconnect(); renderer.domElement.removeEventListener('pointerdown', handlePointerDown); renderer.domElement.removeEventListener('pointermove', handlePointerMove); renderer.domElement.removeEventListener('pointerup', handlePointerUp); renderer.domElement.removeEventListener('pointerleave', handlePointerUp); renderer.domElement.removeEventListener('wheel', handleWheel); renderer.domElement.removeEventListener('click', handleClick); pointGeometry.dispose(); pointMaterial.dispose(); group.traverse((object) => { if (object.geometry) object.geometry.dispose(); if (object.material) object.material.dispose() }); renderer.dispose(); rendererRef.current = null }
  }, [protein, representation, selectedResidue, visibleChains, onResidueSelect])

  const resetCamera = () => { const state = sceneStateRef.current; if (!state) return; state.group.rotation.set(0, 0, 0); state.camera.position.set(0, 0, state.radius * 2.25) }
  const zoom = (amount) => { const state = sceneStateRef.current; if (!state) return; state.camera.position.z = Math.min(state.radius * 6, Math.max(state.radius * 0.65, state.camera.position.z + amount * state.radius * 0.18)) }
  const fit = () => { const state = sceneStateRef.current; if (!state) return; state.camera.position.set(0, 0, state.radius * 2.25); state.camera.lookAt(0, 0, 0) }
  if (webglError) return <div className="protein-webgl-fallback"><strong>{webglError}</strong><span>Use a browser with hardware-accelerated WebGL to inspect this structure.</span></div>
  return <div className="protein-webgl-host" ref={hostRef}><div className="protein-webgl-controls"><button onClick={() => zoom(-1)} aria-label="Zoom in"><ZoomIn size={14} /></button><button onClick={() => zoom(1)} aria-label="Zoom out"><ZoomOut size={14} /></button><button onClick={fit} aria-label="Fit protein"><Maximize2 size={14} /></button><button onClick={resetCamera} aria-label="Reset camera"><RotateCcw size={14} /></button></div></div>
}
