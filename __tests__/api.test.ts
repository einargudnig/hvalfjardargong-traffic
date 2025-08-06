import { expect, test } from 'vitest'
import { CreateTrafficReportSchema } from '../lib/schemas'

test('Traffic report schema validates correct data', () => {
  const valid = CreateTrafficReportSchema.safeParse({
    tunnel: 'Tunnel 1',
    direction: 'north',
    status: 'open',
    timestamp: Date.now(),
  })
  expect(valid.success).toBe(true)
})