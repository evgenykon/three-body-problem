export interface Vector2D {
  x: number
  y: number
}

export interface Body {
  id: string
  position: Vector2D
  velocity: Vector2D
  mass: number
  radius: number
  color: string
}

export type IntegrationMethod = 'euler' | 'rk4' | 'velocity-verlet'

export interface SimulationConfig {
  gravitationalConstant: number
  timeStep: number
  softening: number
  integrationMethod: IntegrationMethod
  bounds?: { width: number; height: number }
  trailLength?: number
}

export const defaultConfig: SimulationConfig = {
  gravitationalConstant: 100,
  timeStep: 0.016,
  softening: 5,
  integrationMethod: 'euler',
  trailLength: 100,
}