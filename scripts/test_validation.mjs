import { validateOrbit, FIG8_CLASSIC, SUV_ORBITS, makeSuvakovBodies, findPeriod } from './orbit.js'

console.log('=== FIG8 CLASSIC ===')
const r1 = validateOrbit(FIG8_CLASSIC, 100, 160)
console.log('  ->', r1.message)

console.log('\n=== ALL SUV FAMILIES (low precision) ===')
for (const [key, { vx, vy, name }] of Object.entries(SUV_ORBITS)) {
  const bodies = makeSuvakovBodies(vx, vy)
  const r = validateOrbit({ bodies, G: 1, dt: 0.0001, softening: 0 }, 100, 160)
  console.log(`  ${name}: ${r.message}`)
}

console.log('\n=== BUTTERFLY I (high precision) ===')
const hpBodies = makeSuvakovBodies(0.3068931165215643, 0.1255073111049974)
const r2 = validateOrbit({ bodies: hpBodies, G: 1, dt: 0.0001, softening: 0 }, 100, 160)
console.log('  ->', r2.message)

console.log('\n=== PERIOD SEARCH (FIG8) ===')
const p = findPeriod(FIG8_CLASSIC, 1000, 160)
console.log('  fig8 period:', p, p > 0 ? `(${(p * 160 * 0.0001).toFixed(4)} time units)` : 'not found')

console.log('\n=== PERIOD SEARCH (Butterfly I) ===')
const p2 = findPeriod({ bodies: hpBodies, G: 1, dt: 0.0001, softening: 0 }, 1000, 160)
console.log('  butterfly period:', p2, p2 > 0 ? `(${(p2 * 160 * 0.0001).toFixed(4)} time units)` : 'not found')
