import type { Body, Vector2D, SimulationConfig } from './Body'
import { defaultConfig } from './Body'

export class Engine2D {
  private bodies: Body[] = []
  private config: SimulationConfig
  private trails: Map<string, Vector2D[]> = new Map()
  private initialBodies: Body[] = []
  private defaultBodies: Body[] = []

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  addBody(body: Body): void {
    this.bodies.push(body)
    this.trails.set(body.id, [])
  }

  setInitialBodies(bodies: Body[]): void {
    this.initialBodies = bodies.map(b => ({
      id: b.id,
      position: { ...b.position },
      velocity: { ...b.velocity },
      mass: b.mass,
      radius: b.radius,
      color: b.color
    }))
  }

  setDefaultBodies(bodies: Body[]): void {
    this.defaultBodies = bodies.map(b => ({
      id: b.id,
      position: { ...b.position },
      velocity: { ...b.velocity },
      mass: b.mass,
      radius: b.radius,
      color: b.color
    }))
    if (this.initialBodies.length === 0) {
      this.initialBodies = [...this.defaultBodies]
    }
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
    switch (this.config.integrationMethod) {
      case 'rk4':
        this.stepRK4()
        break
      case 'velocity-verlet':
        this.stepVelocityVerlet()
        break
      case 'newton':
      case 'euler':
      default:
        this.stepEuler()
        break
    }
    this.updateTrails()
  }

  private computeAccelerations(bodies: Body[]): Map<string, Vector2D> {
    const accels = new Map<string, Vector2D>()
    bodies.forEach(b => accels.set(b.id, { x: 0, y: 0 }))

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]!
        const b = bodies[j]!

        const dx = b.position.x - a.position.x
        const dy = b.position.y - a.position.y

        const distSq = dx * dx + dy * dy + this.config.softening * this.config.softening
        const dist = Math.sqrt(distSq)
        const invR3 = 1 / (dist * distSq)

        const grav = this.config.gravitationalConstant

        accels.get(a.id)!.x += grav * b.mass * dx * invR3
        accels.get(a.id)!.y += grav * b.mass * dy * invR3
        accels.get(b.id)!.x -= grav * a.mass * dx * invR3
        accels.get(b.id)!.y -= grav * a.mass * dy * invR3
      }
    }

    return accels
  }

  private stepEuler(): void {
    const accels = this.computeAccelerations(this.bodies)
    const dt = this.config.timeStep

    this.bodies.forEach(body => {
      const acc = accels.get(body.id)!

      body.velocity.x += acc.x * dt
      body.velocity.y += acc.y * dt

      body.position.x += body.velocity.x * dt
      body.position.y += body.velocity.y * dt
    })
  }

  private stepRK4(): void {
    const dt = this.config.timeStep
    const ids = this.bodies.map(b => b.id)

    const snapshot = (posMap: Map<string, Vector2D>, velMap: Map<string, Vector2D>): Body[] =>
      ids.map(id => ({
        ...this.bodies.find(b => b.id === id)!,
        position: posMap.get(id)!,
        velocity: velMap.get(id)!
      }))

    const x0 = new Map<string, Vector2D>()
    const v0 = new Map<string, Vector2D>()
    this.bodies.forEach(b => {
      x0.set(b.id, { ...b.position })
      v0.set(b.id, { ...b.velocity })
    })

    const a0 = this.computeAccelerations(snapshot(x0, v0))

    const x1 = new Map<string, Vector2D>()
    const v1 = new Map<string, Vector2D>()
    ids.forEach(id => {
      x1.set(id, { x: x0.get(id)!.x + dt / 2 * v0.get(id)!.x, y: x0.get(id)!.y + dt / 2 * v0.get(id)!.y })
      v1.set(id, { x: v0.get(id)!.x + dt / 2 * a0.get(id)!.x, y: v0.get(id)!.y + dt / 2 * a0.get(id)!.y })
    })
    const a1 = this.computeAccelerations(snapshot(x1, v1))

    const x2 = new Map<string, Vector2D>()
    const v2 = new Map<string, Vector2D>()
    ids.forEach(id => {
      x2.set(id, { x: x0.get(id)!.x + dt / 2 * v1.get(id)!.x, y: x0.get(id)!.y + dt / 2 * v1.get(id)!.y })
      v2.set(id, { x: v0.get(id)!.x + dt / 2 * a1.get(id)!.x, y: v0.get(id)!.y + dt / 2 * a1.get(id)!.y })
    })
    const a2 = this.computeAccelerations(snapshot(x2, v2))

    const x3 = new Map<string, Vector2D>()
    const v3 = new Map<string, Vector2D>()
    ids.forEach(id => {
      x3.set(id, { x: x0.get(id)!.x + dt * v2.get(id)!.x, y: x0.get(id)!.y + dt * v2.get(id)!.y })
      v3.set(id, { x: v0.get(id)!.x + dt * a2.get(id)!.x, y: v0.get(id)!.y + dt * a2.get(id)!.y })
    })
    const a3 = this.computeAccelerations(snapshot(x3, v3))

    this.bodies.forEach(body => {
      const id = body.id
      body.position.x += dt / 6 * (v0.get(id)!.x + 2 * v1.get(id)!.x + 2 * v2.get(id)!.x + v3.get(id)!.x)
      body.position.y += dt / 6 * (v0.get(id)!.y + 2 * v1.get(id)!.y + 2 * v2.get(id)!.y + v3.get(id)!.y)
      body.velocity.x += dt / 6 * (a0.get(id)!.x + 2 * a1.get(id)!.x + 2 * a2.get(id)!.x + a3.get(id)!.x)
      body.velocity.y += dt / 6 * (a0.get(id)!.y + 2 * a1.get(id)!.y + 2 * a2.get(id)!.y + a3.get(id)!.y)
    })
  }

  private stepVelocityVerlet(): void {
    const dt = this.config.timeStep
    const dt2 = dt * dt

    const a0 = this.computeAccelerations(this.bodies)

    this.bodies.forEach(body => {
      const acc = a0.get(body.id)!
      body.position.x += body.velocity.x * dt + 0.5 * acc.x * dt2
      body.position.y += body.velocity.y * dt + 0.5 * acc.y * dt2
    })

    const a1 = this.computeAccelerations(this.bodies)

    this.bodies.forEach(body => {
      const acc0 = a0.get(body.id)!
      const acc1 = a1.get(body.id)!
      body.velocity.x += 0.5 * (acc0.x + acc1.x) * dt
      body.velocity.y += 0.5 * (acc0.y + acc1.y) * dt
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

  getConfig(): SimulationConfig {
    return { ...this.config }
  }

  kineticEnergy(): number {
    let ke = 0
    this.bodies.forEach(body => {
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
      ke += 0.5 * body.mass * speed * speed
    })
    return ke
  }

  potentialEnergy(): number {
    let pe = 0
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const a = this.bodies[i]!
        const b = this.bodies[j]!
        const dx = b.position.x - a.position.x
        const dy = b.position.y - a.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        pe -= this.config.gravitationalConstant * a.mass * b.mass / dist
      }
    }
    return pe
  }

  reset(): void {
    const bodiesToRestore = this.initialBodies.length > 0 ? this.initialBodies : this.defaultBodies
    if (bodiesToRestore.length > 0) {
      this.bodies = bodiesToRestore.map(b => ({
        id: b.id,
        position: { ...b.position },
        velocity: { ...b.velocity },
        mass: b.mass,
        radius: b.radius,
        color: b.color
      }))
      this.trails.clear()
      this.bodies.forEach(body => {
        this.trails.set(body.id, [])
      })
    } else {
      this.bodies.forEach(body => {
        body.velocity = { x: 0, y: 0 }
      })
      this.clearTrails()
    }
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
        const bodyA = this.bodies[i]!
        const bodyB = this.bodies[j]!

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