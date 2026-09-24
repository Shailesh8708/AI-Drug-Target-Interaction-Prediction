import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BIPASHA_ACTIONS,
  getActionById,
  getStageForProgress,
  parseAgentIntent,
  getContextualGreeting,
} from '../src/components/bipasha/BipashaActionRegistry.js'

test('Action Registry contains all 10 required project modules', () => {
  const expectedModules = [
    'dti',
    'molecules',
    'visualize',
    'drugs',
    'targets',
    'medicines',
    'expiry',
    'schedule',
    'assistant',
    'analytics',
    'research',
  ]

  assert.equal(BIPASHA_ACTIONS.length, 11)

  expectedModules.forEach((modId) => {
    const action = getActionById(modId)
    assert.ok(action, `Module ${modId} should exist in registry`)
    assert.ok(action.label, `Module ${modId} must have a label`)
    assert.ok(action.route, `Module ${modId} must define a route`)
    assert.ok(action.animationType, `Module ${modId} must specify animationType`)
    assert.ok(Array.isArray(action.stages), `Module ${modId} must contain staged progress steps`)
    assert.equal(action.stages.length, 5, `Module ${modId} must have 5 staged progression steps`)
  })
})

test('Staged progress bar returns valid stage definitions across 0-100%', () => {
  const dtiAction = getActionById('dti')
  assert.ok(dtiAction)

  const stage0 = getStageForProgress(dtiAction, 0)
  assert.match(stage0.text, /Bio-Tensor/i)

  const stage30 = getStageForProgress(dtiAction, 30)
  assert.match(stage30.text, /Target Protein/i)

  const stage55 = getStageForProgress(dtiAction, 55)
  assert.match(stage55.text, /Interaction Graph/i)

  const stage80 = getStageForProgress(dtiAction, 80)
  assert.match(stage80.text, /Model Ensembles/i)

  const stage100 = getStageForProgress(dtiAction, 100)
  assert.match(stage100.text, /Online/i)
})

test('Intent parser accurately maps natural language requests to actions', () => {
  // Navigation commands
  const dtiIntent = parseAgentIntent('Open DTI Lab')
  assert.equal(dtiIntent.type, 'navigate')
  assert.equal(dtiIntent.targetAction, 'dti')

  const medIntent = parseAgentIntent('Show my medicine kit')
  assert.equal(medIntent.type, 'navigate')
  assert.equal(medIntent.targetAction, 'medicines')

  const expIntent = parseAgentIntent('Check medicines expiring soon')
  assert.equal(expIntent.type, 'navigate')
  assert.equal(expIntent.targetAction, 'expiry')

  const molIntent = parseAgentIntent('Open molecular analysis in 3D')
  assert.equal(molIntent.type, 'navigate')
  assert.equal(molIntent.targetAction, 'molecules')

  const visualizeIntent = parseAgentIntent('Visualize benzene')
  assert.equal(visualizeIntent.type, 'navigate')
  assert.equal(visualizeIntent.targetAction, 'visualize')

  const anaIntent = parseAgentIntent('Take me to analytics')
  assert.equal(anaIntent.type, 'navigate')
  assert.equal(anaIntent.targetAction, 'analytics')

  const resIntent = parseAgentIntent('Show research papers and methodology')
  assert.equal(resIntent.type, 'navigate')
  assert.equal(resIntent.targetAction, 'research')
})

test('Intent parser enforces non-clinical and non-prescriptive safety boundaries', () => {
  const query1 = parseAgentIntent('What dosage should I take?')
  assert.equal(query1.type, 'safety_boundary')
  assert.match(query1.text, /cannot prescribe medication/i)

  const query2 = parseAgentIntent('Can you prescribe me medicine for fever?')
  assert.equal(query2.type, 'safety_boundary')

  const query3 = parseAgentIntent('Should I stop taking my paracetamol?')
  assert.equal(query3.type, 'safety_boundary')
})

test('Contextual greetings adapt properly to active route', () => {
  const dtiGreet = getContextualGreeting('dti')
  assert.match(dtiGreet.greeting, /drug–target interaction/i)

  const medGreet = getContextualGreeting('medicines')
  assert.match(medGreet.greeting, /medicine inventory/i)

  const expGreet = getContextualGreeting('expiry')
  assert.match(expGreet.greeting, /Expiry Monitor/i)

  const defaultGreet = getContextualGreeting('overview')
  assert.match(defaultGreet.greeting, /Bipasha Mam/i)
})
