import { Engine2D } from './app/simulation/modules/Engine2D.ts';
const orbits = [
  ['Butterfly I',  0.30689, 0.12551],
  ['Bumblebee',    0.18428, 0.58719],
  ['Moth I',       0.46444, 0.39606],
  ['Moth II',      0.43917, 0.45297],
  ['Moth III',     0.38344, 0.37736],
  ['Goggles',      0.08330, 0.12789],
  ['Dragonfly',    0.08058, 0.58884],
  ['Yarn',         0.55902, 0.34919],
  ['Yin-Yang I',   0.51394, 0.30474],
];
for (const [name, vx, vy] of orbits) {
  const engine = new Engine2D({ gravitationalConstant: 1, timeStep: 0.0001, softening: 0, integrationMethod: 'velocity-verlet' });
  engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: 0.005, color: '#ff6b6b' });
  engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: 0.005, color: '#4ecdc4' });
  engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -2*vx, y: -2*vy }, mass: 1, radius: 0.005, color: '#45b7d1' });
  let minDist = Infinity, coll = -1, energy0 = 0;
  for (let f = 0; f < 300; f++) {
    for (let s = 0; s < 160; s++) engine.step();
    const b = engine.getBodies();
    const d12 = Math.hypot(b[0].position.x - b[1].position.x, b[0].position.y - b[1].position.y);
    const d13 = Math.hypot(b[0].position.x - b[2].position.x, b[0].position.y - b[2].position.y);
    const d23 = Math.hypot(b[1].position.x - b[2].position.x, b[1].position.y - b[2].position.y);
    minDist = Math.min(minDist, d12, d13, d23);
    if (f === 0) energy0 = engine.totalEnergy();
    if (d12 < 0.01 || d13 < 0.01 || d23 < 0.01) { coll = f; break; }
  }
  const drift = coll >= 0 ? 'N/A' : ((engine.totalEnergy() - energy0) / energy0 * 1e6).toFixed(2) + ' ppm';
  console.log(name, coll >= 0 ? `COLL at frame ${coll}` : 'OK 300', '| minDist:', minDist.toFixed(6), '| drift:', drift);
}
