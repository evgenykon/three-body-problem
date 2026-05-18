import { Engine2D } from './app/simulation/modules/Engine2D.ts';

const engine = new Engine2D({ gravitationalConstant: 1, timeStep: 0.016, softening: 0.1, integrationMethod: 'velocity-verlet' });

engine.addBody({ id: 'b1', position: { x: -1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.05, color: '#ff6b6b' });
engine.addBody({ id: 'b2', position: { x: 1, y: 0 }, velocity: { x: 0.30689, y: 0.12551 }, mass: 1, radius: 0.05, color: '#4ecdc4' });
engine.addBody({ id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.61378, y: -0.25102 }, mass: 1, radius: 0.05, color: '#45b7d1' });

for (let i = 0; i < 200; i++) {
  engine.stepVelocityVerlet();
}
const bodies = engine.getBodies();
bodies.forEach(b => {
  console.log(b.id, 'pos:', b.position.x.toFixed(6), b.position.y.toFixed(6), 'vel:', b.velocity.x.toFixed(6), b.velocity.y.toFixed(6));
});
