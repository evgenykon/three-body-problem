import { Engine2D } from './app/simulation/modules/Engine2D.ts';
const G = 1, dt = 0.016, softening = 0.1;
const engine = new Engine2D({ gravitationalConstant: G, timeStep: dt, softening, integrationMethod: 'velocity-verlet' });
engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.01, color: '#ff6b6b' });
engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.01, color: '#4ecdc4' });
engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.61378, y: -0.25102 }, mass: 1, radius: 0.01, color: '#45b7d1' });
let minDist = Infinity, collided = false;
for (let i = 0; i < 300; i++) {
  engine.stepVelocityVerlet();
  const bodies = engine.getBodies();
  const d12 = Math.hypot(bodies[0].position.x - bodies[1].position.x, bodies[0].position.y - bodies[1].position.y);
  const d13 = Math.hypot(bodies[0].position.x - bodies[2].position.x, bodies[0].position.y - bodies[2].position.y);
  const d23 = Math.hypot(bodies[1].position.x - bodies[2].position.x, bodies[1].position.y - bodies[2].position.y);
  minDist = Math.min(minDist, d12, d13, d23);
  if (d12 < 0.02 || d13 < 0.02 || d23 < 0.02) { collided = true; break; }
}
console.log('collided:', collided, '| min dist:', minDist.toFixed(6), '| frames:', engine.getBodies().length > 0 ? 300 : 'stopped early');
