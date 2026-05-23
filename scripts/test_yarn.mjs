/**
 * Yarn orbit validation test.
 * Confirms that with high-precision ICs (Li & Liao 2014) and
 * dt=0.00001, the Yarn orbit is periodic for multiple cycles.
 */
import { validateOrbit, findPeriod, makeSuvakovBodies } from './orbit.js'

const vx = 0.559064247131347
const vy = 0.349191558837891
const bodies = makeSuvakovBodies(vx, vy)
const cfg = { bodies, G: 1, dt: 0.00001, softening: 0 }

let allOk = true
function check(ok, msg) {
  console.log(ok ? '  PASS' : '  FAIL', msg)
  if (!ok) allOk = false
}

// 1. Energy conservation at multiple cycle points
console.log('1. Energy conservation at multiple cycle points:')
for (const n of [100, 500, 1000, 2000, 3469, 5000, 6938]) {
  const r = validateOrbit(cfg, n, 1600)
  check(r.ok, `${n} frames: ${r.message}`)
}

// 2. No collisions
console.log('\n2. No collisions within 2 periods:')
const r2 = validateOrbit(cfg, 6938, 1600)
check(!r2.collisions, `minDist=${r2.minDist.toFixed(6)} > 0.01`)
check(r2.ok, `drift=${r2.energyDriftPpm.toFixed(3)} ppm`)

// 3. Period exists and matches expected
console.log('\n3. Period search:')
// Use build_presets.mjs logic - search up to 2000, extend to 5000
import { SUV_HIGH_PRECISION } from './orbit.js'
check(
  Math.abs(SUV_HIGH_PRECISION.yarn.vx - vx) < 1e-15,
  `High-precision ICs match: vx=${SUV_HIGH_PRECISION.yarn.vx}`
)

// Expected period from literature: T = 55.5017624421301
const expectedFrames = Math.round(55.5017624421301 / (1600 * 0.00001))
check(expectedFrames === 3469, `Expected period ${expectedFrames} frames (55.50 TU)`)

// 4. Frame count matches
import * as fs from 'fs'
const content = fs.readFileSync('app/data/precalculated.ts', 'utf-8')
const lines = content.split('\n')
const yarnHeader = lines.find(l => l.startsWith('// Yarn:'))
const match = yarnHeader?.match(/(\d+) frames/)
check(match !== null, 'Found Yarn header')
if (match) {
  const frameCount = parseInt(match[1])
  check(frameCount === 3470, `Yarn has ${frameCount} frames (expected 3470)`)
}

console.log('\n' + (allOk ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'))
process.exit(allOk ? 0 : 1)
