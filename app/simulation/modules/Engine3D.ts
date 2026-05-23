export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface Body3D {
  id: string
  position: Vector3D
  velocity: Vector3D
  mass: number
  radius: number
  color: string
}

export interface SimulationConfig3D {
  gravitationalConstant: number
  timeStep: number
  softening: number
  bounds?: { width: number; height: number; depth: number }
  trailLength?: number
}

const defaultConfig3D: SimulationConfig3D = {
  gravitationalConstant: 100,
  timeStep: 0.016,
  softening: 5,
  trailLength: 100,
}

export class Engine3D {
  private bodies: Body3D[] = []
  private config: SimulationConfig3D
  private trails: Map<string, Vector3D[]> = new Map()

  constructor(config: Partial<SimulationConfig3D> = {}) {
    this.config = { ...defaultConfig3D, ...config }
  }

  addBody(body: Body3D): void {
    this.bodies.push(body)
    this.trails.set(body.id, [])
  }

  removeBody(id: string): void {
    this.bodies = this.bodies.filter(b => b.id !== id)
    this.trails.delete(id)
  }

  getBodies(): Body3D[] {
    return this.bodies
  }

  getTrail(id: string): Vector3D[] {
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

  private calculateForces(): Map<string, Vector3D> {
    const forces = new Map<string, Vector3D>()

    this.bodies.forEach(body => {
      forces.set(body.id, { x: 0, y: 0, z: 0 })
    })

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i]!
        const bodyB = this.bodies[j]!

        const dx = bodyB.position.x - bodyA.position.x
        const dy = bodyB.position.y - bodyA.position.y
        const dz = bodyB.position.z - bodyA.position.z

        const distSq = dx * dx + dy * dy + dz * dz + this.config.softening * this.config.softening
        const dist = Math.sqrt(distSq)

        const force = (this.config.gravitationalConstant * bodyA.mass * bodyB.mass) / distSq

        const fx = (force * dx) / dist
        const fy = (force * dy) / dist
        const fz = (force * dz) / dist

        const forceA = forces.get(bodyA.id)!
        const forceB = forces.get(bodyB.id)!

        forceA.x += fx
        forceA.y += fy
        forceA.z += fz

        forceB.x -= fx
        forceB.y -= fy
        forceB.z -= fz
      }
    }

    return forces
  }

  private updatePositions(forces: Map<string, Vector3D>): void {
    this.bodies.forEach(body => {
      const force = forces.get(body.id)!
      
      const ax = force.x / body.mass
      const ay = force.y / body.mass
      const az = force.z / body.mass

      body.velocity.x += ax * this.config.timeStep
      body.velocity.y += ay * this.config.timeStep
      body.velocity.z += az * this.config.timeStep

      body.position.x += body.velocity.x * this.config.timeStep
      body.position.y += body.velocity.y * this.config.timeStep
      body.position.z += body.velocity.z * this.config.timeStep
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

  setConfig(config: Partial<SimulationConfig3D>): void {
    this.config = { ...this.config, ...config }
  }

  reset(): void {
    this.bodies.forEach(body => {
      body.velocity = { x: 0, y: 0, z: 0 }
    })
    this.clearTrails()
  }

  totalEnergy(): number {
    let kinetic = 0
    let potential = 0

    this.bodies.forEach(body => {
      const speed = Math.sqrt(
        body.velocity.x ** 2 + 
        body.velocity.y ** 2 + 
        body.velocity.z ** 2
      )
      kinetic += 0.5 * body.mass * speed * speed
    })

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i]!
        const bodyB = this.bodies[j]!

        const dx = bodyB.position.x - bodyA.position.x
        const dy = bodyB.position.y - bodyA.position.y
        const dz = bodyB.position.z - bodyA.position.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        potential -= (this.config.gravitationalConstant * bodyA.mass * bodyB.mass) / dist
      }
    }

    return kinetic + potential
  }
}

export function createDefaultBodies3D(): Body3D[] {
  return [
    {
      id: 'body-1',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      mass: 1000,
      radius: 20,
      color: '#ff6b6b',
    },
    {
      id: 'body-2',
      position: { x: 100, y: 0, z: 0 },
      velocity: { x: 0, y: 6, z: 0 },
      mass: 1000,
      radius: 20,
      color: '#4ecdc4',
    },
    {
      id: 'body-3',
      position: { x: 50, y: 86.6, z: 0 },
      velocity: { x: -5, y: -3, z: 2 },
      mass: 1000,
      radius: 20,
      color: '#ffe66d',
    },
  ]
}