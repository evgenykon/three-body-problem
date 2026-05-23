import { Engine2D } from './app/simulation/modules/Engine2D.ts';
const engine = new Engine2D({ gravitationalConstant: 1, timeStep: 0.0001, softening: 0, integrationMethod: 'velocity-verlet' });
engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: 0.3068931165215643, y: 0.1255073111049974 }, mass: 1, radius: 0.005, color: '#ff6b6b' });
engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: 0.3068931165215643, y: 0.1255073111049974 }, mass: 1, radius: 0.005, color: '#4ecdc4' });
engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.6137862330431286, y: -0.2510146222099948 }, mass: 1, radius: 0.005, color: '#45b7d1' });
let minDist = Infinity, energy0 = 0, coll = -1;
for (let f = 0; f < 10000; f++) {
  for (let s = 0; s < 160; s++) engine.step();
  const b = engine.getBodies();
  const d12 = Math.hypot(b[0].position.x - b[1].position.x, b[0].position.y - b[1].position.y);
  const d13 = Math.hypot(b[0].position.x - b[2].position.x, b[0].position.y - b[2].position.y);
  const d23 = Math.hypot(b[1].position.x - b[2].position.x, b[1].position.y - b[2].position.y);
  minDist = Math.min(minDist, d12, d13, d23);
  if (f === 0) energy0 = engine.totalEnergy();
  if (d12 < 0.01 || d13 < 0.01 || d23 < 0.01) { coll = f; break; }
}
if (coll >= 0) {
  console.log('COLLISION at frame', coll, '| minDist:', minDist.toFixed(6));
} else {
  const drift = ((engine.totalEnergy() - energy0) / energy0 * 1e6).toFixed(3);
  console.log('OK 10000 frames | minDist:', minDist.toFixed(6), '| energy drift:', drift, 'ppm');
}
