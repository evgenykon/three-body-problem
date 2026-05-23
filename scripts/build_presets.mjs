import * as fs from 'fs'
import { validateOrbit, makeSuvakovBodies, FIG8_CLASSIC, SUV_ORBITS, SUV_HIGH_PRECISION, findPeriod } from './orbit.js'

const DT = 0.0001
const SOFT = 0
const SAMPLE_EVERY = 160

function genFrames(cfg, numFrames, sampleEvery) {
  const bodies = cfg.bodies.map(b => ({
    ...b,
    position: { x: b.position.x, y: b.position.y },
    velocity: { x: b.velocity.x, y: b.velocity.y },
  }))
  const dt = cfg.dt ?? DT
  const soft = cfg.softening ?? SOFT
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

function findBestPeriod(cfg, maxFrames, sampleEvery, minSkip = 50) {
  const dt = cfg.dt ?? DT
  const soft = cfg.softening ?? SOFT
  const bodies = cfg.bodies.map(b => ({
    ...b,
    position: { x: b.position.x, y: b.position.y },
    velocity: { x: b.velocity.x, y: b.velocity.y },
  }))
  const pos0 = cfg.bodies.map(b => ({ x: b.position.x, y: b.position.y }))
  let bestFrame = -1
  let bestDist = Infinity

  for (let f = 1; f <= maxFrames; f++) {
    for (let s = 0; s < sampleEvery; s++) stepVV(bodies, cfg.G, soft, dt)
    if (f < minSkip) continue
    let dist = 0
    for (let i = 0; i < bodies.length; i++) {
      dist += Math.hypot(bodies[i].position.x - pos0[i].x, bodies[i].position.y - pos0[i].y)
    }
    if (dist < bestDist) { bestDist = dist; bestFrame = f }
  }
  return { frame: bestFrame, dist: bestDist }
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

function arrToLines(arr, precision = 15, perLine = 8) {
  const lines = []
  let line = ''
  for (let i = 0; i < arr.length; i++) {
    if (line) line += ','
    line += arr[i].toFixed(precision)
    if ((i + 1) % perLine === 0 || i === arr.length - 1) {
      lines.push(line)
      line = ''
    }
  }
  return lines.join(',\n')
}

function tryFixedFrames(cfg, sampleEvery, candidates) {
  for (const n of candidates) {
    const val = validateOrbit(cfg, n, sampleEvery)
    if (val.ok) {
      return { frames: n, message: val.message }
    }
    console.log(`    ${n} frames: ${val.message}`)
  }
  return null
}

function closeLoop(frames, bodyIds) {
  for (const bid of bodyIds) {
    const arr = frames[bid]
    const n = arr.length
    const dx = arr[n - 1].x - arr[0].x
    const dy = arr[n - 1].y - arr[0].y
    if (Math.abs(dx) < 1e-12 && Math.abs(dy) < 1e-12) continue
    for (let i = 1; i < n; i++) {
      const t = i / (n - 1)
      arr[i].x -= dx * t
      arr[i].y -= dy * t
    }
  }
}

function buildPresetData(name, id, cfg, sampleEvery = SAMPLE_EVERY, fixedFrames = null, forcePeriod = false, doCloseLoop = false) {
  const FIXED_CANDIDATES = [3000, 2000, 1000, 600]
  let useFrames, genFramesCount

  if (fixedFrames) {
    useFrames = fixedFrames
    genFramesCount = fixedFrames
    console.log(`  Fixed: ${fixedFrames} frames`)
  } else {
    const period = findBestPeriod(cfg, 2000, sampleEvery, 50)
    let best = period.frame > 0 ? period.frame : 600
    let bestDist = period.dist
    console.log(`  Period: ${period.frame} frames, dist: ${period.dist.toFixed(6)}`)

    if (bestDist > 0.1) {
      console.log(`  Large period distance (${bestDist.toFixed(3)}), extending search to 5000...`)
      const ext = findBestPeriod(cfg, 5000, sampleEvery, 50)
      if (ext.frame > 0) {
        best = ext.frame
        bestDist = ext.dist
        console.log(`  Extended: ${ext.frame} frames, dist: ${ext.dist.toFixed(6)}`)
      }
    }

    if (bestDist > 0.05 && !forcePeriod) {
      // Orbit doesn't close cleanly — try fixed frames
      console.log(`  Dist ${bestDist.toFixed(3)} > 0.05, trying fixed frames...`)
      const fallback = tryFixedFrames(cfg, sampleEvery, FIXED_CANDIDATES)
      if (fallback) {
        useFrames = fallback.frames
        genFramesCount = fallback.frames
        console.log(`  Using ${fallback.frames} fixed frames | ${fallback.message}`)
      } else {
        // No fixed count works — fall back to period with poor closure
        console.log(`  No stable fixed count, using period (${best} frames)`)
        useFrames = best
        genFramesCount = useFrames + 1
      }
    } else {
      useFrames = best
      genFramesCount = useFrames + 1
    }
  }

  const totalSteps = useFrames * sampleEvery

  const val = validateOrbit(cfg, useFrames, sampleEvery)
  if (!val.ok) { console.error(`  FAILED: ${val.message}`); return null }
  console.log(`  ${val.message}`)
  const frames = genFrames(cfg, genFramesCount, sampleEvery)
  const bodyIds = cfg.bodies.map(b => b.id)
  if (doCloseLoop) closeLoop(frames, bodyIds)
  const totalFrames = frames[bodyIds[0]].length

  let code = ''
  code += `// ${name}: ${totalSteps} steps, sampleEvery=${sampleEvery}, ${totalFrames} frames, G=${cfg.G}\n`
  code += `// ${val.message}\n`

  for (const bid of bodyIds) {
    const xs = arrToLines(frames[bid].map(p => p.x), 15, 8)
    const ys = arrToLines(frames[bid].map(p => p.y), 15, 8)
    code += `const ${id}_${bid}_x = [${xs}]\n`
    code += `const ${id}_${bid}_y = [${ys}]\n\n`
  }

  code += `const ${id}FrameMap = new Map<string, { x: number; y: number }[]>([\n`
  for (const bid of bodyIds) {
    code += `  zip('${bid}', ${id}_${bid}_x, ${id}_${bid}_y),\n`
  }
  code += `])\n\n`
  code += `export const ${id} = {\n`
  code += `  bodyIds: ${JSON.stringify(bodyIds)},\n`
  code += `  frames: ${id}FrameMap,\n`
  code += `}\n`

  return code
}

console.log('Building presets...\n')

let allCode = `// Auto-generated by scripts/build_presets.mjs
// DO NOT EDIT - Run: node scripts/build_presets.mjs

export type PrecalculatedPreset = {
  bodyIds: string[]
  x: number[][]
  y: number[][]
}

function zip(id: string, xs: number[], ys: number[]): [string, { x: number; y: number }[]] {
  const frames: { x: number; y: number }[] = []
  for (let i = 0; i < xs.length; i++) {
    frames.push({ x: xs[i]!, y: ys[i]! })
  }
  return [id, frames]
}

`

function suvakovCfg(vx, vy) {
  return { bodies: makeSuvakovBodies(vx, vy), G: 1, dt: DT, softening: SOFT }
}

const presets = [
  ['Figure-8 (Chenciner-Montgomery)', 'fig8', FIG8_CLASSIC],
  ['Butterfly I', 'butterfly1', suvakovCfg(SUV_HIGH_PRECISION.butterfly1.vx, SUV_HIGH_PRECISION.butterfly1.vy)],
  ['Bumblebee', 'bumblebee', suvakovCfg(SUV_ORBITS.bumblebee.vx, SUV_ORBITS.bumblebee.vy)],
  ['Moth I', 'moth1', suvakovCfg(SUV_ORBITS.moth1.vx, SUV_ORBITS.moth1.vy)],
  ['Moth II', 'moth2', suvakovCfg(SUV_ORBITS.moth2.vx, SUV_ORBITS.moth2.vy)],
  ['Moth III', 'moth3', suvakovCfg(SUV_ORBITS.moth3.vx, SUV_ORBITS.moth3.vy)],
  ['Goggles', 'goggles', suvakovCfg(SUV_ORBITS.goggles.vx, SUV_ORBITS.goggles.vy)],
  ['Dragonfly', 'dragonfly', suvakovCfg(SUV_ORBITS.dragonfly.vx, SUV_ORBITS.dragonfly.vy)],
  ['Yarn', 'yarn', suvakovCfg(SUV_ORBITS.yarn.vx, SUV_ORBITS.yarn.vy)],
  ['Yin-Yang I', 'yinyang1', suvakovCfg(SUV_ORBITS.yinyang1.vx, SUV_ORBITS.yinyang1.vy)],
]

for (const [name, id, cfg, fixedFrames, forcePeriod] of presets) {
  const doCloseLoop = id === 'moth3'
  console.log(`Generating ${name}...`)
  const code = buildPresetData(name, id, cfg, SAMPLE_EVERY, fixedFrames ?? null, forcePeriod ?? false, doCloseLoop)
  if (code) {
    allCode += code + '\n'
  }
}

fs.writeFileSync('app/data/precalculated.ts', allCode)
console.log('\nDone! Wrote app/data/precalculated.ts')
