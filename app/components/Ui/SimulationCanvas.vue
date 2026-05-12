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

const emit = defineEmits<{
  (e: 'ready', ctx: CanvasRenderingContext2D, width: number, height: number): void
  (e: 'bodyClick', body: Body, event: MouseEvent): void
}>()

let rafId: number | null = null
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

const initEngine = () => {
  engine.value = new Engine2D({
    trailLength: props.trailLength,
    gravitationalConstant: 80
  })
  
  const bodies = createDefaultBodies2D()
  bodies.forEach(body => engine.value?.addBody(body))
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
}

const drawParticles = (ctx: CanvasRenderingContext2D) => {
  particles.value.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
    ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0')
    ctx.fill()
  })
}

const checkCollisions = () => {
  if (!engine.value) return
  
  const bodies = engine.value.getBodies()
  const toRemove: string[] = []
  
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i]
      const b = bodies[j]
      
      const dx = a.position.x - b.position.x
      const dy = a.position.y - b.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < (a.radius + b.radius)) {
        const collX = center.value.x + (a.position.x + b.position.x) / 2 * scale.value
        const collY = center.value.y + (a.position.y + b.position.y) / 2 * scale.value
        
        createExplosion(collX, collY, a.color, 30)
        createExplosion(collX, collY, b.color, 30)
        
        toRemove.push(a.id, b.id)
      }
    }
  }
  
  if (toRemove.length > 0) {
    toRemove.forEach(id => engine.value!.removeBody(id))
  }
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
  
  ctx.font = '12px monospace'
  ctx.fillStyle = '#666666'
  ctx.fillText('[0;0]', center.value.x + 8, center.value.y - 8)
  
  if (props.showTrails) {
    engine.value.getBodies().forEach(body => {
      const trail = engine.value!.getTrail(body.id)
      if (trail.length < 2) return
      
      ctx.beginPath()
      ctx.strokeStyle = body.color + '40'
      ctx.lineWidth = 2
      
      const startX = center.value.x + trail[0].x * scale.value
      const startY = center.value.y + trail[0].y * scale.value
      ctx.moveTo(startX, startY)
      
      for (let i = 1; i < trail.length; i++) {
        const x = center.value.x + trail[i].x * scale.value
        const y = center.value.y + trail[i].y * scale.value
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
      ctx.lineWidth = 2
      ctx.stroke()
      
      const arrowSize = 8
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
  }
  draw()
  animationId.value = requestAnimationFrame(step)
}

const start = () => {
  isRunning.value = true
}

const stop = () => {
  isRunning.value = false
}

const reset = () => {
  if (engine.value) {
    engine.value.reset()
    particles.value = []
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
  selectedBodyId,
  clearSelection: () => {
    selectedBodyId.value = null
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
  min-height: 400px;
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