import { Engine2D } from './app/simulation/modules/Engine2D.ts';
const engine = new Engine2D({ gravitationalConstant: 1, timeStep: 0.0001, softening: 0, integrationMethod: 'velocity-verlet' });
const vx = 0.3068931165215643, vy = 0.1255073111049974;
engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: 0.002, color: '#ff6b6b' });
engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: 0.002, color: '#4ecdc4' });
engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -2*vx, y: -2*vy }, mass: 1, radius: 0.002, color: '#45b7d1' });
let minDist = Infinity, coll = -1;
for (let f = 0; f < 5000; f++) {
  for (let s = 0; s < 160; s++) engine.step();
  const b = engine.getBodies();
  const d12 = Math.hypot(b[0].position.x - b[1].position.x, b[0].position.y - b[1].position.y);
  const d13 = Math.hypot(b[0].position.x - b[2].position.x, b[0].position.y - b[2].position.y);
  const d23 = Math.hypot(b[1].position.x - b[2].position.x, b[1].position.y - b[2].position.y);
  minDist = Math.min(minDist, d12, d13, d23);
  if (d12 < 0.004 || d13 < 0.004 || d23 < 0.004) { coll = f; break; }
}
console.log(coll >= 0 ? 'COLLISION at frame '+coll : 'OK 5000', '| minDist:', minDist.toFixed(6));
