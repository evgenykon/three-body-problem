import { validateOrbit, SUV_ORBITS, SUV_HIGH_PRECISION, FIG8_CLASSIC, makeSuvakovBodies, findPeriod } from './scripts/orbit.js'

function genFrames(cfg, numFrames, sampleEvery) {
  const bodies = cfg.bodies.map(b => ({
    ...b,
    position: { x: b.position.x, y: b.position.y },
    velocity: { x: b.velocity.x, y: b.velocity.y },
  }))
  const dt = cfg.dt ?? 0.0001
  const soft = cfg.softening ?? 0
  const frames = {}
  bodies.forEach(b => { frames[b.id] = [] })

  for (let i = 0; i < numFrames * sampleEvery; i++) {
    const a0 = computeAccels(bodies, cfg.G, soft)
    bodies.forEach(b => {
      const a = a0[b.id]
      b.position.x += b.velocity.x * dt + 0.5 * a.x * dt * dt
      b.position.y += b.velocity.y * dt + 0.5 * a.y * dt * dt
    })
    const a1 = computeAccels(bodies, cfg.G, soft)
    bodies.forEach(b => {
      const a0v = a0[b.id], a1v = a1[b.id]
      b.velocity.x += 0.5 * (a0v.x + a1v.x) * dt
      b.velocity.y += 0.5 * (a0v.y + a1v.y) * dt
    })
    if (i % sampleEvery === 0) {
      bodies.forEach(b => frames[b.id].push({ x: b.position.x, y: b.position.y }))
    }
  }
  return frames
}

function computeAccels(bodies, G, soft) {
  const accels = {}
  bodies.forEach(b => { accels[b.id] = { x: 0, y: 0 } })
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j]
      const dx = b.position.x - a.position.x
      const dy = b.position.y - a.position.y
      const distSq = dx * dx + dy * dy + soft * soft
      const dist = Math.sqrt(distSq)
      const invR3 = 1 / (dist * distSq)
      accels[a.id].x += G * b.mass * dx * invR3
      accels[a.id].y += G * b.mass * dy * invR3
      accels[b.id].x -= G * a.mass * dx * invR3
      accels[b.id].y -= G * a.mass * dy * invR3
    }
  }
  return accels
}

function generateOrbit(name, cfg, outputFrames = 600, sampleEvery = 160) {
  const val = validateOrbit(cfg, outputFrames, sampleEvery)
  if (!val.ok) { console.error(`${name}: FAILED - ${val.message}`); return null }
  console.log(`// ${name}: ${val.message}`)
  const frames = genFrames(cfg, outputFrames, sampleEvery)

  const period = findPeriod(cfg, 2000, sampleEvery)
  if (period > 0) console.log(`// Period: ${period} frames (${(period * sampleEvery * (cfg.dt ?? 0.0001)).toFixed(4)} time units)`)

  for (const bid of cfg.bodies.map(b => b.id)) {
    console.log(`const ${name}_${bid}_x = [${frames[bid].map(p => p.x.toFixed(15)).join(',')}]`)
    console.log(`const ${name}_${bid}_y = [${frames[bid].map(p => p.y.toFixed(15)).join(',')}]`)
  }
  return frames
}

// Figure-8
console.log('// === FIGURE-8 CLASSIC ===')
generateOrbit('fig8', FIG8_CLASSIC, 600, 160)

// Butterfly I (high precision)
console.log('\n// === BUTTERFLY I (High Precision) ===')
const hp = SUV_HIGH_PRECISION.butterfly1
const hpCfg = { bodies: makeSuvakovBodies(hp.vx, hp.vy), G: 1, dt: 0.0001, softening: 0 }
generateOrbit('butterfly1', hpCfg, 600, 160)

// Bumblebee
console.log('\n// === BUMBLEBEE ===')
const bb = SUV_ORBITS.bumblebee
const bbCfg = { bodies: makeSuvakovBodies(bb.vx, bb.vy), G: 1, dt: 0.0001, softening: 0 }
generateOrbit('bumblebee', bbCfg, 600, 160)
