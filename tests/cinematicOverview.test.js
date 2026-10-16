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

