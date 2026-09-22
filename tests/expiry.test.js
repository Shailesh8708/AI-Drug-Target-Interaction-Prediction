import test from 'node:test'
import assert from 'node:assert/strict'

export function getExpiryStatus(expiryDate, today = new Date()) {
  const expiry = new Date(`${expiryDate}T00:00:00`)
  const reference = new Date(today)
  reference.setHours(0, 0, 0, 0)
  const days = Math.ceil((expiry - reference) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring-soon'
  return 'active'
}

test('classifies medicines inside the default seven-day window', () => {
  assert.equal(getExpiryStatus('2026-09-29', new Date('2026-09-22T12:00:00')), 'expiring-soon')
  assert.equal(getExpiryStatus('2026-10-30', new Date('2026-09-22T12:00:00')), 'active')
  assert.equal(getExpiryStatus('2026-09-21', new Date('2026-09-22T12:00:00')), 'expired')
})
