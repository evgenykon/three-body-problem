import type { Body, Vector2D, SimulationConfig } from './Body'
import { defaultConfig } from './Body'

export class Engine2D {
  private bodies: Body[] = []
  private config: SimulationConfig
  private trails: Map<string, Vector2D[]> = new Map()

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  addBody(body: Body): void {
    this.bodies.push(body)
    this.trails.set(body.id, [])
  }

  removeBody(id: string): void {
    this.bodies = this.bodies.filter(b => b.id !== id)
    this.trails.delete(id)
  }

  getBodies(): Body[] {
    return this.bodies
  }

  getTrail(id: string): Vector2D[] {
    return this.trails.get(id) || []
  }

  clearTrails(): void {
    this.trails.forEach(trail => trail.length = 0)
  }

  step(): void {
    const forces = this.calculateForces()
    this.updatePositions(forces)
    this.updateTrails()
  }

  private calculateForces(): Map<string, Vector2D> {
    const forces = new Map<string, Vector2D>()

    this.bodies.forEach(body => {
      forces.set(body.id, { x: 0, y: 0 })
    })

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i]
        const bodyB = this.bodies[j]

        const dx = bodyB.position.x - bodyA.position.x
        const dy = bodyB.position.y - bodyA.position.y

        const distSq = dx * dx + dy * dy + this.config.softening * this.config.softening
        const dist = Math.sqrt(distSq)

        const force = (this.config.gravitationalConstant * bodyA.mass * bodyB.mass) / distSq

        const fx = (force * dx) / dist
        const fy = (force * dy) / dist

        const forceA = forces.get(bodyA.id)!
        const forceB = forces.get(bodyB.id)!

        forceA.x += fx
        forceA.y += fy

        forceB.x -= fx
        forceB.y -= fy
      }
    }

    return forces
  }

  private updatePositions(forces: Map<string, Vector2D>): void {
    this.bodies.forEach(body => {
      const force = forces.get(body.id)!
      
      const ax = force.x / body.mass
      const ay = force.y / body.mass

      body.velocity.x += ax * this.config.timeStep
      body.velocity.y += ay * this.config.timeStep

      body.position.x += body.velocity.x * this.config.timeStep
      body.position.y += body.velocity.y * this.config.timeStep
    })
  }

  private updateTrails(): void {
    this.bodies.forEach(body => {
      const trail = this.trails.get(body.id)!
      trail.push({ ...body.position })
      
      if (this.config.trailLength && trail.length > this.config.trailLength) {
        trail.shift()
      }
    })
  }

  setConfig(config: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  reset(): void {
    this.bodies.forEach(body => {
      body.velocity = { x: 0, y: 0 }
    })
    this.clearTrails()
  }

  totalEnergy(): number {
    let kinetic = 0
    let potential = 0

    this.bodies.forEach(body => {
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
      kinetic += 0.5 * body.mass * speed * speed
    })

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i]
        const bodyB = this.bodies[j]

        const dx = bodyB.position.x - bodyA.position.x
        const dy = bodyB.position.y - bodyA.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        potential -= (this.config.gravitationalConstant * bodyA.mass * bodyB.mass) / dist
      }
    }

    return kinetic + potential
  }
}

export function createDefaultBodies2D(): Body[] {
  const G = 80
  const r = 80
  const m = 500
  const v = Math.sqrt(G * m / r / 3)
  
  return [
    {
      id: 'body-1',
      position: { x: r, y: 0 },
      velocity: { x: 0, y: v },
      mass: m,
      radius: 15,
      color: '#ff6b6b',
    },
    {
      id: 'body-2',
      position: { x: -r / 2, y: r * Math.sqrt(3) / 2 },
      velocity: { x: v * Math.sqrt(3) / 2, y: v / 2 },
      mass: m,
      radius: 15,
      color: '#4ecdc4',
    },
    {
      id: 'body-3',
      position: { x: -r / 2, y: -r * Math.sqrt(3) / 2 },
      velocity: { x: -v * Math.sqrt(3) / 2, y: -v / 2 },
      mass: m,
      radius: 15,
      color: '#ffe66d',
    },
  ]
}