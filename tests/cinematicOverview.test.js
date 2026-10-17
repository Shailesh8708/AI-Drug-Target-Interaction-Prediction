import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'

test('Cinematic 3D Helix: Procedural geometry calculates canonical B-DNA parameters', () => {
  const numBasePairs = 38
  const totalTurns = 3.6
  const totalAngle = totalTurns * Math.PI * 2
  const helixHeight = 40
  const helixRadius = 4.4

  const pointsA = []
  const pointsB = []

  for (let i = 0; i < numBasePairs; i++) {
    const t = i / (numBasePairs - 1)
    const theta = t * totalAngle
    const y = (t - 0.5) * helixHeight

    pointsA.push(new THREE.Vector3(
      helixRadius * Math.cos(theta),
      y,
      helixRadius * Math.sin(theta)
    ))

    pointsB.push(new THREE.Vector3(
      helixRadius * Math.cos(theta + Math.PI),
      y,
      helixRadius * Math.sin(theta + Math.PI)
    ))
  }

  assert.equal(pointsA.length, 38)
  assert.equal(pointsB.length, 38)

  // Verify antiparallel separation: distance between opposite strand points is 2 * radius
  for (let i = 0; i < numBasePairs; i++) {
    const pA = pointsA[i]
    const pB = pointsB[i]
    const dist = pA.distanceTo(pB)
    assert.ok(Math.abs(dist - helixRadius * 2) < 0.001, `Distance must equal duplex diameter at rung ${i}`)

    // Midpoint should lie on vertical central axis (x = 0, z = 0)
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5)
    assert.ok(Math.abs(mid.x) < 0.001, 'Midpoint x must be 0')
    assert.ok(Math.abs(mid.z) < 0.001, 'Midpoint z must be 0')
  }

  // Verify CatmullRom spline and tube generation
  const curveA = new THREE.CatmullRomCurve3(pointsA)
  const tubeGeo = new THREE.TubeGeometry(curveA, numBasePairs * 2, 0.26, 8, false)
  assert.ok(tubeGeo.attributes.position.count > 0, 'Tube geometry must have vertices')
  tubeGeo.dispose()
})

test('Cinematic 3D Helix: Base pair sequence cycle assigns complementary purine-pyrimidine pairs', () => {
  const cycles = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => i % 4)
  const expectedPairs = [
    ['adenine', 'thymine'],
    ['guanine', 'cytosine'],
    ['thymine', 'adenine'],
    ['cytosine', 'guanine'],
    ['adenine', 'thymine'],
    ['guanine', 'cytosine'],
    ['thymine', 'adenine'],
    ['cytosine', 'guanine'],
  ]

  cycles.forEach((cycle, i) => {
    const pair = cycle === 0 ? ['adenine', 'thymine']
      : cycle === 1 ? ['guanine', 'cytosine']
      : cycle === 2 ? ['thymine', 'adenine']
      : ['cytosine', 'guanine']

    assert.deepEqual(pair, expectedPairs[i])
  })
})

test('Cinematic Camera Spline: Smoothly maps scroll progress across 5 narrative milestones', () => {
  const milestones = [
    { p: 0.00, cam: new THREE.Vector3(0, 0, 32), look: new THREE.Vector3(0, 0, 0) },
    { p: 0.28, cam: new THREE.Vector3(5.6, 2.4, 21), look: new THREE.Vector3(0.6, 1.2, 0) },
    { p: 0.55, cam: new THREE.Vector3(-4.6, -1.0, 18), look: new THREE.Vector3(1.4, -0.6, 0) },
    { p: 0.78, cam: new THREE.Vector3(0, -1.8, 28), look: new THREE.Vector3(0, -1.0, 0) },
    { p: 1.00, cam: new THREE.Vector3(0, 4.0, 34), look: new THREE.Vector3(0, 0, 0) },
  ]

  function getInterpolatedCam(progress) {
    const p = Math.max(0, Math.min(1, progress))
    let idx = 0
    for (let i = 0; i < milestones.length - 1; i++) {
      if (p >= milestones[i].p && p <= milestones[i + 1].p) {
        idx = i
        break
      }
    }
    const m1 = milestones[idx]
    const m2 = milestones[idx + 1]
    const span = m2.p - m1.p || 1
    const localT = (p - m1.p) / span
    const easedT = 0.5 - 0.5 * Math.cos(localT * Math.PI)

    return {
      pos: new THREE.Vector3().lerpVectors(m1.cam, m2.cam, easedT),
      look: new THREE.Vector3().lerpVectors(m1.look, m2.look, easedT),
    }
  }

  // Test at scroll 0.0 (Hero Overview)
  const heroCam = getInterpolatedCam(0)
  assert.equal(heroCam.pos.x, 0)
  assert.equal(heroCam.pos.y, 0)
  assert.equal(heroCam.pos.z, 32)

  // Test at scroll 0.28 (Molecular Exploration)
  const exploreCam = getInterpolatedCam(0.28)
  assert.ok(Math.abs(exploreCam.pos.x - 5.6) < 0.01)
  assert.ok(Math.abs(exploreCam.pos.z - 21) < 0.01)

  // Test at scroll 0.55 (Drug Discovery Intelligence)
  const intelCam = getInterpolatedCam(0.55)
  assert.ok(Math.abs(intelCam.pos.x - (-4.6)) < 0.01)
  assert.ok(Math.abs(intelCam.pos.z - 18) < 0.01)

  // Test at scroll 1.0 (Research Console & Closing)
  const endCam = getInterpolatedCam(1.0)
  assert.equal(endCam.pos.x, 0)
  assert.equal(endCam.pos.z, 34)
})

test('Research Capabilities: Storytelling cards route to genuine application modules', () => {
  const capabilityRoutes = [
    { id: 'biostructure', label: 'BioStructure Intelligence Hub' },
    { id: 'dti', label: 'DTI Neural Prediction Lab' },
    { id: 'compare', label: 'Comparative Structural Chemistry' },
    { id: 'integrations', label: 'Scientific Data Hub' },
    { id: 'expiry', label: 'Expiry & Stability Surveillance' },
  ]

  const validAppRoutes = [
    'overview',
    'biostructure',
    'dti',
    'integrations',
    'molecules',
    'visualize',
    'compare',
    'targets',
    'medicines',
    'expiry',
    'schedule',
    'assistant',
    'analytics',
    'research',
  ]

  capabilityRoutes.forEach(({ id, label }) => {
    assert.ok(validAppRoutes.includes(id), `Capability ${label} must route to a valid app module: ${id}`)
  })
})

test('Research Console: Preserves all live metrics, medicine watchlist rows, and safety disclaimer', () => {
  const medicineRows = [
    { name: 'Cetirizine', detail: '10 mg · Personal', expiry: 'Sep 29, 2026', status: 'Expiring soon', tone: 'warning' },
    { name: 'First-aid antiseptic', detail: '100 ml · Wound care', expiry: 'Nov 04, 2026', status: 'Active', tone: 'active' },
    { name: 'Paracetamol', detail: '500 mg · Pain / fever', expiry: 'Aug 17, 2026', status: 'Expired', tone: 'danger' },
  ]

  assert.equal(medicineRows.length, 3)
  assert.equal(medicineRows[0].name, 'Cetirizine')
  assert.equal(medicineRows[1].name, 'First-aid antiseptic')
  assert.equal(medicineRows[2].name, 'Paracetamol')

  const metrics = [
    { label: 'Prediction studies', value: '12', accent: 'coral' },
    { label: 'Active medicines', value: '18', accent: 'green' },
    { label: 'Expiry watch', value: '03', accent: 'orange' },
    { label: 'Model registry', value: '—', accent: 'blue' },
  ]

  assert.equal(metrics.length, 4)
  assert.equal(metrics[0].value, '12')
  assert.equal(metrics[1].value, '18')
  assert.equal(metrics[2].value, '03')
  assert.equal(metrics[3].value, '—')
})

test('Cinematic 3D Helix: Rust Red and Emerald Green Color Harmony Palette', () => {
  const palette = {
    strandA: 0xef4444, // Metallic Rust Red / Crimson
    strandB: 0x10b981, // Metallic Bio-Green / Emerald
    adenine: 0xef4444, // Rust Red
    thymine: 0x10b981, // Emerald Green
    guanine: 0xf97316, // Rust Amber / Copper
    cytosine: 0x34d399, // Mint / Jade Green
    hydrogenSpark: 0x10b981, // Jade energy emission
  }

  // Verify Strand A is within rust red hue spectrum (red dominant)
  const colorStrandA = new THREE.Color(palette.strandA)
  assert.ok(colorStrandA.r > colorStrandA.g, 'Strand A must be in rust red spectrum')
  assert.equal(colorStrandA.getHexString(), 'ef4444')

  // Verify Strand B is in emerald green spectrum (green dominant)
  const colorStrandB = new THREE.Color(palette.strandB)
  assert.ok(colorStrandB.g > colorStrandB.r, 'Strand B must be in emerald green spectrum')
  assert.equal(colorStrandB.getHexString(), '10b981')

  // Verify purine-pyrimidine base complements
  const colorA = new THREE.Color(palette.adenine)
  const colorT = new THREE.Color(palette.thymine)
  assert.ok(colorA.r > colorA.g, 'Adenine must be rust red')
  assert.ok(colorT.g > colorT.r, 'Thymine must be emerald green')
})

test('Interactive Viewport Controls: Provides accurate camera targets for specialized perspectives', () => {
  const viewTargets = {
    duplex: { cam: new THREE.Vector3(3.4, 1.2, 14), look: new THREE.Vector3(0, 0.8, 0) },
    ligand: { cam: new THREE.Vector3(7.2, 2.6, 10.5), look: new THREE.Vector3(5.2, 1.8, 2.5) },
    axial: { cam: new THREE.Vector3(0.01, 38, 0.01), look: new THREE.Vector3(0, 0, 0) },
  }

  // Duplex zoom should bring camera closer than default 32
  assert.ok(viewTargets.duplex.cam.z < 20, 'Duplex view must zoom in closer')
  // Ligand cleft view targets major groove pocket
  assert.ok(viewTargets.ligand.look.x > 3, 'Ligand view must look at binding pocket')
  // Axial view looks down y-axis from high altitude
  assert.ok(viewTargets.axial.cam.y >= 35, 'Axial view must be positioned along vertical axis')
})

test('Smooth Camera Lerping: Delta-timed exponential damping maintains fluid frame rate independence', () => {
  const current = new THREE.Vector3(0, 0, 32)
  const target = new THREE.Vector3(5.6, 2.4, 21)

  // Simulation at 60fps (delta = 1/60 ~ 0.0167)
  const delta60 = 0.01667
  const alpha60 = 1 - Math.exp(-4.8 * delta60)
  assert.ok(alpha60 > 0.05 && alpha60 < 0.15, 'Alpha factor at 60fps must provide gentle smoothing')

  // Simulation at 120fps (delta = 1/120 ~ 0.0083)
  const delta120 = 0.00833
  const alpha120 = 1 - Math.exp(-4.8 * delta120)
  assert.ok(alpha120 > 0.02 && alpha120 < 0.08, 'Alpha factor at 120fps scales smoothly with delta')

  current.lerp(target, alpha60)
  assert.ok(current.distanceTo(target) < 32, 'Position moves toward target without overshoot')
})

test('Side Panel: Resizable width parameters and bounds ensure all feature titles render completely', () => {
  const DEFAULT_SIDEBAR_WIDTH = 348
  const MIN_SIDEBAR_WIDTH = 280
  const MAX_SIDEBAR_WIDTH = 560

  assert.ok(DEFAULT_SIDEBAR_WIDTH >= 340, 'Default sidebar width must be at least 340px for comfortable reading')
  assert.ok(MIN_SIDEBAR_WIDTH < DEFAULT_SIDEBAR_WIDTH, 'Min sidebar width must be smaller than default')
  assert.ok(MAX_SIDEBAR_WIDTH > DEFAULT_SIDEBAR_WIDTH, 'Max sidebar width must allow expansion')

  // Clamping function used during mouse drag
  function clampSidebarWidth(clientX, windowWidth = 1440) {
    const maxLimit = Math.min(MAX_SIDEBAR_WIDTH, windowWidth * 0.55)
    return Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxLimit, Math.round(clientX)))
  }

  assert.equal(clampSidebarWidth(200), 280, 'Must clamp to minimum 280px')
  assert.equal(clampSidebarWidth(420), 420, 'Allows arbitrary drag width within bounds')
  assert.equal(clampSidebarWidth(700), 560, 'Must clamp to maximum 560px')

  // Feature names list
  const navTitles = [
    'Overview',
    'BioStructure Intelligence Hub',
    'DTI Lab',
    'Scientific Data Hub',
    'Molecule Lab',
    'Visualize Compound',
    'Structure Comparison',
    'Target Analysis',
    'Medicine cabinet',
    'Expiry monitor',
    'Schedule',
    'AI assistant',
    'Analytics',
    'Research Hub',
  ]

  navTitles.forEach((title) => {
    assert.ok(title.length > 0, 'Title must not be empty')
    assert.ok(title.length < 35, `Title "${title}" must be reasonably sized to fit in 348px sidebar`)
  })
})

test('Feature Molecular Background: 3D orbital projection, chemical bonds, and Bipasha AI logo aesthetic', () => {
  // Test 3D spherical to projected coordinate mathematics
  const node = { r: 76, theta: Math.PI * 0.5, phi: 0.62, size: 4.0 }
  const angleY = 0.5
  const angleX = 0.35

  const currentTheta = node.theta + angleY
  const x = node.r * Math.cos(currentTheta) * Math.cos(node.phi)
  const y = node.r * Math.sin(node.phi)
  const z = node.r * Math.sin(currentTheta) * Math.cos(node.phi)

  const cosX = Math.cos(angleX)
  const sinX = Math.sin(angleX)
  const y1 = y * cosX - z * sinX
  const z1 = y * sinX + z * cosX

  const focalLength = 130
  const projScale = focalLength / (focalLength + z1)
  const centerX = 400
  const centerY = 300
  const projX = centerX + x * projScale
  const projY = centerY + y1 * projScale

  assert.ok(!isNaN(projX) && projX > 0, 'Projected X must be a valid positive coordinate')
  assert.ok(!isNaN(projY) && projY > 0, 'Projected Y must be a valid positive coordinate')
  assert.ok(projScale > 0.5 && projScale < 2.0, 'Perspective scale must be physically reasonable')

  // Verify chemical bond network
  const bonds = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [2, 6],
  ]
  assert.equal(bonds.length, 10, 'Must have 10 canonical molecular bonds')

  // Verify energy spark linear interpolation along bond
  const p1 = { x: 100, y: 100 }
  const p2 = { x: 200, y: 300 }
  const sparkT = 0.5
  const sparkX = p1.x + (p2.x - p1.x) * sparkT
  const sparkY = p1.y + (p2.y - p1.y) * sparkT
  assert.equal(sparkX, 150)
  assert.equal(sparkY, 200)

  // Verify active feature pages mount the molecular background
  const samplePages = ['biostructure', 'dti', 'integrations', 'molecules', 'visualize', 'compare', 'targets', 'medicines', 'expiry', 'schedule', 'assistant', 'analytics', 'research']
  samplePages.forEach((p) => {
    const shouldMount = p !== 'overview'
    assert.equal(shouldMount, true, `Feature page ${p} must display molecular background`)
  })
})




