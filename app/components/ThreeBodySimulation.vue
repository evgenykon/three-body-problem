<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Engine2D, type Body, type IntegrationMethod, type Vector2D } from '~/simulation/Engine'

export interface BodyConfig {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  mass: number
  radius: number
  color: string
}

interface Props {
  bodies: BodyConfig[]
  integrationMethod?: IntegrationMethod
  gravitationalConstant?: number
  autoStart?: boolean
  trailLength?: number
  showTrails?: boolean
  zoom?: number
  showFrameCounter?: boolean
  showVectors?: boolean
  showPredictions?: boolean
  softening?: number
  timeStep?: number
  stepsPerFrame?: number
}

const props = withDefaults(defineProps<Props>(), {
  integrationMethod: 'euler',
  gravitationalConstant: 80,
  autoStart: false,
  trailLength: 100,
  showTrails: true,
  showFrameCounter: false,
  showVectors: true,
  showPredictions: true,
  softening: 5,
  timeStep: 0.016,
  stepsPerFrame: 1,
})

const emit = defineEmits<{
  start: []
  collision: [bodyA: Body, bodyB: Body]
  end: [reason: string]
  ejection: [body: Body]
  bodyClick: [body: Body, event: MouseEvent]
  event: [message: string]
  'update:zoom': [value: number]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const engine = ref<Engine2D | null>(null)
const isRunning = ref(false)
const center = ref({ x: 0, y: 0 })
const scale = ref(1)
const animationId = ref<number | null>(null)
const frameCount = ref(0)

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string
}
const particles = ref<Particle[]>([])

interface MergeMessage {
  x: number; y: number; text: string; life: number
}
const mergeMessages = ref<MergeMessage[]>([])

let outOfBoundsZoomCount = 0
const MAX_ZOOM_OUT = 100
let singleBodyCountdown: number | null = null
let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null

const hoveredBody = ref<string | null>(null)
const selectedBodyId = ref<string | null>(null)
let pickingPositionCallback: ((x: number, y: number) => void) | null = null
let pickingMoveCallback: ((x: number, y: number) => void) | null = null
const isPickingPosition = ref(false)
const isPickingVector = ref(false)
const pickingVectorBody = ref<{ x: number; y: number } | null>(null)
const pickingVectorTarget = ref<{ x: number; y: number } | null>(null)
let pickingVectorClickCallback: ((vx: number, vy: number) => void) | null = null
let pickingVectorMoveCallback: ((vx: number, vy: number) => void) | null = null

const deepCopyBody = (b: BodyConfig): Body => ({
  id: b.id,
  position: { x: b.position.x, y: b.position.y },
  velocity: { x: b.velocity.x, y: b.velocity.y },
  mass: b.mass,
  radius: b.radius,
  color: b.color,
})

const initEngine = () => {
  engine.value = new Engine2D({
    gravitationalConstant: props.gravitationalConstant,
    integrationMethod: props.integrationMethod,
    trailLength: props.trailLength,
    softening: props.softening,
    timeStep: props.timeStep,
  })
  props.bodies.forEach(b => engine.value!.addBody(deepCopyBody(b)))
  engine.value.setDefaultBodies(props.bodies.map(deepCopyBody))
  engine.value.setInitialBodies(props.bodies.map(deepCopyBody))
}

const updateInitialBodies = () => {
  if (engine.value) {
    engine.value.setInitialBodies(engine.value.getBodies())
  }
}

const updateEngineConfig = () => {
  if (engine.value) {
    engine.value.setConfig({
      gravitationalConstant: props.gravitationalConstant,
      integrationMethod: props.integrationMethod,
      trailLength: props.trailLength,
      softening: props.softening,
      timeStep: props.timeStep,
    })
  }
}

watch(() => props.integrationMethod, updateEngineConfig)
watch(() => props.gravitationalConstant, updateEngineConfig)
watch(() => props.softening, updateEngineConfig)
watch(() => props.timeStep, updateEngineConfig)
watch(() => props.trailLength, updateEngineConfig)

watch(() => props.autoStart, (val) => {
  if (val) start()
})

const resizeCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  canvasRef.value.width = rect.width
  canvasRef.value.height = rect.height
  center.value = { x: rect.width / 2, y: rect.height / 2 }
  draw()
}

const computeInitialScale = (): number => {
  if (!canvasRef.value || props.bodies.length === 0) return 1

  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  for (const body of props.bodies) {
    const r = Math.max(body.radius, 1)
    minX = Math.min(minX, body.position.x - r)
    maxX = Math.max(maxX, body.position.x + r)
    minY = Math.min(minY, body.position.y - r)
    maxY = Math.max(maxY, body.position.y + r)
  }

  const figureWidth = maxX - minX
  const figureHeight = maxY - minY
  const marginFactor = 1.6
  const canvasW = canvasRef.value.width
  const canvasH = canvasRef.value.height

  const scaleX = canvasW / (Math.max(figureWidth, 1) * marginFactor)
  const scaleY = canvasH / (Math.max(figureHeight, 1) * marginFactor)

  return Math.min(scaleX, scaleY)
}

const createExplosion = (x: number, y: number, color: string, count = 30) => {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 5 + 2
    particles.value.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color,
    })
  }
}

const updateParticles = () => {
  particles.value = particles.value.filter(p => {
    p.x += p.vx; p.y += p.vy
    p.vx *= 0.98; p.vy *= 0.98
    p.life -= 0.02
    return p.life > 0
  })
  mergeMessages.value = mergeMessages.value.filter(m => {
    m.life -= 0.02; m.y -= 0.5
    return m.life > 0
  })
}

const drawParticles = (ctx: CanvasRenderingContext2D) => {
  particles.value.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
    ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0')
    ctx.fill()
  })
  mergeMessages.value.forEach(m => {
    ctx.font = '12px monospace'
    ctx.fillStyle = `rgba(255, 100, 100, ${m.life})`
    ctx.fillText(m.text, m.x, m.y)
  })
}

const checkCollisions = () => {
  if (!engine.value) return
  const bodies = engine.value.getBodies()
  const toRemove: Set<string> = new Set()
  const mergedBodies: Body[] = []

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]!
      const b = bodies[j]!
      if (toRemove.has(a.id) || toRemove.has(b.id)) continue

      const dx = a.position.x - b.position.x
      const dy = a.position.y - b.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < a.radius + b.radius) {
        emit('collision', a, b)
        toRemove.add(a.id)
        toRemove.add(b.id)

        const totalMass = a.mass + b.mass
        const relVx = a.velocity.x - b.velocity.x
        const relVy = a.velocity.y - b.velocity.y
        const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy)
        const dustPercent = Math.min(relSpeed * 0.5, 10)
        const lostMass = totalMass * (dustPercent / 100)
        const finalMass = totalMass - lostMass

        const newX = (a.position.x * a.mass + b.position.x * b.mass) / totalMass
        const newY = (a.position.y * a.mass + b.position.y * b.mass) / totalMass
        const newVx = (a.velocity.x * a.mass + b.velocity.x * b.mass) / totalMass
        const newVy = (a.velocity.y * a.mass + b.velocity.y * b.mass) / totalMass
        const newRadius = Math.sqrt(a.radius * a.radius + b.radius * b.radius)

        const mergeX = center.value.x + newX * scale.value
        const mergeY = center.value.y + newY * scale.value
        const dustCount = Math.floor(5 + relSpeed * 3)
        createExplosion(mergeX, mergeY, '#ffffff', dustCount)

        mergeMessages.value.push({
          x: mergeX,
          y: mergeY - newRadius * scale.value - 10,
          text: `-${dustPercent.toFixed(1)}% (${lostMass.toFixed(0)})`,
          life: 1,
        })

        mergedBodies.push({
          id: `merged-${Date.now()}`,
          position: { x: newX, y: newY },
          velocity: { x: newVx, y: newVy },
          mass: finalMass,
          radius: newRadius * Math.sqrt(finalMass / totalMass),
          color: a.color,
        })
      }
    }
  }

  if (toRemove.size > 0) {
    toRemove.forEach(id => engine.value!.removeBody(id))
  }
  mergedBodies.forEach(body => engine.value!.addBody(body))
}

const predictTrajectory = (body: Body, steps: number): { x: number; y: number }[] => {
  return predictTrajectoryWithVelocity(body, body.velocity.x, body.velocity.y, steps)
}

const predictTrajectoryWithVelocity = (
  body: Body, vx: number, vy: number, steps: number
): { x: number; y: number }[] => {
  const trajectory: { x: number; y: number }[] = []
  let pos = { x: body.position.x, y: body.position.y }
  let vel = { x: vx, y: vy }
  const G = props.gravitationalConstant
  const softening = props.softening ?? 5
  const dt = 0.016
  const bodies = engine.value!.getBodies()

  for (let step = 0; step < steps; step++) {
    let ax = 0, ay = 0
    bodies.forEach(other => {
      if (other.id === body.id) return
      const dx = other.position.x - pos.x
      const dy = other.position.y - pos.y
      const distSq = dx * dx + dy * dy + softening * softening
      const dist = Math.sqrt(distSq)
      const force = G * other.mass / distSq
      ax += (force * dx) / dist
      ay += (force * dy) / dist
    })
    vel.x += ax * dt; vel.y += ay * dt
    pos.x += vel.x * dt; pos.y += vel.y * dt
    trajectory.push({ x: pos.x, y: pos.y })
  }
  return trajectory
}

const draw = () => {
  if (!canvasRef.value || !engine.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const { width, height } = canvasRef.value
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, width, height)

  const gridSize = 50
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 1
  const offsetX = center.value.x % gridSize
  const offsetY = center.value.y % gridSize

  for (let x = offsetX; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = offsetY; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  ctx.font = '10px monospace'
  ctx.fillStyle = '#555555'
  for (let x = offsetX; x < width; x += gridSize) {
    const worldX = Math.round((x - center.value.x) / scale.value)
    if (worldX !== 0) ctx.fillText(worldX.toString(), x + 3, center.value.y + 12)
  }
  for (let y = offsetY; y < height; y += gridSize) {
    const worldY = Math.round((center.value.y - y) / scale.value)
    if (worldY !== 0) ctx.fillText(worldY.toString(), center.value.x + 3, y - 3)
  }

  ctx.font = '12px monospace'
  ctx.fillStyle = '#666666'
  ctx.fillText('[0;0]', center.value.x + 8, center.value.y - 8)

  const originX = center.value.x
  const originY = center.value.y
  ctx.fillStyle = '#ffe66d'
  ctx.fillRect(originX - 0.5, originY - 0.5, 1, 1)
  ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, height)
  ctx.strokeStyle = '#ffe66d30'; ctx.lineWidth = 1; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(width, originY)
  ctx.strokeStyle = '#ffe66d30'; ctx.lineWidth = 1; ctx.stroke()
  ctx.font = 'bold 12px monospace'; ctx.fillStyle = '#ffe66d'
  ctx.fillText('Y', originX - 14, 16)
  ctx.fillText('X', width - 16, originY + 14)

  if (props.showTrails) {
    engine.value.getBodies().forEach(body => {
      const trail = engine.value!.getTrail(body.id)
      if (trail.length < 2) return
      ctx.beginPath()
      ctx.strokeStyle = body.color + '40'
      ctx.lineWidth = 2
      ctx.moveTo(center.value.x + trail[0]!.x * scale.value, center.value.y + trail[0]!.y * scale.value)
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(center.value.x + trail[i]!.x * scale.value, center.value.y + trail[i]!.y * scale.value)
      }
      ctx.stroke()
    })
  }

  engine.value.getBodies().forEach(body => {
    const x = center.value.x + body.position.x * scale.value
    const y = center.value.y + body.position.y * scale.value
    const isHovered = body.id === hoveredBody.value
    const isSelected = body.id === selectedBodyId.value

    if (isSelected) {
      ctx.beginPath()
      ctx.arc(x, y, body.radius * scale.value * 2.5, 0, Math.PI * 2)
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    if (isHovered) {
      ctx.beginPath()
      ctx.arc(x, y, body.radius * scale.value * 2, 0, Math.PI * 2)
      ctx.strokeStyle = body.color + '60'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, body.radius * scale.value)
    gradient.addColorStop(0, body.color)
    gradient.addColorStop(0.5, body.color + '80')
    gradient.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(x, y, body.radius * scale.value * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, body.radius * scale.value, 0, Math.PI * 2)
    ctx.fillStyle = body.color
    ctx.fill()

    const pixelRadius = body.radius * scale.value
    if (pixelRadius < 3) {
      const crossSize = Math.max(4, 12 - pixelRadius)
      ctx.strokeStyle = body.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x - crossSize, y); ctx.lineTo(x + crossSize, y)
      ctx.moveTo(x, y - crossSize); ctx.lineTo(x, y + crossSize)
      ctx.stroke()
    }

    ctx.font = '11px monospace'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`(${body.position.x.toFixed(0)}, ${body.position.y.toFixed(0)})`, x + body.radius * scale.value + 8, y - 8)
    ctx.font = '10px monospace'
    ctx.fillStyle = '#666666'
    ctx.fillText(`m=${body.mass}`, x + body.radius * scale.value + 8, y + 6)

    if (props.showPredictions) {
      const trajectory = predictTrajectory(body, 400)
      if (trajectory.length > 1) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        trajectory.forEach(point => {
          ctx.lineTo(center.value.x + point.x * scale.value, center.value.y + point.y * scale.value)
        })
        ctx.strokeStyle = body.color + '60'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 6])
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    if (props.showVectors) {
      const vScale = 6
      const vx = body.velocity.x * scale.value * vScale
      const vy = body.velocity.y * scale.value * vScale
      const vLen = Math.sqrt(vx * vx + vy * vy)
      if (vLen > 1) {
        const angle = Math.atan2(vy, vx)
        const arrowX = x + vx; const arrowY = y + vy
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(arrowX, arrowY)
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.3, Math.min(1.2, 0.7)); ctx.stroke()
        const arrowSize = Math.max(3, Math.min(10, scale.value * 0.05))
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }
    }
  })

  if (isPickingVector.value && pickingVectorBody.value && pickingVectorTarget.value) {
    const bodyX = center.value.x + pickingVectorBody.value.x * scale.value
    const bodyY = center.value.y + pickingVectorBody.value.y * scale.value
    const targetX = center.value.x + pickingVectorTarget.value.x * scale.value
    const targetY = center.value.y + pickingVectorTarget.value.y * scale.value
    const vx = targetX - bodyX
    const vy = targetY - bodyY

    if (Math.sqrt(vx * vx + vy * vy) > 1) {
      const angle = Math.atan2(vy, vx)
      const arrowSize = 8
      ctx.beginPath()
      ctx.moveTo(bodyX, bodyY)
      ctx.lineTo(targetX, targetY)
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(targetX, targetY)
      ctx.lineTo(targetX - arrowSize * Math.cos(angle - Math.PI / 6), targetY - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(targetX - arrowSize * Math.cos(angle + Math.PI / 6), targetY - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = '#22c55e'
      ctx.fill()
    }
  }

  ctx.font = '11px monospace'
  ctx.fillStyle = '#888888'
  const infoX = 10
  const lines = [
    `G = ${props.gravitationalConstant}`,
    `zoom = ${scale.value.toFixed(2)}`,
    `method = ${props.integrationMethod}`,
    `soft = ${props.softening}`,
    `dt = ${props.timeStep}`,
    `stepsPerFrame = ${props.stepsPerFrame}`,
  ]
  lines.forEach((line, i) => ctx.fillText(line, infoX, 16 + i * 16))

  updateParticles()
  drawParticles(ctx)
}

watch(() => props.showTrails, draw)
watch(() => props.showVectors, draw)
watch(() => props.showPredictions, draw)

const step = () => {
  if (!engine.value || !isRunning.value) return
  for (let i = 0; i < props.stepsPerFrame; i++) {
    engine.value.step()
  }
  checkCollisions()
  frameCount.value++

  if (frameCount.value >= 10000) {
    emit('end', 'Frame limit (10000) reached')
    stop()
    return
  }

  const bodies = engine.value.getBodies()
  if (bodies.length <= 1) {
    if (singleBodyCountdown === null) singleBodyCountdown = 100
    singleBodyCountdown--
    if (singleBodyCountdown <= 0) {
      emit('end', 'Only one body remaining')
      stop()
      singleBodyCountdown = null
      return
    }
  } else {
    singleBodyCountdown = null
  }

  if (canvasRef.value) {
    const { width, height } = canvasRef.value
    for (const body of bodies) {
      const screenX = center.value.x + body.position.x * scale.value
      const screenY = center.value.y + body.position.y * scale.value
      if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) {
        if (outOfBoundsZoomCount < MAX_ZOOM_OUT) {
          setZoom(scale.value * 0.8)
          outOfBoundsZoomCount++
        } else {
          emit('ejection', body)
          emit('end', `Body ${body.id} flew out of bounds`)
          stop()
          return
        }
      }
    }
  }

  draw()
  animationId.value = requestAnimationFrame(step)
}

const start = () => {
  if (isRunning.value) return
  outOfBoundsZoomCount = 0
  isRunning.value = true
  emit('start')
  animationId.value = requestAnimationFrame(step)
}

const stop = () => {
  isRunning.value = false
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
}

const reset = () => {
  stop()
  frameCount.value = 0
  singleBodyCountdown = null
  outOfBoundsZoomCount = 0
  particles.value = []
  mergeMessages.value = []
  if (engine.value) {
    engine.value.reset()
  }
  if (canvasRef.value) {
    resizeCanvas()
    setZoom(props.zoom ?? computeInitialScale())
  }
}

const setZoom = (val: number) => {
  scale.value = Math.max(0.05, Math.min(100, val))
  draw()
  emit('update:zoom', scale.value)
}

const zoom = (delta: number) => {
  setZoom(scale.value + delta)
}

const handleClick = (event: MouseEvent) => {
  if (!canvasRef.value || !engine.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  if (isPickingPosition.value && pickingPositionCallback) {
    const worldX = (clickX - center.value.x) / scale.value
    const worldY = (clickY - center.value.y) / scale.value
    pickingPositionCallback(worldX, worldY)
    pickingPositionCallback = null
    isPickingPosition.value = false
    return
  }

  if (isPickingVector.value && pickingVectorBody.value && pickingVectorClickCallback) {
    const worldX = (clickX - center.value.x) / scale.value
    const worldY = (clickY - center.value.y) / scale.value
    const vx = worldX - pickingVectorBody.value.x
    const vy = worldY - pickingVectorBody.value.y
    pickingVectorClickCallback(vx, vy)
    isPickingVector.value = false
    pickingVectorBody.value = null
    pickingVectorTarget.value = null
    pickingVectorClickCallback = null
    pickingVectorMoveCallback = null
    return
  }

  const bodies = engine.value.getBodies()
  for (const body of bodies) {
    const bodyX = center.value.x + body.position.x * scale.value
    const bodyY = center.value.y + body.position.y * scale.value
    const distance = Math.sqrt((clickX - bodyX) ** 2 + (clickY - bodyY) ** 2)
    if (distance <= body.radius * scale.value * 1.5) {
      selectedBodyId.value = body.id
      emit('bodyClick', body, event)
      draw()
      return
    }
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!canvasRef.value || !engine.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  if (isPickingPosition.value && pickingMoveCallback) {
    const worldX = (mouseX - center.value.x) / scale.value
    const worldY = (mouseY - center.value.y) / scale.value
    pickingMoveCallback(worldX, worldY)
  }

  if (isPickingVector.value && pickingVectorBody.value) {
    const worldX = (mouseX - center.value.x) / scale.value
    const worldY = (mouseY - center.value.y) / scale.value
    pickingVectorTarget.value = { x: worldX, y: worldY }
    if (pickingVectorMoveCallback) {
      const vx = worldX - pickingVectorBody.value.x
      const vy = worldY - pickingVectorBody.value.y
      pickingVectorMoveCallback(vx, vy)
    }
  }

  let found: string | null = null
  const bodies = engine.value.getBodies()
  for (const body of bodies) {
    const bodyX = center.value.x + body.position.x * scale.value
    const bodyY = center.value.y + body.position.y * scale.value
    const distance = Math.sqrt((mouseX - bodyX) ** 2 + (mouseY - bodyY) ** 2)
    if (distance <= body.radius * scale.value * 2) {
      found = body.id
    }
  }
  if (found !== hoveredBody.value) {
    hoveredBody.value = found
  }
}

watch(() => props.zoom, (val) => {
  if (val !== undefined && val > 0) {
    setZoom(val)
  }
})

onMounted(() => {
  initEngine()
  resizeCanvas()
  scale.value = props.zoom ?? computeInitialScale()
  draw()

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    if (!isRunning.value) draw()
  })
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }

  if (props.autoStart) {
    start()
  }
})

onUnmounted(() => {
  stop()
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

defineExpose({
  start,
  stop,
  reset,
  setZoom,
  zoom,
  draw,
  getEngine: () => engine.value,
  isRunning: computed(() => isRunning.value),
  canvasScale: computed(() => scale.value),
  frameCount: computed(() => frameCount.value),
  scale: computed(() => scale.value),
  selectedBodyId,
  updateInitialBodies,
  clearSelection: () => {
    selectedBodyId.value = null
    draw()
  },
  startPickingPosition: (clickCallback: (x: number, y: number) => void, moveCallback?: (x: number, y: number) => void) => {
    pickingPositionCallback = clickCallback
    pickingMoveCallback = moveCallback || null
    isPickingPosition.value = true
  },
  cancelPickingPosition: () => {
    pickingPositionCallback = null
    pickingMoveCallback = null
    isPickingPosition.value = false
  },
  startPickingVector: (bodyX: number, bodyY: number, clickCallback: (vx: number, vy: number) => void, moveCallback?: (vx: number, vy: number) => void) => {
    pickingVectorBody.value = { x: bodyX, y: bodyY }
    pickingVectorClickCallback = clickCallback
    pickingVectorMoveCallback = moveCallback || null
    pickingVectorTarget.value = null
    isPickingVector.value = true
  },
  cancelPickingVector: () => {
    isPickingVector.value = false
    pickingVectorBody.value = null
    pickingVectorTarget.value = null
    pickingVectorClickCallback = null
    pickingVectorMoveCallback = null
  },
  setBodies: (bodies: BodyConfig[]) => {
    if (!engine.value) return
    engine.value.getBodies().forEach(b => engine.value!.removeBody(b.id))
    bodies.forEach(b => engine.value!.addBody(deepCopyBody(b)))
    engine.value.setDefaultBodies(bodies.map(deepCopyBody))
    engine.value.setInitialBodies(bodies.map(deepCopyBody))
    draw()
  },
})
</script>

<template>
  <div ref="containerRef" class="three-body-simulation">
    <canvas
      ref="canvasRef"
      class="canvas"
      :class="{ 'canvas--picking': isPickingPosition }"
      @click="handleClick"
      @mousemove="handleMouseMove"
    />
  </div>
</template>

<style scoped>
.three-body-simulation {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
  position: relative;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.canvas--picking {
  cursor: cell;
}
</style>
