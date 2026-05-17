<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Engine2D, createDefaultBodies2D, type Body, type Vector2D } from '~/simulation/Engine'

interface Props {
  engine?: '2d' | '3d'
  bodyColor?: string
  showTrails?: boolean
  trailColor?: string
  trailLength?: number
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  engine: '2d',
  bodyColor: '#ffffff',
  showTrails: true,
  trailColor: 'rgba(255,255,255,0.3)',
  trailLength: 100,
  autoStart: true
})

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const engine = ref<Engine2D | null>(null)
const isRunning = ref(false)
const animationId = ref<number | null>(null)
const center = ref({ x: 0, y: 0 })
const scale = ref(1)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

const particles = ref<Particle[]>([])

interface MergeMessage {
  x: number
  y: number
  text: string
  life: number
}
const mergeMessages = ref<MergeMessage[]>([])

const emit = defineEmits<{
  (e: 'ready', ctx: CanvasRenderingContext2D, width: number, height: number): void
  (e: 'bodyClick', body: Body, event: MouseEvent): void
  (e: 'stop', reason: string): void
  (e: 'event', message: string): void
}>()

let rafId: number | null = null
const hoveredBody = ref<string | null>(null)
const selectedBodyId = ref<string | null>(null)
const frameCount = ref(0)
let singleBodyCountdown: number | null = null
let pickingPositionCallback: ((x: number, y: number) => void) | null = null
let pickingMoveCallback: ((x: number, y: number) => void) | null = null
const isPickingPosition = ref(false)
const isPickingVector = ref(false)
const pickingVectorBody = ref<{ x: number; y: number } | null>(null)
const pickingVectorTarget = ref<{ x: number; y: number } | null>(null)
const pickingVectorVelocity = ref<{ vx: number; vy: number } | null>(null)
let pickingVectorClickCallback: ((vx: number, vy: number) => void) | null = null
let pickingVectorMoveCallback: ((vx: number, vy: number) => void) | null = null

const initEngine = () => {
  engine.value = new Engine2D({
    trailLength: props.trailLength,
    gravitationalConstant: 80
  })
  
  const defaultBodies = createDefaultBodies2D()
  engine.value.setDefaultBodies(defaultBodies)
  defaultBodies.forEach(body => engine.value?.addBody(body))
}

const updateInitialBodies = () => {
  if (engine.value) {
    engine.value.setInitialBodies(engine.value.getBodies())
  }
}

const resizeCanvas = () => {
  if (canvasRef.value && containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    canvasRef.value.width = rect.width
    canvasRef.value.height = rect.height
    center.value = { x: rect.width / 2, y: rect.height / 2 }
  }
}

const createExplosion = (x: number, y: number, color: string, count = 30) => {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 5 + 2
    particles.value.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color
    })
  }
}

const updateParticles = () => {
  particles.value = particles.value.filter(p => {
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.98
    p.vy *= 0.98
    p.life -= 0.02
    return p.life > 0
  })
  
  mergeMessages.value = mergeMessages.value.filter(m => {
    m.life -= 0.02
    m.y -= 0.5
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
      
      if (dist < (a.radius + b.radius)) {
        const fmt = (v: number) => v.toFixed(1)
        const fmtV = (v: number) => v.toFixed(2)
        emit('event', `Collision: ${a.id}(m=${a.mass} p=${fmt(a.position.x)},${fmt(a.position.y)} v=${fmtV(a.velocity.x)},${fmtV(a.velocity.y)}) + ${b.id}(m=${b.mass} p=${fmt(b.position.x)},${fmt(b.position.y)} v=${fmtV(b.velocity.x)},${fmtV(b.velocity.y)}) dist=${fmt(dist)}`)
        toRemove.add(a.id)
        toRemove.add(b.id)
        
        const relVx = a.velocity.x - b.velocity.x
        const relVy = a.velocity.y - b.velocity.y
        const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy)
        
        const totalMass = a.mass + b.mass
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
          life: 1
        })
        
        const mergedId = `merged-${Date.now()}`
        mergedBodies.push({
          id: mergedId,
          position: { x: newX, y: newY },
          velocity: { x: newVx, y: newVy },
          mass: finalMass,
          radius: newRadius * Math.sqrt(finalMass / totalMass),
          color: a.color
        })
        emit('event', `Merged: ${mergedId} m=${finalMass.toFixed(0)} p=${fmt(newX)},${fmt(newY)} v=${fmtV(newVx)},${fmtV(newVy)} dust=${dustPercent.toFixed(1)}% lost=${lostMass.toFixed(0)}`)
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

const predictTrajectoryWithVelocity = (body: Body, vx: number, vy: number, steps: number): { x: number; y: number }[] => {
  const trajectory: { x: number; y: number }[] = []
  let pos = { x: body.position.x, y: body.position.y }
  let vel = { x: vx, y: vy }
  const G = 80
  const softening = 5
  const dt = 0.016
  
  const bodies = engine.value!.getBodies()
  
  for (let step = 0; step < steps; step++) {
    let ax = 0
    let ay = 0
    
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
    
    vel.x += ax * dt
    vel.y += ay * dt
    pos.x += vel.x * dt
    pos.y += vel.y * dt
    
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
  
  const gridSize = 50 * scale.value
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 1
  
  const offsetX = center.value.x % gridSize
  const offsetY = center.value.y % gridSize
  
  for (let x = offsetX; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  for (let y = offsetY; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  ctx.font = '10px monospace'
  ctx.fillStyle = '#555555'
  for (let x = offsetX; x < width; x += gridSize) {
    const worldX = Math.round((x - center.value.x) / scale.value)
    if (worldX !== 0) {
      ctx.fillText(worldX.toString(), x + 3, center.value.y + 12)
    }
  }
  for (let y = offsetY; y < height; y += gridSize) {
    const worldY = Math.round((center.value.y - y) / scale.value)
    if (worldY !== 0) {
      ctx.fillText(worldY.toString(), center.value.x + 3, y - 3)
    }
  }
  
  ctx.font = '12px monospace'
  ctx.fillStyle = '#666666'
  ctx.fillText('[0;0]', center.value.x + 8, center.value.y - 8)
  
  const originX = center.value.x
  const originY = center.value.y
  
  ctx.fillStyle = '#ffe66d'
  ctx.fillRect(originX - 0.5, originY - 0.5, 1, 1)
  
  ctx.beginPath()
  ctx.moveTo(originX, 0)
  ctx.lineTo(originX, height)
  ctx.strokeStyle = '#ffe66d30'
  ctx.lineWidth = 1
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(0, originY)
  ctx.lineTo(width, originY)
  ctx.strokeStyle = '#ffe66d30'
  ctx.lineWidth = 1
  ctx.stroke()
  
  ctx.font = 'bold 12px monospace'
  ctx.fillStyle = '#ffe66d'
  ctx.fillText('Y', originX - 14, 16)
  ctx.fillText('X', width - 16, originY + 14)
  
  if (props.showTrails) {
    engine.value.getBodies().forEach(body => {
      const trail = engine.value!.getTrail(body.id)
      if (trail.length < 2) return
      
      ctx.beginPath()
      ctx.strokeStyle = body.color + '40'
      ctx.lineWidth = 2
      
      const startX = center.value.x + trail[0]!.x * scale.value
      const startY = center.value.y + trail[0]!.y * scale.value
      ctx.moveTo(startX, startY)
      
      for (let i = 1; i < trail.length; i++) {
        const x = center.value.x + trail[i]!.x * scale.value
        const y = center.value.y + trail[i]!.y * scale.value
        ctx.lineTo(x, y)
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
    
    ctx.font = '11px monospace'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`(${body.position.x.toFixed(0)}, ${body.position.y.toFixed(0)})`, x + body.radius * scale.value + 8, y - 8)
    
    ctx.font = '10px monospace'
    ctx.fillStyle = '#666666'
    ctx.fillText(`m=${body.mass}`, x + body.radius * scale.value + 8, y + 6)
    
    const trajectory = predictTrajectory(body, 400)
    if (trajectory.length > 1) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      trajectory.forEach((point) => {
        const px = center.value.x + point.x * scale.value
        const py = center.value.y + point.y * scale.value
        ctx.lineTo(px, py)
      })
      ctx.strokeStyle = body.color + '60'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 6])
      ctx.stroke()
      ctx.setLineDash([])
    }
    
    const vScale = 6
    const vx = body.velocity.x * scale.value * vScale
    const vy = body.velocity.y * scale.value * vScale
    const vLen = Math.sqrt(vx * vx + vy * vy)
    
    if (vLen > 1) {
      const angle = Math.atan2(vy, vx)
      const arrowX = x + vx
      const arrowY = y + vy
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(arrowX, arrowY)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = Math.max(0.3, Math.min(1.2, 0.7))
      ctx.stroke()
      
      const arrowSize = Math.max(3, Math.min(10, scale.value * 0.05))
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = '#ffffff'
      ctx.fill()
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
      ctx.lineTo(
        targetX - arrowSize * Math.cos(angle - Math.PI / 6),
        targetY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        targetX - arrowSize * Math.cos(angle + Math.PI / 6),
        targetY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = '#22c55e'
      ctx.fill()
    }
  }
  
  updateParticles()
  drawParticles(ctx)
}

const step = () => {
  if (engine.value && isRunning.value) {
    engine.value.step()
    checkCollisions()
    frameCount.value++
    
    if (frameCount.value >= 10000) {
      emit('stop', 'Frame limit (10000) reached - simulation stopped')
      emit('event', 'Frame limit reached (10000)')
      stop()
      return
    }
    
    const bodies = engine.value.getBodies()
    if (bodies.length <= 1) {
      if (singleBodyCountdown === null) {
        singleBodyCountdown = 100
      }
      singleBodyCountdown--
      if (singleBodyCountdown <= 0) {
        emit('stop', '1 body remaining - simulation stopped')
        emit('event', 'Only 1 body left')
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
          emit('stop', `Body ${body.id} out of bounds - simulation stopped`)
          emit('event', `Body ${body.id} flew out of bounds`)
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
  isRunning.value = true
}

const stop = (reason = 'Simulation stopped') => {
  isRunning.value = false
  emit('stop', reason)
}

const reset = () => {
  if (engine.value) {
    engine.value.reset()
    particles.value = []
    mergeMessages.value = []
    frameCount.value = 0
    singleBodyCountdown = null
    stop()
  }
}

const zoom = (delta: number) => {
  scale.value = Math.max(0.1, Math.min(5, scale.value + delta))
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
    pickingVectorVelocity.value = null
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
    
    const vx = worldX - pickingVectorBody.value.x
    const vy = worldY - pickingVectorBody.value.y
    pickingVectorVelocity.value = { vx, vy }
    
    if (pickingVectorMoveCallback) {
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

onMounted(() => {
  initEngine()
  resizeCanvas()
  
  if (props.autoStart) {
    start()
  } else {
    draw()
  }
  
  window.addEventListener('resize', resizeCanvas)
  
  step()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeCanvas)
})

defineExpose({
  start,
  stop,
  reset,
  zoom,
  draw,
  getEngine: () => engine.value,
  isRunning: computed(() => isRunning.value),
  canvasScale: computed(() => scale.value),
  frameCount,
  selectedBodyId,
  updateInitialBodies,
  clearSelection: () => {
    selectedBodyId.value = null
  },
  setBodies: (bodies: any[]) => {
    if (!engine.value) return
    engine.value.getBodies().forEach(b => engine.value!.removeBody(b.id))
    bodies.forEach(b => engine.value!.addBody({ ...b }))
    engine.value.setDefaultBodies(bodies)
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
    pickingVectorVelocity.value = null
    isPickingVector.value = true
  },
  cancelPickingVector: () => {
    isPickingVector.value = false
    pickingVectorBody.value = null
    pickingVectorTarget.value = null
    pickingVectorVelocity.value = null
    pickingVectorClickCallback = null
    pickingVectorMoveCallback = null
  }
})
</script>

<template>
  <div ref="containerRef" class="simulation-canvas">
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
.simulation-canvas {
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