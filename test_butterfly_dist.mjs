import { Engine2D } from './app/simulation/modules/Engine2D.ts';

const engine = new Engine2D({ gravitationalConstant: 1, timeStep: 0.016, softening: 0.1, integrationMethod: 'velocity-verlet' });

engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.05, color: '#ff6b6b' });
engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.05, color: '#4ecdc4' });
engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.61378, y: -0.25102 }, mass: 1, radius: 0.05, color: '#45b7d1' });

let minDist = Infinity;
let minFrame = 0;
const collisionDist = 0.1; // radius + radius

for (let i = 0; i < 200; i++) {
  engine.stepVelocityVerlet();
  const bodies = engine.getBodies();
  const d12 = Math.hypot(bodies[0].position.x - bodies[1].position.x, bodies[0].position.y - bodies[1].position.y);
  const d13 = Math.hypot(bodies[0].position.x - bodies[2].position.x, bodies[0].position.y - bodies[2].position.y);
  const d23 = Math.hypot(bodies[1].position.x - bodies[2].position.x, bodies[1].position.y - bodies[2].position.y);
  const curMin = Math.min(d12, d13, d23);
  if (curMin < minDist) { minDist = curMin; minFrame = i; }
  if (d12 < collisionDist) console.log('Frame', i, 'COLLISION b1-b2 dist:', d12.toFixed(6));
  if (d13 < collisionDist) console.log('Frame', i, 'COLLISION b1-b3 dist:', d13.toFixed(6));
  if (d23 < collisionDist) console.log('Frame', i, 'COLLISION b2-b3 dist:', d23.toFixed(6));
}
console.log('Min dist overall:', minDist.toFixed(6), 'at frame', minFrame);
