import { Engine2D } from '../app/simulation/modules/Engine2D.ts'
import { validateOrbit, FIG8_CLASSIC, makeSuvakovBodies, SUV_ORBITS, SUV_HIGH_PRECISION } from './orbit.js'

const DT = 0.0001
const SOFTENING = 0
const METHOD = 'velocity-verlet'
const STEPS_PER_FRAME = 160
const OUTPUT_FRAMES = 600

function genFrames(bodies, G, numFrames, sampleEvery) {
  const engine = new Engine2D({ gravitationalConstant: G, timeStep: DT, softening: SOFTENING, integrationMethod: METHOD })
  bodies.forEach(b => engine.addBody({ ...b, position: { ...b.position }, velocity: { ...b.velocity } }))
  const frames = {}
  bodies.forEach(b => { frames[b.id] = [] })
  for (let i = 0; i < numFrames * sampleEvery; i++) {
    engine.step()
    if (i % sampleEvery === 0) {
      engine.getBodies().forEach(b => frames[b.id].push({ x: b.position.x, y: b.position.y }))
    }
  }
  return frames
}

function formatFloatArray(arr, maxPerLine = 10) {
  const lines = []
  let line = ''
  for (let i = 0; i < arr.length; i++) {
    if (line) line += ','
    line += arr[i].toFixed(15)
    if ((i + 1) % maxPerLine === 0 || i === arr.length - 1) {
      lines.push(line)
      line = ''
    }
  }
  return lines.join(',\n')
}

function generatePreset(name, id, bodies, G, numFrames, sampleEvery, description) {
  const val = validateOrbit({ bodies, G, dt: DT, softening: SOFTENING }, numFrames, STEPS_PER_FRAME)
  if (!val.ok) {
    console.error(`${name}: VALIDATION FAILED - ${val.message}`)
    return null
  }
  console.log(`// ${name}: ${val.message}`)
  console.log(`// ${description}`)

  const frames = genFrames(bodies, G, numFrames, sampleEvery)
  if (!frames) return null

  const totalSteps = numFrames * sampleEvery
  const bodyIds = bodies.map(b => b.id)

  console.log(`// ${id}: ${totalSteps} steps, sampleEvery=${sampleEvery}, ${numFrames+1} frames, G=${G}`)
  for (const bid of bodyIds) {
    console.log(`const ${id}_${bid}_x = [${frames[bid].map(p => formatFloatArray([p.x])).join(',')}]`)
    console.log(`const ${id}_${bid}_y = [${frames[bid].map(p => formatFloatArray([p.y])).join(',')}]`)
  }

  console.log(`\nconst ${id}FrameMap = new Map<string, { x: number; y: number }[]>([`)
  for (const bid of bodyIds) {
    console.log(`  zip('${bid}', ${id}_${bid}_x, ${id}_${bid}_y),`)
  }
  console.log('])')
  console.log(`\nexport const ${id} = { bodyIds: ${JSON.stringify(bodyIds)}, frames: ${id}FrameMap }`)

  return frames
}

console.log('import type { PrecalculatedPreset } from \'../app/data/precalculated\'\n')

// Figure-8 classic
generatePreset('Figure-8', 'fig8', FIG8_CLASSIC.bodies, FIG8_CLASSIC.G, OUTPUT_FRAMES, 160, 'Classic Chenciner-Montgomery figure-8')

// Butterfly I (high precision)
const hp = SUV_HIGH_PRECISION.butterfly1
const butterflyBodies = makeSuvakovBodies(hp.vx, hp.vy)
generatePreset('Butterfly I (high precision)', 'butterfly1', butterflyBodies, 1, OUTPUT_FRAMES, 160, 'Suvakov butterfly I')

// Bumblebee
const bb = SUV_ORBITS.bumblebee
const bumblebeeBodies = makeSuvakovBodies(bb.vx, bb.vy)
generatePreset('Bumblebee', 'bumblebee', bumblebeeBodies, 1, OUTPUT_FRAMES, 160, 'Suvakov bumblebee')
