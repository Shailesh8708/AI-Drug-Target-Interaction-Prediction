import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dtiPipelineService,
  generateMorganFingerprint,
  generateProteinComposition,
} from '../server/services/dtiPipelineService.js'

test('DTI Pipeline: Computes 256-bit topological Morgan fingerprint from SMILES', () => {
  const smiles = 'CC(=O)OC1=CC=CC=C1C(=O)O' // Aspirin
  const fp = generateMorganFingerprint(smiles, 256)
  assert.equal(fp.length, 256)
  const activeBits = fp.filter((b) => b === 1).length
  assert.ok(activeBits >= 20 && activeBits <= 128, 'Fingerprint must contain realistic active bit count')

  // Identical SMILES produces identical fingerprint
  const fp2 = generateMorganFingerprint(smiles, 256)
  assert.deepEqual(fp, fp2, 'Fingerprint must be deterministic')
})

test('DTI Pipeline: Computes 20-amino-acid normalized composition vector', () => {
  const seq = 'ACDEFGHIKLMNPQRSTVWY'
  const comp = generateProteinComposition(seq)
  assert.equal(comp.length, 20)
  for (const freq of comp) {
    assert.equal(freq, 0.05)
  }
})

test('DTI Pipeline: Provides benchmark dataset registry and evaluation metrics', () => {
  const status = dtiPipelineService.getDatasetStatus()
  assert.equal(status.success, true)
  assert.ok(status.datasets.length >= 3, 'Must register at least 3 benchmark datasets')
  assert.equal(status.activeThresholdUm, 10.0, 'Must apply <= 10 uM bioactivity threshold')
  assert.ok(status.totalCuratedPairs > 20000, 'Must cover over 20,000 curated benchmark pairs')

  const bindingDb = status.datasets.find((d) => d.id === 'bindingdb-core')
  assert.ok(bindingDb.metrics.rocAuc > 0.85, 'Must report ROC-AUC')
  assert.ok(bindingDb.metrics.f1Score > 0.80, 'Must report F1 Score')
})

test('DTI Pipeline: Prepares and partitions benchmark dataset using scaffold splitting', () => {
  const prepared = dtiPipelineService.prepareDataset({
    datasetId: 'bindingdb-core',
    splitStrategy: 'scaffold',
    thresholdUm: 10.0,
  })
  assert.equal(prepared.success, true)
  assert.ok(prepared.partitions.train.count > 10000)
  assert.ok(prepared.partitions.validation.count > 1000)
  assert.ok(prepared.partitions.test.count > 1000)
  assert.equal(prepared.thresholdUm, 10.0)
})

test('DTI Pipeline: Predicts Imatinib + ABL1 interaction with explainable feature attribution', async () => {
  const pred = await dtiPipelineService.predict({
    drug: 'Imatinib',
    target: 'ABL1',
    thresholdUm: 10.0,
  })

  assert.equal(pred.success, true)
  assert.equal(pred.prediction.classification, 'Active')
  assert.equal(pred.prediction.isClassifiedActive, true)
  assert.ok(pred.prediction.interactionProbability >= 0.8, 'Must predict high probability for known active pair')
  assert.ok(pred.prediction.affinity.estimatedKdNm <= 100, 'Must estimate nanomolar affinity for Imatinib on ABL1')
  assert.equal(pred.prediction.researchThreshold.satisfied, true)

  // Explainability checks
  assert.ok(pred.explainability.drugAttributions.length > 0, 'Must explain drug feature contributions')
  assert.ok(pred.explainability.targetAttributions.length > 0, 'Must explain target feature contributions')
  assert.ok(pred.explainability.keyMoleculesMoieties.length > 0, 'Must highlight key drug moieties')
  assert.ok(pred.explainability.keyTargetResidues.length > 0, 'Must highlight key target residues')
})

test('DTI Pipeline: Evaluates candidate compound against research threshold <= 10 uM', async () => {
  const pred = await dtiPipelineService.predict({
    drug: 'Caffeine',
    target: 'ADORA2A',
    thresholdUm: 10.0,
  })

  assert.equal(pred.success, true)
  assert.ok(pred.prediction.affinity.estimatedKdNm <= 10000, 'Caffeine is active at sub-10 uM')
  assert.ok(pred.prediction.affinity.confidenceInterval.upperNm > 0)
  assert.ok(pred.disclaimer, 'Must include scientific disclaimer')
})
