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

function stepVV(bodies, G, soft, dt) {
  const a0 = computeAccels(bodies, G, soft)
  bodies.forEach(b => {
    const a = a0[b.id]
    b.position.x += b.velocity.x * dt + 0.5 * a.x * dt * dt
    b.position.y += b.velocity.y * dt + 0.5 * a.y * dt * dt
  })
  const a1 = computeAccels(bodies, G, soft)
  bodies.forEach(b => {
    const a0v = a0[b.id], a1v = a1[b.id]
    b.velocity.x += 0.5 * (a0v.x + a1v.x) * dt
    b.velocity.y += 0.5 * (a0v.y + a1v.y) * dt
  })
}

function deepCopyBodies(bodies) {
  return bodies.map(b => ({
    ...b,
    position: { x: b.position.x, y: b.position.y },
    velocity: { x: b.velocity.x, y: b.velocity.y },
  }))
}

function totalEnergy(bodies, G) {
  let ke = 0
  bodies.forEach(b => { const s2 = b.velocity.x ** 2 + b.velocity.y ** 2; ke += 0.5 * b.mass * s2 })
  let pe = 0
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j]
      const d = Math.hypot(b.position.x - a.position.x, b.position.y - a.position.y)
      pe -= G * a.mass * b.mass / d
    }
  }
  return ke + pe
}

/**
 * Validate if initial conditions produce a stable periodic orbit.
 * @param {{ bodies: Array<{id:string,position:{x:number,y:number},velocity:{x:number,y:number},mass:number,radius:number,color:string}>, G: number, dt?: number, softening?: number }} cfg
 * @param {number} frames - number of output frames to run
 * @param {number} [stepsPerFrame=160] - substeps per frame
 * @returns {{ ok: boolean, frames: number, minDist: number, collisions: boolean, energyDriftPpm: number, message: string }}
 */
export function validateOrbit(cfg, frames, stepsPerFrame = 160) {
  const dt = cfg.dt ?? 0.0001
  const soft = cfg.softening ?? 0
  const bodies = deepCopyBodies(cfg.bodies)

  let minDist = Infinity
  let energy0 = 0
  let collFrame = -1

  for (let f = 0; f < frames; f++) {
    for (let s = 0; s < stepsPerFrame; s++) stepVV(bodies, cfg.G, soft, dt)
    if (bodies.length < 3) { collFrame = f; break }

    const d12 = Math.hypot(bodies[0].position.x - bodies[1].position.x, bodies[0].position.y - bodies[1].position.y)
    const d13 = Math.hypot(bodies[0].position.x - bodies[2].position.x, bodies[0].position.y - bodies[2].position.y)
    const d23 = Math.hypot(bodies[1].position.x - bodies[2].position.x, bodies[1].position.y - bodies[2].position.y)
    minDist = Math.min(minDist, d12, d13, d23)

    if (f === 0) energy0 = totalEnergy(bodies, cfg.G)
    if (d12 < 0.01 || d13 < 0.01 || d23 < 0.01) { collFrame = f; break }
  }

  if (collFrame >= 0) {
    return { ok: false, frames: collFrame, minDist, collisions: true, energyDriftPpm: Infinity, message: `Collision at frame ${collFrame}` }
  }

  const drift = ((totalEnergy(bodies, cfg.G) - energy0) / energy0) * 1e6
  return {
    ok: Math.abs(drift) < 100,
    frames,
    minDist,
    collisions: false,
    energyDriftPpm: drift,
    message: `OK ${frames} frames | minDist: ${minDist.toFixed(6)} | drift: ${drift.toFixed(3)} ppm`,
  }
}

export function makeSuvakovBodies(vx, vy, radius = 0.005) {
  return [
    { id: 'b1', position: { x: -1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius, color: '#ff6b6b' },
    { id: 'b2', position: { x: 1, y: 0 },  velocity: { x: vx, y: vy }, mass: 1, radius, color: '#4ecdc4' },
    { id: 'b3', position: { x: 0, y: 0 },  velocity: { x: -2 * vx, y: -2 * vy }, mass: 1, radius, color: '#45b7d1' },
  ]
}

export const SUV_ORBITS = {
  butterfly1: { vx: 0.30689,         vy: 0.12551,         name: 'Butterfly I' },
  bumblebee:  { vx: 0.18428,         vy: 0.58719,         name: 'Bumblebee' },
  moth1:      { vx: 0.46444,         vy: 0.39606,         name: 'Moth I' },
  moth2:      { vx: 0.43917,         vy: 0.45297,         name: 'Moth II' },
  moth3:      { vx: 0.38344,         vy: 0.37736,         name: 'Moth III' },
  goggles:    { vx: 0.08330,         vy: 0.12789,         name: 'Goggles' },
  dragonfly:  { vx: 0.08058,         vy: 0.58884,         name: 'Dragonfly' },
  yarn:       { vx: 0.55902,         vy: 0.34919,         name: 'Yarn' },
  yinyang1:   { vx: 0.51394,         vy: 0.30474,         name: 'Yin-Yang I' },
}

export const SUV_HIGH_PRECISION = {
  butterfly1: { vx: 0.3068931165215643, vy: 0.1255073111049974 },
}

export const FIG8_CLASSIC = {
  bodies: [
    { id: 'b1', position: { x: 0.97000436, y: -0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#ff6b6b' },
    { id: 'b2', position: { x: -0.97000436, y: 0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#4ecdc4' },
    { id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.93240737, y: -0.86473146 }, mass: 1, radius: 0.05, color: '#45b7d1' },
  ],
  G: 1,
  dt: 0.0001,
  softening: 0,
}

export function findPeriod(cfg, maxFrames = 3000, stepsPerFrame = 160) {
  const dt = cfg.dt ?? 0.0001
  const soft = cfg.softening ?? 0
  const bodies = deepCopyBodies(cfg.bodies)
  const pos0 = cfg.bodies.map(b => ({ x: b.position.x, y: b.position.y }))
  const vel0 = cfg.bodies.map(b => ({ x: b.velocity.x, y: b.velocity.y }))
  const tolerance = dt * 10

  for (let f = 1; f <= maxFrames; f++) {
    for (let s = 0; s < stepsPerFrame; s++) stepVV(bodies, cfg.G, soft, dt)
    if (bodies.length < 3) break
    let match = true
    for (let i = 0; i < 3; i++) {
      if (Math.abs(bodies[i].position.x - pos0[i].x) > tolerance ||
          Math.abs(bodies[i].position.y - pos0[i].y) > tolerance ||
          Math.abs(bodies[i].velocity.x - vel0[i].x) > tolerance ||
          Math.abs(bodies[i].velocity.y - vel0[i].y) > tolerance) { match = false; break }
    }
    if (match) return f
  }
  return -1
}
