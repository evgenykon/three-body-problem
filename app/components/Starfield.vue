<template>
  <div class="starfield">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  radius: number
  color: string
}

const G = 0.3
let stars: Star[] = []
let animationId: number | null = null

const colors = ['#ffffff', '#aaccff', '#ffddaa', '#aaffaa', '#ffaaff']

const initStars = (width: number, height: number) => {
  stars = []
  const numStars = Math.min(25, Math.floor((width * height) / 12000))
  
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      mass: Math.random() * 2 + 1,
      radius: Math.random() * 1.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)]!
    })
  }
}

const update = () => {
  if (!canvasRef.value) return
  
  for (let i = 0; i < stars.length; i++) {
    let fx = 0, fy = 0
    
    for (let j = 0; j < stars.length; j++) {
      if (i === j) continue
      
      const dx = stars[j]!.x - stars[i]!.x
      const dy = stars[j]!.y - stars[i]!.y
      const distSq = dx * dx + dy * dy
      const dist = Math.sqrt(distSq)
      
      if (dist > 8) {
        const force = (G * stars[i]!.mass * stars[j]!.mass) / distSq
        fx += (force * dx) / dist
        fy += (force * dy) / dist
      }
    }
    
    stars[i]!.vx += fx / stars[i]!.mass
    stars[i]!.vy += fy / stars[i]!.mass
  }
  
  const width = canvasRef.value.width
  const height = canvasRef.value.height
  
  for (const star of stars) {
    star.x += star.vx
    star.y += star.vy
    
    if (star.x < -30) star.x = width + 30
    if (star.x > width + 30) star.x = -30
    if (star.y < -30) star.y = height + 30
    if (star.y > height + 30) star.y = -30
  }
}

const draw = () => {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  const { width, height } = canvasRef.value
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.fillRect(0, 0, width, height)
  
  for (const star of stars) {
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fillStyle = star.color
    ctx.fill()
    
    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2.5)
    glow.addColorStop(0, star.color + '30')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(star.x - star.radius * 2.5, star.y - star.radius * 2.5, star.radius * 5, star.radius * 5)
  }
}

const animate = () => {
  update()
  draw()
  animationId = requestAnimationFrame(animate)
}

const resize = () => {
  if (canvasRef.value) {
    const parent = canvasRef.value.parentElement
    if (parent) {
      canvasRef.value.width = parent.clientWidth
      canvasRef.value.height = parent.clientHeight
      initStars(parent.clientWidth, parent.clientHeight)
    }
  }
}

onMounted(() => {
  resize()
  animate()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.starfield {
  width: 100%;
  height: 100%;
}
.starfield canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>