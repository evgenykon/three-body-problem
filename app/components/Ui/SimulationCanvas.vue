<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
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
const hoveredBody = ref<string | null>(null)

const engine = ref<Engine2D | null>(null)
const isRunning = ref(false)
const animationId = ref<number | null>(null)
const center = ref({ x: 0, y: 0 })
const scale = ref(1)

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
    // console.log('drawing body', body.id, body.velocity)
    const x = center.value.x + body.position.x * scale.value
    const y = center.value.y + body.position.y * scale.value
    const isHovered = body.id === hoveredBody.value
    
    // console.log('hovered:', body.id, isHovered)
    
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
    ctx.fillStyle = '#888888'
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
}

const step = () => {
  if (engine.value && isRunning.value) {
    engine.value.step()
    checkCollisions()
    draw()
  }
  animationId.value = requestAnimationFrame(step)
}

const start = () => {
  isRunning.value = true
}

const stop = () => {
  isRunning.value = false
}

const reset = () => {
  initEngine()
  draw()
}

const getBodies = () => engine.value?.getBodies() || []

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
        toRemove.push(a.id, b.id)
      }
    }
  }
  
  if (toRemove.length > 0) {
    toRemove.forEach(id => engine.value!.removeBody(id))
  }
}

const zoom = (delta: number) => {
  scale.value = Math.max(0.1, Math.min(5, scale.value + delta))
  draw()
}

const emit = defineEmits<{
  (e: 'bodyClick', body: Body, event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!canvasRef.value || !engine.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top
  
  const bodies = engine.value.getBodies()
  for (const body of bodies) {
    const bodyX = center.value.x + body.position.x * scale.value
    const bodyY = center.value.y + body.position.y * scale.value
    const distance = Math.sqrt((clickX - bodyX) ** 2 + (clickY - bodyY) ** 2)
    
    if (distance <= body.radius * scale.value * 1.5) {
      emit('bodyClick', body, event)
      return
    }
  }
}

let rafId: number | null = null

const handleMouseMove = (event: MouseEvent) => {
  // console.log('mouse move', event.clientX, event.clientY)
  if (!canvasRef.value || !engine.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  // console.log('canvas rect', rect)
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
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
    draw()
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
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  window.removeEventListener('resize', resizeCanvas)
})

defineExpose({
  start,
  stop,
  reset,
  zoom,
  draw,
  engine: computed(() => engine.value),
  isRunning: computed(() => isRunning.value)
})
</script>

<template>
  <div ref="containerRef" class="simulation-canvas">
    <canvas 
      ref="canvasRef" 
      class="canvas"
      @mousemove="handleMouseMove"
      @click="handleClick"
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

.canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>