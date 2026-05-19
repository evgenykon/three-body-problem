import { Engine2D } from './app/simulation/Engine.ts'

function genFrames(bodies, G, dt, soft, numFrames, sampleEvery) {
  const engine = new Engine2D({ gravitationalConstant: G, timeStep: dt, softening: soft, integrationMethod: 'velocity-verlet' })
  bodies.forEach(b => engine.addBody({ ...b, position: { ...b.position }, velocity: { ...b.velocity } }))
  const frames = {}
  bodies.forEach(b => { frames[b.id] = [] })
  for (let i = 0; i < numFrames * sampleEvery; i++) {
    engine.step()
    if (i % sampleEvery === 0) {
      engine.getBodies().forEach(b => frames[b.id].push({ x: +b.position.x.toFixed(6), y: +b.position.y.toFixed(6) }))
    }
  }
  return frames
}

const fig8 = genFrames([
  { id: 'b1', position: { x: 0.97000436, y: -0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#ff6b6b' },
  { id: 'b2', position: { x: -0.97000436, y: 0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#4ecdc4' },
  { id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.93240737, y: -0.86473146 }, mass: 1, radius: 0.05, color: '#45b7d1' },
], 80, 0.0001, 5, 600, 107)

console.log('FIG8_B1_X:' + JSON.stringify(fig8.b1.map(p => p.x)))
console.log('FIG8_B1_Y:' + JSON.stringify(fig8.b1.map(p => p.y)))
console.log('FIG8_B2_X:' + JSON.stringify(fig8.b2.map(p => p.x)))
console.log('FIG8_B2_Y:' + JSON.stringify(fig8.b2.map(p => p.y)))
console.log('FIG8_B3_X:' + JSON.stringify(fig8.b3.map(p => p.x)))
console.log('FIG8_B3_Y:' + JSON.stringify(fig8.b3.map(p => p.y)))

const lag = genFrames([
  { id: 'b1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 10.75 }, mass: 200, radius: 14, color: '#ff6b6b' },
  { id: 'b2', position: { x: -40, y: 69.28 }, velocity: { x: -9.31, y: -5.37 }, mass: 200, radius: 14, color: '#4ecdc4' },
  { id: 'b3', position: { x: -40, y: -69.28 }, velocity: { x: 9.31, y: -5.37 }, mass: 200, radius: 14, color: '#45b7d1' },
], 80, 0.016, 5, 600, 7)

console.log('LAG_B1_X:' + JSON.stringify(lag.b1.map(p => p.x)))
console.log('LAG_B1_Y:' + JSON.stringify(lag.b1.map(p => p.y)))
console.log('LAG_B2_X:' + JSON.stringify(lag.b2.map(p => p.x)))
console.log('LAG_B2_Y:' + JSON.stringify(lag.b2.map(p => p.y)))
console.log('LAG_B3_X:' + JSON.stringify(lag.b3.map(p => p.x)))
console.log('LAG_B3_Y:' + JSON.stringify(lag.b3.map(p => p.y)))
