import { expect, test } from 'vitest'
import { CreateTrafficReportSchema } from '../lib/schemas'

test('Traffic report schema validates correct data', () => {
  const valid = CreateTrafficReportSchema.safeParse({
    tunnelId: '00000000-0000-0000-0000-000000000001',
    direction: 'north',
    userId: '11111111-1111-1111-1111-111111111111',
    geolocationVerified: true,
    hasTraffic: true,
    coordinates: { lat: 64.1375, lng: -21.8952 },
  })
  expect(valid.success).toBe(true)
})

import { afterAll, beforeAll } from 'vitest'

const BASE_URL = 'http://localhost:3000/api/traffic/report'

const validReport = {
  tunnelId: '00000000-0000-0000-0000-000000000001',
  direction: 'north',
  userId: '11111111-1111-1111-1111-111111111111',
  geolocationVerified: true,
  hasTraffic: true,
  coordinates: { lat: 64.1375, lng: -21.8952 },
}

const invalidReport = {
  ...validReport,
  coordinates: { lat: 64.15, lng: -21.90 },
}

test('API accepts report at valid location', async () => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validReport),
  })
  expect(res.status).toBe(200)
  const data = await res.json()
  expect(data.success).toBe(true)
})

test('API rejects report at invalid location', async () => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidReport),
  })
  expect(res.status).toBe(403)
  const data = await res.json()
  expect(data.error).toBeDefined()
})
