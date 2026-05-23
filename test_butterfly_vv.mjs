import { Engine2D } from './app/simulation/modules/Engine2D.ts';
const engine = new Engine2D({ gravitationalConstant: 1, timeStep: 0.0001, softening: 0, integrationMethod: 'velocity-verlet' });
engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.01, color: '#ff6b6b' });
engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.01, color: '#4ecdc4' });
engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.61378, y: -0.25102 }, mass: 1, radius: 0.01, color: '#45b7d1' });
let minDist = Infinity, energy0 = 0, collFrame = -1;
for (let f = 0; f < 400; f++) {
  for (let s = 0; s < 160; s++) engine.step();
  const bodies = engine.getBodies();
  const d12 = Math.hypot(bodies[0].position.x - bodies[1].position.x, bodies[0].position.y - bodies[1].position.y);
  const d13 = Math.hypot(bodies[0].position.x - bodies[2].position.x, bodies[0].position.y - bodies[2].position.y);
  const d23 = Math.hypot(bodies[1].position.x - bodies[2].position.x, bodies[1].position.y - bodies[2].position.y);
  minDist = Math.min(minDist, d12, d13, d23);
  if (f === 0) energy0 = engine.totalEnergy();
  if (d12 < 0.02 || d13 < 0.02 || d23 < 0.02) { collFrame = f; break; }
}
if (collFrame >= 0) {
  console.log('COLLISION at frame', collFrame, 'minDist:', minDist.toFixed(6));
} else {
  const bodies = engine.getBodies();
  bodies.forEach(b => console.log(b.id, 'pos:', b.position.x.toFixed(6), b.position.y.toFixed(6)));
  const drift = ((engine.totalEnergy() - energy0) / energy0 * 1e6).toFixed(3);
  console.log('OK 400 frames | minDist:', minDist.toFixed(6), '| energy drift:', drift, 'ppm');
}
