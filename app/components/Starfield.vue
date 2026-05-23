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

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface Flash {
  x: number
  y: number
  life: number
  color: string
}

const G = 5
let stars: Star[] = []
let particles: Particle[] = []
let flashes: Flash[] = []
let animationId: number | null = null

const colors = ['#ffffff', '#aaccff', '#ffddaa', '#aaffaa', '#ffaaff']

const initStars = (width: number, height: number) => {
  stars = []
  const numStars = Math.min(25, Math.floor((width * height) / 12000))

  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const mass = Math.random() * 2 + 1
    const radius = Math.random() * 1.5 + 1

    let vx = (Math.random() - 0.5) * 0.2
    let vy = (Math.random() - 0.5) * 0.2

    if (i > 0 && i % 3 === 0) {
      const prev = stars[stars.length - 1]!
      const dx = x - prev.x
      const dy = y - prev.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 10) {
        const orbitV = Math.sqrt(G * (prev.mass + mass) / dist) * 0.6
        const angle = Math.atan2(dy, dx)
        vx = -Math.sin(angle) * orbitV
        vy = Math.cos(angle) * orbitV
      }
    }

    stars.push({
      x,
      y,
      vx,
      vy,
      mass,
      radius,
      color: colors[Math.floor(Math.random() * colors.length)]!
    })
  }
}

const createFlash = (x: number, y: number, color: string) => {
  flashes.push({ x, y, life: 1, color })
}

const createExplosion = (x: number, y: number, color: string, count: number) => {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 2 + 0.3
    particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.5,
      color
    })
  }
}

const checkCollisions = () => {
  let changed = false
  const toRemove = new Set<number>()
  const toAdd: Star[] = []
  const current = [...stars]

  for (let i = 0; i < current.length; i++) {
    if (toRemove.has(i)) continue
    for (let j = i + 1; j < current.length; j++) {
      if (toRemove.has(j)) continue
      const a = current[i]!
      const b = current[j]!
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < a.radius + b.radius) {
        changed = true
        toRemove.add(i)
        toRemove.add(j)

        const cx = (a.x + b.x) / 2
        const cy = (a.y + b.y) / 2
        const avgVx = (a.vx + b.vx) / 2
        const avgVy = (a.vy + b.vy) / 2

        createFlash(cx, cy, '#ffffff')
        createExplosion(cx, cy, a.color, 25)
        createExplosion(cx, cy, b.color, 25)

        const totalMass = a.mass + b.mass
        if (totalMass < 0.8) break

        const fragCount = Math.min(3, Math.ceil(totalMass / 1.5))
        for (let k = 0; k < fragCount; k++) {
          const fragMass = totalMass / fragCount
          const angle = Math.random() * Math.PI * 2
          const offset = 5 + Math.random() * 10
          const orbitV = Math.sqrt(G * totalMass / offset) * (0.4 + Math.random() * 0.4)
          toAdd.push({
            x: cx + Math.cos(angle) * offset,
            y: cy + Math.sin(angle) * offset,
            vx: avgVx + Math.cos(angle + Math.PI / 2) * orbitV * 0.5,
            vy: avgVy + Math.sin(angle + Math.PI / 2) * orbitV * 0.5,
            mass: fragMass,
            radius: Math.max(0.5, Math.sqrt(fragMass) * 0.8),
            color: Math.random() > 0.5 ? a.color : b.color
          })
        }
        break
      }
    }
  }

  if (changed) {
    stars = current.filter((_, idx) => !toRemove.has(idx)).concat(toAdd)
  }
}

const updateParticles = () => {
  particles = particles.filter(p => {
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.97
    p.vy *= 0.97
    p.life -= 0.03
    return p.life > 0
  })
  flashes = flashes.filter(f => {
    f.life -= 0.06
    return f.life > 0
  })
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
      
      if (dist > 0.5) {
        const force = (G * stars[i]!.mass * stars[j]!.mass) / Math.max(distSq, 1)
        fx += (force * dx) / Math.max(dist, 1)
        fy += (force * dy) / Math.max(dist, 1)
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

  checkCollisions()
  updateParticles()
}

const draw = () => {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  const { width, height } = canvasRef.value
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
  ctx.fillRect(0, 0, width, height)
  
  for (const star of stars) {
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fillStyle = star.color
    ctx.fill()
    
    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 2.5)
    glow.addColorStop(0, star.color + '15')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(star.x - star.radius * 2.5, star.y - star.radius * 2.5, star.radius * 5, star.radius * 5)
  }

  for (const f of flashes) {
    const r = 8 * (1 - f.life * 0.5)
    const alpha = Math.floor(f.life * 200).toString(16).padStart(2, '0')
    ctx.beginPath()
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2)
    ctx.fillStyle = f.color + alpha
    ctx.fill()
  }

  for (const p of particles) {
    const alpha = Math.floor(p.life * 120).toString(16).padStart(2, '0')
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1 * p.life, 0, Math.PI * 2)
    ctx.fillStyle = p.color + alpha
    ctx.fill()
  }
}

const animate = () => {
  try {
    update()
    draw()
  } catch (e) {
    // ignore render errors
  }
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